import React, { useState } from "react";
import { Link } from "react-router-dom";

import IconSearch from "../../assets/images/icons/icon-search.svg";
import IconCart from "../../assets/images/icons/icon-cart.svg";
import IconUser from "../../assets/images/icons/icon-user.svg";
import IconLogout from "../../assets/images/icons/icon-logout.svg";

import { Logo } from "../Logo";
import Menu from "../Menu";
import Search from "../Search";

import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";

import "./HeaderStyle.css";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openCart, totalItems } = useCart();

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const firstName = user?.name
    ?.trim()
    .split(" ")[0]
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="header">
        <Logo />

        <nav className="header__navigation" aria-label="Navegação principal">
          <Menu />
        </nav>

        <nav className="header__actions" aria-label="Ações do usuário">
          <button
            type="button"
            className="header__action"
            onClick={handleOpenSearch}
            aria-label="Pesquisar produtos"
          >
            <img
              src={IconSearch}
              alt=""
              width="24"
              height="24"
              decoding="async"
            />
          </button>

          <button
            type="button"
            className="header__action header__cart"
            onClick={openCart}
            aria-label={`Carrinho com ${totalItems} ${
              totalItems === 1 ? "produto" : "produtos"
            }`}
          >
            <img
              src={IconCart}
              alt=""
              width="24"
              height="24"
              decoding="async"
            />

            {totalItems > 0 && (
              <span className="header__cart-badge" aria-hidden="true">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="header__account">
              <span className="header__welcome">
                Seja bem-vindo(a), {firstName}!
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

      <Search open={isSearchOpen} onClose={handleCloseSearch} />
    </>
  );
};

export default Header;
