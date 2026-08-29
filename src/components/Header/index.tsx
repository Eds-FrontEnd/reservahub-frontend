import LogoReservaHub from "../../assets/images/logo/reservahub_logo.png";
import Menu from "../Menu";
import "./HeaderStyle.css";

const Header = () => {
  return (
    <header className="header">
      <a href="/" aria-label="Ir para a página inicial">
        <img
          src={LogoReservaHub}
          alt="ReservaHub"
          width="158"
          height="34"
          decoding="async"
        />
      </a>
      <Menu />
    </header>
  );
};

export default Header;
