import { useState } from "react";
import "./MenuStyle.css";

import IconMenuMobile from "../../assets/images/icons/icon-menu-mobile.svg";
import IconCloseButton from "../../assets/images/icons/icon-close-button.svg";

const menuItems = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/como-funciona", label: "Como funciona?" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="menu" aria-label="Navegação principal">
      <button
        className="menu__mobile-button"
        type="button"
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        onClick={toggleMenu}
      >
        <img
          src={isMenuOpen ? IconCloseButton : IconMenuMobile}
          alt=""
          aria-hidden="true"
        />
      </button>

      <ul
        id="main-menu"
        className={`menu__list ${isMenuOpen ? "menu__list--open" : ""}`}
      >
        {menuItems.map(({ href, label }) => (
          <li className="menu__item" key={href}>
            <a className="menu__link" href={href} onClick={closeMenu}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
