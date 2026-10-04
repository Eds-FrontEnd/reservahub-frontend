import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { DarkThemeProvider } from "../../contexts/DarkThemeContext";
import { Logo } from "../Logo";

import "@testing-library/jest-dom";

describe("Logo", () => {
  const renderLogo = () =>
    render(
      <MemoryRouter>
        <DarkThemeProvider>
          <Logo />
        </DarkThemeProvider>
      </MemoryRouter>,
    );

  it("deve renderizar o logo", () => {
    renderLogo();

    expect(screen.getByRole("img", { name: "ReservaHub" })).toBeInTheDocument();
  });

  it("deve renderizar o logo dentro de um link", () => {
    renderLogo();

    const link = screen.getByRole("link", {
      name: "ReservaHub - página inicial",
    });

    expect(link).toBeInTheDocument();
    expect(link).toContainElement(
      screen.getByRole("img", { name: "ReservaHub" }),
    );
  });

  it("deve aplicar a classe logo ao link", () => {
    renderLogo();

    const link = screen.getByRole("link", {
      name: "ReservaHub - página inicial",
    });

    expect(link).toHaveClass("logo");
  });

  it("deve apontar o link para a página inicial", () => {
    renderLogo();

    const link = screen.getByRole("link", {
      name: "ReservaHub - página inicial",
    });

    expect(link).toHaveAttribute("href", "/");
  });

  it("deve aplicar o nome acessível correto ao link", () => {
    renderLogo();

    expect(
      screen.getByRole("link", {
        name: "ReservaHub - página inicial",
      }),
    ).toHaveAttribute("aria-label", "ReservaHub - página inicial");
  });

  it("deve renderizar a imagem com o texto alternativo correto", () => {
    renderLogo();

    expect(screen.getByRole("img")).toHaveAttribute("alt", "ReservaHub");
  });

  it("deve renderizar a imagem com largura de 158 pixels", () => {
    renderLogo();

    expect(screen.getByRole("img")).toHaveAttribute("width", "158");
  });

  it("deve renderizar a imagem com altura de 34 pixels", () => {
    renderLogo();

    expect(screen.getByRole("img")).toHaveAttribute("height", "34");
  });

  it("deve utilizar decoding assíncrono na imagem", () => {
    renderLogo();

    expect(screen.getByRole("img")).toHaveAttribute("decoding", "async");
  });

  it("deve renderizar apenas uma imagem", () => {
    renderLogo();

    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("deve renderizar apenas um link", () => {
    renderLogo();

    expect(
      screen.getAllByRole("link", {
        name: "ReservaHub - página inicial",
      }),
    ).toHaveLength(1);
  });
});
