export type CupomPromocional = {
  id: number;
  nomeUsuario: string;
  emailUsuario: string;
  cupom: string;
  percentual: number;
  uf: string;
  dataCriacao: string;
  utilizado: boolean;
  ativo: boolean;
};

export type CriarCupomPromocionalRequest = {
  emailUsuario: string;
  cupom: string;
  percentual: number;
  ativo: boolean;
};

export type EditarCupomPromocionalRequest = {
  cupom: string;
  percentual: number;
  utilizado: boolean;
};

type CupomPromocionalResponseData =
  | CupomPromocional[]
  | {
      content: CupomPromocional[];
    };

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

const CUPONS_ENDPOINT = `${API_URL}/api/admin/cupons`;

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null) {
      if (
        "message" in data &&
        typeof data.message === "string" &&
        data.message.trim()
      ) {
        return data.message;
      }

      if (
        "mensagem" in data &&
        typeof data.mensagem === "string" &&
        data.mensagem.trim()
      ) {
        return data.mensagem;
      }

      if (
        "detail" in data &&
        typeof data.detail === "string" &&
        data.detail.trim()
      ) {
        return data.detail;
      }
    }
  } catch {
    // A resposta pode não conter JSON.
  }

  if (response.status === 401) {
    return "Sua sessão expirou. Entre novamente como administrador.";
  }

  if (response.status === 403) {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (response.status === 409) {
    return "Não foi possível concluir a operação devido a um conflito com dados existentes.";
  }

  return "Não foi possível concluir a operação.";
};

const isCupomPromocional = (value: unknown): value is CupomPromocional => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const cupom = value as Record<string, unknown>;

  return (
    typeof cupom.id === "number" &&
    typeof cupom.nomeUsuario === "string" &&
    typeof cupom.emailUsuario === "string" &&
    typeof cupom.cupom === "string" &&
    typeof cupom.percentual === "number" &&
    typeof cupom.uf === "string" &&
    typeof cupom.dataCriacao === "string" &&
    typeof cupom.utilizado === "boolean" &&
    typeof cupom.ativo === "boolean"
  );
};

const isCupomPromocionalResponseData = (
  value: unknown,
): value is CupomPromocionalResponseData => {
  if (Array.isArray(value)) {
    return value.every(isCupomPromocional);
  }

  if (typeof value !== "object" || value === null || !("content" in value)) {
    return false;
  }

  return (
    Array.isArray(value.content) && value.content.every(isCupomPromocional)
  );
};

const request = async (
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> => {
  const token = getToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente como administrador.");
  }

  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
};

const validateCouponId = (id: number): void => {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Identificador de cupom inválido.");
  }
};

const readCouponResponse = async (
  response: Response,
  operation: string,
): Promise<CupomPromocional> => {
  const data: unknown = await response.json();

  if (!isCupomPromocional(data)) {
    throw new Error(
      `A API retornou dados inválidos após ${operation} o cupom.`,
    );
  }

  return data;
};

export const listarCuponsPromocionais = async (
  signal?: AbortSignal,
): Promise<CupomPromocional[]> => {
  const response = await request(CUPONS_ENDPOINT, {
    method: "GET",
    signal,
  });

  const data: unknown = await response.json();

  if (!isCupomPromocionalResponseData(data)) {
    throw new Error(
      "A API retornou dados inválidos para a listagem de cupons.",
    );
  }

  return Array.isArray(data) ? data : data.content;
};

export const criarCupomPromocional = async (
  payload: CriarCupomPromocionalRequest,
): Promise<CupomPromocional> => {
  const response = await request(CUPONS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return readCouponResponse(response, "criar");
};

export const editarCupomPromocional = async (
  id: number,
  payload: EditarCupomPromocionalRequest,
): Promise<CupomPromocional> => {
  validateCouponId(id);

  const response = await request(`${CUPONS_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return readCouponResponse(response, "editar");
};

export const alterarStatusCupomPromocional = async (
  id: number,
  ativo: boolean,
): Promise<CupomPromocional> => {
  validateCouponId(id);

  const response = await request(`${CUPONS_ENDPOINT}/${id}/ativo`, {
    method: "PATCH",
    body: JSON.stringify({ ativo }),
  });

  return readCouponResponse(response, "alterar o status");
};

export const excluirCupomPromocional = async (id: number): Promise<void> => {
  validateCouponId(id);

  await request(`${CUPONS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};
