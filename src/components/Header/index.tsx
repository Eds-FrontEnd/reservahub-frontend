import LogoReservaHub from "../../assets/images/logo/reservahub_logo.png";

import Menu from "../Menu";

import "./HeaderStyle.css";

const Header = () => {
  return (
    <header className="header">
      <a
        className="header__logo"
        href="/"
        aria-label="ReservaHub - página inicial"
      >
        <img
          src={LogoReservaHub}
          alt="ReservaHub"
          width="158"
          height="34"
          decoding="async"
        />
      </a>

      <Menu />

      <a className="header__button" href="/login">
        Entrar
      </a>
    </header>
  );
};

export default Header;
