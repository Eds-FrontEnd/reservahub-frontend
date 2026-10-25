import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { render, screen } from "@testing-library/react";

import type { SmartphoneSubscriptionItem } from "../components/Product";
import { SmartphoneService } from "../services/SmartphoneService";

import { CartProvider, useCart } from "./CartContext";

const createProduct = (
  overrides: Partial<SmartphoneSubscriptionItem> = {},
): SmartphoneSubscriptionItem => ({
  id: "iphone-15-pro-max",
  product: "iPhone 15 Pro Max",
  stock: 8,
  description: "Smartphone Apple com excelente desempenho.",
  model: "A3108",
  image: "/images/iphone-15-pro-max.webp",
  monthlyPrice: 289.9,
  planType: "Mensal Flex",
  benefits: ["Seguro incluso", "Troca facilitada"],
  ...overrides,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const CartConsumer = () => {
  const {
    items,
    isOpen,
    totalItems,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    savePurchasePayload,
  } = useCart();

  return (
    <div>
      <span data-testid="items">{JSON.stringify(items)}</span>

      <span data-testid="is-open">{String(isOpen)}</span>

      <span data-testid="total-items">{String(totalItems)}</span>

      <span data-testid="total">{String(total)}</span>

      <button type="button" onClick={() => addItem(createProduct(), 12)}>
        Adicionar
      </button>

      <button
        type="button"
        onClick={() => updateQuantity("iphone-15-pro-max", 12, 1)}
      >
        Aumentar quantidade
      </button>

      <button
        type="button"
        onClick={() => updateQuantity("iphone-15-pro-max", 12, -1)}
      >
        Diminuir quantidade
      </button>

      <button type="button" onClick={() => removeItem("iphone-15-pro-max", 12)}>
        Remover
      </button>

      <button type="button" onClick={clearCart}>
        Limpar carrinho
      </button>

      <button type="button" onClick={openCart}>
        Abrir carrinho
      </button>

      <button type="button" onClick={closeCart}>
        Fechar carrinho
      </button>

      <button
        type="button"
        onClick={() =>
          savePurchasePayload({
            customer: "Edson Alves",
            total: 579.8,
          })
        }
      >
        Salvar compra
      </button>
    </div>
  );
};

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();

    jest
      .spyOn(SmartphoneService, "listarDisponiveis")
      .mockImplementation(
        () => new Promise<SmartphoneSubscriptionItem[]>(() => undefined),
      );

    jest
      .spyOn(SmartphoneService, "escutarAtualizacoesEstoque")
      .mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("deve iniciar com o carrinho vazio quando não existem dados no localStorage", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("items")).toHaveTextContent("[]");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("total-items")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
  });

  it("deve recuperar os itens do carrinho do localStorage", () => {
    const product = createProduct();

    const cartItem = {
      ...product,
      quantity: 2,
      planMonths: 12,
    };

    localStorage.setItem("cart-items", JSON.stringify([cartItem]));

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("items")).toHaveTextContent(
      JSON.stringify([cartItem]),
    );

    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
    expect(screen.getByTestId("total")).toHaveTextContent("6957.6");
  });

  it("deve iniciar com carrinho vazio quando o localStorage contém JSON inválido", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    localStorage.setItem("cart-items", "{json-invalido");

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("items")).toHaveTextContent("[]");
    expect(screen.getByTestId("total-items")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");

    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao carregar o carrinho:",
      expect.any(SyntaxError),
    );
  });

  it("deve adicionar um novo produto ao carrinho", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Adicionar" }).click();
    });

    const items = JSON.parse(screen.getByTestId("items").textContent ?? "[]");

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      ...createProduct(),
      quantity: 1,
      planMonths: 12,
    });

    expect(screen.getByTestId("total-items")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("3478.8");
  });

  it("deve abrir o carrinho ao adicionar um produto", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    act(() => {
      screen.getByRole("button", { name: "Adicionar" }).click();
    });

    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  it("deve aumentar a quantidade quando o mesmo produto e plano forem adicionados novamente", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Adicionar" }).click();
      screen.getByRole("button", { name: "Adicionar" }).click();
    });

    const items = JSON.parse(screen.getByTestId("items").textContent ?? "[]");

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);

    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
    expect(screen.getByTestId("total")).toHaveTextContent("6957.6");
  });

  it("não deve adicionar produtos sem estoque", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(createProduct({ stock: 0 }), 12);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it("não deve permitir adicionar mais unidades do que o estoque disponível", () => {
    const product = createProduct({ stock: 2 });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.addItem(product, 12);
      result.current.addItem(product, 12);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it("deve adicionar o mesmo produto como item diferente quando o plano mudar", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.addItem(product, 24);
    });

    expect(result.current.items).toHaveLength(2);

    expect(result.current.items[0].planMonths).toBe(12);
    expect(result.current.items[0].quantity).toBe(1);

    expect(result.current.items[1].planMonths).toBe(24);
    expect(result.current.items[1].quantity).toBe(1);

    expect(result.current.totalItems).toBe(2);
    expect(result.current.total).toBeCloseTo(10436.4, 2);
  });

  it("deve manter o plano sem fidelidade separado do plano anual", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.addItem(product, 12);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].planMonths).toBe(1);
    expect(result.current.items[1].planMonths).toBe(12);

    expect(result.current.total).toBeCloseTo(3768.7, 2);
  });

  it("deve aumentar somente a quantidade do plano selecionado", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 1, 1);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].planMonths).toBe(1);
    expect(result.current.items[1].quantity).toBe(1);
    expect(result.current.items[1].planMonths).toBe(12);

    expect(result.current.totalItems).toBe(3);
    expect(result.current.total).toBeCloseTo(4058.6, 2);
  });

  it("deve aumentar somente a quantidade do plano anual selecionado", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 12, 1);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].planMonths).toBe(1);
    expect(result.current.items[1].quantity).toBe(2);
    expect(result.current.items[1].planMonths).toBe(12);

    expect(result.current.totalItems).toBe(3);
    expect(result.current.total).toBeCloseTo(7247.5, 2);
  });

  it("deve atualizar a quantidade de um produto", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 12, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.total).toBeCloseTo(10436.4, 2);
  });

  it("não deve permitir aumentar a quantidade acima do estoque", () => {
    const product = createProduct({ stock: 3 });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 12, 10);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  it("deve remover o item quando a atualização da quantidade resultar em zero", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 12, -1);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("deve remover o item quando a atualização da quantidade resultar em valor negativo", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 12, -2);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("não deve alterar itens de outros produtos ao atualizar a quantidade", () => {
    const firstProduct = createProduct();

    const secondProduct = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 249.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
      result.current.updateQuantity(firstProduct.id, 12, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.items[1].quantity).toBe(1);

    expect(result.current.totalItems).toBe(4);
    expect(result.current.total).toBeCloseTo(16434, 2);
  });

  it("deve remover somente o plano selecionado do mesmo produto", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.addItem(product, 12);
      result.current.removeItem(product.id, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(product.id);
    expect(result.current.items[0].planMonths).toBe(12);
    expect(result.current.items[0].quantity).toBe(1);

    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBeCloseTo(3478.8, 2);
  });

  it("deve remover um produto pelo id e plano", () => {
    const firstProduct = createProduct();

    const secondProduct = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 249.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
      result.current.removeItem(firstProduct.id, 12);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(secondProduct.id);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBeCloseTo(5997.6, 2);
  });

  it("deve limpar o carrinho e fechar o carrinho", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.total).toBe(0);
    expect(localStorage.getItem("cart-items")).toBeNull();
  });

  it("deve abrir o carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("deve fechar o carrinho", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("deve salvar os itens do carrinho no localStorage", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(localStorage.getItem("cart-items")).toBe(
      JSON.stringify([
        {
          ...product,
          quantity: 1,
          planMonths: 12,
        },
      ]),
    );
  });

  it("deve persistir a quantidade e o plano de cada item separadamente", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 1, 1);
    });

    const savedItems = JSON.parse(localStorage.getItem("cart-items") ?? "[]");

    expect(savedItems).toHaveLength(2);
    expect(savedItems[0].planMonths).toBe(1);
    expect(savedItems[0].quantity).toBe(2);
    expect(savedItems[1].planMonths).toBe(12);
    expect(savedItems[1].quantity).toBe(1);
  });

  it("deve remover os itens do localStorage quando o carrinho ficar vazio", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(localStorage.getItem("cart-items")).not.toBeNull();

    act(() => {
      result.current.removeItem(product.id, 12);
    });

    expect(localStorage.getItem("cart-items")).toBeNull();
  });

  it("deve calcular o total de itens corretamente", () => {
    const firstProduct = createProduct();

    const secondProduct = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 199.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
    });

    expect(result.current.totalItems).toBe(3);
  });

  it("deve calcular o valor total corretamente", () => {
    const firstProduct = createProduct();

    const secondProduct = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 199.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
    });

    expect(result.current.total).toBeCloseTo(11755.2, 2);
  });

  it("deve calcular corretamente o contrato anual de R$ 249,90 por mês", () => {
    const product = createProduct({
      monthlyPrice: 249.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(result.current.total).toBeCloseTo(2998.8, 2);
  });

  it("deve calcular somente um mês para o plano sem fidelidade", () => {
    const product = createProduct({
      monthlyPrice: 289.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
    });

    expect(result.current.total).toBeCloseTo(289.9, 2);
  });

  it("deve recalcular o total corretamente ao aumentar a quantidade sem fidelidade", () => {
    const product = createProduct({
      monthlyPrice: 289.9,
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product, 1);
      result.current.updateQuantity(product.id, 1, 1);
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].planMonths).toBe(1);
    expect(result.current.total).toBeCloseTo(579.8, 2);
  });

  it("deve salvar o payload da compra no localStorage", () => {
    const payload = {
      customer: {
        name: "Edson Alves",
        email: "edson@example.com",
      },
      items: [
        {
          id: "iphone-15-pro-max",
          quantity: 1,
        },
      ],
      total: 289.9,
    };

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.savePurchasePayload(payload);
    });

    expect(localStorage.getItem("purchase-payload")).toBe(
      JSON.stringify(payload),
    );
  });

  it("deve permitir salvar qualquer payload serializável", () => {
    const payload = {
      orderId: "ORDER-001",
      products: ["iphone-15-pro-max"],
      quantity: 2,
      active: true,
    };

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.savePurchasePayload(payload);
    });

    expect(
      JSON.parse(localStorage.getItem("purchase-payload") ?? "null"),
    ).toEqual(payload);
  });

  it("deve tratar erro ao salvar o payload da compra", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Erro de armazenamento");
      });

    const { result } = renderHook(() => useCart(), { wrapper });

    const payload = {
      orderId: "ORDER-001",
    };

    act(() => {
      result.current.savePurchasePayload(payload);
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao salvar payload da compra:",
      expect.any(Error),
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "purchase-payload",
      JSON.stringify(payload),
    );
  });

  it("deve tratar erro ao salvar o carrinho no localStorage", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Erro de armazenamento");
      });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(createProduct(), 12);
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao salvar o carrinho:",
      expect.any(Error),
    );

    expect(setItemSpy).toHaveBeenCalled();
  });

  it("deve sincronizar o carrinho com o estoque ao carregar a aplicação", async () => {
    const product = createProduct({
      stock: 3,
    });

    localStorage.setItem(
      "cart-items",
      JSON.stringify([
        {
          ...product,
          quantity: 7,
          planMonths: 12,
        },
      ]),
    );

    jest
      .mocked(SmartphoneService.listarDisponiveis)
      .mockResolvedValueOnce([product]);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.items[0].stock).toBe(3);
    });

    await waitFor(() => {
      const savedItems = JSON.parse(localStorage.getItem("cart-items") ?? "[]");

      expect(savedItems[0].quantity).toBe(3);
      expect(savedItems[0].stock).toBe(3);
    });
  });

  it("deve remover somente os smartphones esgotados e ajustar a quantidade dos demais", async () => {
    const iphone = createProduct({
      id: "iphone-15-pro-max",
      stock: 8,
    });

    const galaxy = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 249.9,
      stock: 10,
    });

    localStorage.setItem(
      "cart-items",
      JSON.stringify([
        {
          ...iphone,
          quantity: 2,
          planMonths: 12,
        },
        {
          ...galaxy,
          quantity: 7,
          planMonths: 12,
        },
      ]),
    );

    jest.mocked(SmartphoneService.listarDisponiveis).mockResolvedValueOnce([
      {
        ...galaxy,
        stock: 3,
      },
    ]);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe("galaxy-s24-ultra");
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.items[0].stock).toBe(3);
    });

    await waitFor(() => {
      const savedItems = JSON.parse(localStorage.getItem("cart-items") ?? "[]");

      expect(savedItems).toHaveLength(1);
      expect(savedItems[0].id).toBe("galaxy-s24-ultra");
      expect(savedItems[0].quantity).toBe(3);
    });
  });

  it("deve preservar a quantidade quando o estoque continuar suficiente", async () => {
    const product = createProduct({
      stock: 8,
    });

    localStorage.setItem(
      "cart-items",
      JSON.stringify([
        {
          ...product,
          quantity: 2,
          planMonths: 12,
        },
      ]),
    );

    jest.mocked(SmartphoneService.listarDisponiveis).mockResolvedValueOnce([
      {
        ...product,
        stock: 5,
      },
    ]);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.items[0].stock).toBe(5);
    });
  });

  it("deve preservar o carrinho quando a API de estoque falhar", async () => {
    const product = createProduct();

    const cartItem = {
      ...product,
      quantity: 2,
      planMonths: 12,
    };

    localStorage.setItem("cart-items", JSON.stringify([cartItem]));

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    jest
      .mocked(SmartphoneService.listarDisponiveis)
      .mockRejectedValueOnce(new Error("Falha na API"));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao sincronizar o estoque do carrinho:",
        expect.any(Error),
      );
    });

    expect(result.current.items).toEqual([cartItem]);
  });

  it("deve sincronizar novamente o carrinho quando receber um evento SSE", async () => {
    const iphone = createProduct({
      stock: 8,
    });

    const galaxy = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 249.9,
      stock: 10,
    });

    localStorage.setItem(
      "cart-items",
      JSON.stringify([
        {
          ...iphone,
          quantity: 2,
          planMonths: 12,
        },
        {
          ...galaxy,
          quantity: 3,
          planMonths: 12,
        },
      ]),
    );

    jest
      .mocked(SmartphoneService.listarDisponiveis)
      .mockResolvedValueOnce([iphone, galaxy])
      .mockResolvedValueOnce([
        {
          ...galaxy,
          stock: 1,
        },
      ]);

    let onUpdate: ((idsProdutos: string[]) => void) | undefined;

    const cancelarAtualizacoes = jest.fn();

    jest
      .mocked(SmartphoneService.escutarAtualizacoesEstoque)
      .mockImplementation((callback: (idsProdutos: string[]) => void) => {
        onUpdate = callback;

        return cancelarAtualizacoes;
      });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    expect(onUpdate).toBeDefined();

    act(() => {
      onUpdate?.(["iphone-15-pro-max", "galaxy-s24-ultra"]);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe("galaxy-s24-ultra");
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[0].stock).toBe(1);
    });

    await waitFor(() => {
      const savedItems = JSON.parse(localStorage.getItem("cart-items") ?? "[]");

      expect(savedItems).toHaveLength(1);
      expect(savedItems[0].id).toBe("galaxy-s24-ultra");
      expect(savedItems[0].quantity).toBe(1);
    });

    expect(SmartphoneService.listarDisponiveis).toHaveBeenCalledTimes(2);
  });

  it("deve encerrar a inscrição SSE ao desmontar o CartProvider", () => {
    const cancelarAtualizacoes = jest.fn();

    jest
      .mocked(SmartphoneService.escutarAtualizacoesEstoque)
      .mockReturnValue(cancelarAtualizacoes);

    const { unmount } = renderHook(() => useCart(), { wrapper });

    unmount();

    expect(cancelarAtualizacoes).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro quando useCart for usado fora do CartProvider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart deve ser usado dentro de CartProvider");

    consoleError.mockRestore();
  });
});
