const OrderProcessorOriginal = require('./order-processor');
const OrderProcessorFixed = require('./order-processor.fixed');


describe('OrderProcessor - Original vs fixed hacemos una comparacion', () => {
    test('OrderProcessor comprehensive validation: Original bugs vs Fixed logic', () => {
    
        // 1. COMPROBAR QUE LOS BUGS EXISTEN EN EL CÓDIGO ORIGINAL ---
        const originalOrder = new OrderProcessorOriginal();
        originalOrder.addLineItem({ sku: '123', unitPrice: 100, quantity: 1, taxRate: 0.1 });
        
        // Valida que los métodos fallen y lancen TypeError debido a los límites del array
        expect(() => originalOrder.getTotalItemCount()).toThrow(TypeError);
        expect(() => originalOrder.calculateTotal()).toThrow(TypeError);

        // 2. COMPROBAR QUE LOS BUGS ESTÁN ARREGLADOS EN EL CÓDIGO NUEVO ---
        const fixedOrder = new OrderProcessorFixed();
        
        // Validar control de cantidades y duplicados (Edge Cases)
        fixedOrder.addLineItem({ sku: 'ITEM-1', unitPrice: 100, quantity: -5, taxRate: 0.1 }); // Se debe ignorar
        fixedOrder.addLineItem({ sku: 'ITEM-1', unitPrice: 100, quantity: 2, taxRate: 0.1 });
        fixedOrder.addLineItem({ sku: 'ITEM-1', unitPrice: 100, quantity: 3, taxRate: 0.1 }); // SKU repetido se suma
        
        expect(fixedOrder.lineItems.length).toBe(1);
        expect(fixedOrder.getTotalItemCount()).toBe(5); // El error fatal de iteración ya no ocurre

        // Validar lógica de negocio: Impuestos calculados DESPUÉS del cupón
        fixedOrder.applyCoupon({ code: 'HALF', discountAmount: 100 }); 
        // Escenario: 5 ítems a $100 = Subtotal $500. Sin descuento de volumen. Cupón $100. Base Imponible: $400. Impuesto (10%): $40.
        let totals = fixedOrder.calculateTotal();
        expect(totals.subtotal).toBe(500);
        expect(totals.couponDiscount).toBe(100);
        expect(totals.tax).toBe(40); // Si fuera el código original, el impuesto sería $50
        expect(totals.total).toBe(440);

        // 3. COMPROBAR CASOS LÍMITE (Edge Cases) ---
        const edgeOrder = new OrderProcessorFixed();
        edgeOrder.addLineItem({ sku: 'CHEAP', unitPrice: 10, quantity: 1, taxRate: 0 });
        edgeOrder.applyCoupon({ code: 'MASSIVE', discountAmount: 50 }); // Cupón mayor al costo del pedido
        let edgeTotals = edgeOrder.calculateTotal();
        
        expect(edgeTotals.total).toBe(0); // Evita un total negativo
        expect(edgeTotals.couponDiscount).toBe(10); // El descuento se limita al máximo del subtotal

        // 4. COMPROBAR LÓGICA DE NEGOCIO RESTANTE ---
        const bulkOrder = new OrderProcessorFixed();
        bulkOrder.addLineItem({ sku: 'BULK', unitPrice: 10, quantity: 25, taxRate: 0.1 }); // 25 items -> 10% descuento
        bulkOrder.setRush(true);
        let bulkTotals = bulkOrder.calculateTotal();
        
        // Subtotal: 250. Descuento Vol (10%): 25. Base Imponible: 225. Impuesto (10%): 22.5. Rush: 15. Total: 262.5
        expect(bulkTotals.volumeDiscount).toBe(25);
        expect(bulkTotals.rushSurcharge).toBe(15);
        expect(bulkTotals.total).toBe(262.5);

        // Validar transiciones de estado
        bulkOrder.advanceStatus();
        expect(bulkOrder.status).toBe('submitted');
        bulkOrder.cancel();
        expect(bulkOrder.status).toBe('cancelled');
    });
});

