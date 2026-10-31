import { useRef } from "react";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import { LoadingProvider, useLoading } from "./LoadingContext";

const LoadingTestComponent = () => {
  const { isLoading, startLoading } = useLoading();
  const finishCallbacks = useRef<Array<() => void>>([]);

  const handleStart = () => {
    finishCallbacks.current.push(startLoading());
  };

  const handleFinishFirst = () => {
    finishCallbacks.current[0]?.();
  };

  const handleFinishAll = () => {
    finishCallbacks.current.forEach((finish) => finish());
  };

  return (
    <div>
      <span>{isLoading ? "Carregando" : "Parado"}</span>

      <button type="button" onClick={handleStart}>
        Iniciar operação
      </button>

      <button type="button" onClick={handleFinishFirst}>
        Finalizar primeira
      </button>

      <button type="button" onClick={handleFinishAll}>
        Finalizar todas
      </button>
    </div>
  );
};

describe("LoadingContext", () => {
  const renderComponent = () =>
    render(
      <LoadingProvider>
        <LoadingTestComponent />
      </LoadingProvider>,
    );

  it("deve iniciar sem loading", () => {
    renderComponent();

    expect(screen.getByText("Parado")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve abrir o modal ao iniciar uma operação", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Iniciar operação",
      }),
    );

    expect(screen.getByText("Carregando")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deve fechar o modal ao finalizar todas as operações", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Iniciar operação",
      }),
    );

    const dialog = screen.getByRole("dialog");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finalizar todas",
        hidden: true,
      }),
    );

    expect(screen.getByText("Parado")).toBeInTheDocument();

    await waitForElementToBeRemoved(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve manter o modal aberto enquanto houver operações pendentes", async () => {
    renderComponent();

    const startButton = screen.getByRole("button", {
      name: "Iniciar operação",
    });

    fireEvent.click(startButton);
    fireEvent.click(startButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finalizar primeira",
        hidden: true,
      }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finalizar todas",
        hidden: true,
      }),
    );

    await waitForElementToBeRemoved(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
