import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "../../components/Button";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import { useLoading } from "../../contexts/LoadingContext";
import {
  subscribePasswordResetStatus,
  type PasswordResetStatusResponse,
} from "../../services/AuthService";

import "./AdminResetPasswordStyle.css";

type RequestStatus =
  | "PENDENTE"
  | "APROVADA"
  | "REJEITADA"
  | "RECUSADA"
  | "CANCELADA"
  | "FINALIZADA";

type ResetPasswordRequest = {
  id: number;
  email: string;
  status: RequestStatus;
  criadoEm: string;
};

type ApiResponse =
  | ResetPasswordRequest[]
  | {
      content: ResetPasswordRequest[];
    };

type RequestAction = "aprovar" | "recusar";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  buttonText?: string;
  buttonColor?: string;
  buttonHoverColor?: string;
  onConfirm?: () => void;
};

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

const REQUESTS_ENDPOINT = `${API_URL}/api/admin/solicitacoes-reset-senha`;
const ADMIN_EVENTS_ENDPOINT = `${REQUESTS_ENDPOINT}/eventos`;
const RECONNECT_DELAY = 3000;

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REJEITADA: "Recusada",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
  FINALIZADA: "Finalizada",
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "mensagem" in data &&
      typeof data.mensagem === "string"
    ) {
      return data.mensagem;
    }
  } catch {
    return "Não foi possível concluir a operação.";
  }

  return "Não foi possível concluir a operação.";
};

const normalizarStatus = (status: string): RequestStatus | null => {
  const normalizado = status.trim().toUpperCase();

  return Object.prototype.hasOwnProperty.call(STATUS_LABELS, normalizado)
    ? (normalizado as RequestStatus)
    : null;
};

const formatDate = (date: string): string => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
};

