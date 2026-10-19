import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Button } from "../../components/Button";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import {
  alterarStatusCupomPromocional,
  criarCupomPromocional,
  editarCupomPromocional,
  excluirCupomPromocional,
  listarCuponsPromocionais,
  type CupomPromocional,
} from "../../services/CupomPromocionalAdminService";

import "./AdminCouponsStyle.css";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  buttonText?: string;
  buttonColor?: string;
  buttonHoverColor?: string;
  onConfirm?: () => void;
};

type FormValues = {
  emailUsuario: string;
  cupom: string;
  percentual: string;
};

type EditFormValues = {
  cupom: string;
  percentual: string;
};

const INITIAL_FORM: FormValues = {
  emailUsuario: "",
  cupom: "",
  percentual: "10",
};

const INITIAL_EDIT_FORM: EditFormValues = {
  cupom: "",
  percentual: "",
};

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

const ESTOQUE_EVENTS_ENDPOINT = `${API_URL}/api/smartphones/estoque/eventos`;

const RECONNECT_DELAY = 3000;

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

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<CupomPromocional[]>([]);
  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [editForm, setEditForm] = useState<EditFormValues>(INITIAL_EDIT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
  });

  const listController = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  const closeModal = useCallback(() => {
    setModal((current) => ({
      ...current,
      open: false,
      onConfirm: undefined,
    }));
  }, []);

  const showMessageModal = useCallback(
    (title: string, message: string) => {
      setModal({
        open: true,
        title,
        message,
        buttonText: "Entendi",
        buttonColor: "var(--color-secondary)",
        buttonHoverColor: "var(--color-primary)",
        onConfirm: closeModal,
      });
    },
    [closeModal],
  );

  const loadCoupons = useCallback(async (silent = false) => {
    listController.current?.abort();

    const controller = new AbortController();
    listController.current = controller;

    if (!silent) {
      setLoading(true);
      setError("");
      setFeedback("");
    }

    try {
      const result = await listarCuponsPromocionais(controller.signal);

      if (controller.signal.aborted || !mounted.current) {
        return;
      }

      setCoupons(result);
      setError("");
    } catch (requestError) {
      if (
        controller.signal.aborted ||
        (requestError instanceof DOMException &&
          requestError.name === "AbortError")
      ) {
        return;
      }

      if (!mounted.current) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar os cupons promocionais.",
      );
    } finally {
      if (mounted.current && !controller.signal.aborted && !silent) {
        setLoading(false);
      }

      if (listController.current === controller) {
        listController.current = null;
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadCoupons();

    return () => {
      mounted.current = false;
      listController.current?.abort();
      listController.current = null;
    };
  }, [loadCoupons]);

  useEffect(() => {
    let active = true;
    let reconnectTimer: number | undefined;
    let controller: AbortController | null = null;

    const connect = async (): Promise<void> => {
      while (active) {
        const token = getToken();

        if (!token) {
          if (active) {
            setError("Sua sessão expirou. Entre novamente como administrador.");
          }

          return;
        }

        controller = new AbortController();

        try {
          const response = await fetch(ESTOQUE_EVENTS_ENDPOINT, {
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
              if (active) {
                setError(
                  "Sua sessão expirou ou você não tem permissão para acompanhar os cupons.",
                );
              }

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

              if (eventName === "cupom-atualizado") {
                void loadCoupons(true);
              }
            }
          }

          try {
            await reader.cancel();
          } catch {
            // O fluxo pode já ter sido encerrado pelo servidor.
          }
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

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [loadCoupons]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "cupom") {
      setForm((current) => ({
        ...current,
        cupom: value.toUpperCase().replace(/\s/g, "").slice(0, 20),
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting || processingId !== null || editingId !== null) {
      return;
    }

    const emailUsuario = form.emailUsuario.trim();
    const cupom = form.cupom.trim().toUpperCase();
    const percentual = Number(form.percentual);

    if (!emailUsuario) {
      setError("Informe o e-mail do usuário.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUsuario)) {
      setError("Informe um endereço de e-mail válido.");
      return;
    }

    if (!/^[A-Z0-9_-]{3,20}$/.test(cupom)) {
      setError(
        "O código deve conter de 3 a 20 caracteres: letras, números, hífen ou sublinhado.",
      );
      return;
    }

    if (!Number.isInteger(percentual) || percentual < 1 || percentual > 100) {
      setError("O percentual deve ser um número inteiro entre 1 e 100.");
      return;
    }

    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const createdCoupon = await criarCupomPromocional({
        emailUsuario,
        cupom,
        percentual,
        ativo: true,
      });

      if (!mounted.current) {
        return;
      }

      setCoupons((current) => [
        createdCoupon,
        ...current.filter((item) => item.id !== createdCoupon.id),
      ]);

      setForm(INITIAL_FORM);

      const successMessage = `O cupom ${createdCoupon.cupom} foi criado com sucesso.`;

      setFeedback(successMessage);
      showMessageModal("Cupom criado", successMessage);
    } catch (requestError) {
      if (!mounted.current) {
        return;
      }

      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível criar o cupom promocional.";

      setError(errorMessage);
      showMessageModal("Não foi possível criar o cupom", errorMessage);
    } finally {
      if (mounted.current) {
        setSubmitting(false);
      }
    }
  };

  const handleStartEditing = (coupon: CupomPromocional) => {
    if (submitting || processingId !== null) {
      return;
    }

    setEditingId(coupon.id);
    setEditForm({
      cupom: coupon.cupom,
      percentual: String(coupon.percentual),
    });
    setError("");
    setFeedback("");
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditForm(INITIAL_EDIT_FORM);
    setError("");
  };

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "cupom") {
      setEditForm((current) => ({
        ...current,
        cupom: value.toUpperCase().replace(/\s/g, "").slice(0, 20),
      }));

      return;
    }

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveCouponEdit = async (coupon: CupomPromocional) => {
    if (editingId !== coupon.id || submitting || processingId !== null) {
      return;
    }

    const cupom = editForm.cupom.trim().toUpperCase();
    const percentual = Number(editForm.percentual);

    if (!/^[A-Z0-9_-]{3,20}$/.test(cupom)) {
      setError(
        "O código deve conter de 3 a 20 caracteres: letras, números, hífen ou sublinhado.",
      );
      return;
    }

    if (!Number.isInteger(percentual) || percentual < 1 || percentual > 100) {
      setError("O percentual deve ser um número inteiro entre 1 e 100.");
      return;
    }

    setProcessingId(coupon.id);
    setError("");
    setFeedback("");

    try {
      const updatedCoupon = await editarCupomPromocional(coupon.id, {
        cupom,
        percentual,
        utilizado: false,
      });

      if (!mounted.current) {
        return;
      }

      setCoupons((current) =>
        current.map((item) =>
          item.id === updatedCoupon.id ? updatedCoupon : item,
        ),
      );

      setEditingId(null);
      setEditForm(INITIAL_EDIT_FORM);

      const successMessage = `O cupom ${updatedCoupon.cupom} foi atualizado com sucesso.`;

      setFeedback(successMessage);
      showMessageModal("Cupom atualizado", successMessage);
    } catch (requestError) {
      if (!mounted.current) {
        return;
      }

      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível editar o cupom promocional.";

      setError(errorMessage);
      showMessageModal("Falha ao editar o cupom", errorMessage);
    } finally {
      if (mounted.current) {
        setProcessingId(null);
      }
    }
  };

  const handleDeleteCoupon = (coupon: CupomPromocional) => {
    if (submitting || processingId !== null || editingId !== null) {
      return;
    }

    setModal({
      open: true,
      title: "Confirmar exclusão",
      message: `Deseja realmente excluir o cupom ${coupon.cupom}, associado a ${coupon.emailUsuario}? Essa operação não poderá ser desfeita.`,
      buttonText: "Excluir cupom",
      buttonColor: "var(--color-red)",
      buttonHoverColor: "var(--color-primary)",
      onConfirm: () => {
        closeModal();
        void deleteCoupon(coupon);
      },
    });
  };

  const deleteCoupon = async (coupon: CupomPromocional) => {
    if (processingId !== null || submitting || editingId !== null) {
      return;
    }

    setProcessingId(coupon.id);
    setError("");
    setFeedback("");

    try {
      await excluirCupomPromocional(coupon.id);

      if (!mounted.current) {
        return;
      }

      setCoupons((current) => current.filter((item) => item.id !== coupon.id));

      const successMessage = `O cupom ${coupon.cupom} foi excluído com sucesso.`;

      setFeedback(successMessage);
      showMessageModal("Cupom excluído", successMessage);
    } catch (requestError) {
      if (!mounted.current) {
        return;
      }

      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir o cupom.";

      setError(errorMessage);
      showMessageModal("Falha ao excluir o cupom", errorMessage);
    } finally {
      if (mounted.current) {
        setProcessingId(null);
      }
    }
  };

  const handleStatusChange = (coupon: CupomPromocional) => {
    if (processingId !== null || submitting || editingId !== null) {
      return;
    }

    const newStatus = !coupon.ativo;
    const action = newStatus ? "ativar" : "desativar";

    setModal({
      open: true,
      title: `Confirmar ${action} cupom`,
      message: `Deseja realmente ${action} o cupom ${coupon.cupom}, associado a ${coupon.emailUsuario}? Essa ação não altera o status de utilização.`,
      buttonText: `Confirmar ${action}`,
      buttonColor: newStatus ? "var(--color-secondary)" : "var(--color-red)",
      buttonHoverColor: "var(--color-primary)",
      onConfirm: () => {
        closeModal();
        void updateCouponStatus(coupon, newStatus);
      },
    });
  };

  const updateCouponStatus = async (
    coupon: CupomPromocional,
    ativo: boolean,
  ) => {
    if (processingId !== null || submitting || editingId !== null) {
      return;
    }

    setProcessingId(coupon.id);
    setError("");
    setFeedback("");

    try {
      const updatedCoupon = await alterarStatusCupomPromocional(
        coupon.id,
        ativo,
      );

      if (!mounted.current) {
        return;
      }

      setCoupons((current) =>
        current.map((item) =>
          item.id === updatedCoupon.id ? updatedCoupon : item,
        ),
      );

      const successMessage = ativo
        ? `O cupom ${updatedCoupon.cupom} foi ativado.`
        : `O cupom ${updatedCoupon.cupom} foi desativado.`;

      setFeedback(successMessage);
      showMessageModal("Status atualizado", successMessage);
    } catch (requestError) {
      if (!mounted.current) {
        return;
      }

      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível alterar o status do cupom.";

      setError(errorMessage);
      showMessageModal("Falha ao atualizar o cupom", errorMessage);
    } finally {
      if (mounted.current) {
        setProcessingId(null);
      }
    }
  };

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = [
      coupon.nomeUsuario,
      coupon.emailUsuario,
      coupon.cupom,
      coupon.uf,
    ].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );

    const matchesStatus =
      statusFilter === "TODOS" ||
      (statusFilter === "ATIVOS" && coupon.ativo) ||
      (statusFilter === "INATIVOS" && !coupon.ativo) ||
      (statusFilter === "UTILIZADOS" && coupon.utilizado) ||
      (statusFilter === "DISPONIVEIS" && coupon.ativo && !coupon.utilizado);

    return matchesSearch && matchesStatus;
  });

  const activeCount = coupons.filter((coupon) => coupon.ativo).length;
  const availableCount = coupons.filter(
    (coupon) => coupon.ativo && !coupon.utilizado,
  ).length;
  const usedCount = coupons.filter((coupon) => coupon.utilizado).length;

  const handleModalButtonClick = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
      return;
    }

    closeModal();
  };

  return (
    <>
      <Header />

      <main className="admin-coupons">
        <section
          className="admin-coupons__container"
          aria-labelledby="admin-coupons-title"
        >
          <header className="admin-coupons__header">
            <h1 id="admin-coupons-title" className="admin-coupons__title">
              Cupons promocionais
            </h1>

            <p className="admin-coupons__description">
              Crie cupons de desconto e gerencie sua disponibilidade.
            </p>
          </header>

          <section
            className="admin-coupons__summary"
            aria-label="Resumo dos cupons"
          >
            <div className="admin-coupons__summary-item">
              <span className="admin-coupons__summary-label">
                Total de cupons
              </span>
              <strong className="admin-coupons__summary-count">
                {coupons.length}
              </strong>
            </div>

            <div className="admin-coupons__summary-item">
              <span className="admin-coupons__summary-label">Ativos</span>
              <strong className="admin-coupons__summary-count">
                {activeCount}
              </strong>
            </div>

            <div className="admin-coupons__summary-item">
              <span className="admin-coupons__summary-label">Disponíveis</span>
              <strong className="admin-coupons__summary-count">
                {availableCount}
              </strong>
            </div>

            <div className="admin-coupons__summary-item">
              <span className="admin-coupons__summary-label">Utilizados</span>
              <strong className="admin-coupons__summary-count">
                {usedCount}
              </strong>
            </div>
          </section>

          {error && (
            <div
              className="admin-coupons__alert admin-coupons__alert--error"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {feedback && (
            <div
              className="admin-coupons__alert admin-coupons__alert--success"
              role="status"
            >
              <p>{feedback}</p>
            </div>
          )}

          <section
            className="admin-coupons__form-section"
            aria-labelledby="admin-coupons-form-title"
          >
            <h2
              id="admin-coupons-form-title"
              className="admin-coupons__subtitle"
            >
              Cadastrar cupom
            </h2>

            <form className="admin-coupons__form" onSubmit={handleCreateCoupon}>
              <div className="admin-coupons__field">
                <label htmlFor="coupon-email">E-mail do usuário</label>
                <input
                  id="coupon-email"
                  name="emailUsuario"
                  type="email"
                  autoComplete="off"
                  maxLength={254}
                  value={form.emailUsuario}
                  onChange={handleInputChange}
                  placeholder="cliente@email.com"
                  required
                  disabled={
                    submitting || processingId !== null || editingId !== null
                  }
                />
              </div>

              <div className="admin-coupons__field">
                <label htmlFor="coupon-code">Código do cupom</label>
                <input
                  id="coupon-code"
                  name="cupom"
                  type="text"
                  autoComplete="off"
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_-]{3,20}"
                  value={form.cupom}
                  onChange={handleInputChange}
                  placeholder="BEMVINDO15"
                  required
                  disabled={
                    submitting || processingId !== null || editingId !== null
                  }
                  aria-describedby="coupon-code-help"
                />
                <span
                  id="coupon-code-help"
                  className="admin-coupons__field-help"
                >
                  Use de 3 a 20 letras, números, hífen ou sublinhado.
                </span>
              </div>

              <div className="admin-coupons__field">
                <label htmlFor="coupon-percentage">Desconto (%)</label>
                <input
                  id="coupon-percentage"
                  name="percentual"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={form.percentual}
                  onChange={handleInputChange}
                  required
                  disabled={
                    submitting || processingId !== null || editingId !== null
                  }
                />
              </div>

              <div className="admin-coupons__form-actions">
                <Button
                  type="submit"
                  backgroundColor="var(--color-primary)"
                  hoverBackgroundColor="var(--color-secondary)"
                  disabled={
                    submitting || processingId !== null || editingId !== null
                  }
                >
                  {submitting ? "Cadastrando..." : "Criar cupom"}
                </Button>
              </div>
            </form>
          </section>

          <section
            className="admin-coupons__list-section"
            aria-labelledby="admin-coupons-list-title"
          >
            <div className="admin-coupons__toolbar">
              <h2
                id="admin-coupons-list-title"
                className="admin-coupons__subtitle"
              >
                Cupons cadastrados
              </h2>

              <Button
                type="button"
                backgroundColor="var(--color-primary)"
                hoverBackgroundColor="var(--color-secondary)"
                onClick={() => void loadCoupons()}
                disabled={
                  loading ||
                  submitting ||
                  processingId !== null ||
                  editingId !== null
                }
              >
                Atualizar lista
              </Button>
            </div>

            <div className="admin-coupons__filters">
              <div className="admin-coupons__field">
                <label htmlFor="coupon-search">Buscar cupons</label>
                <input
                  id="coupon-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome, e-mail, código ou UF"
                />
              </div>

              <div className="admin-coupons__field">
                <label htmlFor="coupon-status-filter">Filtrar por status</label>
                <select
                  id="coupon-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="TODOS">Todos os cupons</option>
                  <option value="ATIVOS">Ativos</option>
                  <option value="INATIVOS">Inativos</option>
                  <option value="DISPONIVEIS">Disponíveis</option>
                  <option value="UTILIZADOS">Utilizados</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="admin-coupons__message" role="status">
                Carregando cupons promocionais...
              </p>
            ) : filteredCoupons.length === 0 ? (
              <p className="admin-coupons__message">
                {coupons.length === 0
                  ? "Nenhum cupom promocional cadastrado."
                  : "Nenhum cupom corresponde aos filtros informados."}
              </p>
            ) : (
              <div className="admin-coupons__table-wrapper">
                <table className="admin-coupons__table">
                  <caption className="admin-coupons__caption">
                    Cupons promocionais cadastrados no ReservaHub.
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Usuário</th>
                      <th scope="col">Cupom</th>
                      <th scope="col">Desconto</th>
                      <th scope="col">Criação</th>
                      <th scope="col">Utilização</th>
                      <th scope="col">Status</th>
                      <th scope="col">Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCoupons.map((coupon) => {
                      const isProcessing = processingId === coupon.id;
                      const isEditing = editingId === coupon.id;

                      return (
                        <tr key={coupon.id}>
                          <td data-label="Usuário">
                            <span className="admin-coupons__user-name">
                              {coupon.nomeUsuario}
                            </span>
                            <span className="admin-coupons__user-email">
                              {coupon.emailUsuario}
                            </span>
                          </td>

                          <td data-label="Cupom">
                            {isEditing ? (
                              <div className="admin-coupons__field">
                                <label
                                  htmlFor={`coupon-edit-code-${coupon.id}`}
                                >
                                  Código
                                </label>
                                <input
                                  id={`coupon-edit-code-${coupon.id}`}
                                  name="cupom"
                                  type="text"
                                  minLength={3}
                                  maxLength={20}
                                  pattern="[A-Za-z0-9_-]{3,20}"
                                  value={editForm.cupom}
                                  onChange={handleEditInputChange}
                                  required
                                  disabled={isProcessing}
                                  autoComplete="off"
                                />
                              </div>
                            ) : (
                              <span className="admin-coupons__code">
                                {coupon.cupom}
                              </span>
                            )}
                          </td>

                          <td data-label="Desconto">
                            {isEditing ? (
                              <div className="admin-coupons__field">
                                <label
                                  htmlFor={`coupon-edit-percentage-${coupon.id}`}
                                >
                                  Desconto (%)
                                </label>
                                <input
                                  id={`coupon-edit-percentage-${coupon.id}`}
                                  name="percentual"
                                  type="number"
                                  min={1}
                                  max={100}
                                  step={1}
                                  inputMode="numeric"
                                  value={editForm.percentual}
                                  onChange={handleEditInputChange}
                                  required
                                  disabled={isProcessing}
                                />
                              </div>
                            ) : (
                              <strong>{coupon.percentual}%</strong>
                            )}
                          </td>

                          <td data-label="Criação">
                            {formatDate(coupon.dataCriacao)}
                          </td>

                          <td data-label="Utilização">
                            <span
                              className={`admin-coupons__status ${
                                coupon.utilizado
                                  ? "admin-coupons__status--used"
                                  : "admin-coupons__status--available"
                              }`}
                            >
                              {coupon.utilizado ? "Utilizado" : "Não utilizado"}
                            </span>
                          </td>

                          <td data-label="Status">
                            <span
                              className={`admin-coupons__status ${
                                coupon.ativo
                                  ? "admin-coupons__status--active"
                                  : "admin-coupons__status--inactive"
                              }`}
                            >
                              {coupon.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </td>

                          <td data-label="Ação">
                            <div className="admin-coupons__form-actions">
                              {isEditing ? (
                                <>
                                  <Button
                                    type="button"
                                    backgroundColor="var(--color-secondary)"
                                    hoverBackgroundColor="var(--color-primary)"
                                    disabled={isProcessing}
                                    onClick={() =>
                                      void handleSaveCouponEdit(coupon)
                                    }
                                  >
                                    {isProcessing ? "Salvando..." : "Salvar"}
                                  </Button>

                                  <Button
                                    type="button"
                                    backgroundColor="var(--color-red)"
                                    hoverBackgroundColor="var(--color-primary)"
                                    disabled={isProcessing}
                                    onClick={handleCancelEditing}
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    backgroundColor="var(--color-primary)"
                                    hoverBackgroundColor="var(--color-secondary)"
                                    disabled={
                                      processingId !== null ||
                                      submitting ||
                                      editingId !== null
                                    }
                                    onClick={() => handleStartEditing(coupon)}
                                  >
                                    Editar
                                  </Button>

                                  <Button
                                    type="button"
                                    backgroundColor={
                                      coupon.ativo
                                        ? "var(--color-red)"
                                        : "var(--color-secondary)"
                                    }
                                    hoverBackgroundColor="var(--color-primary)"
                                    disabled={
                                      processingId !== null ||
                                      submitting ||
                                      editingId !== null
                                    }
                                    onClick={() => handleStatusChange(coupon)}
                                  >
                                    {coupon.ativo ? "Desativar" : "Ativar"}
                                  </Button>

                                  <Button
                                    type="button"
                                    backgroundColor="var(--color-red)"
                                    hoverBackgroundColor="var(--color-primary)"
                                    disabled={
                                      processingId !== null ||
                                      submitting ||
                                      editingId !== null
                                    }
                                    onClick={() => handleDeleteCoupon(coupon)}
                                  >
                                    {isProcessing ? "Excluindo..." : "Excluir"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
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

export default AdminCouponsPage;
