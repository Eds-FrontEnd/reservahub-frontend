import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";

import Search from "../Search";

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
    image: "/images/iphone-15-pro-max.png",
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
    image: "/images/galaxy-s24-ultra.png",
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
    image: "/images/iphone-15.png",
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
    image: "/images/galaxy-a55.png",
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
    image: "/images/motorola-edge-50.png",
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
    image: "/images/pixel-9.png",
    monthlyPrice: 299.9,
    planType: "Mensal Flex",
    benefits: ["IA avançada"],
  },
]);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../contexts/AutContext", () => ({
  useAuth: jest.fn(),
}));

describe("Search", () => {
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseNavigate = useNavigate as jest.MockedFunction<
    typeof useNavigate
  >;

  const renderSearch = (open = true, isAuthenticated = false) => {
    mockUseAuth.mockReturnValue({
      isAuthenticated,
    } as ReturnType<typeof useAuth>);

    return render(<Search open={open} onClose={mockOnClose} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it("não deve renderizar o componente quando open for false", () => {
    const { container } = renderSearch(false);

    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar o modal quando open for true", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deve renderizar o título da pesquisa", () => {
    renderSearch();

    expect(
      screen.getByRole("heading", {
        name: "Pesquisar smartphone",
      }),
    ).toBeInTheDocument();
  });

  it("deve associar o diálogo ao título pelo aria-labelledby", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "search-modal-title",
    );
  });

  it("deve aplicar aria-modal ao diálogo", () => {
    renderSearch();

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("deve renderizar o formulário de pesquisa", () => {
    renderSearch();

    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("deve renderizar o campo de pesquisa", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toBeInTheDocument();
  });

  it("deve aplicar o placeholder ao campo de pesquisa", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toHaveAttribute("placeholder", "Digite o nome ou modelo");
  });

  it("deve desabilitar o autocomplete do campo", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toHaveAttribute("autocomplete", "off");
  });

  it("deve renderizar o botão Buscar", () => {
    renderSearch();

    expect(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão para fechar a pesquisa", () => {
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

  it("deve focar automaticamente o campo quando o modal abrir", async () => {
    renderSearch();

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", {
          name: "Pesquisar smartphones",
        }),
      ).toHaveFocus();
    });
  });

  it("deve fechar a pesquisa ao pressionar Escape", () => {
    renderSearch();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("não deve fechar a pesquisa para outras teclas", () => {
    renderSearch();

    fireEvent.keyDown(document, {
      key: "Enter",
    });

    fireEvent.keyDown(document, {
      key: "Tab",
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("deve fechar ao clicar no overlay", () => {
    renderSearch();

    const overlay = document.querySelector(".search-overlay");

    expect(overlay).toBeInTheDocument();

    fireEvent.mouseDown(overlay!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("não deve fechar ao clicar dentro do modal", () => {
    renderSearch();

    fireEvent.mouseDown(screen.getByRole("dialog"));

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("deve iniciar o campo de pesquisa vazio", () => {
    renderSearch();

    expect(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
    ).toHaveValue("");
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

  it("não deve renderizar resultados enquanto a pesquisa estiver vazia", () => {
    renderSearch();

    expect(
      screen.queryByText("Resultados encontrados"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Nenhum smartphone encontrado."),
    ).not.toBeInTheDocument();
  });

  it("deve encontrar produto pelo nome", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone 15 Pro Max",
    );

    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    expect(screen.getByText("256GB")).toBeInTheDocument();
  });

  it("deve encontrar produto pelo modelo", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "512GB",
    );

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
  });

  it("deve encontrar produto pela descrição", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "câmera profissional",
    );

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
  });

  it("deve encontrar produto pelo tipo de plano", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Anual",
    );

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();

    expect(screen.getByText("Motorola Edge 50")).toBeInTheDocument();
  });

  it("deve encontrar produto pelo benefício", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Seguro incluso",
    );

    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("deve realizar a busca sem diferenciar maiúsculas e minúsculas", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "IPHONE",
    );

    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("deve ignorar espaços no início da pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "   iPhone",
    );

    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("deve ignorar espaços no final da pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone   ",
    );

    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("deve renderizar o título de resultados encontrados", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Samsung",
    );

    expect(
      screen.getByRole("heading", {
        name: "Resultados encontrados",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a lista de resultados", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Samsung",
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("deve renderizar cada resultado dentro de um item da lista", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Samsung",
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("deve limitar os resultados a no máximo cinco produtos", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "smartphone",
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("deve exibir mensagem quando nenhum produto for encontrado", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "produto-inexistente",
    );

    expect(
      screen.getByText("Nenhum smartphone encontrado."),
    ).toBeInTheDocument();
  });

  it("não deve renderizar a lista quando nenhum produto for encontrado", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "produto-inexistente",
    );

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("deve renderizar a imagem de cada resultado", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    expect(
      screen.getByRole("img", {
        name: "iPhone 15 Pro Max",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "iPhone 15",
      }),
    ).toBeInTheDocument();
  });

  it("deve aplicar loading lazy às imagens dos resultados", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    const images = screen.getAllByRole("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("loading", "lazy");
    });
  });

  it("deve aplicar decoding async às imagens dos resultados", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    const images = screen.getAllByRole("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("decoding", "async");
    });
  });

  it("deve aplicar dimensões de 64 por 64 às imagens", async () => {
    const user = userEvent.setup();

    renderSearch();

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    const images = screen.getAllByRole("img");

    images.forEach((image) => {
      expect(image).toHaveAttribute("width", "64");
      expect(image).toHaveAttribute("height", "64");
    });
  });

  it("deve mostrar o botão Ver para usuário autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    expect(
      screen.getAllByRole("button", {
        name: /Ver iPhone/,
      }),
    ).toHaveLength(2);
  });

  it("deve mostrar o texto de acesso para usuário não autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone",
    );

    expect(
      screen.getAllByRole("button", {
        name: /Entre ou crie a conta para ver iPhone/,
      }),
    ).toHaveLength(2);
  });

  it("deve navegar para login ao selecionar produto sem autenticação", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone 15 Pro Max",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Entre ou crie a conta para ver iPhone 15 Pro Max",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("não deve navegar para os detalhes quando não estiver autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, false);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone 15 Pro Max",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Entre ou crie a conta para ver iPhone 15 Pro Max",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalledWith(
      "/smartphones/iphone-15-pro-max",
    );
  });

  it("deve navegar para os detalhes quando estiver autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "iPhone 15 Pro Max",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ver iPhone 15 Pro Max",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/smartphones/iphone-15-pro-max");
  });

  it("não deve navegar para login quando estiver autenticado", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Galaxy S24 Ultra",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ver Galaxy S24 Ultra",
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("deve fechar a pesquisa antes de navegar para o produto", async () => {
    const user = userEvent.setup();

    renderSearch(true, true);

    await user.type(
      screen.getByRole("textbox", {
        name: "Pesquisar smartphones",
      }),
      "Galaxy S24 Ultra",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ver Galaxy S24 Ultra",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("deve focar o campo ao tentar buscar com pesquisa vazia", async () => {
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
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deve focar o campo ao tentar buscar somente com espaços", async () => {
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

    expect(input).toHaveFocus();
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deve navegar para a pesquisa ao enviar o formulário", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/smartphones?search=iPhone");
  });

  it("deve remover espaços das extremidades antes de navegar", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "   iPhone   ");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/smartphones?search=iPhone");
  });

  it("deve codificar caracteres especiais na URL da pesquisa", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone 15 Pro Max");

    await user.click(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/smartphones?search=iPhone%2015%20Pro%20Max",
    );
  });

  it("deve submeter a pesquisa ao pressionar Enter", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "Samsung");
    await user.keyboard("{Enter}");

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/smartphones?search=Samsung");
  });

  it("deve limpar a pesquisa quando o componente for fechado", async () => {
    const user = userEvent.setup();

    const { rerender } = renderSearch(true);

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await user.type(input, "iPhone");

    expect(input).toHaveValue("iPhone");

    rerender(<Search open={false} onClose={mockOnClose} />);

    rerender(<Search open={true} onClose={mockOnClose} />);

    const reopenedInput = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await waitFor(() => {
      expect(reopenedInput).toHaveValue("");
    });
  });

  it("deve remover o listener de Escape quando o componente for desmontado", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderSearch();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("deve remover o listener de Escape quando open mudar para false", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { rerender } = renderSearch(true);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    rerender(<Search open={false} onClose={mockOnClose} />);

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("deve aplicar aria-live aos resultados", () => {
    renderSearch();

    expect(document.querySelector(".search-results")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("deve aplicar aria-label aos resultados", () => {
    renderSearch();

    expect(screen.getByLabelText("Resultados da pesquisa")).toBeInTheDocument();
  });

  it("deve permitir navegar pelo botão de fechar usando teclado", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    await user.tab({ shift: true });

    expect(
      screen.getByRole("button", {
        name: "Fechar pesquisa",
      }),
    ).toHaveFocus();
  });

  it("deve permitir navegar até o botão Buscar usando teclado", async () => {
    const user = userEvent.setup();

    renderSearch();

    const input = screen.getByRole("textbox", {
      name: "Pesquisar smartphones",
    });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    await user.tab();

    expect(
      screen.getByRole("button", {
        name: "Buscar smartphone",
      }),
    ).toHaveFocus();
  });
});
