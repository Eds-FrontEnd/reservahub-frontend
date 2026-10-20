import { z } from "zod";

const COUPON_HELP = "Digite letras, números ou hífen.";

const couponCodeSchema = z
  .string()
  .min(3, COUPON_HELP)
  .max(20, COUPON_HELP)
  .regex(/^[A-Z0-9_-]+$/, COUPON_HELP);

const percentageSchema = z
  .string()
  .min(1, "Informe o percentual.")
  .refine(
    (value) =>
      Number.isInteger(Number(value)) &&
      Number(value) >= 1 &&
      Number(value) <= 100,
    "O percentual deve ser um número inteiro entre 1 e 100.",
  );

export const adminCouponSchema = z.object({
  emailUsuario: z
    .string()
    .trim()
    .min(1, "Informe o e-mail do usuário.")
    .max(254, "O e-mail deve ter no máximo 254 caracteres.")
    .email("Informe um endereço de e-mail válido."),
  cupom: couponCodeSchema,
  percentual: percentageSchema,
});

export const editCouponSchema = z.object({
  cupom: couponCodeSchema,
  percentual: percentageSchema,
});
