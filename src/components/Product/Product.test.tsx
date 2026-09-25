import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";

import ProductCard, { type SmartphoneSubscriptionItem } from "../Product/index";

import { useAuth } from "../../contexts/AutContext";

import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../contexts/AutContext", () => ({
  useAuth: jest.fn(),
}));

describe("ProductCard", () => {
  const mockNavigate = jest.fn();

  const mockItem: SmartphoneSubscriptionItem = {
    id: "iphone-15-pro-max",
    product: "iPhone 15 Pro Max",
    stock: 8,
    description: "Smartphone Apple com tecnologia avançada.",
    model: "256GB",
    image: "/images/iphone-15-pro-max.png",
    monthlyPrice: 289.9,
    planType: "Mensal Flex",
    benefits: ["Frete grátis", "Seguro incluso"],
  };

  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseNavigate = useNavigate as jest.MockedFunction<
    typeof useNavigate
  >;

  const renderProductCard = (
    item: SmartphoneSubscriptionItem = mockItem,
    isAuthenticated = false,
  ) => {
    mockUseAuth.mockReturnValue({
      isAuthenticated,
    } as ReturnType<typeof useAuth>);

    return render(<ProductCard item={item} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it("deve renderizar o card do produto", () => {
    renderProductCard();

    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("deve renderizar o produto informado", () => {
    renderProductCard();

    expect(
      screen.getByRole("heading", {
        name: "iPhone 15 Pro Max",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o modelo informado", () => {
    renderProductCard();

    expect(screen.getByText("256GB")).toBeInTheDocument();
  });

  it("deve renderizar a imagem do produto", () => {
    renderProductCard();

    expect(
      screen.getByRole("img", {
        name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
      }),
    ).toHaveAttribute("src", "/images/iphone-15-pro-max.png");
  });

  it("deve aplicar o atributo loading lazy à imagem", () => {
    renderProductCard();

    expect(
      screen.getByRole("img", {
        name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
      }),
    ).toHaveAttribute("loading", "lazy");
  });

  it("deve aplicar decoding async à imagem", () => {
    renderProductCard();

    expect(
      screen.getByRole("img", {
        name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
      }),
    ).toHaveAttribute("decoding", "async");
  });

  it("deve aplicar a classe phone-card__image à imagem", () => {
    renderProductCard();

    expect(
      screen.getByRole("img", {
        name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
      }),
    ).toHaveClass("phone-card__image");
  });

  it("deve exibir o loading da imagem inicialmente", () => {
    renderProductCard();

    expect(
      document.querySelector(".phone-card__image-loading"),
    ).toBeInTheDocument();
  });

  it("deve remover o loading quando a imagem for carregada", async () => {
    renderProductCard();

    const image = screen.getByRole("img", {
      name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
    });

    fireEvent.load(image);

    await waitFor(() => {
      expect(
        document.querySelector(".phone-card__image-loading"),
      ).not.toBeInTheDocument();
    });
  });

  it("deve marcar o loading da imagem como decorativo para leitores de tela", () => {
    renderProductCard();

    const loading = document.querySelector(".phone-card__image-loading");

    expect(loading).toHaveAttribute("aria-hidden", "true");
  });

  it("deve renderizar o plano do produto", () => {
    renderProductCard();

    expect(screen.getByText("Mensal Flex")).toBeInTheDocument();
  });

  it("deve aplicar aria-label ao plano", () => {
    renderProductCard();

    expect(screen.getByLabelText("Plano: Mensal Flex")).toBeInTheDocument();
  });

  it("deve aplicar a classe mensal ao plano Mensal Flex", () => {
    renderProductCard();

    expect(screen.getByLabelText("Plano: Mensal Flex")).toHaveClass(
      "phone-card__badge-plan--monthly",
    );
  });

  it("deve aplicar a classe anual ao plano Anual", () => {
    renderProductCard({
      ...mockItem,
      planType: "Anual",
    });

    expect(screen.getByLabelText("Plano: Anual")).toHaveClass(
      "phone-card__badge-plan--annual",
    );
  });

  it("não deve aplicar classe específica para plano desconhecido", () => {
    renderProductCard({
      ...mockItem,
      planType: "Semestral",
    });

    const badge = screen.getByLabelText("Plano: Semestral");

    expect(badge).toHaveClass("phone-card__badge-plan");
    expect(badge).not.toHaveClass("phone-card__badge-plan--monthly");
    expect(badge).not.toHaveClass("phone-card__badge-plan--annual");
  });

  it("deve formatar o preço em reais", () => {
    renderProductCard();

    expect(screen.getByText("R$ 289,90")).toBeInTheDocument();
  });

  it("deve renderizar o período mensal", () => {
    renderProductCard();

    expect(screen.getByText("/mês")).toBeInTheDocument();
  });

  it("deve formatar corretamente diferentes valores de preço", () => {
    renderProductCard({
      ...mockItem,
      monthlyPrice: 1299.99,
    });

    expect(screen.getByText("R$ 1.299,99")).toBeInTheDocument();
  });

  it("deve renderizar o botão Entre para ver quando não estiver autenticado", () => {
    renderProductCard(mockItem, false);

    expect(
      screen.getByRole("button", {
        name: "Entre para ver",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão Saiba Mais quando estiver autenticado", () => {
    renderProductCard(mockItem, true);

    expect(
      screen.getByRole("button", {
        name: "Saiba Mais",
      }),
    ).toBeInTheDocument();
  });

  it("deve aplicar a classe phone-card ao artigo", () => {
    renderProductCard();

    expect(screen.getByRole("article")).toHaveClass("phone-card");
  });

  it("deve aplicar a classe phone-card__figure à figura", () => {
    renderProductCard();

    expect(document.querySelector(".phone-card__figure")).toBeInTheDocument();
  });

  it("deve aplicar a classe phone-card__header ao cabeçalho", () => {
    renderProductCard();

    expect(document.querySelector(".phone-card__header")).toBeInTheDocument();
  });

  it("deve aplicar a classe phone-card__model ao modelo", () => {
    renderProductCard();

    expect(document.querySelector(".phone-card__model")).toHaveTextContent(
      "256GB",
    );
  });

  it("deve aplicar shimmer ao modelo enquanto a imagem estiver carregando", () => {
    renderProductCard();

    expect(document.querySelector(".phone-card__model")).toHaveClass(
      "phone-card__shimmer",
    );
  });

  it("deve remover shimmer do modelo após o carregamento da imagem", async () => {
    renderProductCard();

    const image = screen.getByRole("img", {
      name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
    });

    fireEvent.load(image);

    await waitFor(() => {
      expect(document.querySelector(".phone-card__model")).not.toHaveClass(
        "phone-card__shimmer",
      );
    });
  });

  it("deve aplicar shimmer ao título enquanto a imagem estiver carregando", () => {
    renderProductCard();

    expect(
      screen.getByRole("heading", {
        name: "iPhone 15 Pro Max",
      }),
    ).toHaveClass("phone-card__shimmer");
  });

  it("deve remover shimmer do título após o carregamento da imagem", async () => {
    renderProductCard();

    const image = screen.getByRole("img", {
      name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
    });

    fireEvent.load(image);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "iPhone 15 Pro Max",
        }),
      ).not.toHaveClass("phone-card__shimmer");
    });
  });

  it("deve aplicar shimmer ao preço enquanto a imagem estiver carregando", () => {
    renderProductCard();

    expect(document.querySelector(".phone-card__pricing")).toHaveClass(
      "phone-card__shimmer",
    );
  });

  it("deve remover shimmer do preço após o carregamento da imagem", async () => {
    renderProductCard();

    const image = screen.getByRole("img", {
      name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
    });

    fireEvent.load(image);

    await waitFor(() => {
      expect(document.querySelector(".phone-card__pricing")).not.toHaveClass(
        "phone-card__shimmer",
      );
    });
  });

  it("deve aplicar shimmer ao botão enquanto a imagem estiver carregando", () => {
    renderProductCard();

    expect(
      screen.getByRole("button", {
        name: "Entre para ver",
      }),
    ).toHaveClass("phone-card__button--shimmer");
  });

  it("deve remover shimmer do botão após o carregamento da imagem", async () => {
    renderProductCard();

    const image = screen.getByRole("img", {
      name: "Smartphone iPhone 15 Pro Max - Modelo 256GB",
    });

    fireEvent.load(image);

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Entre para ver",
        }),
      ).not.toHaveClass("phone-card__button--shimmer");
    });
  });

  it("deve aplicar aria-labelledby no artigo", () => {
    renderProductCard();

    const article = screen.getByRole("article");
    const heading = screen.getByRole("heading", {
      name: "iPhone 15 Pro Max",
    });

    expect(article).toHaveAttribute(
      "aria-labelledby",
      heading.getAttribute("id"),
    );
  });

  it("deve navegar para login quando o usuário não estiver autenticado", async () => {
    const user = userEvent.setup();

    renderProductCard(mockItem, false);

    await user.click(
      screen.getByRole("button", {
        name: "Entre para ver",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("não deve navegar para o produto quando o usuário não estiver autenticado", async () => {
    const user = userEvent.setup();

    renderProductCard(mockItem, false);

    await user.click(
      screen.getByRole("button", {
        name: "Entre para ver",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalledWith(
      `/smartphones/${mockItem.id}`,
    );
  });

  it("deve navegar para os detalhes do produto quando o usuário estiver autenticado", async () => {
    const user = userEvent.setup();

    renderProductCard(mockItem, true);

    await user.click(
      screen.getByRole("button", {
        name: "Saiba Mais",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(`/smartphones/${mockItem.id}`);
  });

  it("não deve navegar para login quando o usuário estiver autenticado", async () => {
    const user = userEvent.setup();

    renderProductCard(mockItem, true);

    await user.click(
      screen.getByRole("button", {
        name: "Saiba Mais",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("deve navegar para o id correto de diferentes produtos", async () => {
    const user = userEvent.setup();

    const secondItem: SmartphoneSubscriptionItem = {
      ...mockItem,
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "512GB",
      monthlyPrice: 319.9,
    };

    renderProductCard(secondItem, true);

    await user.click(
      screen.getByRole("button", {
        name: "Saiba Mais",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/smartphones/galaxy-s24-ultra");
  });

  it("deve permitir interação com o botão pelo teclado", async () => {
    const user = userEvent.setup();

    renderProductCard(mockItem, true);

    await user.tab();

    expect(
      screen.getByRole("button", {
        name: "Saiba Mais",
      }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(mockNavigate).toHaveBeenCalledWith(`/smartphones/${mockItem.id}`);
  });

  it("deve manter o preço correto para valor inteiro", () => {
    renderProductCard({
      ...mockItem,
      monthlyPrice: 300,
    });

    expect(screen.getByText("R$ 300,00")).toBeInTheDocument();
  });

  it("deve renderizar corretamente um plano com preço decimal", () => {
    renderProductCard({
      ...mockItem,
      monthlyPrice: 99.9,
    });

    expect(screen.getByText("R$ 99,90")).toBeInTheDocument();
  });

  it("deve renderizar corretamente outro produto", () => {
    renderProductCard({
      ...mockItem,
      product: "Galaxy S24 Ultra",
      model: "512GB",
      image: "/images/galaxy-s24-ultra.png",
    });

    expect(
      screen.getByRole("heading", {
        name: "Galaxy S24 Ultra",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("512GB")).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Smartphone Galaxy S24 Ultra - Modelo 512GB",
      }),
    ).toHaveAttribute("src", "/images/galaxy-s24-ultra.png");
  });

  it("deve retornar null quando item for nulo", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    const { container } = render(
      <ProductCard item={null as unknown as SmartphoneSubscriptionItem} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
