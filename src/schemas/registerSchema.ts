import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),

  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Digite um e-mail válido."),

  password: z
    .string()
    .min(1, "A senha é obrigatória.")
    .min(6, "A senha deve ter no mínimo 6 caracteres."),

  cep: z
    .string()
    .min(1, "O CEP é obrigatório.")
    .regex(/^\d{5}-?\d{3}$/, "Digite um CEP válido com 8 dígitos."),

  street: z.string().trim().min(1, "A rua é obrigatória."),

  neighborhood: z.string().trim().min(1, "O bairro é obrigatório."),

  city: z.string().trim().min(1, "A cidade é obrigatória."),

  state: z
    .string()
    .trim()
    .min(1, "A UF é obrigatória.")
    .regex(/^[A-Za-z]{2}$/, "Informe uma UF válida com 2 letras."),
});
