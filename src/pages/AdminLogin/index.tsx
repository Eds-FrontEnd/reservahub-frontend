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
import { loginSchema } from "../../schemas/loginSchema";
import { loginUser } from "../../services/AuthService";

import "./AdminLoginStyle.css";

type LoginField = "email" | "password";

type LoginErrors = {
  email?: string;
  password?: string;
};

const hasAdminRole = (user: unknown): boolean => {
  if (typeof user !== "object" || user === null) {
    return false;
  }

  const candidate = user as {
    perfil?: unknown;
    role?: unknown;
    roles?: unknown;
    authorities?: unknown;
  };

  const values: unknown[] = [
    candidate.perfil,
    candidate.role,
    candidate.roles,
    candidate.authorities,
  ];

  return values.some((value) => {
    const roles = Array.isArray(value) ? value : [value];

    return roles.some((role) => {
      if (typeof role === "string") {
        return [
          "ROLE_ADMIN",
          "ADMIN",
          "ROLE_ADMINISTRADOR",
          "ADMINISTRADOR",
        ].includes(role.toUpperCase());
      }

      if (
        typeof role === "object" &&
        role !== null &&
        "authority" in role &&
        typeof role.authority === "string"
      ) {
        return [
          "ROLE_ADMIN",
          "ADMIN",
          "ROLE_ADMINISTRADOR",
          "ADMINISTRADOR",
        ].includes(role.authority.toUpperCase());
      }

      return false;
    });
  });
};

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const validateField = (field: LoginField, value: string) => {
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

    const field = name as LoginField;

    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    validateField(field, value);
    setLoginError(false);
    setAccessDenied(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: LoginErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as LoginField;

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

    try {
      const authenticatedUser = await loginUser(
        formData.email.trim(),
        formData.password,
      );

      if (!authenticatedUser) {
        setLoginError(true);
        return;
      }

      if (!hasAdminRole(authenticatedUser)) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authenticatedUser");
        setAccessDenied(true);
        return;
      }

      login(authenticatedUser);
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao realizar acesso administrativo:", error);
      setErrorModalOpen(true);
    }
  };

  return (
    <main className="admin-login">
      <section
        className="admin-login__container"
        aria-labelledby="admin-login-title"
      >
        <header className="admin-login__header">
          <Logo />
        </header>

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <div className="admin-login__field">
            <label htmlFor="admin-email">E-mail</label>

            <input
              id="admin-email"
              name="email"
              type="email"
              value={formData.email}
              autoComplete="username"
              inputMode="email"
              maxLength={254}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "admin-email-error" : undefined}
              onChange={handleChange}
            />

            {errors.email && (
              <span id="admin-email-error" className="admin-login__field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="admin-login__field">
            <label htmlFor="admin-password">Senha</label>

            <PasswordInput
              id="admin-password"
              name="password"
              value={formData.password}
              autoComplete="current-password"
              required
              onChange={handleChange}
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-secondary)"
          >
            Entrar como administrador
          </Button>
        </form>

        {loginError && (
          <div className="admin-login__error" role="alert">
            <p>E-mail ou senha incorretos.</p>
          </div>
        )}

        {accessDenied && (
          <div className="admin-login__error" role="alert">
            <p>
              Acesso negado. Esta área é exclusiva para administradores
              autorizados.
            </p>
          </div>
        )}

        <Modal
          open={modalOpen}
          title="Acesso autorizado!"
          message="Autenticação administrativa realizada. Você será redirecionado para o painel."
          redirectUrl="/admin/solicitacoes-reset-senha"
          redirectDelay={3000}
          icon={<CheckCircleIcon />}
          iconColor="var(--color-secondary)"
          titleColor="var(--color-secondary)"
          onNavigate={navigate}
          closeUrl="/admin/solicitacoes-reset-senha"
        />

        <Modal
          open={errorModalOpen}
          title="Não foi possível realizar o acesso"
          message="Ocorreu um problema durante a autenticação. Tente novamente mais tarde."
          icon={<ErrorOutlined />}
          iconColor="var(--color-red)"
          titleColor="var(--color-red)"
          onClose={() => setErrorModalOpen(false)}
        />

        <footer className="admin-login__footer">
          <p>
            <Link to="/">Voltar para página inicial</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default AdminLoginPage;
