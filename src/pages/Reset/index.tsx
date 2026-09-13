import type React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import Modal from "../../components/Modal";
import { PasswordInput } from "../../components/PasswordInput";
import { resetPassword } from "../../services/AuthService";
import { resetPasswordSchema } from "../../schemas/ResetSchema";

import "./ResetStyle.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);

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

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    validateField(name as "password" | "confirmPassword", value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: {
        password?: string;
        confirmPassword?: string;
      } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "password" | "confirmPassword";

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    if (!email) {
      return;
    }

    setErrors({});

    resetPassword(email, formData.password);

    setModalOpen(true);
  };

  return (
    <main className="reset">
      <section
        className="reset__container"
        aria-labelledby="reset-password-title"
      >
        <header className="reset__header">
          <Logo />
        </header>

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

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-secondary)"
          >
            Redefinir senha
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
