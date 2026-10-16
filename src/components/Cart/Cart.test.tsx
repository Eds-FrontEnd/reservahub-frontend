import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import mockReact from "react";

import { useCart } from "../../contexts/CartContext";
import type { CompraResponse } from "../../services/CompraService";
import { CompraService } from "../../services/CompraService";
import { Cart } from "../Cart/index";

jest.mock("../../contexts/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../../services/CompraService", () => ({
  CompraService: {
    validarCupom: jest.fn(),
    concluirCompra: jest.fn(),
  },
}));

jest.mock("@mui/material/Tooltip", () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    children: mockReact.ReactNode;
    title: mockReact.ReactNode;
  }) =>
    mockReact.createElement(
      "span",
      { title: typeof title === "string" ? title : "" },
      children,
    ),
}));

jest.mock("../../assets/images/icons/icon-bag.svg", () => ({
  __esModule: true,
  default: "icon-bag.svg",
}));

jest.mock("../Modal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    onClose,
  }: {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
  }) =>
    open
      ? mockReact.createElement(
          "div",
          { role: "dialog", "aria-label": title },
          mockReact.createElement("h2", null, title),
          mockReact.createElement("p", null, message),
          mockReact.createElement(
            "button",
            { type: "button", onClick: onClose },
            "Fechar modal",
          ),
        )
      : null,
}));

const mockedUseCart = jest.mocked(useCart);
const mockedValidarCupom = jest.mocked(CompraService.validarCupom);
const mockedConcluirCompra = jest.mocked(CompraService.concluirCompra);

const mockCompraResponse: CompraResponse = {
  mensagem: "Compra realizada com sucesso.",
  totalItens: 1,
};

const mockItem = {
  id: "smartphone-1",
  product: "iPhone",
  model: "iPhone 15 Pro Max 256GB",
  image: "/images/iphone.png",
  monthlyPrice: 289.9,
  quantity: 2,
  stock: 8,
  planMonths: 12,
  description: "Smartphone para assinatura",
  planType: "12 meses",
  benefits: [],
};

const mockCloseCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();
const mockClearCart = jest.fn();

const configureCart = (overrides: Partial<ReturnType<typeof useCart>> = {}) => {
  mockedUseCart.mockReturnValue({
    items: [mockItem],
    isOpen: true,
    total: 579.8,
    closeCart: mockCloseCart,
    updateQuantity: mockUpdateQuantity,
    removeItem: mockRemoveItem,
    clearCart: mockClearCart,
    ...overrides,
  } as ReturnType<typeof useCart>);
};

const mensagemCupomAplicado = /Cupom de\s*10\s*%\s*aplicado com sucesso!/;

