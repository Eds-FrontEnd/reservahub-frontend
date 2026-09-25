import { createRef } from "react";
import { render, screen } from "@testing-library/react";

import { Title } from "../Title/index";

describe("Title", () => {
  it("deve renderizar o conteúdo corretamente", () => {
    render(<Title>Título da página</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título da página",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar h2 por padrão", () => {
    render(<Title>Título padrão</Title>);

    const title = screen.getByRole("heading", {
      name: "Título padrão",
    });

    expect(title.tagName).toBe("H2");
  });

  it("deve renderizar o nível de heading informado", () => {
    render(<Title level={1}>Título principal</Title>);

    const title = screen.getByRole("heading", {
      name: "Título principal",
    });

    expect(title.tagName).toBe("H1");
  });

  it.each([
    [1, "H1"],
    [2, "H2"],
    [3, "H3"],
    [4, "H4"],
    [5, "H5"],
    [6, "H6"],
  ] as const)("deve renderizar h%s quando level=%s", (level, tagName) => {
    render(<Title level={level}>Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title.tagName).toBe(tagName);
  });

  it("deve permitir definir o elemento semântico através de as", () => {
    render(<Title as="p">Texto</Title>);

    const title = screen.getByText("Texto");

    expect(title.tagName).toBe("P");
  });

  it.each([
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
    ["h4", "H4"],
    ["h5", "H5"],
    ["h6", "H6"],
    ["p", "P"],
    ["span", "SPAN"],
  ] as const)(
    "deve renderizar o elemento %s quando informado em as",
    (element, tagName) => {
      render(<Title as={element}>Título</Title>);

      const title = screen.getByText("Título");

      expect(title.tagName).toBe(tagName);
    },
  );

  it("deve priorizar as sobre level", () => {
    render(
      <Title as="p" level={1}>
        Título
      </Title>,
    );

    const title = screen.getByText("Título");

    expect(title.tagName).toBe("P");
  });

  it.each(["left", "center", "right"] as const)(
    "deve aplicar a classe de alinhamento %s",
    (align) => {
      render(<Title align={align}>Título</Title>);

      const title = screen.getByRole("heading", {
        name: "Título",
      });

      expect(title).toHaveClass(`title--${align}`);
    },
  );

  it("deve aplicar alinhamento à esquerda por padrão", () => {
    render(<Title>Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).toHaveClass("title--left");
  });

  it.each(["small", "medium", "large", "xlarge"] as const)(
    "deve aplicar a classe de tamanho %s",
    (size) => {
      render(<Title size={size}>Título</Title>);

      const title = screen.getByRole("heading", {
        name: "Título",
      });

      expect(title).toHaveClass(`title--${size}`);
    },
  );

  it("deve aplicar tamanho medium por padrão", () => {
    render(<Title>Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).toHaveClass("title--medium");
  });

  it("deve aplicar a classe de largura total por padrão", () => {
    render(<Title>Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).toHaveClass("title--full-width");
  });

  it("não deve aplicar largura total quando fullWidth for false", () => {
    render(<Title fullWidth={false}>Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).not.toHaveClass("title--full-width");
  });

  it("deve aplicar width inline quando informado", () => {
    render(<Title width="500px">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle({
      width: "500px",
    });
  });

  it("não deve aplicar a classe full-width quando width for informado", () => {
    render(<Title width="500px">Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).not.toHaveClass("title--full-width");
  });

  it("deve aplicar fontSize através da custom property CSS", () => {
    render(<Title fontSize="2rem">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle("--title-font-size: 2rem");
  });

  it("deve aplicar color através da custom property CSS", () => {
    render(<Title color="#003399">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle("--title-color: #003399");
  });

  it("deve aplicar margin quando informado", () => {
    render(<Title margin="20px">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle({
      margin: "20px",
    });
  });

  it("deve aplicar padding quando informado", () => {
    render(<Title padding="10px">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle({
      padding: "10px",
    });
  });

  it("deve combinar width, fontSize, color, margin e padding", () => {
    render(
      <Title
        width="80%"
        fontSize="32px"
        color="red"
        margin="10px 20px"
        padding="5px"
      >
        Título
      </Title>,
    );

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle({
      width: "80%",
      "--title-font-size": "32px",
      "--title-color": "red",
      margin: "10px 20px",
      padding: "5px",
    });
  });

  it("deve preservar estilos informados através da prop style", () => {
    render(
      <Title
        style={{
          backgroundColor: "black",
          lineHeight: 1.5,
        }}
      >
        Título
      </Title>,
    );

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title.style.backgroundColor).toBe("black");
    expect(title.style.lineHeight).toBe("1.5");
  });

  it("deve permitir sobrescrever propriedades geradas através da prop style", () => {
    render(
      <Title
        width="500px"
        margin="10px"
        style={{
          width: "700px",
          margin: "20px",
        }}
      >
        Título
      </Title>,
    );

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveStyle({
      width: "700px",
      margin: "20px",
    });
  });

  it("deve aplicar className personalizado", () => {
    render(<Title className="custom-title">Título</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).toHaveClass("custom-title");
  });

  it("deve combinar className personalizado com as classes padrão", () => {
    render(
      <Title align="center" size="large" className="custom-title">
        Título
      </Title>,
    );

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveClass(
      "title",
      "title--center",
      "title--large",
      "title--full-width",
      "custom-title",
    );
  });

  it("deve encaminhar a ref para o elemento renderizado", () => {
    const ref = createRef<HTMLElement>();

    render(<Title ref={ref}>Título</Title>);

    expect(ref.current).toBe(
      screen.getByRole("heading", {
        name: "Título",
      }),
    );
  });

  it("deve encaminhar a ref para o elemento definido em as", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Title ref={ref} as="span">
        Título
      </Title>,
    );

    expect(ref.current).toBe(screen.getByText("Título"));
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("deve encaminhar atributos HTML adicionais", () => {
    render(
      <Title
        id="main-title"
        data-testid="custom-title"
        title="Título informativo"
      >
        Título
      </Title>,
    );

    const title = screen.getByTestId("custom-title");

    expect(title).toHaveAttribute("id", "main-title");
    expect(title).toHaveAttribute("title", "Título informativo");
  });

  it("deve encaminhar aria-label corretamente", () => {
    render(<Title aria-label="Título principal">Conteúdo visual</Title>);

    expect(
      screen.getByRole("heading", {
        name: "Título principal",
      }),
    ).toBeInTheDocument();
  });

  it("deve suportar conteúdo ReactNode", () => {
    render(
      <Title>
        <span>Parte 1</span>
        <strong>Parte 2</strong>
      </Title>,
    );

    expect(screen.getByText("Parte 1")).toBeInTheDocument();
    expect(screen.getByText("Parte 2")).toBeInTheDocument();
  });

  it("deve renderizar conteúdo numérico", () => {
    render(<Title>{2026}</Title>);

    expect(
      screen.getByRole("heading", {
        name: "2026",
      }),
    ).toBeInTheDocument();
  });

  it("deve aceitar fullWidth como false mesmo quando width não é informado", () => {
    render(<Title fullWidth={false}>Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title).toHaveClass("title");
    expect(title).not.toHaveClass("title--full-width");
  });

  it("deve manter as classes padrão quando className não é informado", () => {
    render(<Title>Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title.className).toBe(
      "title title--left title--medium title--full-width",
    );
  });

  it("deve remover classes vazias quando className for uma string vazia", () => {
    render(<Title className="">Título</Title>);

    const title = screen.getByRole("heading", {
      name: "Título",
    });

    expect(title.className).not.toContain("undefined");
    expect(title.className).not.toContain("false");
  });
});