describe(' Validar que el Fixed NO rompa con iteraciones y que el Original sí', () => {
    test('Fixed version should not throw TypeError on iteration limits (Original does)', () => {
        const originalOrder = new OrderProcessorOriginal();
        originalOrder.addLineItem({ sku: '123', unitPrice: 100, quantity: 1, taxRate: 0.1 });

        // El original rompe por el bug de iteración
        expect(() => originalOrder.getTotalItemCount()).toThrow(TypeError);
        expect(() => originalOrder.calculateTotal()).toThrow(TypeError);

        const fixedOrder = new OrderProcessorFixed();
        fixedOrder.addLineItem({ sku: '123', unitPrice: 100, quantity: 1, taxRate: 0.1 });

        // El fixed NO debe romper
        expect(() => fixedOrder.getTotalItemCount()).not.toThrow();
        expect(() => fixedOrder.calculateTotal()).not.toThrow();
    });
});


describe(' Validar que nunca se generen totales negativos', () => {
    test('Fixed version should prevent negative totals when coupon exceeds subtotal', () => {
        const order = new OrderProcessorFixed();

        order.addLineItem({ sku: 'CHEAP', unitPrice: 10, quantity: 1, taxRate: 0 });
        order.applyCoupon({ code: 'MASSIVE', discountAmount: 50 });

        const totals = order.calculateTotal();

        expect(totals.subtotal).toBe(10);
        expect(totals.couponDiscount).toBe(10); // Se limita al subtotal
        expect(totals.total).toBe(0); // Nunca negativo
    });
});

describe(' con este test cubro metodos importantes como removeLineItem y updateQuantity, removeCoupon, getSummary', () => {
    test('Remaining methods and negative branches', () => {
        const order = new OrderProcessorFixed();
        
        // 1. Cubrir removeLineItem y updateQuantity
        order.addLineItem({ sku: 'TEST-1', unitPrice: 50, quantity: 2, taxRate: 0.1 });
        order.addLineItem({ sku: 'TEST-2', unitPrice: 30, quantity: 1, taxRate: 0 });
        
        order.updateQuantity('TEST-1', 4); // Rama exitosa
        order.updateQuantity('TEST-1', -1); // Rama de validación (<= 0)
        order.updateQuantity('GHOST-ITEM', 10); // Rama donde el ítem no existe
        expect(order.getTotalItemCount()).toBe(5); // 4 de TEST-1 + 1 de TEST-2
        
        order.removeLineItem('TEST-2');
        expect(order.lineItems.length).toBe(1);

        // 2. Cubrir removeCoupon
        order.applyCoupon({ code: 'DISCOUNT', discountAmount: 10 });
        order.removeCoupon();
        expect(order.coupon).toBeNull();

        // 3. Cubrir getSummary
        const summary = order.getSummary();
        expect(summary.itemCount).toBe(4);
        expect(summary.status).toBe('draft');

        // 4. Cubrir ramas negativas de advanceStatus y cancel
        order.status = 'shipped'; // Forzamos estado avanzado
        
        // Intentar cancelar un pedido enviado (debe retornar false)
        expect(order.cancel()).toBe(false);
        
        // Intentar avanzar desde "delivered" (no hay transición válida)
        order.status = 'delivered';
        expect(order.advanceStatus()).toBe('delivered');
    });
});

describe(' Con este test cubro prueba sobre porcentajes', () => {
    test('Volume discount tiers and zero subtotal edge case', () => {
        // Nivel 100+ items (20% descuento)
        const order100 = new OrderProcessorFixed();
        order100.addLineItem({ sku: 'T1', unitPrice: 1, quantity: 100 });
        expect(order100.getVolumeDiscountPercent()).toBe(20);

        // Nivel 50-99 items (15% descuento)
        const order50 = new OrderProcessorFixed();
        order50.addLineItem({ sku: 'T2', unitPrice: 1, quantity: 50 });
        expect(order50.getVolumeDiscountPercent()).toBe(15);

        // Nivel 10-24 items (5% descuento)
        const order10 = new OrderProcessorFixed();
        order10.addLineItem({ sku: 'T3', unitPrice: 1, quantity: 10 });
        expect(order10.getVolumeDiscountPercent()).toBe(5);

        // Forzar subtotal a cero para cubrir la rama `discountedSubtotal 
        const orderZero = new OrderProcessorFixed();
        orderZero.addLineItem({ sku: 'FREE', unitPrice: 0, quantity: 1, taxRate: 0.1 });
        const totals = orderZero.calculateTotal();
        expect(totals.tax).toBe(0);
        expect(totals.total).toBe(0);
    });
});