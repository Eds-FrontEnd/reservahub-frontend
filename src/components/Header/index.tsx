import { Link } from "react-router-dom";

import IconSearch from "../../assets/images/icons/icon-search.svg";
import IconCart from "../../assets/images/icons/icon-cart.svg";
import IconUser from "../../assets/images/icons/icon-user.svg";
import IconLogout from "../../assets/images/icons/icon-logout.svg";

import { Logo } from "../Logo";
import Menu from "../Menu";

import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";

import "./HeaderStyle.css";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openCart, totalItems } = useCart();

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

        <button
          type="button"
          className="header__action header__cart"
          onClick={openCart}
          aria-label={`Carrinho com ${totalItems} ${
            totalItems === 1 ? "produto" : "produtos"
          }`}
        >
          <img src={IconCart} alt="" width="24" height="24" decoding="async" />

          {totalItems > 0 && (
            <span className="header__cart-badge" aria-hidden="true">
              {totalItems}
            </span>
          )}
        </button>

        {isAuthenticated ? (
          <div className="header__account">
            <span className="header__welcome">
              Seja bem-vindo(a), {user?.name}!
            </span>

            <Link
              className="header__action"
              to="/"
              aria-label="Sair da minha conta"
              onClick={logout}
            >
              <img
                src={IconLogout}
                alt=""
                width="24"
                height="24"
                decoding="async"
              />
            </Link>
          </div>
        ) : (
          <Link
            className="header__action"
            to="/login"
            aria-label="Entrar na minha conta"
          >
            <img
              src={IconUser}
              alt=""
              width="24"
              height="24"
              decoding="async"
            />
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
