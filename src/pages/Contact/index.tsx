import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";

import AccessTime from "@mui/icons-material/AccessTime";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Email from "@mui/icons-material/Email";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import LocationOn from "@mui/icons-material/LocationOn";
import Phone from "@mui/icons-material/Phone";
import WhatsApp from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import { Button } from "../../components/Button";
import { saveContact } from "../../services/ContactService";
import { contactSchema } from "../../schemas/ContactSchema";
import "./ContactStyles.css";

interface ContactChannel {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactChannels: ContactChannel[] = [
  {
    title: "WhatsApp",
    description: "Fale com nossa equipe",
    href: "https://wa.me/5500000000000",
    icon: <WhatsApp aria-hidden="true" />,
    external: true,
  },
  {
    title: "E-mail",
    description: "Envie sua mensagem",
    href: "mailto:contato@reservahub.com",
    icon: <Email aria-hidden="true" />,
  },
  {
    title: "Telefone",
    description: "(00) 0000-0000",
    href: "tel:+550000000000",
    icon: <Phone aria-hidden="true" />,
  },
];

const ContactPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: keyof ContactFormData, value: string) => {
    const result = contactSchema.shape[field].safeParse(value);

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (result.success) {
        delete updatedErrors[field];
      } else {
        updatedErrors[field] = result.error.issues[0].message;
      }

      return updatedErrors;
    });
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    validateField(name as keyof ContactFormData, value);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    const contact = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const result = contactSchema.safeParse(contact);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});

    try {
      const response = await saveContact(result.data);

      if (response.status !== 201) {
        setErrorModalOpen(true);

        return;
      }

      form.reset();
      setModalOpen(true);
    } catch {
      setErrorModalOpen(true);
    }
  };

  return (
    <main className="contact-page">
      <Header />

      <section className="contact-channels" aria-labelledby="channels-title">
        <div className="contact-container">
          <div className="contact-section-heading">
            <span className="contact-eyebrow contact-eyebrow--dark">
              Fale conosco
            </span>

            <h2 id="channels-title">
              Escolha a melhor forma de
              <span> falar com a gente.</span>
            </h2>

            <p>Estamos disponíveis para tirar dúvidas e ajudar você.</p>
          </div>

          <div className="contact-channels__grid">
            {contactChannels.map((channel) => (
              <a
                className="contact-channel"
                href={channel.href}
                key={channel.title}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                aria-label={`${channel.title}: ${channel.description}`}
              >
                <div className="contact-channel__icon">{channel.icon}</div>

                <div className="contact-channel__content">
                  <h3>{channel.title}</h3>
                  <p>{channel.description}</p>
                </div>

                <ArrowForward
                  className="contact-channel__arrow"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-form-section" aria-labelledby="form-title">
        <div className="contact-container contact-form-section__grid">
          <div className="contact-form-section__info">
            <span className="contact-eyebrow contact-eyebrow--dark">
              Envie sua mensagem
            </span>

            <h2 id="form-title">
              Como podemos
              <span> ajudar?</span>
            </h2>

            <p>
              Preencha o formulário e nossa equipe entrará em contato com você o
              mais breve possível.
            </p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <LocationOn aria-hidden="true" />

                <div>
                  <strong>Atendimento online</strong>
                  <span>Fale com nossa equipe de qualquer lugar.</span>
                </div>
              </div>

              <div className="contact-info-item">
                <AccessTime aria-hidden="true" />

                <div>
                  <strong>Horário de atendimento</strong>
                  <span>Segunda a sexta, das 8h às 18h.</span>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label htmlFor="contact-name">Nome</label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "contact-name-error" : undefined
                  }
                />

                {errors.name && (
                  <span id="contact-name-error" className="contact-form__error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="contact-form__field">
                <label htmlFor="contact-email">E-mail</label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "contact-email-error" : undefined
                  }
                />

                {errors.email && (
                  <span
                    id="contact-email-error"
                    className="contact-form__error"
                  >
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="contact-form__field">
              <label htmlFor="contact-subject">Assunto</label>

              <select
                id="contact-subject"
                name="subject"
                defaultValue=""
                onChange={handleChange}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={
                  errors.subject ? "contact-subject-error" : undefined
                }
              >
                <option value="" disabled>
                  Selecione um assunto
                </option>
                <option value="duvida">Dúvida</option>
                <option value="suporte">Suporte</option>
                <option value="parceria">Parceria</option>
                <option value="outro">Outro</option>
              </select>

              {errors.subject && (
                <span
                  id="contact-subject-error"
                  className="contact-form__error"
                >
                  {errors.subject}
                </span>
              )}
            </div>

            <div className="contact-form__field">
              <label htmlFor="contact-message">Mensagem</label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="Como podemos ajudar?"
                rows={5}
                onChange={handleChange}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? "contact-message-error" : undefined
                }
              />

              {errors.message && (
                <span
                  id="contact-message-error"
                  className="contact-form__error"
                >
                  {errors.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              backgroundColor="var(--color-secondary)"
              hoverBackgroundColor="var(--color-primary)"
            >
              Enviar mensagem
            </Button>

            <p className="contact-form__privacy">
              Ao enviar, você concorda com nossa política de privacidade.
            </p>
          </form>
        </div>
      </section>

      <Footer />

      <Modal
        open={modalOpen}
        title="Mensagem enviada!"
        message="Sua mensagem foi enviada com sucesso. Você será redirecionado para a página inicial."
        icon={<CheckCircleIcon />}
        iconColor="var(--color-secondary)"
        titleColor="var(--color-secondary)"
        onClose={() => setModalOpen(false)}
      />

      <Modal
        open={errorModalOpen}
        title="Erro ao enviar mensagem"
        message="Não foi possível enviar sua mensagem. Tente novamente."
        icon={<ErrorOutlined />}
        iconColor="var(--color-red)"
        titleColor="var(--color-red)"
        onClose={() => setErrorModalOpen(false)}
      />
    </main>
  );
};

export default ContactPage;
