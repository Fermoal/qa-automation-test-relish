/**
 * OrderProcessor - Fixed Version
 */
function OrderProcessor() {
    this.lineItems = [];
    this.coupon = null;
    this.isRush = false;
    this.status = "draft";
    
    this.addLineItem = function (item) {
      if (item.quantity <= 0) return; // Validación de cantidades inválidas
      
      const existingItem = this.lineItems.find((i) => i.sku === item.sku);
      if (existingItem) {
        existingItem.quantity += item.quantity; //  SKUs duplicados
      } else {
        this.lineItems.push({
          sku: item.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          taxRate: item.taxRate || 0,
        });
      }
    };
    
    this.removeLineItem = function (sku) {
      this.lineItems = this.lineItems.filter((item) => item.sku !== sku);
    };
    
    this.updateQuantity = function (sku, newQuantity) {
      if (newQuantity <= 0) return;
      const item = this.lineItems.find((item) => item.sku === sku);
      if (item) {
        item.quantity = newQuantity;
      }
    };
    
    this.applyCoupon = function (coupon) {
      this.coupon = coupon;
    };
    
    this.removeCoupon = function () {
      this.coupon = null;
    };
    
    this.setRush = function (isRush) {
      this.isRush = isRush;
    };
    
    this.getTotalItemCount = function () {
      let count = 0;
      // Corrección del límite del array (< en lugar de <=)
      for (let i = 0; i < this.lineItems.length; i++) {
        count += this.lineItems[i].quantity;
      }
      return count;
    };
    
    this.getVolumeDiscountPercent = function () {
      const count = this.getTotalItemCount();
      if (count >= 100) return 20;
      if (count >= 50) return 15;
      if (count >= 25) return 10;
      if (count >= 10) return 5;
      return 0;
    };
    
    this.calculateTotal = function () {
      const volumeDiscountPercent = this.getVolumeDiscountPercent();
      let subtotal = 0;
      let totalTax = 0;
      let discountedSubtotal = 0;
  
      // Fase 1: Calcular subtotal y aplicar descuento por volumen
      const itemsWithDiscounts = this.lineItems.map((item) => {
        const lineSubtotal = item.unitPrice * item.quantity;
        subtotal += lineSubtotal;
        const discountedLineSubtotal = lineSubtotal * (1 - volumeDiscountPercent / 100);
        discountedSubtotal += discountedLineSubtotal;
        return { ...item, discountedLineSubtotal };
      });
  
      const volumeDiscount = subtotal * (volumeDiscountPercent / 100);
      
      let couponDiscount = 0;
      if (this.coupon) {
        couponDiscount = this.coupon.discountAmount;
        // Previene totales negativos acotando el cupón al subtotal con descuento
        if (couponDiscount > discountedSubtotal) {
          couponDiscount = discountedSubtotal;
        }
      }
  
      let afterVolumeDiscount = subtotal - volumeDiscount;
      const afterVolumeAndCoupon = afterVolumeDiscount - couponDiscount;
  
      // Fase 2: Calcular impuestos DESPUÉS del cupón, distribuido de manera proporcional
      itemsWithDiscounts.forEach((item) => {
        const proportion = discountedSubtotal > 0 ? (item.discountedLineSubtotal / discountedSubtotal) : 0;
        const itemCouponDiscount = couponDiscount * proportion;
        const taxableAmount = item.discountedLineSubtotal - itemCouponDiscount;
        totalTax += taxableAmount * item.taxRate;
      });
  
      let rushSurcharge = 0;
      if (this.isRush) {
        rushSurcharge = 15.0;
      }
  
      const total = afterVolumeAndCoupon + totalTax + rushSurcharge;
  
      // Uso de Number.EPSILON para precisión financiera (me tome un momento para investigar este)
      const roundVal = (val) => Math.round((val + Number.EPSILON) * 100) / 100;
  
      return {
        subtotal: roundVal(subtotal),
        volumeDiscount: roundVal(volumeDiscount),
        couponDiscount: roundVal(couponDiscount),
        tax: roundVal(totalTax),
        rushSurcharge: rushSurcharge,
        total: roundVal(total),
      };
    };
  
    this.advanceStatus = function () {
      const transitions = {
        draft: "submitted",
        submitted: "processing",
        processing: "shipped",
        shipped: "delivered",
      };
      if (transitions[this.status]) {
        this.status = transitions[this.status];
        return this.status;
      }
      return this.status;
    };
    
    this.cancel = function () {
      if (this.status === "draft" || this.status === "submitted") {
        this.status = "cancelled";
        return true;
      }
      return false;
    };
    
    this.getSummary = function () {
      const totals = this.calculateTotal();
      return {
        itemCount: this.getTotalItemCount(),
        lineItemCount: this.lineItems.length,
        status: this.status,
        isRush: this.isRush,
        hasCoupon: this.coupon != null,
        ...totals,
      };
    };
  }
  
  module.exports = OrderProcessor;