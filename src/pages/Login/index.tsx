import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import Modal from "../../components/Modal";
import { PasswordInput } from "../../components/PasswordInput";
import { useAuth } from "../../contexts/AutContext";
import { useLoading } from "../../contexts/LoadingContext";
import { loginSchema } from "../../schemas/loginSchema";
import { loginUser, requestPasswordReset } from "../../services/AuthService";

import "./LoginStyle.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { startLoading } = useLoading();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [loginError, setLoginError] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetRequestError, setResetRequestError] = useState("");

  const validateField = (field: "email" | "password", value: string) => {
    const result = loginSchema.shape[field].safeParse(value);

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

    if (name !== "email" && name !== "password") {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    validateField(name, value);

    setLoginError(false);
    setAccessDenied(false);
    setResetRequestError("");
  };

  const handleForgotPassword = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    if (resetSubmitting) {
      return;
    }

    const emailResult = loginSchema.shape.email.safeParse(formData.email);

    if (!emailResult.success) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email:
          emailResult.error.issues[0]?.message ?? "Informe um e-mail válido.",
      }));

      return;
    }

    setResetSubmitting(true);
    setResetRequestError("");

    const finishLoading = startLoading();

    try {
      const solicitacao = await requestPasswordReset(formData.email);

      navigate(`/aguardando-resposta?solicitacaoId=${solicitacao.id}`, {
        state: {
          solicitacaoId: solicitacao.id,
          email: formData.email.trim(),
          status: solicitacao.status,
        },
      });
    } catch (error: unknown) {
      setResetRequestError(
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar a recuperação da senha. Tente novamente.",
      );
    } finally {
      setResetSubmitting(false);
      finishLoading();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: {
        email?: string;
        password?: string;
      } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "email" | "password";

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});
    setLoginError(false);
    setAccessDenied(false);

    const finishLoading = startLoading();

    try {
      const authenticatedUser = await loginUser(
        formData.email,
        formData.password,
      );

      if (!authenticatedUser) {
        setLoginError(true);
        return;
      }

      if (authenticatedUser.perfil !== "USER") {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authenticatedUser");
        setAccessDenied(true);
        return;
      }

      login(authenticatedUser);
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setErrorModalOpen(true);
    } finally {
      finishLoading();
    }
  };

  return (
    <main className="login">
      <section className="login__container" aria-labelledby="login-title">
        <header className="login__header">
          <Logo />
        </header>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__field">
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              autoComplete="email"
              inputMode="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={handleChange}
            />

            {errors.email && (
              <span id="email-error" className="login__field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="login__field">
            <label htmlFor="password">Senha</label>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              autoComplete="current-password"
              required
              onChange={handleChange}
              error={errors.password}
            />

            {loginError && (
              <div className="login__error" role="alert">
                <p>E-mail ou senha incorretos.</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-secondary)"
          >
            Entrar
          </Button>
        </form>

        {accessDenied && (
          <div className="login__error" role="alert">
            <p>E-mail ou senha incorretos.</p>
          </div>
        )}

        {loginError && (
          <div className="login__error">
            <Link
              className="login__forgot-password"
              to="/aguardando-resposta"
              state={{ email: formData.email }}
              onClick={handleForgotPassword}
              aria-disabled={resetSubmitting}
            >
              {resetSubmitting
                ? "Enviando solicitação..."
                : "Esqueci minha senha"}
            </Link>

            {resetRequestError && <p role="alert">{resetRequestError}</p>}
          </div>
        )}

        <Modal
          open={modalOpen}
          title="Login realizado!"
          message="Login realizado com sucesso. Você será redirecionado para a página inicial."
          redirectUrl="/"
          redirectDelay={3000}
          icon={<CheckCircleIcon />}
          iconColor="var(--color-secondary)"
          titleColor="var(--color-secondary)"
          onNavigate={navigate}
          closeUrl="/"
        />

        <Modal
          open={errorModalOpen}
          title="Não foi possível realizar o login"
          message="Tivemos um problema ao realizar seu login. Tente novamente mais tarde ou entre em contato com a nossa equipe para mais informações."
          icon={<ErrorOutlined />}
          iconColor="var(--color-red)"
          titleColor="var(--color-red)"
          onClose={() => setErrorModalOpen(false)}
        />

        <footer className="login__footer">
          <p>
            Ainda não possui uma conta? <Link to="/cadastrar">Criar conta</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default LoginPage;
