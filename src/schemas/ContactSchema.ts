import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),

  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Digite um e-mail válido."),

  subject: z.string().min(1, "O assunto é obrigatório."),

  message: z
    .string()
    .min(1, "A mensagem é obrigatória.")
    .min(10, "A mensagem deve ter no mínimo 10 caracteres."),
});
