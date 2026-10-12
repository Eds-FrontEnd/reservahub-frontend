import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import Modal from "../../components/Modal";
import { PasswordInput } from "../../components/PasswordInput";
import {
  getPasswordResetStatus,
  resetPassword,
} from "../../services/AuthService";
import { resetPasswordSchema } from "../../schemas/ResetSchema";

import "./ResetStyle.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const solicitacaoIdParam = searchParams.get("solicitacaoId");
  const solicitacaoId =
    solicitacaoIdParam && /^\d+$/.test(solicitacaoIdParam)
      ? Number(solicitacaoIdParam)
      : NaN;

  const [approvalVerified, setApprovalVerified] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;

    const verificarAprovacao = async () => {
      if (!Number.isSafeInteger(solicitacaoId) || solicitacaoId <= 0) {
        navigate("/login", { replace: true });
        setCheckingApproval(false);
        return;
      }

      try {
        const solicitacao = await getPasswordResetStatus(solicitacaoId);

        if (!active) {
          return;
        }

        if (solicitacao.status.trim().toUpperCase() !== "APROVADA") {
          navigate(`/aguardando-resposta?solicitacaoId=${solicitacaoId}`, {
            replace: true,
          });
          return;
        }

        setApprovalVerified(true);
      } catch {
        if (active) {
          navigate(`/aguardando-resposta?solicitacaoId=${solicitacaoId}`, {
            replace: true,
          });
        }
      } finally {
        if (active) {
          setCheckingApproval(false);
        }
      }
    };

    void verificarAprovacao();

    return () => {
      active = false;
    };
  }, [solicitacaoId, navigate]);

  const validateField = (
    field: "password" | "confirmPassword",
    value: string,
  ) => {
    const result = resetPasswordSchema.shape[field].safeParse(value);

    setErrors((currentErrors) => {
      if (result.success) {
        const { [field]: _, ...remainingErrors } = currentErrors;

        return remainingErrors;
      }

      return {
        ...currentErrors,
        [field]: result.error.issues[0]?.message,
      };
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name !== "password" && name !== "confirmPassword") {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    validateField(name, value);
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!approvalVerified) {
      setSubmitError(
        "A redefinição só pode continuar após a aprovação da administração.",
      );
      return;
    }

    if (!Number.isSafeInteger(solicitacaoId) || solicitacaoId <= 0) {
      setSubmitError(
        "Solicitação de redefinição inválida. Acesse o link correto para redefinir sua senha.",
      );
      return;
    }

    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      const nextErrors: {
        password?: string;
        confirmPassword?: string;
      } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          (field === "password" || field === "confirmPassword") &&
          !nextErrors[field]
        ) {
          nextErrors[field] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      await resetPassword({
        solicitacaoId,
        novaSenha: formData.password,
      });

      setModalOpen(true);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir a senha. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingApproval) {
    return (
      <main className="reset">
        <section className="reset__container" aria-live="polite">
          <header className="reset__header">
            <Logo />
          </header>

          <h1 id="reset-password-title">Verificando aprovação</h1>

          <p className="reset__description">
            Estamos verificando o status da sua solicitação.
          </p>
        </section>
      </main>
    );
  }

  if (!approvalVerified) {
    return null;
  }

  return (
    <main className="reset">
      <section
        className="reset__container"
        aria-labelledby="reset-password-title"
      >
        <header className="reset__header">
          <Logo />
        </header>

        <h1 id="reset-password-title">Redefinir senha</h1>

        <p className="reset__description">
          Sua solicitação foi aprovada pela administração. Cadastre sua nova
          senha para concluir a redefinição.
        </p>

        <form className="reset__form" onSubmit={handleSubmit} noValidate>
          <div className="reset__field">
            <label htmlFor="password">Nova senha</label>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              autoComplete="new-password"
              required
              onChange={handleChange}
              error={errors.password}
            />
          </div>

          <div className="reset__field">
            <label htmlFor="confirmPassword">Confirmar nova senha</label>

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              autoComplete="new-password"
              required
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          {submitError && (
            <p role="alert" className="reset__error">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-secondary)"
            disabled={submitting}
          >
            {submitting ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>

        <Modal
          open={modalOpen}
          title="Senha redefinida!"
          message="Sua senha foi redefinida com sucesso. Você será redirecionado para a tela de login."
          redirectUrl="/login"
          redirectDelay={3000}
          icon={<CheckCircleIcon />}
          iconColor="var(--color-secondary)"
          titleColor="var(--color-secondary)"
          onNavigate={navigate}
          closeUrl="/login"
        />

        <footer className="reset__footer">
          <p>
            Lembrou sua senha? <Link to="/login">Voltar para o login</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
