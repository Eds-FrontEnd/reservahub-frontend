import axios from "axios";

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  unidade?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  estado?: string;
  regiao?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export const fetchCepData = async (
  cep: string,
  signal: AbortSignal,
): Promise<ViaCepResponse> => {
  const normalizedCep = cep.replace(/\D/g, "");

  const response = await axios.get<ViaCepResponse>(
    `https://viacep.com.br/ws/${normalizedCep}/json/`,
    {
      signal,
      timeout: 10000,
    },
  );

  return response.data;
};
