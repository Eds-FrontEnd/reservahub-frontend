import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import Menu from "../Menu";

import "@testing-library/jest-dom";

describe("Menu", () => {
  const renderMenu = (initialEntries = ["/"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Menu />
      </MemoryRouter>,
    );

  it("deve renderizar a navegação principal", () => {
    renderMenu();

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
  });

  it("deve aplicar a classe menu ao elemento de navegação", () => {
    renderMenu();

    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    });

    expect(navigation).toHaveClass("menu");
  });

  it("deve renderizar o botão para abrir o menu", () => {
    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    expect(button).toBeInTheDocument();
  });

  it("deve renderizar o botão com o atributo aria-expanded como false inicialmente", () => {
    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("deve controlar a lista principal pelo atributo aria-controls", () => {
    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    expect(button).toHaveAttribute("aria-controls", "main-menu");
  });

  it("deve renderizar a lista principal", () => {
    renderMenu();

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("deve aplicar o id main-menu à lista principal", () => {
    renderMenu();

    expect(screen.getByRole("list")).toHaveAttribute("id", "main-menu");
  });

  it("deve aplicar a classe menu__list à lista principal", () => {
    renderMenu();

    expect(screen.getByRole("list")).toHaveClass("menu__list");
  });

  it("deve renderizar todos os itens do menu", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Como funciona?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Assine Agora!" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contato" })).toBeInTheDocument();
  });

  it("deve renderizar quatro links no menu", () => {
    renderMenu();

    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("deve aplicar a classe menu__item aos itens da lista", () => {
    renderMenu();

    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(4);
    items.forEach((item) => {
      expect(item).toHaveClass("menu__item");
    });
  });

  it("deve aplicar a classe menu__link aos links", () => {
    renderMenu();

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveClass("menu__link");
    });
  });

  it("deve apontar Início para a página inicial", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("deve apontar Como funciona? para a rota correta", () => {
    renderMenu();

    expect(
      screen.getByRole("link", { name: "Como funciona?" }),
    ).toHaveAttribute("href", "/como-funciona");
  });

  it("deve apontar Assine Agora! para a rota correta", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: "Assine Agora!" })).toHaveAttribute(
      "href",
      "/smartphones",
    );
  });

  it("deve apontar Contato para a rota correta", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute(
      "href",
      "/contato",
    );
  });

  it("deve iniciar com o menu fechado", () => {
    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    const list = screen.getByRole("list");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveClass("menu__mobile-button--open");
    expect(list).not.toHaveClass("menu__list--open");
  });

  it("deve abrir o menu ao clicar no botão", async () => {
    const user = userEvent.setup();

    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Fechar menu" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Fechar menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    expect(button).toHaveClass("menu__mobile-button--open");

    expect(screen.getByRole("list")).toHaveClass("menu__list--open");
  });

  it("deve trocar o ícone do menu ao abrir", async () => {
    const user = userEvent.setup();

    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    const initialIcon = button.querySelector("img");

    expect(initialIcon).toHaveClass("menu__icon-menu-mobile");
    expect(initialIcon).toHaveAttribute("aria-hidden", "true");
    expect(initialIcon).toHaveAttribute("alt", "");

    await user.click(button);

    const openedButton = screen.getByRole("button", {
      name: "Fechar menu",
    });

    const openedIcon = openedButton.querySelector("img");

    expect(openedIcon).toHaveClass("menu__icon-close-button");
    expect(openedIcon).toHaveAttribute("aria-hidden", "true");
    expect(openedIcon).toHaveAttribute("alt", "");
  });

  it("deve fechar o menu ao clicar novamente no botão", async () => {
    const user = userEvent.setup();

    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    await user.click(button);

    const openedButton = screen.getByRole("button", {
      name: "Fechar menu",
    });

    await user.click(openedButton);

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(screen.getByRole("list")).not.toHaveClass("menu__list--open");
  });

  it("deve fechar o menu ao clicar em um link", async () => {
    const user = userEvent.setup();

    renderMenu();

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menu",
      }),
    );

    expect(screen.getByRole("list")).toHaveClass("menu__list--open");

    await user.click(screen.getByRole("link", { name: "Contato" }));

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(screen.getByRole("list")).not.toHaveClass("menu__list--open");
  });

  it("deve marcar o link da rota atual como ativo", () => {
    renderMenu(["/contato"]);

    expect(screen.getByRole("link", { name: "Contato" })).toHaveClass("active");

    expect(screen.getByRole("link", { name: "Início" })).not.toHaveClass(
      "active",
    );
  });

  it("deve marcar Como funciona? como ativo quando a rota atual corresponder", () => {
    renderMenu(["/como-funciona"]);

    expect(screen.getByRole("link", { name: "Como funciona?" })).toHaveClass(
      "active",
    );
  });

  it("deve marcar Assine Agora! como ativo quando a rota atual corresponder", () => {
    renderMenu(["/smartphones"]);

    expect(screen.getByRole("link", { name: "Assine Agora!" })).toHaveClass(
      "active",
    );
  });

  it("deve marcar Início como ativo somente na rota inicial", () => {
    renderMenu(["/"]);

    expect(screen.getByRole("link", { name: "Início" })).toHaveClass("active");
  });

  it("não deve marcar Início como ativo em uma rota diferente", () => {
    renderMenu(["/smartphones/detalhes"]);

    expect(screen.getByRole("link", { name: "Início" })).not.toHaveClass(
      "active",
    );
  });

  it("deve manter os links acessíveis pelo teclado", async () => {
    const user = userEvent.setup();

    renderMenu();

    const button = screen.getByRole("button", {
      name: "Abrir menu",
    });

    await user.tab();

    expect(button).toHaveFocus();
  });
});
