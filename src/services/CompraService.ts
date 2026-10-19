const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export interface ItemCompra {
  productId: string;
  quantity: number;
  planMonths: number;
}

export interface CompraResponse {
  mensagem: string;
  totalItens: number;
}

export interface CompraPayload {
  items: ItemCompra[];
  cupomDesconto: string | null;
}

export interface ValidarCupomResponse {
  valido: boolean;
  mensagem: string;
  percentual: number;
}

const getToken = (): string => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  return token;
};

const getErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const data: { message?: string; detail?: string } = await response.json();

    return (
      data.message ??
      data.detail ??
      (response.status === 401 || response.status === 403
        ? "Sua sessão expirou. Faça login novamente."
        : fallbackMessage)
    );
  } catch {
    if (response.status === 401 || response.status === 403) {
      return "Sua sessão expirou. Faça login novamente.";
    }

    return fallbackMessage;
  }
};

export const CompraService = {
  async validarCupom(cupomDesconto: string): Promise<ValidarCupomResponse> {
    const token = getToken();
    const cupomNormalizado = cupomDesconto.trim().toUpperCase();

    const response = await fetch(`${API_URL}/api/compras/validar-cupom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cupomDesconto: cupomNormalizado,
      }),
    });

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Não foi possível validar o cupom.",
      );

      throw new Error(message);
    }

    return response.json() as Promise<ValidarCupomResponse>;
  },

  async concluirCompra(
    items: ItemCompra[],
    cupomDesconto?: string,
  ): Promise<CompraResponse> {
    const token = getToken();

    const payload: CompraPayload = {
      items,
      cupomDesconto: cupomDesconto?.trim().toUpperCase() || null,
    };

    const response = await fetch(`${API_URL}/api/compras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Não foi possível concluir sua assinatura.",
      );

      throw new Error(message);
    }

    return response.json() as Promise<CompraResponse>;
  },
};
