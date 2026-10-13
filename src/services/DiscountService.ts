import { STATE_DISCOUNTS } from "../../src/tests/discountMock";

export const getDiscountByState = (state: string): number => {
  return STATE_DISCOUNTS[state.toUpperCase()] ?? 6;
};

export const generateCoupon = (discount: number): string => {
  return `DESC${discount}%`;
};
