import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "./SmartphoneStyles.css";

import {
  CheckCircle,
  ChevronRight,
  PhoneAndroid,
  Security,
  ShoppingCart,
  Smartphone,
  SwapHoriz,
  Tune,
  VerifiedUser,
} from "@mui/icons-material";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Escolha seu smartphone",
    description:
      "Selecione o modelo que combina com você e encontre a assinatura ideal para o seu momento.",
    icon: <Smartphone aria-hidden="true" />,
  },
  {
    number: "02",
    title: "Escolha seu plano",
    description:
      "Defina o período de assinatura e as condições disponíveis para o aparelho escolhido.",
    icon: <Tune aria-hidden="true" />,
  },
  {
    number: "03",
    title: "Receba em casa",
    description:
      "Finalize sua assinatura e aguarde a entrega do smartphone no endereço informado.",
    icon: <ShoppingCart aria-hidden="true" />,
  },
  {
    number: "04",
    title: "Use e aproveite",
    description:
      "Tenha acesso ao seu smartphone durante o período contratado, com praticidade e segurança.",
    icon: <PhoneAndroid aria-hidden="true" />,
  },
];

const benefits = [
  {
    title: "Mais liberdade",
    description: "Escolha um aparelho sem precisar comprar tudo de uma vez.",
    icon: <SwapHoriz aria-hidden="true" />,
  },
  {
    title: "Praticidade",
    description: "Faça tudo online, de forma simples e transparente.",
    icon: <CheckCircle aria-hidden="true" />,
  },
  {
    title: "Segurança",
    description: "Conte com condições claras e suporte durante sua assinatura.",
    icon: <Security aria-hidden="true" />,
  },
];

const faqs = [
  {
    question: "O que é a assinatura de smartphone?",
    answer:
      "É uma forma de ter acesso a um smartphone por meio de um plano de assinatura, sem a necessidade de comprar o aparelho integralmente no início.",
  },
  {
    question: "Posso escolher o modelo do smartphone?",
    answer:
      "Sim. Os modelos disponíveis podem variar conforme o plano e as condições da assinatura.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O pagamento segue as condições apresentadas no momento da contratação, incluindo valor, periodicidade e prazo.",
  },
];

const SmartphoneSubscription = () => {
  return (
    <main className="smartphone-subscription">
      <Header />
      <section
        className="subscription-steps"
        id="como-funciona"
        aria-labelledby="steps-title"
      >
        <div className="subscription-container">
          <div className="subscription-section-heading subscription-section-heading--center">
            <span className="subscription-eyebrow subscription-eyebrow--dark">
              É fácil começar
            </span>

            <h2 id="steps-title">
              Como funciona a<span> assinatura?</span>
            </h2>

            <p>
              Em poucos passos, você escolhe seu smartphone e começa a
              aproveitar.
            </p>
          </div>

          <ol className="subscription-steps__list">
            {steps.map((step, index) => (
              <li className="subscription-step" key={step.number}>
                <div className="subscription-step__number">{step.number}</div>

                <div className="subscription-step__icon">{step.icon}</div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>

                {index < steps.length - 1 && (
                  <ChevronRight
                    className="subscription-step__arrow"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        className="subscription-faq"
        id="duvidas"
        aria-labelledby="faq-title"
      >
        <div className="subscription-container">
          <div className="subscription-section-heading subscription-section-heading--center">
            <span className="subscription-eyebrow subscription-eyebrow--dark">
              Ainda tem dúvidas?
            </span>

            <h2 id="faq-title">
              Perguntas
              <span> frequentes</span>
            </h2>

            <p>Confira algumas informações importantes sobre a assinatura.</p>
          </div>

          <div className="subscription-faq__list">
            {faqs.map((faq) => (
              <details className="subscription-faq__item" key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                </summary>

                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default SmartphoneSubscription;
