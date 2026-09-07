import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import { loginSchema } from "../../schemas/loginSchema";
import { loginUser } from "../../services/authService";

import "./LoginStyle.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [loginError, setLoginError] = useState(false);

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

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    validateField(name as "email" | "password", value);

    setLoginError(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    const authenticated = loginUser(formData.email, formData.password);

    setLoginError(!authenticated);
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

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onChange={handleChange}
            />

            {errors.password && (
              <span id="password-error" className="login__field-error">
                {errors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            backgroundColor="var(--color-primary)"
            hoverBackgroundColor="var(--color-black)"
          >
            Entrar
          </Button>
        </form>

        {loginError && (
          <div className="login__error" role="alert">
            <p>E-mail ou senha incorretos.</p>

            <Link className="login__forgot-password" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </div>
        )}

        <footer className="login__footer">
          <p>Ainda não possui uma conta?</p>
          <Link to="/cadastrar">Criar conta</Link>
        </footer>
      </section>
    </main>
  );
};

export default LoginPage;
