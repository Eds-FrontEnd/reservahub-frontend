import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DarkThemeProvider, useDarkTheme } from "./DarkThemeContext";

const TestComponent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useDarkTheme();

  return (
    <div>
      <span data-testid="theme">{isDarkMode ? "dark" : "light"}</span>

      <button type="button" onClick={toggleTheme}>
        Alternar tema
      </button>
    </div>
  );
};

describe("DarkThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = "";
  });

  it("deve iniciar no tema claro quando não houver tema salvo", () => {
    render(
      <DarkThemeProvider>
        <TestComponent />
      </DarkThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.body).not.toHaveClass("dark-theme");
  });

  it("deve iniciar no tema escuro quando o tema salvo for dark", () => {
    localStorage.setItem("theme", "dark");

    render(
      <DarkThemeProvider>
        <TestComponent />
      </DarkThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.body).toHaveClass("dark-theme");
  });

  it("deve alternar do tema claro para o escuro", async () => {
    const user = userEvent.setup();

    render(
      <DarkThemeProvider>
        <TestComponent />
      </DarkThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Alternar tema" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.body).toHaveClass("dark-theme");
  });

  it("deve alternar do tema escuro para o claro", async () => {
    const user = userEvent.setup();

    localStorage.setItem("theme", "dark");

    render(
      <DarkThemeProvider>
        <TestComponent />
      </DarkThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Alternar tema" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.body).not.toHaveClass("dark-theme");
  });

  it("deve lançar erro quando useDarkTheme for utilizado fora do provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useDarkTheme deve ser utilizado dentro de um DarkThemeProvider.",
    );

    consoleError.mockRestore();
  });

  it("deve persistir o tema claro no localStorage após alternar do escuro", async () => {
    const user = userEvent.setup();

    localStorage.setItem("theme", "dark");

    render(
      <DarkThemeProvider>
        <TestComponent />
      </DarkThemeProvider>,
    );

    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Alternar tema" }));

    expect(localStorage.getItem("theme")).toBe("light");
  });
});
