import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Header from "../Header/index";

import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";

import "@testing-library/jest-dom";

jest.mock("../../contexts/AutContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../contexts/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../Logo", () => ({
  Logo: () => <div data-testid="header-logo">ReservaHub Logo</div>,
}));

jest.mock("../Menu", () => ({
  __esModule: true,
  default: () => <div data-testid="header-menu">Menu</div>,
}));

jest.mock("../Search", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="header-search">
      {open ? (
        <>
          <span>Busca aberta</span>
          <button type="button" onClick={onClose}>
            Fechar busca
          </button>
        </>
      ) : (
        <span>Busca fechada</span>
      )}
    </div>
  ),
}));

jest.mock("../../assets/images/icons/icon-search.svg", () => "icon-search.svg");
jest.mock("../../assets/images/icons/icon-cart.svg", () => "icon-cart.svg");
jest.mock("../../assets/images/icons/icon-user.svg", () => "icon-user.svg");
jest.mock("../../assets/images/icons/icon-logout.svg", () => "icon-logout.svg");

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseCart = jest.mocked(useCart);

type AuthContextValue = ReturnType<typeof useAuth>;
type CartContextValue = ReturnType<typeof useCart>;

const createUserMock = (name: string) => ({
  name,
  email: "juvenasanastasiando@example.com",
  password: "password",
});

const createCartMock = (
  overrides: Partial<CartContextValue> = {},
): CartContextValue => ({
  items: [],
  isOpen: false,
  totalItems: 0,
  total: 0,
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  openCart: jest.fn(),
  closeCart: jest.fn(),
  savePurchasePayload: jest.fn(),
  ...overrides,
});

