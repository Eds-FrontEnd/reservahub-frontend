import SmartImageFront from "../../assets/images/products/smartphone_front.png";
import SmartImageBack from "../../assets/images/products/smartphone_back.png";

import { Image } from "../../components/Image";
import { Title } from "../../components/Title";
import { Button } from "../../components/Button";

import "./HomePageStyle.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const HomePage = () => {
  return (
    <main className="home">
      <Header />
      <section className="home_section">
        <span className="home_description">
          <Title
            width="22rem"
            fullWidth={false}
            level={1}
            size="large"
            align="left"
            color="var(--color-blue)"
            title="Seu próximo smartphone está a poucos toques de distância."
            padding="1.5rem 0 1.5rem 0"
          >
            Seu próximo smartphone está a poucos cliques de distância.
          </Title>
          <Button
            to="/smartphones"
            backgroundColor="var(--color-secondary)"
            hoverBackgroundColor="var(--color-primary)"
          >
            Ver Smartphones
          </Button>
        </span>
        <span className="home_images">
          <Image
            src={SmartImageFront}
            alt="Foto de um Iphone frente"
            width={204}
            height={420}
            priority
          />
          <Image
            src={SmartImageBack}
            alt="Foto de um Iphone verso"
            width={204}
            height={420}
            priority
          />
        </span>
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
