import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

import { Logo } from "../../components/Logo";
import { subscribePasswordResetStatus } from "../../services/AuthService";

import type { PasswordResetStatusResponse } from "../../services/AuthService";

import "./WaitingResetPasswordStyle.css";

const normalizarStatus = (status: string) => status.trim().toUpperCase();

const obterMensagemStatus = (status: string) => {
  switch (normalizarStatus(status)) {
    case "PENDENTE":
      return "Sua solicitação está aguardando a análise da administração. Esta página atualizará o status quando houver uma alteração.";

    case "APROVADA":
      return "Sua solicitação foi aprovada pela administração. Você já pode continuar para a redefinição da sua senha.";

    case "REJEITADA":
    case "RECUSADA":
      return "Sua solicitação foi rejeitada pela administração. Entre em contato com o suporte para obter mais informações.";

    case "CANCELADA":
      return "Sua solicitação foi cancelada. Para continuar, será necessário iniciar uma nova solicitação.";

    case "FINALIZADA":
      return "Esta solicitação já foi finalizada. Se ainda precisar recuperar sua senha, inicie uma nova solicitação.";

    default:
      return "Este é o status informado pelo sistema. Entre em contato com o suporte caso precise de esclarecimentos.";
  }
};

const obterClasseStatus = (status: string) => {
  switch (normalizarStatus(status)) {
    case "PENDENTE":
      return "waiting-reset__status--pending";

    case "APROVADA":
      return "waiting-reset__status--approved";

    case "REJEITADA":
    case "RECUSADA":
    case "CANCELADA":
      return "waiting-reset__status--rejected";

    case "FINALIZADA":
      return "waiting-reset__status--finished";

    default:
      return "waiting-reset__status--unknown";
  }
};

const WaitingResetPasswordPage = () => {
  const [searchParams] = useSearchParams();

  const solicitacaoIdParam = searchParams.get("solicitacaoId");
  const solicitacaoId =
    solicitacaoIdParam && /^\d+$/.test(solicitacaoIdParam)
      ? Number(solicitacaoIdParam)
      : NaN;

  const [solicitacao, setSolicitacao] =
    useState<PasswordResetStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isSafeInteger(solicitacaoId) || solicitacaoId <= 0) {
      setError(
        "Não foi possível identificar sua solicitação. Inicie a recuperação de senha novamente.",
      );
      setLoading(false);
      return;
    }

    let ativo = true;
    let eventSource: EventSource | undefined;

    eventSource = subscribePasswordResetStatus(
      solicitacaoId,
      (resposta) => {
        if (!ativo) {
          return;
        }

        const novoStatus = normalizarStatus(resposta.status);

        setSolicitacao((atual) => {
          if (
            atual &&
            atual.id === resposta.id &&
            normalizarStatus(atual.status) === novoStatus
          ) {
            return atual;
          }

          return resposta;
        });

        setError("");
        setLoading(false);

        if (
          novoStatus === "APROVADA" ||
          novoStatus === "REJEITADA" ||
          novoStatus === "RECUSADA" ||
          novoStatus === "CANCELADA" ||
          novoStatus === "FINALIZADA"
        ) {
          eventSource?.close();
        }
      },
      (mensagem) => {
        if (!ativo) {
          return;
        }

        setError(mensagem);
        setLoading(false);
      },
    );

    return () => {
      ativo = false;
      eventSource?.close();
    };
  }, [solicitacaoId]);

  const statusAtual = solicitacao ? normalizarStatus(solicitacao.status) : "";

  const aprovado = statusAtual === "APROVADA";

  const statusIcone =
    statusAtual === "APROVADA" ? (
      <CheckCircleIcon />
    ) : statusAtual === "PENDENTE" ? (
      <HourglassTopIcon />
    ) : (
      <ErrorOutlineIcon />
    );

  return (
    <main className="waiting-reset">
      <section
        className="waiting-reset__container"
        aria-labelledby="waiting-reset-title"
      >
        <header className="waiting-reset__header">
          <Logo />
        </header>

        <h1 id="waiting-reset-title" className="waiting-reset__title">
          Recuperação de senha
        </h1>

        <p className="waiting-reset__description">
          Acompanhe o andamento da sua solicitação de recuperação de senha.
        </p>

        {loading && (
          <p className="waiting-reset__info" role="status">
            Conectando para acompanhar o status da solicitação...
          </p>
        )}

        {error && (
          <div className="waiting-reset__error" role="alert">
            <p>{error}</p>
          </div>
        )}

        {solicitacao && (
          <div
            className={`waiting-reset__status ${obterClasseStatus(solicitacao.status)}`}
            aria-live="polite"
          >
            <span className="waiting-reset__status-icon" aria-hidden="true">
              {statusIcone}
            </span>

            <p className="waiting-reset__status-label">Status atual:</p>

            <p className="waiting-reset__status-value">{solicitacao.status}</p>

            <p className="waiting-reset__status-message">
              {obterMensagemStatus(solicitacao.status)}
            </p>

            <p className="waiting-reset__request-id">
              Solicitação nº {solicitacao.id}
            </p>
          </div>
        )}

        {aprovado && solicitacao && (
          <Link
            className="waiting-reset__submit"
            to={`/recuperar-senha?solicitacaoId=${solicitacao.id}`}
          >
            Redefinir minha senha
          </Link>
        )}

        {(statusAtual === "REJEITADA" ||
          statusAtual === "RECUSADA" ||
          statusAtual === "CANCELADA" ||
          statusAtual === "FINALIZADA") && (
          <Link className="waiting-reset__forgot-password" to="/login">
            Voltar para o login
          </Link>
        )}

        <footer className="waiting-reset__footer">
          <p>
            Precisa voltar? <Link to="/login">Acessar login</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default WaitingResetPasswordPage;
