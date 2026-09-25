import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { Button } from "../Button/index";

describe("Button", () => {
  it("deve renderizar o texto corretamente", () => {
    render(<Button>Continuar</Button>);

    expect(
      screen.getByRole("button", { name: "Continuar" }),
    ).toBeInTheDocument();
  });

  it("deve renderizar como link quando a propriedade to for informada", () => {
    render(
      <MemoryRouter>
        <Button to="/smartphones">Ver smartphones</Button>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Ver smartphones" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/smartphones");
  });

  it("deve aplicar o tamanho informado", () => {
    render(<Button size="large">Continuar</Button>);

    expect(screen.getByRole("button")).toHaveClass("action-button--large");
  });

  it("deve aplicar fullWidth quando informado", () => {
    render(<Button fullWidth>Continuar</Button>);

    expect(screen.getByRole("button")).toHaveClass("action-button--full-width");
  });

  it("deve aplicar uma classe personalizada", () => {
    render(<Button className="custom-button">Continuar</Button>);

    expect(screen.getByRole("button")).toHaveClass("custom-button");
  });

  it("deve renderizar o ícone à esquerda", () => {
    render(
      <Button icon={<span data-testid="icon">→</span>} iconPosition="left">
        Continuar
      </Button>,
    );

    const icon = screen.getByTestId("icon");

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass("action-button__icon");
  });

  it("deve renderizar o ícone à direita por padrão", () => {
    render(<Button icon={<span data-testid="icon">→</span>}>Continuar</Button>);

    const icon = screen.getByTestId("icon");

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass("action-button__icon");
  });

  it("deve exibir o estado de loading", () => {
    render(
      <Button loading loadingText="Processando">
        Continuar
      </Button>,
    );

    expect(screen.getByText("Processando")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("button").querySelector(".action-button__spinner"),
    ).toBeInTheDocument();
  });

  it("deve desabilitar o botão quando disabled for informado", () => {
    render(<Button disabled>Continuar</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("deve desabilitar o link quando loading estiver ativo", () => {
    render(
      <MemoryRouter>
        <Button to="/smartphones" loading>
          Ver smartphones
        </Button>
      </MemoryRouter>,
    );

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("href");
  });

  it("deve aplicar as variáveis CSS personalizadas", () => {
    render(
      <Button
        textColor="#ffffff"
        backgroundColor="#003399"
        hoverBackgroundColor="#008000"
      >
        Continuar
      </Button>,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveStyle("--button-text-color: #ffffff");
    expect(button).toHaveStyle("--button-background-color: #003399");
    expect(button).toHaveStyle("--button-hover-background-color: #008000");
  });

  it("deve chamar o evento onClick", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Continuar</Button>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("não deve chamar onClick quando estiver desabilitado", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <Button disabled onClick={handleClick}>
        Continuar
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("não deve renderizar como link quando loading estiver ativo", () => {
    render(
      <MemoryRouter>
        <Button to="/smartphones" loading>
          Ver smartphones
        </Button>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
