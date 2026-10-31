import type React from "react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import { Tooltip } from "@mui/material";

import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import Modal from "../../components/Modal";
import { PasswordInput } from "../../components/PasswordInput";
import { registerSchema } from "../../schemas/registerSchema";
import { registerUser } from "../../services/AuthService";
import { fetchCepData } from "../../services/ViaCepService";
import { useLoading } from "../../contexts/LoadingContext";

import "./RegisterStyle.css";

type RegistrationField =
  | "name"
  | "email"
  | "password"
  | "cep"
  | "street"
  | "neighborhood"
  | "city"
  | "state";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

type AddressData = Pick<
  RegisterFormData,
  "street" | "neighborhood" | "city" | "state"
>;

type RegistrationErrors = Partial<Record<RegistrationField, string>>;

const initialFormData: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
};

const registrationFields: RegistrationField[] = [
  "name",
  "email",
  "password",
  "cep",
  "street",
  "neighborhood",
  "city",
  "state",
];

const addressFields: (keyof AddressData)[] = [
  "street",
  "neighborhood",
  "city",
  "state",
];

const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
};

const getFieldError = (
  field: RegistrationField,
  value: string,
): string | undefined => {
  const result = registerSchema.shape[field].safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
};

const getFormErrors = (formData: RegisterFormData): RegistrationErrors => {
  const result = registerSchema.safeParse(formData);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<RegistrationErrors>(
    (fieldErrors, issue) => {
      const field = issue.path[0];

      if (
        typeof field === "string" &&
        registrationFields.includes(field as RegistrationField) &&
        !fieldErrors[field as RegistrationField]
      ) {
        fieldErrors[field as RegistrationField] = issue.message;
      }

      return fieldErrors;
    },
    {},
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { startLoading } = useLoading();

  const cepRequestId = useRef(0);
  const cepAbortController = useRef<AbortController | null>(null);

  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);

  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [registerError, setRegisterError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const updateFieldError = (field: RegistrationField, value: string): void => {
    const message = getFieldError(field, value);

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (message) {
        updatedErrors[field] = message;
      } else {
        delete updatedErrors[field];
      }

      return updatedErrors;
    });
  };

  const clearFieldErrors = (fields: RegistrationField[]): void => {
    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      fields.forEach((field) => {
        delete updatedErrors[field];
      });

      return updatedErrors;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    if (!registrationFields.includes(name as RegistrationField)) {
      return;
    }

    const field = name as RegistrationField;

    setRegisterError(false);

    if (field === "cep") {
      cepRequestId.current += 1;

      cepAbortController.current?.abort();
      cepAbortController.current = null;

      setCepLoading(false);

      setFormData((currentData) => ({
        ...currentData,
        cep: formatCep(value),
        street: "",
        neighborhood: "",
        city: "",
        state: "",
      }));

      clearFieldErrors(["cep", ...addressFields]);

      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    updateFieldError(field, value);
  };

  const handleCepBlur = async (): Promise<void> => {
    const cep = formData.cep.replace(/\D/g, "");

    if (!cep) {
      updateFieldError("cep", formData.cep);
      return;
    }

    if (cep.length !== 8) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        cep: "Informe um CEP válido com 8 dígitos.",
      }));

      return;
    }

    cepAbortController.current?.abort();

    const controller = new AbortController();
    cepAbortController.current = controller;

    const requestId = ++cepRequestId.current;

    setCepLoading(true);

    try {
      const address = await fetchCepData(cep, controller.signal);

      if (requestId !== cepRequestId.current || controller.signal.aborted) {
        return;
      }

      if (address.erro) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          cep: "CEP não encontrado. Confira os números informados.",
        }));

        return;
      }

      const addressData: AddressData = {
        street: address.logradouro ?? "",
        neighborhood: address.bairro ?? "",
        city: address.localidade ?? "",
        state: address.uf ?? "",
      };

      setFormData((currentData) => ({
        ...currentData,
        ...addressData,
      }));

      setErrors((currentErrors) => {
        const updatedErrors = { ...currentErrors };

        delete updatedErrors.cep;

        addressFields.forEach((field) => {
          const message = getFieldError(field, addressData[field]);

          if (message) {
            updatedErrors[field] = message;
          } else {
            delete updatedErrors[field];
          }
        });

        return updatedErrors;
      });
    } catch (error) {
      if (requestId !== cepRequestId.current || controller.signal.aborted) {
        return;
      }

      console.error("Erro ao consultar CEP:", error);

      setErrors((currentErrors) => ({
        ...currentErrors,
        cep: "Não foi possível consultar o CEP. Tente novamente.",
      }));
    } finally {
      if (requestId === cepRequestId.current) {
        cepAbortController.current = null;
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (cepLoading) {
      return;
    }

    const fieldErrors = getFormErrors(formData);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);

      const firstInvalidField = registrationFields.find(
        (field) => fieldErrors[field],
      );

      if (firstInvalidField) {
        document.getElementById(firstInvalidField)?.focus();
      }

      return;
    }

    setErrors({});
    setRegisterError(false);

    const finishLoading = startLoading();

    try {
      const registered = await registerUser({
        ...formData,
        perfil: "USER",
      });

      setRegisterError(!registered);
      setModalOpen(registered);
    } catch (error) {
      console.error("Erro ao realizar cadastro:", error);
      setErrorModalOpen(true);
    } finally {
      finishLoading();
    }
  };

  const renderFieldError = (field: RegistrationField): React.ReactNode => {
    const message = errors[field];

    if (!message) {
      return null;
    }

    return (
      <span
        id={`${field}-error`}
        className="register__field-error"
        role="alert"
      >
        {message}
      </span>
    );
  };

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
            {renderFieldError("name")}
          </div>

          <div className="register__account-grid">
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
              {renderFieldError("email")}
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

              {!errors.password && renderFieldError("password")}

              {registerError && (
                <span
                  id="register-error"
                  className="register__field-error"
                  role="alert"
                >
                  Este nome ou e-mail já está cadastrado.
                </span>
              )}
            </div>
          </div>

          <fieldset className="register__address">
            <legend>Endereço</legend>

            <div className="register__address-grid">
              <Tooltip
                title="Preencha o CEP para buscar o endereço automaticamente."
                placement="top"
                arrow
              >
                <div className="register__field register__field--cep">
                  <label htmlFor="cep">CEP *</label>
                  <input
                    id="cep"
                    name="cep"
                    type="text"
                    value={formData.cep}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]{5}-?[0-9]{3}"
                    maxLength={9}
                    placeholder="00000-000"
                    required
                    aria-invalid={Boolean(errors.cep)}
                    aria-describedby={
                      errors.cep ? "cep-help cep-error" : "cep-help"
                    }
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                  />

                  <span id="cep-help" className="register__field-help">
                    {cepLoading && "Consultando CEP..."}
                  </span>

                  {renderFieldError("cep")}

                  <span className="register__sr-only" aria-live="polite">
                    {cepLoading ? "Consultando endereço pelo CEP." : ""}
                  </span>
                </div>
              </Tooltip>

              <div className="register__field register__field--street">
                <label htmlFor="street">Rua</label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={formData.street}
                  autoComplete="address-line1"
                  required
                  aria-invalid={Boolean(errors.street)}
                  aria-describedby={errors.street ? "street-error" : undefined}
                  onChange={handleChange}
                />
                {renderFieldError("street")}
              </div>

              <div className="register__field">
                <label htmlFor="neighborhood">Bairro</label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  value={formData.neighborhood}
                  autoComplete="address-level3"
                  required
                  aria-invalid={Boolean(errors.neighborhood)}
                  aria-describedby={
                    errors.neighborhood ? "neighborhood-error" : undefined
                  }
                  onChange={handleChange}
                />
                {renderFieldError("neighborhood")}
              </div>

              <div className="register__field">
                <label htmlFor="city">Cidade</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  autoComplete="address-level2"
                  required
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  onChange={handleChange}
                />
                {renderFieldError("city")}
              </div>

              <div className="register__field">
                <label htmlFor="state">UF</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  autoComplete="address-level1"
                  maxLength={2}
                  required
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  onChange={handleChange}
                />
                {renderFieldError("state")}
              </div>
            </div>
          </fieldset>

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
