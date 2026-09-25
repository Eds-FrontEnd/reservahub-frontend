import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasswordInput } from "../PasswordInput";

import "@testing-library/jest-dom";

describe("PasswordInput", () => {
  const renderPasswordInput = (
    props: React.ComponentProps<typeof PasswordInput> = {},
  ) => render(<PasswordInput {...props} />);

  const getInput = (container: HTMLElement): HTMLInputElement => {
    const input = container.querySelector("input");

    if (!input) {
      throw new Error("Campo de senha não encontrado.");
    }

    return input;
  };

  it("deve renderizar o campo de senha", () => {
    const { container } = renderPasswordInput();

    expect(getInput(container)).toBeInTheDocument();
  });

  it("deve renderizar o campo inicialmente como password", () => {
    const { container } = renderPasswordInput();

    expect(getInput(container)).toHaveAttribute("type", "password");
  });

  it("deve aplicar o id informado ao campo", () => {
    const { container } = renderPasswordInput({
      id: "password",
    });

    expect(getInput(container)).toHaveAttribute("id", "password");
  });

  it("deve gerar um id quando nenhum id for informado", () => {
    const { container } = renderPasswordInput();

    const input = getInput(container);

    expect(input).toHaveAttribute("id");
    expect(input.getAttribute("id")).toMatch(/^password-/);
  });

  it("deve aplicar a classe password-input ao container principal", () => {
    renderPasswordInput();

    expect(document.querySelector(".password-input")).toBeInTheDocument();
  });

  it("deve aplicar a classe password-input__field ao container do campo", () => {
    renderPasswordInput();

    expect(
      document.querySelector(".password-input__field"),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão para exibir a senha", () => {
    renderPasswordInput();

    expect(
      screen.getByRole("button", { name: "Exibir senha" }),
    ).toBeInTheDocument();
  });

  it("deve aplicar a classe password-input__toggle ao botão", () => {
    renderPasswordInput();

    expect(screen.getByRole("button", { name: "Exibir senha" })).toHaveClass(
      "password-input__toggle",
    );
  });

  it("deve iniciar o botão com aria-pressed false", () => {
    renderPasswordInput();

    expect(
      screen.getByRole("button", { name: "Exibir senha" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("deve exibir a senha ao clicar no botão", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    const input = getInput(container);
    const toggleButton = screen.getByRole("button", {
      name: "Exibir senha",
    });

    await user.click(toggleButton);

    expect(input).toHaveAttribute("type", "text");
  });

  it("deve alterar o nome acessível do botão ao exibir a senha", async () => {
    const user = userEvent.setup();

    renderPasswordInput();

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Ocultar senha" }),
    ).toBeInTheDocument();
  });

  it("deve alterar aria-pressed para true ao exibir a senha", async () => {
    const user = userEvent.setup();

    renderPasswordInput();

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Ocultar senha" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("deve ocultar novamente a senha ao clicar no botão", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    const input = getInput(container);

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ocultar senha",
      }),
    );

    expect(input).toHaveAttribute("type", "password");
  });

  it("deve restaurar aria-pressed para false ao ocultar a senha", async () => {
    const user = userEvent.setup();

    renderPasswordInput();

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ocultar senha",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Exibir senha" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("deve renderizar o ícone de visibilidade quando a senha estiver oculta", () => {
    renderPasswordInput();

    expect(screen.getByTestId("VisibilityIcon")).toBeInTheDocument();
  });

  it("deve renderizar o ícone de ocultação quando a senha estiver visível", async () => {
    const user = userEvent.setup();

    renderPasswordInput();

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    expect(screen.getByTestId("VisibilityOffIcon")).toBeInTheDocument();
  });

  it("deve aplicar aria-invalid false quando não houver erro", () => {
    const { container } = renderPasswordInput();

    expect(getInput(container)).toHaveAttribute("aria-invalid", "false");
  });

  it("deve aplicar aria-invalid true quando houver erro", () => {
    const { container } = renderPasswordInput({
      error: "Senha inválida",
    });

    expect(getInput(container)).toHaveAttribute("aria-invalid", "true");
  });

  it("deve renderizar a mensagem de erro", () => {
    renderPasswordInput({
      error: "Senha inválida",
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Senha inválida");
  });

  it("deve aplicar a classe password-input__error à mensagem de erro", () => {
    renderPasswordInput({
      error: "Senha inválida",
    });

    expect(screen.getByRole("alert")).toHaveClass("password-input__error");
  });

  it("deve associar a mensagem de erro ao campo pelo aria-describedby", () => {
    const { container } = renderPasswordInput({
      id: "password",
      error: "Senha inválida",
    });

    const input = getInput(container);
    const error = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-describedby", "password-error");

    expect(error).toHaveAttribute("id", "password-error");
  });

  it("não deve renderizar a mensagem de erro quando error não for informado", () => {
    renderPasswordInput();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve preservar aria-describedby informado quando não houver erro", () => {
    const { container } = renderPasswordInput({
      id: "password",
      "aria-describedby": "password-help",
    });

    expect(getInput(container)).toHaveAttribute(
      "aria-describedby",
      "password-help",
    );
  });

  it("deve combinar aria-describedby informado com o id do erro", () => {
    const { container } = renderPasswordInput({
      id: "password",
      "aria-describedby": "password-help",
      error: "Senha inválida",
    });

    expect(getInput(container)).toHaveAttribute(
      "aria-describedby",
      "password-help password-error",
    );
  });

  it("deve aplicar placeholder ao campo", () => {
    const { container } = renderPasswordInput({
      placeholder: "Digite sua senha",
    });

    expect(getInput(container)).toHaveAttribute(
      "placeholder",
      "Digite sua senha",
    );
  });

  it("deve aplicar name ao campo", () => {
    const { container } = renderPasswordInput({
      name: "password",
    });

    expect(getInput(container)).toHaveAttribute("name", "password");
  });

  it("deve aplicar autoComplete ao campo", () => {
    const { container } = renderPasswordInput({
      autoComplete: "current-password",
    });

    expect(getInput(container)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("deve aplicar required ao campo", () => {
    const { container } = renderPasswordInput({
      required: true,
    });

    expect(getInput(container)).toBeRequired();
  });

  it("deve aplicar disabled ao campo", () => {
    const { container } = renderPasswordInput({
      disabled: true,
    });

    expect(getInput(container)).toBeDisabled();
  });

  it("deve preservar o valor informado no campo", () => {
    const { container } = renderPasswordInput({
      defaultValue: "Senha123",
    });

    expect(getInput(container)).toHaveValue("Senha123");
  });

  it("deve permitir digitar no campo", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    const input = getInput(container);

    await user.type(input, "Senha123");

    expect(input).toHaveValue("Senha123");
  });

  it("deve chamar onChange quando o valor for alterado", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = renderPasswordInput({
      onChange,
    });

    await user.type(getInput(container), "Senha123");

    expect(onChange).toHaveBeenCalled();
  });

  it("deve permitir focar o campo pelo teclado", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    await user.tab();

    expect(getInput(container)).toHaveFocus();
  });

  it("deve permitir acessar o botão de visibilidade pelo teclado", async () => {
    const user = userEvent.setup();

    renderPasswordInput();

    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "Exibir senha" })).toHaveFocus();
  });

  it("deve alternar a visibilidade da senha pelo teclado", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(getInput(container)).toHaveAttribute("type", "text");
  });

  it("deve manter o valor da senha ao alternar a visibilidade", async () => {
    const user = userEvent.setup();
    const { container } = renderPasswordInput();

    const input = getInput(container);

    await user.type(input, "Senha123");

    await user.click(
      screen.getByRole("button", {
        name: "Exibir senha",
      }),
    );

    expect(input).toHaveValue("Senha123");
  });

  it("deve gerar ids diferentes para múltiplos componentes", () => {
    const { container } = render(
      <>
        <PasswordInput />
        <PasswordInput />
      </>,
    );

    const inputs = container.querySelectorAll("input");

    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute("id");
    expect(inputs[1]).toHaveAttribute("id");
    expect(inputs[0].getAttribute("id")).not.toBe(inputs[1].getAttribute("id"));
  });
});