const createAuthMock = (
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue => ({
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  ...overrides,
});

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue(createAuthMock());
    mockedUseCart.mockReturnValue(createCartMock());
  });

  it("deve renderizar o header", () => {
    renderHeader();

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("deve renderizar o logo", () => {
    renderHeader();

    expect(screen.getByTestId("header-logo")).toBeInTheDocument();
  });

  it("deve renderizar o menu principal", () => {
    renderHeader();

    expect(screen.getByTestId("header-menu")).toBeInTheDocument();
  });

  it("deve renderizar a navegação principal com o label correto", () => {
    renderHeader();

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a navegação de ações do usuário", () => {
    renderHeader();

    expect(
      screen.getByRole("navigation", { name: "Ações do usuário" }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão de pesquisa", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Pesquisar produtos" }),
    ).toBeInTheDocument();
  });

  it("deve abrir a busca ao clicar no botão de pesquisa", () => {
    renderHeader();

    expect(screen.getByText("Busca fechada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pesquisar produtos" }));

    expect(screen.getByText("Busca aberta")).toBeInTheDocument();
  });

  it("deve fechar a busca ao executar onClose", () => {
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: "Pesquisar produtos" }));

    expect(screen.getByText("Busca aberta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fechar busca" }));

    expect(screen.getByText("Busca fechada")).toBeInTheDocument();
  });

  it("deve renderizar o botão do carrinho", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Carrinho com 0 produtos" }),
    ).toBeInTheDocument();
  });

  it("deve chamar openCart ao clicar no carrinho", () => {
    const openCart = jest.fn();

    mockedUseCart.mockReturnValue(
      createCartMock({
        openCart,
      }),
    );

    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "Carrinho com 0 produtos" }),
    );

    expect(openCart).toHaveBeenCalledTimes(1);
  });

  it("deve exibir a quantidade de produtos no carrinho", () => {
    mockedUseCart.mockReturnValue(
      createCartMock({
        totalItems: 3,
      }),
    );

    renderHeader();

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("deve aplicar o aria-label plural quando houver mais de um produto", () => {
    mockedUseCart.mockReturnValue(
      createCartMock({
        totalItems: 3,
      }),
    );

    renderHeader();

    expect(
      screen.getByRole("button", { name: "Carrinho com 3 produtos" }),
    ).toBeInTheDocument();
  });

  it("deve aplicar o aria-label singular quando houver exatamente um produto", () => {
    mockedUseCart.mockReturnValue(
      createCartMock({
        totalItems: 1,
      }),
    );

    renderHeader();

    expect(
      screen.getByRole("button", { name: "Carrinho com 1 produto" }),
    ).toBeInTheDocument();
  });

  it("não deve exibir o badge quando o carrinho estiver vazio", () => {
    renderHeader();

    expect(
      document.querySelector(".header__cart-badge"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir o badge quando houver produtos no carrinho", () => {
    mockedUseCart.mockReturnValue(
      createCartMock({
        totalItems: 2,
      }),
    );

    renderHeader();

    const badge = document.querySelector(".header__cart-badge");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("2");
    expect(badge).toHaveAttribute("aria-hidden", "true");
  });

  it("deve renderizar o link de login quando o usuário não estiver autenticado", () => {
    renderHeader();

    const loginLink = screen.getByRole("link", {
      name: "Entrar na minha conta",
    });

    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("deve renderizar o ícone de usuário quando não estiver autenticado", () => {
    renderHeader();

    const loginLink = screen.getByRole("link", {
      name: "Entrar na minha conta",
    });

    expect(loginLink.querySelector("img")).toHaveAttribute(
      "src",
      "icon-user.svg",
    );
  });

  it("deve renderizar a saudação do usuário autenticado", () => {
    mockedUseAuth.mockReturnValue(
      createAuthMock({
        isAuthenticated: true,
        user: createUserMock("Juvenas Anastaciano"),
      }),
    );

    renderHeader();

    expect(screen.getByText("Seja bem-vindo(a), Juvenas!")).toBeInTheDocument();
  });

  it("deve formatar o primeiro nome com inicial maiúscula", () => {
    mockedUseAuth.mockReturnValue(
      createAuthMock({
        isAuthenticated: true,
        user: createUserMock(" jUvEnAs Anastaciano "),
      }),
    );

    renderHeader();

    expect(screen.getByText("Seja bem-vindo(a), Juvenas!")).toBeInTheDocument();
  });

  it("deve renderizar o link de logout quando o usuário estiver autenticado", () => {
    mockedUseAuth.mockReturnValue(
      createAuthMock({
        isAuthenticated: true,
        user: createUserMock("Juvenas Anastaciano"),
      }),
    );

    renderHeader();

    const logoutLink = screen.getByRole("link", {
      name: "Sair da minha conta",
    });

    expect(logoutLink).toBeInTheDocument();
    expect(logoutLink).toHaveAttribute("href", "/");
  });

  it("deve chamar logout ao clicar no link de sair", () => {
    const logout = jest.fn();

    mockedUseAuth.mockReturnValue(
      createAuthMock({
        isAuthenticated: true,
        user: createUserMock("Juvenas Anastaciano"),
        logout,
      }),
    );

    renderHeader();

    fireEvent.click(screen.getByRole("link", { name: "Sair da minha conta" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o ícone de logout para usuário autenticado", () => {
    mockedUseAuth.mockReturnValue(
      createAuthMock({
        isAuthenticated: true,
        user: createUserMock("Juvenas Anastaciano"),
      }),
    );

    renderHeader();

    const logoutLink = screen.getByRole("link", {
      name: "Sair da minha conta",
    });

    expect(logoutLink.querySelector("img")).toHaveAttribute(
      "src",
      "icon-logout.svg",
    );
  });

  it("deve renderizar as imagens com dimensões de 24 por 24 pixels", () => {
    renderHeader();

    const images = screen
      .getByRole("navigation", { name: "Ações do usuário" })
      .querySelectorAll("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("width", "24");
      expect(image).toHaveAttribute("height", "24");
    });
  });

  it("deve utilizar decoding async nas imagens dos ícones", () => {
    renderHeader();

    const images = screen
      .getByRole("navigation", { name: "Ações do usuário" })
      .querySelectorAll("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("decoding", "async");
    });
  });

  it("deve utilizar imagens decorativas sem texto alternativo", () => {
    renderHeader();

    const images = screen
      .getByRole("navigation", { name: "Ações do usuário" })
      .querySelectorAll("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("alt", "");
    });
  });

  it("deve renderizar o componente Search inicialmente fechado", () => {
    renderHeader();

    expect(screen.getByText("Busca fechada")).toBeInTheDocument();
    expect(screen.queryByText("Busca aberta")).not.toBeInTheDocument();
  });

  it("deve manter o Header e seus componentes principais na estrutura esperada", () => {
    renderHeader();

    const header = screen.getByRole("banner");
    const cart = screen.getByRole("button", {
      name: "Carrinho com 0 produtos",
    });
    const search = screen.getByTestId("header-search");

    expect(header).toContainElement(cart);
    expect(search).toBeInTheDocument();
  });
});
