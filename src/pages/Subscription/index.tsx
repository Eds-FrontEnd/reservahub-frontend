import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "./SmartphoneStyles.css";

import ChevronRight from "@mui/icons-material/ChevronRight";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import PhoneAndroid from "@mui/icons-material/PhoneAndroid";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import Smartphone from "@mui/icons-material/Smartphone";
import Tune from "@mui/icons-material/Tune";

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
      "Encontre o smartphone ideal entre os modelos disponíveis, com planos de assinatura mais acessíveis e sem precisar comprar o aparelho integralmente.",
    icon: <Smartphone aria-hidden="true" />,
  },
  {
    number: "02",
    title: "Escolha seu plano",
    description:
      "Escolha o período de assinatura e confira os benefícios disponíveis, que podem incluir seguro contra roubo, garantia e assistência técnica.",
    icon: <Tune aria-hidden="true" />,
  },
  {
    number: "03",
    title: "Receba em casa",
    description:
      "Finalize sua assinatura e aguarde a entrega do smartphone no endereço informado, com praticidade e comodidade.",
    icon: <ShoppingCart aria-hidden="true" />,
  },
  {
    number: "04",
    title: "Use e aproveite",
    description:
      "Aproveite seu smartphone com mais tranquilidade, contando com atendimento personalizado e manutenção profissional, conforme as condições do plano.",
    icon: <PhoneAndroid aria-hidden="true" />,
  },
];

const faqs = [
  {
    question: "O que é a assinatura de smartphone?",
    answer:
      "É uma alternativa à compra tradicional que permite utilizar um smartphone por meio de um plano de assinatura, com menor investimento, mais praticidade e vários benefícios.",
  },
  {
    question: "Posso escolher o modelo do smartphone?",
    answer:
      "Sim. Você pode escolher entre os modelos disponíveis e consultar as opções de planos e benefícios para encontrar a alternativa mais adequada às suas necessidades.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O pagamento segue as condições apresentadas no momento da contratação, incluindo valor, periodicidade e prazo.",
  },
  {
    question: "Quais são os benefícios?",
    answer:
      "Você terá cobertura total de garantia, seguro contra roubo, asssitência técnica e manutenção profissional à sua disposição, atendimento personalizado, e o melhor de tudo, smartphones de última geração por um preço acessível!",
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
              Tenha acesso a smartphones de última geração por planos
              acessíveis, com praticidade, atendimento personalizado e
              benefícios que podem incluir seguro, garantia e assistência
              técnica.
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

            <p>
              Conheça as opções de assinatura e os benefícios disponíveis, como
              seguro contra roubo, garantia, assistência técnica e manutenção
              profissional, conforme as condições de cada plano.
            </p>
          </div>

          <div className="subscription-faq__list">
            {faqs.map((faq) => (
              <details className="subscription-faq__item" key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <KeyboardArrowDown aria-hidden="true" />
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
