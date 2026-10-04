import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { User } from "../../services/AuthService";

import Header from "./index";

const mockOpenCart = jest.fn();
const mockLogout = jest.fn();
const mockToggleTheme = jest.fn();

let mockIsAuthenticated = false;
let mockUser: User | null = null;
let mockTotalItems = 0;
let mockIsDarkMode = false;

jest.mock("../../contexts/AutContext", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    user: mockUser,
    logout: mockLogout,
  }),
}));

jest.mock("../../contexts/CartContext", () => ({
  useCart: () => ({
    openCart: mockOpenCart,
    totalItems: mockTotalItems,
  }),
}));

jest.mock("../../contexts/DarkThemeContext", () => ({
  useDarkTheme: () => ({
    isDarkMode: mockIsDarkMode,
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock("../Logo", () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

jest.mock("../Menu", () => ({
  __esModule: true,
  default: () => <nav data-testid="menu">Menu</nav>,
}));

jest.mock("../Search", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="search">
        <button type="button" onClick={onClose}>
          Fechar busca
        </button>
      </div>
    ) : null,
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ status: 200 }),
  },
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockUser = null;
    mockTotalItems = 0;
    mockIsDarkMode = false;

    mockOpenCart.mockClear();
    mockLogout.mockClear();
    mockToggleTheme.mockClear();
  });

  it("deve renderizar o header", () => {
    renderHeader();

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("deve renderizar o logo", () => {
    renderHeader();

    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("deve renderizar o menu principal", () => {
    renderHeader();

    expect(screen.getByTestId("menu")).toBeInTheDocument();
  });

  it("deve renderizar a navegação principal com o label correto", () => {
    renderHeader();

    expect(
      screen.getByRole("navigation", {
        name: "Navegação principal",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a navegação de ações do usuário", () => {
    renderHeader();

    expect(
      screen.getByRole("navigation", {
        name: "Ações do usuário",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão de pesquisa", () => {
    renderHeader();

    expect(
      screen.getByRole("button", {
        name: "Pesquisar produtos",
      }),
    ).toBeInTheDocument();
  });

  it("deve abrir a busca ao clicar no botão de pesquisa", () => {
    renderHeader();

    expect(screen.queryByTestId("search")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Pesquisar produtos",
      }),
    );

    expect(screen.getByTestId("search")).toBeInTheDocument();
  });

  it("deve fechar a busca ao executar onClose", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Pesquisar produtos",
      }),
    );

    expect(screen.getByTestId("search")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar busca",
      }),
    );

    expect(screen.queryByTestId("search")).not.toBeInTheDocument();
  });

  it("deve renderizar o botão do carrinho", () => {
    renderHeader();

    expect(
      screen.getByRole("button", {
        name: "Carrinho com 0 produtos",
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar openCart ao clicar no carrinho", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Carrinho com 0 produtos",
      }),
    );

    expect(mockOpenCart).toHaveBeenCalledTimes(1);
  });

  it("deve exibir a quantidade de produtos no carrinho", () => {
    mockTotalItems = 3;

    renderHeader();

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("deve aplicar o aria-label plural quando houver mais de um produto", () => {
    mockTotalItems = 3;

    renderHeader();

    expect(
      screen.getByRole("button", {
        name: "Carrinho com 3 produtos",
      }),
    ).toBeInTheDocument();
  });

  it("deve aplicar o aria-label singular quando houver exatamente um produto", () => {
    mockTotalItems = 1;

    renderHeader();

    expect(
      screen.getByRole("button", {
        name: "Carrinho com 1 produto",
      }),
    ).toBeInTheDocument();
  });

  it("não deve exibir o badge quando o carrinho estiver vazio", () => {
    mockTotalItems = 0;

    renderHeader();

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("deve exibir o badge quando houver produtos no carrinho", () => {
    mockTotalItems = 2;

    renderHeader();

    const badge = screen.getByText("2");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("aria-hidden", "true");
  });

  it("deve renderizar o link de login quando o usuário não estiver autenticado", () => {
    mockIsAuthenticated = false;

    renderHeader();

    expect(
      screen.getByRole("link", {
        name: "Entrar na minha conta",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o ícone de usuário quando não estiver autenticado", () => {
    mockIsAuthenticated = false;

    renderHeader();

    const loginLink = screen.getByRole("link", {
      name: "Entrar na minha conta",
    });

    expect(loginLink.querySelector("img")).toBeInTheDocument();
  });

  it("deve renderizar a saudação do usuário autenticado", () => {
    mockIsAuthenticated = true;
    mockUser = {
      name: "Edson Alves",
      email: "edson@example.com",
      password: "123456",
    };

    renderHeader();

    expect(screen.getByText("Seja bem-vindo(a), Edson!")).toBeInTheDocument();
  });

  it("deve formatar o primeiro nome com inicial maiúscula", () => {
    mockIsAuthenticated = true;
    mockUser = {
      name: "EDSON ALVES",
      email: "edson@example.com",
      password: "123456",
    };

    renderHeader();

    expect(screen.getByText("Seja bem-vindo(a), Edson!")).toBeInTheDocument();
  });

  it("deve renderizar o link de logout quando o usuário estiver autenticado", () => {
    mockIsAuthenticated = true;
    mockUser = {
      name: "Edson Alves",
      email: "edson@example.com",
      password: "123456",
    };

    renderHeader();

    expect(
      screen.getByRole("button", {
        name: "Sair da minha conta",
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar logout ao clicar no link de sair", () => {
    mockIsAuthenticated = true;
    mockUser = {
      name: "Edson Alves",
      email: "edson@example.com",
      password: "123456",
    };

    renderHeader();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sair da minha conta",
      }),
    );

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o ícone de logout para usuário autenticado", () => {
    mockIsAuthenticated = true;
    mockUser = {
      name: "Edson Alves",
      email: "edson@example.com",
      password: "123456",
    };

    renderHeader();

    const logoutButton = screen.getByRole("button", {
      name: "Sair da minha conta",
    });

    expect(logoutButton.querySelector("img")).toBeInTheDocument();
  });

  it("deve renderizar as imagens com dimensões de 24 por 24 pixels", () => {
    renderHeader();

    const images = document.querySelectorAll("img");

    expect(images.length).toBeGreaterThan(0);

    images.forEach((image) => {
      expect(image).toHaveAttribute("width", "24");
      expect(image).toHaveAttribute("height", "24");
    });
  });

  it("deve utilizar decoding async nas imagens dos ícones", () => {
    renderHeader();

    const images = document.querySelectorAll("img");

    expect(images.length).toBeGreaterThan(0);

    images.forEach((image) => {
      expect(image).toHaveAttribute("decoding", "async");
    });
  });

  it("deve utilizar imagens decorativas sem texto alternativo", () => {
    renderHeader();

    const images = document.querySelectorAll("img");

    expect(images.length).toBeGreaterThan(0);

    images.forEach((image) => {
      expect(image).toHaveAttribute("alt", "");
    });
  });

  it("deve renderizar o componente Search inicialmente fechado", () => {
    renderHeader();

    expect(screen.queryByTestId("search")).not.toBeInTheDocument();
  });

  it("deve manter o Header e seus componentes principais na estrutura esperada", () => {
    renderHeader();

    expect(screen.getByRole("banner")).toBeInTheDocument();

    expect(
      screen.getByRole("navigation", {
        name: "Navegação principal",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("navigation", {
        name: "Ações do usuário",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByTestId("menu")).toBeInTheDocument();
  });
});
