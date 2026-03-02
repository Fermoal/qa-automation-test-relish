# Bug Report - Order Processor

## Bug 1: Fatal Error in Array Iteration (Index Out of Bounds)
1. Location: `getTotalItemCount` method.
2. Description: The `for` loop uses the condition `i <= this.lineItems.length`. Since JavaScript arrays are zero-indexed, the last valid index is `length - 1`. When `i` reaches `length`, `this.lineItems[i]` evaluates to `undefined`. Accessing `.quantity` on `undefined` throws a `TypeError` and crashes the application.
3. Reproduction: ```javascript
  const order = new OrderProcessor();
  order.addLineItem({ sku: '123', unitPrice: 10, quantity: 1 });
  order.getTotalItemCount(); // Throws TypeError
4. Severity: Critical. This completely breaks the application at runtime.
5. Reasoning/Discovery Process: Discovered through static code analysis. The "<=" operator in a standard array for loop is a classic anti-pattern.

## Bug 2: Business Rule Violation (Tax calculated before Coupon)

1. Location: calculateTotal method.

2. Description: I saw the rules state: "Coupons provide a fixed-dollar discount applied after volume discounts and before tax." However, totalTax is accumulated inside the forEach loop based only on the volume discount. The coupon is applied afterwards, meaning the customer is taxed on the pre-coupon amount.

3. Reproduction: by checking this code
const order = new OrderProcessor();
order.addLineItem({ sku: '123', unitPrice: 100, quantity: 1, taxRate: 0.1 }); // Tax should be $10
order.applyCoupon({ code: 'HALF', discountAmount: 50 }); // Tax should now be based on $50 ($5)
// Actual result: tax remains $10.

4. Severity: Major. Financial logic and overcharging customers.

5. Reasoning/Discovery Process: Discovered by mapping the documented Business Rules against the sequential execution of calculateTotal. Noticed a temporal visual mismatch where totalTax is finalized before couponDiscount is even evaluated.

## Bug 3: Logical Inconsistency - Duplicate SKUs Handling
1. Location: addLineItem vs updateQuantity methods.

2. Description: addLineItem uses .push() without checking if the SKU already exists. If we add twice, the array will have two identical SKUs. However, updateQuantity uses .find(), which only updates the first occurrence. This leads to a duplicated item that cannot be updated.

3. Reproduction: i chcked with this code and i thought "what if"
const order = new OrderProcessor();
order.addLineItem({ sku: '123', unitPrice: 10, quantity: 1 });
order.addLineItem({ sku: '123', unitPrice: 10, quantity: 1 }); // Array now has length 2
order.updateQuantity('123', 5); // Only the first object is updated

4. Severity: Medium. Causes desynchronization in the cart.

5. Reasoning/Discovery Process: I found the mismatch between .push() (allows duplicates) and .find() (returns only the first match) highlighted a structural flaw.

## Bug 4: Edge Case - Negative Order Totals
1. Location: calculateTotal method.

2. Description: There is no boundary check when applying a coupon. If the discountAmount of a coupon is greater than the order's subtotal (after volume discounts), the afterVolumeDiscount variable goes negative, leading to a negative final order total (the company mathematically "owes" the customer money).

3. Reproduction: following ths code
const order = new OrderProcessor();
order.addLineItem({ sku: '123', unitPrice: 10, quantity: 1 });
order.applyCoupon({ code: 'PROMO', discountAmount: 50 });
const totals = order.calculateTotal(); // total will be -40.

4. Severity: Major. in my experience with E-commerce platforms/proyects should floor order totals at $0.00 to prevent payout exploitation.

5. Reasoning/Discovery Process: Discovered through exploratory edge-case analysis, specifically questioning what happens when fixed-dollar subtractions exceed the current balance.

## Bug 5: Edge Case - Lack of Validation for Negative/Zero Quantities
1. Location: addLineItem and updateQuantity methods.

2. Description: The methods blindly accept zero or negative numbers for quantity. A user could add an item with -5 quantity, which would invert the pricing logic, create negative subtotals, and corrupt the getVolumeDiscountPercent tiers.

3. Reproduction:
const order = new OrderProcessor();
order.addLineItem({ sku: '123', unitPrice: 100, quantity: -2 });
// System accepts it, leading to a subtotal of -200.

4. Severity: Major. Allows data corruption and potentially exploitable cart logic.

5. Reasoning/Discovery Process: I found by evaluating input boundaries. In an automation mindset, inputs should never be trusted, and testing negative/null boundaries on numerical inputs is standard practice.

## Bug 6: Edge Case - Unhandled Zero-Price Items leading to Math Errors
- **1. Location:** `calculateTotal` and `addLineItem` methods.
- **2. Description:** The system allows adding items with a `$0.00` unit price ( free promotional items). However, the logic does not safely handle orders where the total subtotal is exactly zero. In advanced implementations where coupons or taxes are distributed proportionally, a zero subtotal causes a division-by-zero scenario, resulting in `NaN` (Not a Number) propagating through the financial totals.
- **3. Reproduction:**
  const order = new OrderProcessor();
  order.addLineItem({ sku: 'FREE-GIFT', unitPrice: 0, quantity: 1, taxRate: 0.1 });
  // If proportional math is applied without safeguards, total becomes NaN.

4. Severity: Medium. While orders with only free items are rare, generating NaN breaks the UI and downstream payment gateways.

5. Reasoning/Discovery Process: Discovered by applying Boundary Value Analysis on the unitPrice input. Testing the absolute minimum boundary ($0.00) revealed the lack of mathematical safeguards for zero-division in logic.

## Bug 7: Edge Case - Volume Tiers Vulnerable
1. Location: getVolumeDiscountPercent and addLineItem methods.

2. Description: The volume discount tiers (10, 25, 50, 100) rely entirely on getTotalItemCount(). Because addLineItem lacks input type validation, passing a string for quantity (e.g., "10") causes string concatenation (0 + "10" = "010"), breaking the numerical tier logic. Additionally, fractional quantities (e.g., 10.5) are accepted, which is invalid for discrete physical items and can trigger incorrect discount brackets.

3. Reproduction: i following this logic
const order = new OrderProcessor();
order.addLineItem({ sku: '123', unitPrice: 10, quantity: "50" });
4. Severity: Medium. Exposes the discount engine to exploitation if the frontend fails to sanitize inputs.

5. Reasoning/Discovery Process: testing on the discount thresholds. In JavaScript, trusting numerical boundaries without strict type checking (typeof quantity === 'number') or integer validation (Number.isInteger()) is a critical structural flaw (I wanted to know more about this took some more time just courious).