const AdminResetPasswordPage = () => {
  const [requests, setRequests] = useState<ResetPasswordRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
  });

  const { startLoading } = useLoading();

  const hasConnectedBefore = useRef(false);
  const activeRequestController = useRef<AbortController | null>(null);

  const closeModal = useCallback(() => {
    setModal((current) => ({
      ...current,
      open: false,
      onConfirm: undefined,
    }));
  }, []);

  const showFeedbackModal = useCallback(
    (title: string, message: string, _action: RequestAction) => {
      setModal({
        open: true,
        title,
        message,
        buttonText: "Entendi",
        onConfirm: closeModal,
        buttonColor: "var(--color-secondary)",
        buttonHoverColor: "var(--color-primary)",
      });
    },
    [closeModal],
  );

  const loadRequests = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
      setFeedback("");
    }

    const token = getToken();

    if (!token) {
      const message = "Sua sessão expirou. Entre novamente como administrador.";

      setError(message);

      if (!silent) {
        setLoading(false);
      }

      return;
    }

    try {
      const response = await fetch(REQUESTS_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: ApiResponse = await response.json();
      const result = Array.isArray(data) ? data : data.content;

      setRequests(result);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    let active = true;
    let reconnectTimer: number | undefined;
    let controller: AbortController | null = null;

    const connect = async (): Promise<void> => {
      while (active) {
        const token = getToken();

        if (!token) {
          setError("Sua sessão expirou. Entre novamente como administrador.");
          return;
        }

        controller = new AbortController();
        activeRequestController.current = controller;

        try {
          const response = await fetch(ADMIN_EVENTS_ENDPOINT, {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              setError(
                "Sua sessão expirou ou você não tem permissão para acompanhar as solicitações.",
              );
              return;
            }

            throw new Error(`Falha na conexão SSE (HTTP ${response.status}).`);
          }

          if (!response.body) {
            throw new Error("O servidor não disponibilizou o fluxo SSE.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (active) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() ?? "";

            for (const frame of frames) {
              if (!active || !frame.trim()) {
                continue;
              }

              let eventName = "message";

              for (const line of frame.split(/\r?\n/)) {
                if (line.startsWith("event:")) {
                  eventName = line.slice(6).trim();
                  break;
                }
              }

              if (eventName === "conectado") {
                if (hasConnectedBefore.current) {
                  void loadRequests(true);
                }

                hasConnectedBefore.current = true;
              } else if (eventName === "alteracao") {
                void loadRequests(true);
              }
            }
          }

          try {
            await reader.cancel();
          } catch {}
        } catch (connectionError) {
          if (!active) {
            return;
          }

          if (
            connectionError instanceof DOMException &&
            connectionError.name === "AbortError"
          ) {
            return;
          }
        }

        if (!active) {
          return;
        }

        await new Promise<void>((resolve) => {
          reconnectTimer = window.setTimeout(resolve, RECONNECT_DELAY);
        });
      }
    };

    const startTimer = window.setTimeout(() => {
      void connect();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(startTimer);
      controller?.abort();

      if (activeRequestController.current === controller) {
        activeRequestController.current = null;
      }

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [loadRequests]);

  const pendingRequestIdsKey = requests
    .filter((request) => request.status === "PENDENTE")
    .map((request) => request.id)
    .sort((first, second) => first - second)
    .join(",");

  useEffect(() => {
    if (!pendingRequestIdsKey) {
      return;
    }

    let active = true;
    const eventSources: EventSource[] = [];
    const requestIds = pendingRequestIdsKey.split(",").map(Number);

    requestIds.forEach((requestId) => {
      const eventSource = subscribePasswordResetStatus(
        requestId,
        (response: PasswordResetStatusResponse) => {
          if (!active) {
            return;
          }

          const status = normalizarStatus(response.status);

          if (!status) {
            return;
          }

          setRequests((currentRequests) =>
            currentRequests.map((request) => {
              if (request.id !== response.id || request.status === status) {
                return request;
              }

              return {
                ...request,
                status,
                criadoEm: response.criadoEm || request.criadoEm,
              };
            }),
          );

          setError("");
        },
        (message) => {
          if (active) {
            setError(message);
          }
        },
      );

      eventSources.push(eventSource);
    });

    return () => {
      active = false;
      eventSources.forEach((eventSource) => eventSource.close());
    };
  }, [pendingRequestIdsKey]);

  const processRequestAction = async (
    request: ResetPasswordRequest,
    action: RequestAction,
  ) => {
    const token = getToken();

    if (!token) {
      const message = "Sua sessão expirou. Entre novamente como administrador.";

      setError(message);
      showFeedbackModal("Sessão expirada", message, action);
      return;
    }

    setProcessingId(request.id);
    setError("");
    setFeedback("");

    const finishLoading = startLoading();

    try {
      const response = await fetch(
        `${REQUESTS_ENDPOINT}/${request.id}/${action}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const successMessage =
        action === "aprovar"
          ? `Solicitação de ${request.email} aprovada.`
          : `Solicitação de ${request.email} recusada.`;

      setFeedback(successMessage);
      showFeedbackModal("Operação concluída", successMessage, action);
      await loadRequests(true);
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar a solicitação.";

      setError(errorMessage);
      showFeedbackModal("Não foi possível concluir", errorMessage, action);
    } finally {
      finishLoading();
      setProcessingId(null);
    }
  };

  const handleRequestAction = (
    request: ResetPasswordRequest,
    action: RequestAction,
  ) => {
    const actionLabel = action === "aprovar" ? "aprovar" : "recusar";

    setModal({
      open: true,
      title: "Confirmar ação",
      message: `Deseja realmente ${actionLabel} a solicitação de redefinição de senha de ${request.email}?`,
      buttonText: `Confirmar ${actionLabel}`,
      buttonColor:
        action === "aprovar" ? "var(--color-secondary)" : "var(--color-red)",
      buttonHoverColor: "var(--color-primary)",
      onConfirm: () => {
        closeModal();
        void processRequestAction(request, action);
      },
    });
  };

  const handleModalButtonClick = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
      return;
    }

    closeModal();
  };

  const pendingCount = requests.filter(
    (request) => request.status === "PENDENTE",
  ).length;

  return (
    <>
      <Header />

      <main className="admin-reset">
        <section
          className="admin-reset__container"
          aria-labelledby="admin-reset-title"
        >
          <header className="admin-reset__header">
            <h1 id="admin-reset-title" className="admin-reset__title">
              Redefinição de senha
            </h1>

            <p className="admin-reset__description">
              Gerencie as solicitações de redefinição de senha dos usuários.
            </p>
          </header>

          <div className="admin-reset__summary">
            <span className="admin-reset__summary-label">
              Solicitações pendentes
            </span>

            <strong className="admin-reset__summary-count">
              {pendingCount}
            </strong>
          </div>

          <div className="admin-reset__toolbar">
            <h2 className="admin-reset__subtitle">Solicitações recebidas</h2>

            <Button
              type="button"
              backgroundColor="var(--color-primary)"
              hoverBackgroundColor="var(--color-secondary)"
              onClick={() => void loadRequests()}
              disabled={loading || processingId !== null}
            >
              Atualizar lista
            </Button>
          </div>

          {error && (
            <div
              className="admin-reset__alert admin-reset__alert--error"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {feedback && (
            <div
              className="admin-reset__alert admin-reset__alert--success"
              role="status"
            >
              <p>{feedback}</p>
            </div>
          )}

          {loading ? (
            <p className="admin-reset__message" role="status">
              Carregando solicitações...
            </p>
          ) : requests.length === 0 ? (
            <p className="admin-reset__message">
              Nenhuma solicitação de redefinição de senha encontrada.
            </p>
          ) : (
            <div className="admin-reset__table-wrapper">
              <table className="admin-reset__table">
                <caption className="admin-reset__caption">
                  Solicitações de redefinição de senha cadastradas no sistema.
                </caption>

                <thead>
                  <tr>
                    <th scope="col">E-mail</th>
                    <th scope="col">Data da solicitação</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => {
                    const isProcessing = processingId === request.id;
                    const isPending = request.status === "PENDENTE";

                    return (
                      <tr key={request.id}>
                        <td data-label="E-mail">{request.email}</td>

                        <td data-label="Data da solicitação">
                          {formatDate(request.criadoEm)}
                        </td>

                        <td data-label="Status">
                          <span
                            className={`admin-reset__status admin-reset__status--${request.status.toLowerCase()}`}
                          >
                            {STATUS_LABELS[request.status]}
                          </span>
                        </td>

                        <td data-label="Ações">
                          {isPending ? (
                            <div className="admin-reset__actions">
                              <Button
                                type="button"
                                backgroundColor="var(--color-secondary)"
                                hoverBackgroundColor="var(--color-primary)"
                                disabled={processingId !== null}
                                onClick={() =>
                                  handleRequestAction(request, "aprovar")
                                }
                              >
                                {isProcessing ? "Processando..." : "Aprovar"}
                              </Button>

                              <Button
                                type="button"
                                backgroundColor="var(--color-red)"
                                hoverBackgroundColor="var(--color-primary)"
                                disabled={processingId !== null}
                                onClick={() =>
                                  handleRequestAction(request, "recusar")
                                }
                              >
                                {isProcessing ? "Processando..." : "Recusar"}
                              </Button>
                            </div>
                          ) : (
                            <span className="admin-reset__resolved">
                              Solicitação finalizada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        buttonText={modal.buttonText ?? "Entendi"}
        buttonColor={modal.buttonColor ?? "var(--color-secondary)"}
        buttonHoverColor={modal.buttonHoverColor ?? "var(--color-primary)"}
        onClose={closeModal}
        onButtonClick={handleModalButtonClick}
      />
    </>
  );
};

export default AdminResetPasswordPage;
