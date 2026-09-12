import { Link } from "react-router-dom";

import "./NotFoundStyle.css";

import notFoundImage from "../../assets/images/not-found/not-found-404.png";
import { Button } from "../../components/Button";

const NotFound = () => {
  return (
    <main className="not-found">
      <section className="not-found__content" aria-labelledby="not-found-title">
        <div className="not-found__illustration">
          <img
            src={notFoundImage}
            alt="Smartphone divertido segurando uma placa com o número 404"
            width="600"
            height="500"
            loading="eager"
          />
        </div>

        <div className="not-found__message">
          <p className="not-found__code" aria-label="Erro 404">
            404
          </p>

          <h1 id="not-found-title" className="not-found__title">
            Ops! Página não encontrada.
          </h1>

          <p className="not-found__description">
            A página que você está procurando não existe. Volte para nossa
            página inicial e continue explorando.
          </p>
          <Button
            to="/"
            backgroundColor="var(--color-secondary)"
            hoverBackgroundColor="var(--color-primary)"
          >
            Voltar para a página inicial
          </Button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
