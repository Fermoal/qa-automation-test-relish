mac@Macs-MacBook-Pro relish-qa-test % npm run coverage

> relish-qa-test@1.0.0 coverage
> jest --coverage --collectCoverageFrom='order-processor.fixed.js'

 PASS  ./order-processor.test.js
  OrderProcessor - Original vs fixed hacemos una comparacion
    ✓ OrderProcessor comprehensive validation: Original bugs vs Fixed logic (13 ms)
   Validar que el Fixed NO rompa con iteraciones y que el Original sí
    ✓ Fixed version should not throw TypeError on iteration limits (Original does) (1 ms)
   Validar que nunca se generen totales negativos
    ✓ Fixed version should prevent negative totals when coupon exceeds subtotal
   con este test cubro metodos importantes como removeLineItem y updateQuantity, removeCoupon, getSummary
    ✓ Remaining methods and negative branches
   Con este test cubro prueba sobre porcentajes
    ✓ Volume discount tiers and zero subtotal edge case (1 ms)

--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |     100 |      100 |     100 |     100 |                   
 order-processor.fixed.js |     100 |      100 |     100 |     100 |                   
--------------------------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.489 s, estimated 1 s
Ran all test suites.