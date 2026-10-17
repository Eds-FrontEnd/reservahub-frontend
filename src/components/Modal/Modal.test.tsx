import type { ReactNode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Modal from "./index";

import "@testing-library/jest-dom";

describe("Modal", () => {
  const defaultProps = {
    open: true,
    message: "Mensagem de teste",
  };

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof Modal>> = {},
  ) => render(<Modal {...defaultProps} {...overrides} />);

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("deve permitir renderizar o componente sem propriedades", () => {
    render(<Modal />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve renderizar o modal quando open for true", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("não deve renderizar o modal quando open for false", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve renderizar a mensagem", () => {
    renderModal();

    expect(screen.getByText("Mensagem de teste")).toBeInTheDocument();
  });

  it("deve renderizar a mensagem dentro de um parágrafo", () => {
    renderModal();

    expect(screen.getByText("Mensagem de teste").tagName).toBe("P");
  });

  it("deve aplicar a classe modal__message à mensagem", () => {
    renderModal();

    expect(screen.getByText("Mensagem de teste")).toHaveClass("modal__message");
  });

  it("deve renderizar o título quando informado", () => {
    renderModal({ title: "Título do modal" });

    expect(
      screen.getByRole("heading", { name: "Título do modal" }),
    ).toBeInTheDocument();
  });

  it("não deve renderizar o título quando não informado", () => {
    renderModal();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("deve aplicar a classe modal__title ao título", () => {
    renderModal({ title: "Título do modal" });

    expect(
      screen.getByRole("heading", { name: "Título do modal" }),
    ).toHaveClass("modal__title");
  });

  it("deve associar o título ao modal pelo aria-labelledby", () => {
    renderModal({ title: "Título do modal" });

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "modal-title",
    );
  });

  it("deve associar a mensagem ao modal pelo aria-describedby", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-describedby",
      "modal-message",
    );
  });

  it("não deve associar uma mensagem quando ela não for informada", () => {
    render(<Modal open />);

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });

  it("deve aplicar a classe modal ao Dialog", () => {
    renderModal();

    expect(document.querySelector(".modal")).toBeInTheDocument();
  });

  it("deve renderizar o botão Fechar", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });

  it("deve aplicar a classe modal__close ao botão Fechar", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "Fechar" })).toHaveClass(
      "modal__close",
    );
  });

  it("deve renderizar o botão de ação quando buttonText for informado", () => {
    renderModal({ buttonText: "Continuar" });

    expect(
      screen.getByRole("button", { name: "Continuar" }),
    ).toBeInTheDocument();
  });

  it("não deve renderizar o botão de ação quando buttonText não for informado", () => {
    renderModal();

    expect(
      screen.queryByRole("button", { name: "Continuar" }),
    ).not.toBeInTheDocument();
  });

  it("deve aplicar a classe modal__button ao botão de ação", () => {
    renderModal({ buttonText: "Continuar" });

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveClass(
      "modal__button",
    );
  });

  it("deve aplicar a cor do botão", () => {
    renderModal({
      buttonText: "Continuar",
      buttonColor: "#003399",
    });

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveStyle({
      "--button-background-color": "#003399",
    });
  });

  it("deve aplicar a cor de hover do botão na variável CSS", () => {
    renderModal({
      buttonText: "Continuar",
      buttonHoverColor: "#000000",
    });

    expect(
      screen
        .getByRole("button", { name: "Continuar" })
        .style.getPropertyValue("--button-hover-background-color"),
    ).toBe("#000000");
  });

  it("deve aplicar a cor personalizada ao título", () => {
    renderModal({
      title: "Título do modal",
      titleColor: "#008000",
    });

    expect(
      screen.getByRole("heading", { name: "Título do modal" }),
    ).toHaveStyle({ color: "#008000" });
  });

  it("deve renderizar o ícone quando informado", () => {
    const icon: ReactNode = <span data-testid="modal-icon">✓</span>;

    renderModal({ icon });

    expect(screen.getByTestId("modal-icon")).toBeInTheDocument();
  });

  it("não deve renderizar o container do ícone quando icon não for informado", () => {
    renderModal();

    expect(screen.queryByTestId("modal-icon")).not.toBeInTheDocument();
    expect(document.querySelector(".modal__header")).not.toBeInTheDocument();
  });

  it("deve aplicar a cor personalizada ao ícone", () => {
    const icon: ReactNode = <span data-testid="modal-icon">✓</span>;

    renderModal({ icon, iconColor: "#008000" });

    expect(document.querySelector(".modal__icon")).toHaveStyle({
      color: "#008000",
    });
  });

  it("deve fechar o modal ao clicar no botão Fechar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderModal({ onClose });

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deve navegar para closeUrl ao clicar no botão Fechar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onNavigate = jest.fn();

    renderModal({ closeUrl: "/", onClose, onNavigate });

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("/");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("não deve navegar quando closeUrl não for informado", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onNavigate = jest.fn();

    renderModal({ onClose, onNavigate });

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("deve chamar onClose ao clicar no botão de ação sem buttonUrl", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onNavigate = jest.fn();

    renderModal({
      buttonText: "Continuar",
      onClose,
      onNavigate,
    });

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("deve navegar para buttonUrl ao clicar no botão de ação", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onNavigate = jest.fn();

    renderModal({
      buttonText: "Continuar",
      buttonUrl: "/smartphones",
      onClose,
      onNavigate,
    });

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("/smartphones");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("deve priorizar onNavigate quando buttonUrl for informado", async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();

    renderModal({
      buttonText: "Continuar",
      buttonUrl: "/smartphones",
      onNavigate,
    });

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onNavigate).toHaveBeenCalledWith("/smartphones");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("deve executar onButtonClick sem acionar a navegação", async () => {
    const user = userEvent.setup();
    const onButtonClick = jest.fn();
    const onNavigate = jest.fn();
    const onClose = jest.fn();

    renderModal({
      buttonText: "Confirmar",
      buttonUrl: "/smartphones",
      onButtonClick,
      onNavigate,
      onClose,
    });

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("deve executar o redirecionamento automático após o tempo definido", () => {
    jest.useFakeTimers();

    const onClose = jest.fn();
    const onNavigate = jest.fn();

    renderModal({
      redirectDelay: 3000,
      redirectUrl: "/smartphones",
      onClose,
      onNavigate,
    });

    expect(onNavigate).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2999);
    });

    expect(onNavigate).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("/smartphones");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("não deve configurar redirecionamento automático quando redirectUrl não for informado", () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    renderModal({ redirectDelay: 3000, onNavigate });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("não deve configurar redirecionamento automático quando redirectDelay não for informado", () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    renderModal({ redirectUrl: "/smartphones", onNavigate });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("não deve configurar redirecionamento automático quando redirectDelay for zero", () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    renderModal({
      redirectDelay: 0,
      redirectUrl: "/smartphones",
      onNavigate,
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("não deve redirecionar automaticamente quando o modal estiver fechado", () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    renderModal({
      open: false,
      redirectDelay: 3000,
      redirectUrl: "/smartphones",
      onNavigate,
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("deve cancelar o redirecionamento automático ao desmontar o modal", () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    const { unmount } = renderModal({
      redirectDelay: 3000,
      redirectUrl: "/smartphones",
      onNavigate,
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("deve renderizar o ícone com a estrutura esperada", () => {
    const icon = <span data-testid="custom-icon">!</span>;

    renderModal({ icon });

    const iconContainer = document.querySelector(".modal__icon");

    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toContainElement(screen.getByTestId("custom-icon"));
  });

  it("deve renderizar a ação dentro do container de ações", () => {
    renderModal({ buttonText: "Continuar" });

    expect(document.querySelector(".modal__actions")).toContainElement(
      screen.getByRole("button", { name: "Continuar" }),
    );
  });

  it("deve aplicar autoFocus ao botão de ação", async () => {
    renderModal({ buttonText: "Continuar" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Continuar" })).toHaveFocus();
    });
  });

  it("deve permitir o uso apenas da mensagem sem título, ícone ou botão", () => {
    renderModal({
      title: undefined,
      icon: undefined,
      buttonText: undefined,
    });

    expect(screen.getByText("Mensagem de teste")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(document.querySelector(".modal__icon")).not.toBeInTheDocument();
    expect(document.querySelector(".modal__actions")).not.toBeInTheDocument();
  });

  it("deve limpar o timer anterior quando as propriedades de redirecionamento mudarem", async () => {
    jest.useFakeTimers();

    const onNavigate = jest.fn();

    const { rerender } = renderModal({
      redirectDelay: 3000,
      redirectUrl: "/primeira-rota",
      onNavigate,
    });

    rerender(
      <Modal
        {...defaultProps}
        redirectDelay={3000}
        redirectUrl="/segunda-rota"
        onNavigate={onNavigate}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(2999);
    });

    expect(onNavigate).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    expect(onNavigate).toHaveBeenCalledWith("/segunda-rota");
  });
});
