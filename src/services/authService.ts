const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export interface User {
  name: string;
  email: string;
  password: string;
  perfil: "USER" | "ADMIN";
}

interface LoginResponse {
  token: string;
  nome: string;
  perfil: "USER" | "ADMIN";
}

interface ApiMessage {
  mensagem?: string;
  message?: string;
}

export interface PasswordResetRequestResponse {
  id: number;
  email: string;
  status: string;
  criadoEm: string;
}

export interface PasswordResetStatusResponse {
  id: number;
  status: string;
  criadoEm: string;
}

interface ResetPasswordRequest {
  solicitacaoId: number;
  novaSenha: string;
}

async function parseApiMessage(response: Response): Promise<ApiMessage> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    const result: unknown = JSON.parse(text);

    if (typeof result === "object" && result !== null) {
      return result as ApiMessage;
    }
  } catch {
    return { mensagem: text };
  }

  return {};
}

function getErrorMessage(result: ApiMessage, fallback: string): string {
  return result.mensagem ?? result.message ?? fallback;
}

export const registerUser = async (user: User): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: user.name,
        email: user.email.trim(),
        senha: user.password,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        senha: password,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as LoginResponse;

    if (!data.token || !data.nome || !["USER", "ADMIN"].includes(data.perfil)) {
      return null;
    }

    localStorage.setItem("token", data.token);

    return {
      name: data.nome,
      email: email.trim(),
      password: "",
      perfil: data.perfil,
    };
  } catch {
    return null;
  }
};

export const logoutUser = async (): Promise<boolean> => {
  const token = localStorage.getItem("token");

  try {
    if (!token) {
      return true;
    }

    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authenticatedUser");
  }
};

async function requestReset<T>(
  endpoint: string,
  method: "POST" | "PUT",
  body: T,
): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await parseApiMessage(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Não foi possível concluir a solicitação."),
    );
  }

  return getErrorMessage(result, "Operação concluída com sucesso.");
}

export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetRequestResponse> {
  const response = await fetch(`${API_URL}/api/auth/solicitar-reset-senha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
    }),
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? getErrorMessage(
            result as ApiMessage,
            "Não foi possível solicitar a recuperação da senha.",
          )
        : "Não foi possível solicitar a recuperação da senha.";

    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof result.id !== "number" ||
    !("status" in result) ||
    typeof result.status !== "string"
  ) {
    throw new Error(
      "A API não retornou o identificador e o status da solicitação de recuperação.",
    );
  }

  return result as PasswordResetRequestResponse;
}

export async function getPasswordResetStatus(
  solicitacaoId: number,
): Promise<PasswordResetStatusResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/solicitacao-reset-senha/${solicitacaoId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? getErrorMessage(
            result as ApiMessage,
            "Não foi possível consultar o status da solicitação.",
          )
        : "Não foi possível consultar o status da solicitação.";

    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof result.id !== "number" ||
    !("status" in result) ||
    typeof result.status !== "string"
  ) {
    throw new Error("A API retornou um status de solicitação inválido.");
  }

  return result as PasswordResetStatusResponse;
}

export function subscribePasswordResetStatus(
  solicitacaoId: number,
  onStatus: (status: PasswordResetStatusResponse) => void,
  onError: (message: string) => void,
): EventSource {
  const eventSource = new EventSource(
    `${API_URL}/api/auth/solicitacao-reset-senha/${solicitacaoId}/eventos`,
  );

  eventSource.addEventListener("status", (event: Event) => {
    try {
      const result: unknown = JSON.parse((event as MessageEvent<string>).data);

      if (
        typeof result !== "object" ||
        result === null ||
        !("id" in result) ||
        typeof result.id !== "number" ||
        !("status" in result) ||
        typeof result.status !== "string"
      ) {
        onError("A API retornou um status de solicitação inválido.");
        return;
      }

      onStatus({
        id: result.id,
        status: result.status,
        criadoEm:
          "criadoEm" in result && typeof result.criadoEm === "string"
            ? result.criadoEm
            : "",
      });
    } catch {
      onError("Não foi possível interpretar o status da solicitação.");
    }
  });

  eventSource.onerror = () => {
    onError(
      "Conexão com o servidor interrompida. Tentando reconectar automaticamente.",
    );
  };

  return eventSource;
}

export function resetPassword(request: ResetPasswordRequest): Promise<string> {
  return requestReset("redefinir-senha", "PUT", {
    solicitacaoId: request.solicitacaoId,
    novaSenha: request.novaSenha,
  });
}
