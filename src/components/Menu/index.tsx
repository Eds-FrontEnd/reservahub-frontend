import { useState } from "react";
import { NavLink } from "react-router-dom";

import "./MenuStyle.css";

import IconMenuMobile from "../../assets/images/icons/icon-menu-mobile.svg";
import IconMenuMobileDark from "../../assets/images/icons/icon-menu-mobile-dark.svg";
import IconCloseButton from "../../assets/images/icons/icon-close-button.svg";
import IconCloseButtonDark from "../../assets/images/icons/icon-close-button-dark.svg";
import { useDarkTheme } from "../../contexts/DarkThemeContext";

interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { href: "/", label: "Início" },
  { href: "/como-funciona", label: "Como funciona?" },
  { href: "/smartphones", label: "Assine Agora!" },
  { href: "/contato", label: "Contato" },
];

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode } = useDarkTheme();

  const toggleMenu = () => {
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuIcon = isDarkMode ? IconMenuMobileDark : IconMenuMobile;
  const closeIcon = isDarkMode ? IconCloseButtonDark : IconCloseButton;

  return (
    <nav className="menu" aria-label="Navegação principal">
      <button
        className={`menu__mobile-button ${
          isMenuOpen ? "menu__mobile-button--open" : ""
        }`}
        type="button"
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        onClick={toggleMenu}
      >
        <img
          className={
            isMenuOpen ? "menu__icon-close-button" : "menu__icon-menu-mobile"
          }
          src={isMenuOpen ? closeIcon : menuIcon}
          alt=""
          aria-hidden="true"
          width="24"
          height="24"
          decoding="async"
        />
      </button>

      <ul
        id="main-menu"
        className={`menu__list ${isMenuOpen ? "menu__list--open" : ""}`}
      >
        {menuItems.map(({ href, label }) => (
          <li className="menu__item" key={href}>
            <NavLink
              className="menu__link"
              to={href}
              end={href === "/"}
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
