import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";

import Search from "../Search";

import { SmartphoneService } from "../../services/SmartphoneService";
import { useAuth } from "../../contexts/AutContext";

import "@testing-library/jest-dom";

jest.mock("../../data/mock-smartphones.json", () => [
  {
    id: "iphone-15-pro-max",
    product: "iPhone 15 Pro Max",
    quantity: 10,
    stock: 8,
    description: "Smartphone Apple com câmera avançada.",
    model: "256GB",
    image: "/images/iphone-15-pro-max.webp",
    monthlyPrice: 289.9,
    planType: "Mensal Flex",
    benefits: ["Frete grátis", "Seguro incluso"],
  },
  {
    id: "galaxy-s24-ultra",
    product: "Galaxy S24 Ultra",
    quantity: 10,
    stock: 5,
    description: "Smartphone Samsung com câmera profissional.",
    model: "512GB",
    image: "/images/galaxy-s24-ultra.webp",
    monthlyPrice: 319.9,
    planType: "Anual",
    benefits: ["Frete grátis", "Troca garantida"],
  },
  {
    id: "iphone-15",
    product: "iPhone 15",
    quantity: 10,
    stock: 12,
    description: "Smartphone Apple compacto e potente.",
    model: "128GB",
    image: "/images/iphone-15.webp",
    monthlyPrice: 199.9,
    planType: "Mensal Flex",
    benefits: ["Seguro incluso"],
  },
  {
    id: "galaxy-a55",
    product: "Galaxy A55",
    quantity: 10,
    stock: 15,
    description: "Smartphone Samsung com excelente desempenho.",
    model: "256GB",
    image: "/images/galaxy-a55.webp",
    monthlyPrice: 149.9,
    planType: "Mensal Flex",
    benefits: ["Frete grátis"],
  },
  {
    id: "motorola-edge-50",
    product: "Motorola Edge 50",
    quantity: 10,
    stock: 7,
    description: "Smartphone com tela de alta resolução.",
    model: "256GB",
    image: "/images/motorola-edge-50.webp",
    monthlyPrice: 179.9,
    planType: "Anual",
    benefits: ["Seguro incluso"],
  },
  {
    id: "pixel-9",
    product: "Google Pixel 9",
    quantity: 10,
    stock: 6,
    description: "Smartphone Google com inteligência artificial.",
    model: "128GB",
    image: "/images/pixel-9.webp",
    monthlyPrice: 299.9,
    planType: "Mensal Flex",
    benefits: ["IA avançada"],
  },
]);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../services/SmartphoneService", () => ({
  SmartphoneService: {
    buscarPorNome: jest.fn(),
  },
}));

jest.mock("../../contexts/AutContext", () => ({
  useAuth: jest.fn(),
}));

const mockBuscarPorNome = jest.mocked(SmartphoneService.buscarPorNome);
const mockNavigate = jest.fn();
const mockUseNavigate = jest.mocked(useNavigate);
const mockUseAuth = jest.mocked(useAuth);

const mockSmartphones = [
  {
    id: "iphone-15-pro-max",
    product: "iPhone 15 Pro Max",
    quantity: 10,
    stock: 8,
    description: "Smartphone Apple com câmera avançada.",
    model: "256GB",
    image: "/images/iphone-15-pro-max.webp",
    monthlyPrice: 289.9,
    planType: "Mensal Flex",
    benefits: ["Frete grátis", "Seguro incluso"],
  },
  {
    id: "galaxy-s24-ultra",
    product: "Galaxy S24 Ultra",
    quantity: 10,
    stock: 5,
    description: "Smartphone Samsung com câmera profissional.",
    model: "512GB",
    image: "/images/galaxy-s24-ultra.webp",
    monthlyPrice: 319.9,
    planType: "Anual",
    benefits: ["Frete grátis", "Troca garantida"],
  },
  {
    id: "iphone-15",
    product: "iPhone 15",
    quantity: 10,
    stock: 12,
    description: "Smartphone Apple compacto e potente.",
    model: "128GB",
    image: "/images/iphone-15.webp",
    monthlyPrice: 199.9,
    planType: "Mensal Flex",
    benefits: ["Seguro incluso"],
  },
  {
    id: "galaxy-a55",
    product: "Galaxy A55",
    quantity: 10,
    stock: 15,
    description: "Smartphone Samsung com excelente desempenho.",
    model: "256GB",
    image: "/images/galaxy-a55.webp",
    monthlyPrice: 149.9,
    planType: "Mensal Flex",
    benefits: ["Frete grátis"],
  },
  {
    id: "motorola-edge-50",
    product: "Motorola Edge 50",
    quantity: 10,
    stock: 7,
    description: "Smartphone com tela de alta resolução.",
    model: "256GB",
    image: "/images/motorola-edge-50.webp",
    monthlyPrice: 179.9,
    planType: "Anual",
    benefits: ["Seguro incluso"],
  },
  {
    id: "pixel-9",
    product: "Google Pixel 9",
    quantity: 10,
    stock: 6,
    description: "Smartphone Google com inteligência artificial.",
    model: "128GB",
    image: "/images/pixel-9.webp",
    monthlyPrice: 299.9,
    planType: "Mensal Flex",
    benefits: ["IA avançada"],
  },
];

