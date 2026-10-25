import { z } from "zod";

export const adminProductSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome do produto.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),

  stock: z.coerce
    .number()
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo."),

  modelo_produto: z
    .string()
    .trim()
    .min(1, "Informe o modelo.")
    .max(100, "O modelo deve ter no máximo 100 caracteres."),

  description: z.string().trim().min(1, "Informe a descrição."),

  id_plano: z.string().trim().min(1, "Selecione um plano."),

  image_url: z
    .string()
    .trim()
    .min(1, "Selecione uma imagem para o produto.")
    .max(255, "O caminho da imagem é muito longo."),
});

export type AdminProductFormData = z.infer<typeof adminProductSchema>;
