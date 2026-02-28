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
