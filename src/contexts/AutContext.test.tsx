import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { User } from "../services/AuthService";

import { AuthProvider, resetPassword, useAuth } from "./AutContext";

const createUser = (): User => ({
  name: "Edson Alves",
  email: "edson@example.com",
  password: "senha-atual",
});

const AuthConsumer = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>

      <span data-testid="user">{user ? JSON.stringify(user) : "null"}</span>

      <button type="button" onClick={() => login(createUser())}>
        Login
      </button>

      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("deve iniciar como não autenticado quando não existem dados no localStorage", () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");

    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("deve recuperar o estado de autenticação do localStorage", () => {
    localStorage.setItem("isAuthenticated", "true");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("deve recuperar o usuário autenticado do localStorage", () => {
    const user = createUser();

    localStorage.setItem("authenticatedUser", JSON.stringify(user));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(user));
  });

  it("deve iniciar com usuário null quando authenticatedUser não existe", () => {
    localStorage.setItem("isAuthenticated", "true");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("deve realizar login corretamente", async () => {
    const user = userEvent.setup();
    const authenticatedUser = createUser();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("user")).toHaveTextContent(
      JSON.stringify(authenticatedUser),
    );
  });

  it("deve salvar os dados do usuário no localStorage ao realizar login", async () => {
    const user = userEvent.setup();
    const authenticatedUser = createUser();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    expect(localStorage.getItem("isAuthenticated")).toBe("true");

    expect(localStorage.getItem("authenticatedUser")).toBe(
      JSON.stringify(authenticatedUser),
    );
  });

  it("deve realizar logout corretamente", async () => {
    const user = userEvent.setup();
    const authenticatedUser = createUser();

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem(
      "authenticatedUser",
      JSON.stringify(authenticatedUser),
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");

    expect(screen.getByTestId("user")).toHaveTextContent(
      JSON.stringify(authenticatedUser),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Logout",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("deve remover os dados do usuário do localStorage ao realizar logout", async () => {
    const user = userEvent.setup();
    const authenticatedUser = createUser();

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem(
      "authenticatedUser",
      JSON.stringify(authenticatedUser),
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Logout",
      }),
    );

    expect(localStorage.getItem("isAuthenticated")).toBeNull();
    expect(localStorage.getItem("authenticatedUser")).toBeNull();
  });

  it("deve permitir realizar login novamente após logout", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Logout",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("user")).toHaveTextContent(
      JSON.stringify(createUser()),
    );
  });
});

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("deve disponibilizar o contexto através do hook", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.login).toEqual(expect.any(Function));
    expect(result.current.logout).toEqual(expect.any(Function));
  });

  it("deve atualizar o estado através do login", () => {
    const user = createUser();

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    act(() => {
      result.current.login(user);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);

    expect(localStorage.getItem("isAuthenticated")).toBe("true");
    expect(localStorage.getItem("authenticatedUser")).toBe(
      JSON.stringify(user),
    );
  });

  it("deve limpar o estado através do logout", () => {
    const user = createUser();

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    act(() => {
      result.current.login(user);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    expect(localStorage.getItem("isAuthenticated")).toBeNull();
    expect(localStorage.getItem("authenticatedUser")).toBeNull();
  });

  it("deve lançar erro quando usado fora do AuthProvider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth deve ser usado dentro de um AuthProvider.");

    consoleError.mockRestore();
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("não deve alterar o localStorage quando não existe usuário autenticado", () => {
    resetPassword("nova-senha");

    expect(localStorage.getItem("authenticatedUser")).toBeNull();
  });

  it("deve atualizar a senha do usuário autenticado", () => {
    const user = createUser();

    localStorage.setItem("authenticatedUser", JSON.stringify(user));

    resetPassword("nova-senha");

    const storedUser = JSON.parse(
      localStorage.getItem("authenticatedUser") ?? "null",
    ) as User;

    expect(storedUser).toEqual({
      ...user,
      password: "nova-senha",
    });
  });

  it("deve preservar nome e email ao atualizar a senha", () => {
    const user = createUser();

    localStorage.setItem("authenticatedUser", JSON.stringify(user));

    resetPassword("nova-senha");

    const storedUser = JSON.parse(
      localStorage.getItem("authenticatedUser") ?? "null",
    ) as User;

    expect(storedUser.name).toBe(user.name);
    expect(storedUser.email).toBe(user.email);
    expect(storedUser.password).toBe("nova-senha");
  });

  it("deve substituir a senha anterior", () => {
    const user = createUser();

    localStorage.setItem("authenticatedUser", JSON.stringify(user));

    resetPassword("primeira-senha");
    resetPassword("segunda-senha");

    const storedUser = JSON.parse(
      localStorage.getItem("authenticatedUser") ?? "null",
    ) as User;

    expect(storedUser.password).toBe("segunda-senha");
  });
});
