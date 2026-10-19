import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import IconSearch from "../../assets/images/icons/icon-search.svg";
import IconSearchDark from "../../assets/images/icons/icon-search-dark.svg";
import IconCart from "../../assets/images/icons/icon-cart.svg";
import IconCartDark from "../../assets/images/icons/icon-cart-dark.svg";
import IconUser from "../../assets/images/icons/icon-user.svg";
import IconUserDark from "../../assets/images/icons/icon-user-dark.svg";
import IconLogout from "../../assets/images/icons/icon-logout.svg";
import IconLogoutDark from "../../assets/images/icons/icon-logout-dark.svg";
import IconSun from "../../assets/images/icons/icon-sun.svg";
import IconMoon from "../../assets/images/icons/icon-moon.svg";

const API_URL = import.meta.env.VITE_API_URL;
import { Logo } from "../Logo";
import Menu from "../Menu";
import Search from "../Search";

import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";
import { useDarkTheme } from "../../contexts/DarkThemeContext";

import "./HeaderStyle.css";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openCart, totalItems } = useCart();
  const { isDarkMode, toggleTheme } = useDarkTheme();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const isAdmin = user?.perfil === "ADMIN";

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

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch {}
    }

    logout();
    navigate("/");
  };

  return (
    <>
      <header className="header">
        <Logo />

        <nav className="header__navigation" aria-label="Navegação principal">
          <Menu isAdmin={isAdmin} />
        </nav>

        <nav className="header__actions" aria-label="Ações do usuário">
          {!isAdmin && (
            <>
              <button
                type="button"
                className="header__action"
                onClick={handleOpenSearch}
                aria-label="Pesquisar produtos"
              >
                <img
                  src={isDarkMode ? IconSearchDark : IconSearch}
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
                  src={isDarkMode ? IconCartDark : IconCart}
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
            </>
          )}

          {isAuthenticated ? (
            <div className="header__account">
              <span className="header__welcome">
                Seja bem-vindo(a), {firstName}!
              </span>

              <button
                type="button"
                className="header__action"
                aria-label="Sair da minha conta"
                onClick={handleLogout}
              >
                <img
                  src={isDarkMode ? IconLogoutDark : IconLogout}
                  alt=""
                  width="24"
                  height="24"
                  decoding="async"
                />
              </button>
            </div>
          ) : (
            <Link
              className="header__action"
              to="/login"
              aria-label="Entrar na minha conta"
            >
              <img
                src={isDarkMode ? IconUserDark : IconUser}
                alt=""
                width="24"
                height="24"
                decoding="async"
              />
            </Link>
          )}

          <button
            type="button"
            className="header__action"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Ativar tema claro" : "Ativar tema escuro"}
          >
            <img
              src={isDarkMode ? IconMoon : IconSun}
              alt=""
              width="24"
              height="24"
              decoding="async"
            />
          </button>
        </nav>
      </header>

      {!isAdmin && <Search open={isSearchOpen} onClose={handleCloseSearch} />}
    </>
  );
};

export default Header;