describe("Search", () => {
  const mockOnClose = jest.fn();

  const renderSearch = (open = true, isAuthenticated = false) => {
    mockUseAuth.mockReturnValue({
      isAuthenticated,
    } as ReturnType<typeof useAuth>);

    return render(<Search open={open} onClose={mockOnClose} />);
  };

  const searchFor = async (
    user: ReturnType<typeof userEvent.setup>,
    term: string,
  ) => {
    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, term);

    await waitFor(() => {
      expect(mockBuscarPorNome).toHaveBeenCalledWith(term.trim());
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseNavigate.mockReturnValue(mockNavigate);

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuth>);

    mockBuscarPorNome.mockResolvedValue(mockSmartphones);
  });

  it("não deve renderizar quando open for false", () => {
    renderSearch(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve renderizar quando open for true", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deve exibir o título da pesquisa", () => {
    renderSearch();

    expect(
      screen.getByRole("heading", {
        name: "Pesquisar smartphone",
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir o campo de pesquisa", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir o botão de fechar", () => {
    renderSearch();

    expect(
      screen.getByRole("button", {
        name: "Fechar pesquisa",
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.click(
      screen.getByRole("button", {
        name: "Fechar pesquisa",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose ao pressionar Escape", () => {
    renderSearch();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose ao clicar no overlay", () => {
    renderSearch();

    const overlay = screen.getByRole("presentation");

    fireEvent.mouseDown(overlay, {
      target: overlay,
      currentTarget: overlay,
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("não deve chamar onClose ao clicar dentro do modal", () => {
    renderSearch();

    const dialog = screen.getByRole("dialog");

    fireEvent.mouseDown(dialog, {
      target: dialog,
      currentTarget: dialog,
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("deve permitir digitar no campo de pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone");

    expect(input).toHaveValue("iPhone");
  });

  it("deve iniciar o campo de pesquisa vazio", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toHaveValue("");
  });

  it("deve limpar a pesquisa quando o componente for fechado", async () => {
    const { rerender } = renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    fireEvent.change(input, {
      target: {
        value: "iPhone",
      },
    });

    expect(input).toHaveValue("iPhone");

    rerender(<Search open={false} onClose={mockOnClose} />);

    rerender(<Search open onClose={mockOnClose} />);

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toHaveValue("");
  });

  it("deve buscar smartphones após o debounce", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone");

    expect(mockBuscarPorNome).toHaveBeenCalledTimes(1);
    expect(mockBuscarPorNome).toHaveBeenCalledWith("iPhone");
  });

  it("deve encontrar produto pelo nome", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

      expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    });
  });

  it("deve encontrar produto pelo modelo", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "512GB");

    await waitFor(() => {
      expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    });
  });

  it("deve encontrar produto pela descrição", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "câmera profissional");

    await waitFor(() => {
      expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    });
  });

  it("deve encontrar produto pelo tipo de plano", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "Anual");

    await waitFor(() => {
      expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();

      expect(screen.getByText("Motorola Edge 50")).toBeInTheDocument();
    });
  });

  it("deve encontrar produto pelo benefício", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "Seguro incluso");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

      expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    });
  });

  it("deve realizar a pesquisa sem diferenciar maiúsculas e minúsculas", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "IPHONE");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

      expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    });
  });

  it("deve ignorar espaços no início da pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "   iPhone");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    expect(mockBuscarPorNome).toHaveBeenCalledWith("iPhone");
  });

  it("deve ignorar espaços no final da pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone   ");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    expect(mockBuscarPorNome).toHaveBeenCalledWith("iPhone");
  });

  it("deve exibir mensagem quando nenhum smartphone for encontrado", async () => {
    const user = userEvent.setup();

    mockBuscarPorNome.mockResolvedValue([]);

    renderSearch();

    await searchFor(user, "Nokia");

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum smartphone encontrado."),
      ).toBeInTheDocument();
    });
  });

  it("deve limitar os resultados a cinco smartphones", async () => {
    const user = userEvent.setup();

    mockBuscarPorNome.mockResolvedValue([
      ...mockSmartphones,
      {
        ...mockSmartphones[0],
        id: "smartphone-7",
        product: "Smartphone 7",
      },
    ]);

    renderSearch();

    await searchFor(user, "Smartphone");

    await waitFor(() => {
      expect(screen.getByText("Resultados encontrados")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("deve exibir a imagem do smartphone", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone");

    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: "iPhone 15 Pro Max",
      });

      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/images/iphone-15-pro-max.webp");
    });
  });

  it("deve exibir o modelo do smartphone", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone 15 Pro Max");

    await waitFor(() => {
      expect(screen.getByText("256GB")).toBeInTheDocument();
    });
  });

  it("deve exibir o botão Ver para usuário autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await searchFor(user, "iPhone 15 Pro Max");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Ver iPhone 15 Pro Max",
        }),
      ).toBeInTheDocument();
    });
  });

  it("deve exibir o botão de login para usuário não autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await searchFor(user, "iPhone 15 Pro Max");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Entre ou crie a conta para ver iPhone 15 Pro Max",
        }),
      ).toBeInTheDocument();
    });
  });

  it("deve navegar para login quando usuário não autenticado clicar em Ver", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await searchFor(user, "iPhone 15 Pro Max");

    await user.click(
      screen.getByRole("button", {
        name: "Entre ou crie a conta para ver iPhone 15 Pro Max",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("deve navegar para o produto quando usuário autenticado clicar em Ver", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await searchFor(user, "iPhone 15 Pro Max");

    await user.click(
      screen.getByRole("button", {
        name: "Ver iPhone 15 Pro Max",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/smartphones/iphone-15-pro-max");
  });

  it("deve navegar para a página de smartphones ao enviar a pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone 15");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/smartphones?search=iPhone%2015",
    );
  });

  it("deve codificar corretamente caracteres especiais na pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone 15 Pro+");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/smartphones?search=iPhone%2015%20Pro%2B",
    );
  });

  it("não deve navegar quando a pesquisa estiver vazia", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("não deve navegar quando a pesquisa contiver apenas espaços", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "   ");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("deve manter o campo focado quando a pesquisa estiver vazia", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(input).toHaveFocus();
  });

  it("deve submeter a pesquisa ao pressionar Enter", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "Galaxy S24");

    await user.keyboard("{Enter}");

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/smartphones?search=Galaxy%20S24",
    );
  });

  it("deve limpar os resultados quando a pesquisa for apagada", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.clear(input);

    expect(screen.queryByText("iPhone 15 Pro Max")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Nenhum smartphone encontrado."),
    ).not.toBeInTheDocument();
  });

  it("deve limpar os resultados ao fechar a pesquisa", async () => {
    const user = userEvent.setup();

    const { rerender } = renderSearch();

    await searchFor(user, "iPhone");

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    rerender(<Search open={false} onClose={mockOnClose} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve utilizar a rota correta para o smartphone autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await searchFor(user, "Galaxy S24 Ultra");

    await user.click(
      screen.getByRole("button", {
        name: "Ver Galaxy S24 Ultra",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/smartphones/galaxy-s24-ultra");
  });

  it("deve fechar a pesquisa antes de navegar para o produto", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await searchFor(user, "Galaxy S24 Ultra");

    await user.click(
      screen.getByRole("button", {
        name: "Ver Galaxy S24 Ultra",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("deve fechar a pesquisa antes de navegar para login", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await searchFor(user, "Galaxy S24 Ultra");

    await user.click(
      screen.getByRole("button", {
        name: "Entre ou crie a conta para ver Galaxy S24 Ultra",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("deve exibir o texto de resultados encontrados quando houver resultados", async () => {
    const user = userEvent.setup();

    renderSearch();

    await searchFor(user, "iPhone");

    await waitFor(() => {
      expect(screen.getByText("Resultados encontrados")).toBeInTheDocument();
    });
  });

  it("deve utilizar aria-live nos resultados", () => {
    renderSearch();

    const results = screen.getByLabelText("Resultados da pesquisa");

    expect(results).toHaveAttribute("aria-live", "polite");
  });

  it("deve renderizar o formulário com role search", () => {
    renderSearch();

    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("deve renderizar o diálogo com aria-modal", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("deve associar o diálogo ao título", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "search-modal-title",
    );
  });

  it("deve renderizar somente cinco resultados mesmo quando o serviço retornar mais produtos", async () => {
    const user = userEvent.setup();

    const additionalSmartphones = [
      ...mockSmartphones,
      {
        ...mockSmartphones[0],
        id: "smartphone-7",
        product: "Smartphone 7",
      },
      {
        ...mockSmartphones[0],
        id: "smartphone-8",
        product: "Smartphone 8",
      },
    ];

    mockBuscarPorNome.mockResolvedValue(additionalSmartphones);

    renderSearch();

    await searchFor(user, "Smartphone");

    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(5);
    });
  });
});
