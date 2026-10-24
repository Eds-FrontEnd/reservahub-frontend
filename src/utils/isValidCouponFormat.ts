export const isValidCouponFormat = (coupon: string): boolean =>
  /^[A-Z0-9_%\-]{3,20}$/.test(coupon);
