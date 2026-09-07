import { Link } from "react-router-dom";

import IconSearch from "../../assets/images/icons/icon-search.svg";
import IconCart from "../../assets/images/icons/icon-cart.svg";
import IconUser from "../../assets/images/icons/icon-user.svg";

import { Logo } from "../Logo";
import Menu from "../Menu";

import "./HeaderStyle.css";

const Header = () => {
  return (
    <header className="header">
      <Logo />

      <nav className="header__navigation" aria-label="Navegação principal">
        <Menu />
      </nav>

      <nav className="header__actions" aria-label="Ações do usuário">
        <Link className="header__action" to="/buscar" aria-label="Pesquisar">
          <img
            src={IconSearch}
            alt=""
            width="24"
            height="24"
            decoding="async"
          />
        </Link>

        <Link className="header__action" to="/carrinho" aria-label="Carrinho">
          <img src={IconCart} alt="" width="24" height="24" decoding="async" />
        </Link>

        <Link
          className="header__action"
          to="/login"
          aria-label="Entrar na minha conta"
        >
          <img src={IconUser} alt="" width="24" height="24" decoding="async" />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
