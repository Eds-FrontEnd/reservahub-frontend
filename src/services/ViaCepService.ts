import axios from "axios";

export interface ViaCepResponse {
  cep: string;
  localidade: string;
  uf: string;
  regiao?: string;
  erro?: boolean;
}

export const fetchCepData = async (
  cep: string,
  signal: AbortSignal,
): Promise<ViaCepResponse> => {
  const response = await axios.get<ViaCepResponse>(
    `https://viacep.com.br/ws/${cep}/json/`,
    {
      signal,
      timeout: 10000,
    },
  );

  return response.data;
};
