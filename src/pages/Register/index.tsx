import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import Modal from "../../components/Modal";
import { PasswordInput } from "../../components/PasswordInput";
import { registerSchema } from "../../schemas/registerSchema";
import { registerUser } from "../../services/AuthService";

import "./RegisterStyle.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [registerError, setRegisterError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const validateField = (
    field: "name" | "email" | "password",
    value: string,
  ) => {
    const result = registerSchema.shape[field].safeParse(value);

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

    validateField(name as "name" | "email" | "password", value);

    setRegisterError(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: {
        name?: string;
        email?: string;
        password?: string;
      } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "name" | "email" | "password";

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});

    try {
      const registered = await registerUser(formData);

      setRegisterError(!registered);
      setModalOpen(registered);
    } catch (error) {
      console.error("Erro ao realizar cadastro:", error);

      setErrorModalOpen(true);
    }
  };

  const isError = registerError;

  return (
    <main className="register">
      <section className="register__container" aria-labelledby="register-title">
        <header className="register__header">
          <Logo />
        </header>

        <form className="register__form" onSubmit={handleSubmit} noValidate>
          <div className="register__field">
            <label htmlFor="name">Nome</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={handleChange}
            />

            {errors.name && (
              <span id="name-error" className="register__field-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="register__field">
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
              <span id="email-error" className="register__field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="register__field">
            <label htmlFor="password">Senha</label>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              autoComplete="new-password"
              required
              onChange={handleChange}
              error={errors.password}
            />

            {isError && (
              <span id="register-error" className="register__field-error">
                Este nome ou e-mail já está cadastrado.
              </span>
            )}
          </div>

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-secondary)"
          >
            Criar conta
          </Button>
        </form>

        <Modal
          open={modalOpen}
          title="Cadastro concluído!"
          message="Sua conta foi criada com sucesso. Você será redirecionado para o login."
          redirectUrl="/login"
          redirectDelay={3000}
          icon={<CheckCircleIcon />}
          iconColor="var(--color-secondary)"
          titleColor="var(--color-secondary)"
          onNavigate={navigate}
          closeUrl="/login"
        />

        <Modal
          open={errorModalOpen}
          title="Não foi possível criar sua conta"
          message="Tivemos um problema ao criar sua conta. Tente novamente mais tarde ou entre em contato com a nossa equipe para mais informações."
          icon={<ErrorOutlined />}
          iconColor="var(--color-red)"
          titleColor="var(--color-red)"
          onClose={() => setErrorModalOpen(false)}
        />

        <footer className="register__footer">
          <p>
            Já possui uma conta? <Link to="/login">Entrar</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default RegisterPage;
