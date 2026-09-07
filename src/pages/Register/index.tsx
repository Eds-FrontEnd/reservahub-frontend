import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import { registerSchema } from "../../schemas/registerSchema";
import { registerUser } from "../../services/authService";

import "./RegisterStyle.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [registerError, setRegisterError] = useState(false);

  const validateField = (field: "email" | "password", value: string) => {
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

    validateField(name as "email" | "password", value);

    setRegisterError(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = registerSchema.safeParse(formData);

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

    const registered = registerUser(formData);

    setRegisterError(!registered);
  };

  return (
    <main className="register">
      <section className="register__container" aria-labelledby="register-title">
        <header className="register__header">
          <Logo />
        </header>

        <form className="register__form" onSubmit={handleSubmit} noValidate>
          <div className="register__field">
            <label htmlFor="email">Cadastre um E-mail</label>

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
            <label htmlFor="password">Cadastre uma Senha</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onChange={handleChange}
            />

            {errors.password && (
              <span id="password-error" className="register__field-error">
                {errors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-black)"
          >
            Criar conta
          </Button>
        </form>

        {registerError && (
          <div className="register__error" role="alert">
            <p>Este e-mail já está cadastrado.</p>
          </div>
        )}

        <footer className="register__footer">
          <p>Já possui uma conta?</p>
          <Link to="/login">Entrar</Link>
        </footer>
      </section>
    </main>
  );
};

export default RegisterPage;