describe("Cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configureCart();

    mockedValidarCupom.mockImplementation(async (cupom: string) => {
      if (cupom.trim().toUpperCase() === "DESC10%") {
        return {
          valido: true,
          mensagem: "Cupom aplicado com sucesso.",
        };
      }

      return {
        valido: false,
        mensagem: "Cupom inválido. Confira o código e tente novamente.",
      };
    });

    mockedConcluirCompra.mockResolvedValue(mockCompraResponse);
  });

  describe("Renderização", () => {
    it("deve renderizar o carrinho aberto", () => {
      render(<Cart />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Meu carrinho" }),
      ).toBeInTheDocument();
      expect(screen.getByText("iPhone")).toBeInTheDocument();
      expect(screen.getByText("iPhone 15 Pro Max 256GB")).toBeInTheDocument();
    });

    it("deve exibir o plano de 12 meses", () => {
      render(<Cart />);

      expect(screen.getByText("Plano: 12 Meses")).toBeInTheDocument();
    });

    it("deve exibir o plano sem fidelidade quando a duração for um mês", () => {
      configureCart({
        items: [{ ...mockItem, planMonths: 1 }],
      });

      render(<Cart />);

      expect(screen.getByText("Plano: Sem Fidelidade")).toBeInTheDocument();
    });

    it("deve exibir o total mensal formatado em reais", () => {
      render(<Cart />);

      expect(screen.getByText("Total mensal")).toBeInTheDocument();
      expect(screen.getByText("R$ 579,80")).toBeInTheDocument();
    });

    it("deve exibir o preço mensal do smartphone", () => {
      render(<Cart />);

      expect(screen.getByText("R$ 289,90")).toBeInTheDocument();
      expect(screen.getByText("/mês")).toBeInTheDocument();
    });

    it("deve exibir o campo para informar o cupom", () => {
      render(<Cart />);

      expect(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Aplicar" }),
      ).toBeInTheDocument();
    });

    it("deve exibir os botões de checkout e limpeza do carrinho", () => {
      render(<Cart />);

      expect(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Limpar carrinho" }),
      ).toBeInTheDocument();
    });

    it("não deve renderizar o drawer quando o carrinho estiver fechado", () => {
      configureCart({ isOpen: false });

      render(<Cart />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Meu carrinho" }),
      ).not.toBeInTheDocument();
    });

    it("deve exibir a mensagem quando o carrinho estiver vazio", () => {
      configureCart({
        items: [],
        total: 0,
      });

      render(<Cart />);

      expect(
        screen.getByText(
          "Seu carrinho está vazio. Não vá embora de sacola vazia.",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Adicione um smartphone para começar sua assinatura."),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "Concluir assinatura" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Cupom de desconto", () => {
    it("deve aplicar um cupom válido e calcular o desconto", async () => {
      render(<Cart />);

      fireEvent.change(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
        {
          target: { value: "DESC10%" },
        },
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      expect(
        await screen.findByText(mensagemCupomAplicado),
      ).toBeInTheDocument();
      expect(screen.getByText("Desconto (10%)")).toBeInTheDocument();
      expect(screen.getByText("- R$ 57,98")).toBeInTheDocument();
      expect(screen.getByText("Total mensal com desconto")).toBeInTheDocument();
      expect(screen.getByText("R$ 521,82")).toBeInTheDocument();

      expect(mockedValidarCupom).toHaveBeenCalledWith("DESC10%");
    });

    it("deve aceitar o cupom informado em letras minúsculas", async () => {
      render(<Cart />);

      fireEvent.change(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
        {
          target: { value: "desc10%" },
        },
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      expect(
        await screen.findByText(mensagemCupomAplicado),
      ).toBeInTheDocument();
      expect(screen.getByText("- R$ 57,98")).toBeInTheDocument();
      expect(mockedValidarCupom).toHaveBeenCalledWith("DESC10%");
    });

    it("deve exibir uma mensagem para um cupom inválido", async () => {
      render(<Cart />);

      fireEvent.change(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
        {
          target: { value: "PROMOCAO" },
        },
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Cupom inválido. Confira o código e tente novamente.",
      );

      expect(
        screen.queryByText("Total mensal com desconto"),
      ).not.toBeInTheDocument();
    });

    it("deve remover o cupom aplicado", async () => {
      render(<Cart />);

      fireEvent.change(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
        {
          target: { value: "DESC10%" },
        },
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      await screen.findByText(mensagemCupomAplicado);

      fireEvent.click(screen.getByRole("button", { name: "Remover cupom" }));

      expect(
        screen.queryByText("Total mensal com desconto"),
      ).not.toBeInTheDocument();

      expect(screen.getByText("R$ 579,80")).toBeInTheDocument();
    });

    it("deve enviar os itens da assinatura e o cupom aplicado para o serviço", async () => {
      render(<Cart />);

      fireEvent.change(
        screen.getByRole("textbox", { name: "Cupom de desconto" }),
        {
          target: { value: "DESC10%" },
        },
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      await screen.findByText(mensagemCupomAplicado);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      await waitFor(() => {
        expect(mockedConcluirCompra).toHaveBeenCalledWith(
          [
            {
              productId: "smartphone-1",
              quantity: 2,
              planMonths: 12,
            },
          ],
          "DESC10%",
        );
      });
    });
  });

  describe("Interações com o carrinho", () => {
    it("deve fechar o carrinho ao clicar no botão de fechar", () => {
      render(<Cart />);

      fireEvent.click(screen.getByRole("button", { name: "Fechar carrinho" }));

      expect(mockCloseCart).toHaveBeenCalledTimes(1);
    });

    it("deve fechar o carrinho ao clicar no overlay", () => {
      const { container } = render(<Cart />);

      const overlay = container.querySelector(".cart-overlay");

      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay!);

      expect(mockCloseCart).toHaveBeenCalledTimes(1);
    });

    it("deve fechar o carrinho ao pressionar Escape", () => {
      render(<Cart />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockCloseCart).toHaveBeenCalledTimes(1);
    });

    it("não deve fechar o carrinho ao pressionar outra tecla", () => {
      render(<Cart />);

      fireEvent.keyDown(document, { key: "Enter" });

      expect(mockCloseCart).not.toHaveBeenCalled();
    });

    it("deve aumentar a quantidade do smartphone", () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", {
          name: "Aumentar quantidade de iPhone",
        }),
      );

      expect(mockUpdateQuantity).toHaveBeenCalledWith("smartphone-1", 1);
    });

    it("deve diminuir a quantidade do smartphone", () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", {
          name: "Diminuir quantidade de iPhone",
        }),
      );

      expect(mockUpdateQuantity).toHaveBeenCalledWith("smartphone-1", -1);
    });

    it("deve remover o smartphone do carrinho", () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Remover iPhone do carrinho" }),
      );

      expect(mockRemoveItem).toHaveBeenCalledWith("smartphone-1");
    });

    it("deve limpar o carrinho ao clicar no botão correspondente", () => {
      render(<Cart />);

      fireEvent.click(screen.getByRole("button", { name: "Limpar carrinho" }));

      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });
  });

  describe("Limite de estoque", () => {
    it("deve desabilitar o botão de aumentar quando a quantidade atingir o estoque", () => {
      configureCart({
        items: [{ ...mockItem, quantity: 8, stock: 8 }],
      });

      render(<Cart />);

      expect(
        screen.getByRole("button", {
          name: "Estoque máximo de iPhone atingido",
        }),
      ).toBeDisabled();
    });

    it("deve exibir a mensagem de estoque máximo com plural correto", () => {
      configureCart({
        items: [{ ...mockItem, quantity: 8, stock: 8 }],
      });

      render(<Cart />);

      expect(
        screen.getByTitle(
          "Estoque máximo atingido. Há apenas 8 unidades disponíveis para este smartphone.",
        ),
      ).toBeInTheDocument();
    });

    it("deve exibir a mensagem no singular quando houver uma unidade em estoque", () => {
      configureCart({
        items: [{ ...mockItem, quantity: 1, stock: 1 }],
      });

      render(<Cart />);

      expect(
        screen.getByTitle(
          "Estoque máximo atingido. Há apenas 1 unidade disponível para este smartphone.",
        ),
      ).toBeInTheDocument();
    });

    it("deve permitir aumentar a quantidade quando ainda houver estoque", () => {
      configureCart({
        items: [{ ...mockItem, quantity: 2, stock: 8 }],
      });

      render(<Cart />);

      expect(
        screen.getByRole("button", {
          name: "Aumentar quantidade de iPhone",
        }),
      ).toBeEnabled();

      expect(screen.getByTitle("Adicionar unidade")).toBeInTheDocument();
    });
  });

  describe("Checkout", () => {
    it("deve enviar os itens da assinatura para o serviço de compra", async () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      await waitFor(() => {
        expect(mockedConcluirCompra).toHaveBeenCalledWith(
          [
            {
              productId: "smartphone-1",
              quantity: 2,
              planMonths: 12,
            },
          ],
          undefined,
        );
      });
    });

    it("deve limpar o carrinho após concluir a compra com sucesso", async () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalledTimes(1);
      });
    });

    it("deve abrir o modal de sucesso após concluir a compra", async () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      expect(
        await screen.findByRole("heading", {
          name: "Compra realizada!",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Sua assinatura foi registrada com sucesso. Agradecemos pela preferência!",
        ),
      ).toBeInTheDocument();
    });

    it("deve fechar o modal de sucesso ao clicar no botão de fechar", async () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      expect(
        await screen.findByRole("heading", {
          name: "Compra realizada!",
        }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));

      expect(
        screen.queryByRole("heading", {
          name: "Compra realizada!",
        }),
      ).not.toBeInTheDocument();
    });

    it("deve exibir a mensagem de erro quando o serviço lançar uma exceção", async () => {
      mockedConcluirCompra.mockRejectedValueOnce(
        new Error("Não foi possível concluir sua assinatura."),
      );

      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Não foi possível concluir sua assinatura.",
      );

      expect(mockClearCart).not.toHaveBeenCalled();

      expect(
        screen.queryByRole("heading", {
          name: "Compra realizada!",
        }),
      ).not.toBeInTheDocument();
    });

    it("deve exibir uma mensagem genérica quando o erro não for uma instância de Error", async () => {
      mockedConcluirCompra.mockRejectedValueOnce("erro inesperado");

      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Não foi possível concluir sua assinatura. Tente novamente.",
      );

      expect(mockClearCart).not.toHaveBeenCalled();
    });

    it("deve manter os itens no carrinho quando a compra falhar", async () => {
      mockedConcluirCompra.mockRejectedValueOnce(
        new Error("Sua sessão expirou. Faça login novamente."),
      );

      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Sua sessão expirou. Faça login novamente.",
      );

      expect(screen.getByText("iPhone")).toBeInTheDocument();
      expect(mockClearCart).not.toHaveBeenCalled();
    });

    it("deve liberar o botão de checkout após uma compra bem-sucedida", async () => {
      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Concluir assinatura" }),
        ).toBeEnabled();
      });
    });

    it("deve liberar o botão de checkout após uma falha", async () => {
      mockedConcluirCompra.mockRejectedValueOnce(
        new Error("Erro ao processar a assinatura."),
      );

      render(<Cart />);

      fireEvent.click(
        screen.getByRole("button", { name: "Concluir assinatura" }),
      );

      await screen.findByRole("alert");

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Concluir assinatura" }),
        ).toBeEnabled();
      });
    });

    it("não deve chamar o serviço quando o carrinho estiver vazio", () => {
      configureCart({
        items: [],
        total: 0,
      });

      render(<Cart />);

      expect(mockedConcluirCompra).not.toHaveBeenCalled();
    });
  });
});
