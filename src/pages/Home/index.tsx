import SmartImage from "../../assets/images/products/smartphone_home.png";

import { Image } from "../../components/Image";
import { Title } from "../../components/Title";

import Header from "../../components/Header";
import "./HomePageStyle.css";
import { Button } from "../../components/Button";
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
            color="var(--color-white)"
            title="Seu próximo smartphone está a poucos toques de distância."
            padding="1.5rem 0 1.5rem 0"
          >
            Seu próximo smartphone está a poucos cliques de distância.
          </Title>
          <Button
            to="/smartphone"
            backgroundColor="var(--color-secondary)"
            hoverBackgroundColor="var(--color-primary)"
          >
            Ver Smartphones
          </Button>
        </span>
        <Image
          src={SmartImage}
          alt="Foto de um Iphone frente e verso"
          width={295}
          height={295}
          priority
        />
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
