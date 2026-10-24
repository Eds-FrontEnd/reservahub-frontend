import { isValidCouponFormat } from "./isValidCouponFormat";

describe("isValidCouponFormat", () => {
  it("aceita códigos alfanuméricos com hífen ou underline", () => {
    expect(isValidCouponFormat("DESC10")).toBe(true);
    expect(isValidCouponFormat("PROMO15")).toBe(true);
    expect(isValidCouponFormat("CUPOM-10")).toBe(true);
    expect(isValidCouponFormat("CUPOM_10")).toBe(true);
  });

  it("aceita códigos com percentual", () => {
    expect(isValidCouponFormat("DESC10%")).toBe(true);
    expect(isValidCouponFormat("PROMO9%")).toBe(true);
    expect(isValidCouponFormat("DESC20%")).toBe(true);
  });

  it("aceita códigos com comprimento entre 3 e 20 caracteres", () => {
    expect(isValidCouponFormat("ABC")).toBe(true);
    expect(isValidCouponFormat("A".repeat(20))).toBe(true);
  });

  it("rejeita códigos menores que 3 ou maiores que 20 caracteres", () => {
    expect(isValidCouponFormat("AB")).toBe(false);
    expect(isValidCouponFormat("A".repeat(21))).toBe(false);
  });

  it("rejeita símbolos não permitidos", () => {
    expect(isValidCouponFormat("DESC@10")).toBe(false);
    expect(isValidCouponFormat("CUPOM.10")).toBe(false);
    expect(isValidCouponFormat("CUPOM 10")).toBe(false);
  });

  it("rejeita letras minúsculas e espaços quando chamados diretamente", () => {
    expect(isValidCouponFormat("desc10")).toBe(false);
    expect(isValidCouponFormat(" DESC10")).toBe(false);
    expect(isValidCouponFormat("DESC10 ")).toBe(false);
  });

  it("rejeita códigos vazios", () => {
    expect(isValidCouponFormat("")).toBe(false);
  });
});
