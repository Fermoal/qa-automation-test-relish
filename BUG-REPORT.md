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

