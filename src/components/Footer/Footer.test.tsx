import { render, screen } from "@testing-library/react";

import Footer from "../Footer/index";

import "@testing-library/jest-dom";

describe("Footer", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    jest.setSystemTime(new Date("2026-09-24T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve renderizar o footer", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("deve exibir o nome da ReservaHub", () => {
    render(<Footer />);

    expect(
      screen.getByText("© 2026 ReservaHub. Todos os direitos reservados."),
    ).toBeInTheDocument();
  });

  it("deve exibir o ano atual automaticamente", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();

    expect(
      screen.getByText(
        `© ${currentYear} ReservaHub. Todos os direitos reservados.`,
      ),
    ).toBeInTheDocument();
  });

  it("deve renderizar a navegação de redes sociais", () => {
    render(<Footer />);

    expect(
      screen.getByRole("navigation", {
        name: "Redes sociais",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar todas as redes sociais", () => {
    render(<Footer />);

    const socialLinks = [
      "Acessar Instagram",
      "Acessar Facebook",
      "Acessar LinkedIn",
      "Acessar Twitter",
      "Acessar WhatsApp",
    ];

    socialLinks.forEach((label) => {
      expect(
        screen.getByRole("link", {
          name: label,
        }),
      ).toBeInTheDocument();
    });
  });

  it("deve renderizar exatamente cinco links de redes sociais", () => {
    render(<Footer />);

    const navigation = screen.getByRole("navigation", {
      name: "Redes sociais",
    });

    expect(navigation.querySelectorAll("a")).toHaveLength(5);
  });

  it("deve possuir o link correto do Instagram", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Acessar Instagram",
      }),
    ).toHaveAttribute("href", "https://www.instagram.com/");
  });

  it("deve possuir o link correto do Facebook", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Acessar Facebook",
      }),
    ).toHaveAttribute("href", "https://www.facebook.com/");
  });

  it("deve possuir o link correto do LinkedIn", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Acessar LinkedIn",
      }),
    ).toHaveAttribute("href", "https://www.linkedin.com/");
  });

  it("deve possuir o link correto do Twitter", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Acessar Twitter",
      }),
    ).toHaveAttribute("href", "https://twitter.com/");
  });

  it("deve possuir o link correto do WhatsApp", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Acessar WhatsApp",
      }),
    ).toHaveAttribute("href", "https://wa.me/");
  });

  it("deve abrir os links sociais em uma nova aba", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("deve possuir rel seguro nos links externos", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("deve possuir aria-label em todos os links sociais", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveAttribute("aria-label");
    });
  });

  it("deve renderizar a lista de redes sociais", () => {
    render(<Footer />);

    const navigation = screen.getByRole("navigation", {
      name: "Redes sociais",
    });

    const list = navigation.querySelector("ul");

    expect(list).toBeInTheDocument();
    expect(list).toHaveClass("footer__social-list");
  });

  it("deve renderizar um item de lista para cada rede social", () => {
    render(<Footer />);

    const navigation = screen.getByRole("navigation", {
      name: "Redes sociais",
    });

    const listItems = navigation.querySelectorAll("li");

    expect(listItems).toHaveLength(5);
  });

  it("deve renderizar os ícones das redes sociais", () => {
    render(<Footer />);

    const navigation = screen.getByRole("navigation", {
      name: "Redes sociais",
    });

    const svgIcons = navigation.querySelectorAll("svg");

    expect(svgIcons).toHaveLength(5);
  });

  it("deve manter a estrutura semântica do footer", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    const navigation = screen.getByRole("navigation", {
      name: "Redes sociais",
    });

    expect(footer).toContainElement(navigation);
  });
});
