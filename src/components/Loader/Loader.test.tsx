import { render, screen } from "@testing-library/react";

import Loader from "../Loader";

import "@testing-library/jest-dom";

describe("Loader", () => {
  it("deve renderizar o container do loader", () => {
    const { container } = render(<Loader />);

    expect(
      container.querySelector<HTMLElement>(".page-loader"),
    ).toBeInTheDocument();
  });

  it("deve aplicar a classe page-loader ao container", () => {
    const { container } = render(<Loader />);

    const loader = container.querySelector<HTMLElement>(".page-loader");

    expect(loader).toHaveClass("page-loader");
  });

  it("deve renderizar o spinner", () => {
    const { container } = render(<Loader />);

    expect(
      container.querySelector<HTMLElement>(".page-loader__spinner"),
    ).toBeInTheDocument();
  });

  it("deve aplicar a classe page-loader__spinner ao spinner", () => {
    const { container } = render(<Loader />);

    const spinner = container.querySelector<HTMLElement>(
      ".page-loader__spinner",
    );

    expect(spinner).toHaveClass("page-loader__spinner");
  });

  it("deve renderizar um elemento SVG dentro do spinner", () => {
    const { container } = render(<Loader />);

    const spinner = container.querySelector<HTMLElement>(
      ".page-loader__spinner",
    );

    const svg = spinner?.querySelector<SVGElement>("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toBeInstanceOf(SVGElement);
  });

  it("deve renderizar o SVG do spinner com a estrutura esperada", () => {
    const { container } = render(<Loader />);

    const spinner = container.querySelector<HTMLElement>(
      ".page-loader__spinner",
    );

    const svg = spinner?.querySelector<SVGElement>("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toContainElement(
      spinner?.querySelector<SVGCircleElement>("circle") ?? null,
    );
  });

  it("deve aplicar a espessura 4 ao spinner", () => {
    const { container } = render(<Loader />);

    const spinner = container.querySelector<HTMLElement>(
      ".page-loader__spinner",
    );

    const circle = spinner?.querySelector<SVGCircleElement>("circle");

    expect(circle).toHaveAttribute("stroke-width", "4");
  });

  it("deve renderizar o texto de carregamento", () => {
    render(<Loader />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("deve aplicar a classe page-loader__text ao texto", () => {
    render(<Loader />);

    expect(screen.getByText("Carregando...")).toHaveClass("page-loader__text");
  });

  it("deve renderizar o texto dentro de um parágrafo", () => {
    render(<Loader />);

    const text = screen.getByText("Carregando...");

    expect(text.tagName).toBe("P");
  });

  it("deve renderizar o spinner e o texto dentro do container", () => {
    const { container } = render(<Loader />);

    const loader = container.querySelector<HTMLElement>(".page-loader");
    const spinner = container.querySelector<HTMLElement>(
      ".page-loader__spinner",
    );
    const text = container.querySelector<HTMLElement>(".page-loader__text");

    expect(loader).toContainElement(spinner);
    expect(loader).toContainElement(text);
  });

  it("deve renderizar apenas um spinner", () => {
    const { container } = render(<Loader />);

    expect(container.querySelectorAll(".page-loader__spinner")).toHaveLength(1);
  });

  it("deve renderizar apenas um texto de carregamento", () => {
    render(<Loader />);

    expect(screen.getAllByText("Carregando...")).toHaveLength(1);
  });

  it("deve utilizar o componente Loader sem propriedades obrigatórias", () => {
    expect(() => render(<Loader />)).not.toThrow();
  });
});
