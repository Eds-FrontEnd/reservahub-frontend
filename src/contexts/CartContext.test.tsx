import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { render, screen } from "@testing-library/react";

import type { SmartphoneSubscriptionItem } from "../components/Product";

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
        onClick={() => updateQuantity("iphone-15-pro-max", 1)}
      >
        Aumentar quantidade
      </button>

      <button
        type="button"
        onClick={() => updateQuantity("iphone-15-pro-max", -1)}
      >
        Diminuir quantidade
      </button>

      <button type="button" onClick={() => removeItem("iphone-15-pro-max")}>
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
      screen
        .getByRole("button", {
          name: "Adicionar",
        })
        .click();
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
      screen
        .getByRole("button", {
          name: "Adicionar",
        })
        .click();
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
      screen
        .getByRole("button", {
          name: "Adicionar",
        })
        .click();

      screen
        .getByRole("button", {
          name: "Adicionar",
        })
        .click();
    });

    const items = JSON.parse(screen.getByTestId("items").textContent ?? "[]");

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);

    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
    expect(screen.getByTestId("total")).toHaveTextContent("6957.6");
  });

  it("deve adicionar o mesmo produto como item diferente quando o plano mudar", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

  it("deve atualizar a quantidade de um produto", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.total).toBeCloseTo(10436.4, 2);
  });

  it("deve remover o item quando a atualização da quantidade resultar em zero", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, -1);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("deve remover o item quando a atualização da quantidade resultar em valor negativo", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(product, 12);
      result.current.updateQuantity(product.id, -2);
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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
      result.current.updateQuantity(firstProduct.id, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.items[1].quantity).toBe(1);

    expect(result.current.totalItems).toBe(4);
    expect(result.current.total).toBeCloseTo(16434, 2);
  });

  it("deve remover um produto pelo id", () => {
    const firstProduct = createProduct();

    const secondProduct = createProduct({
      id: "galaxy-s24-ultra",
      product: "Galaxy S24 Ultra",
      model: "SM-S928B",
      monthlyPrice: 249.9,
    });

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(firstProduct, 12);
      result.current.addItem(secondProduct, 24);
      result.current.removeItem(firstProduct.id);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(secondProduct.id);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBeCloseTo(5997.6, 2);
  });

  it("deve limpar o carrinho e fechar o carrinho", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("deve fechar o carrinho", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

  it("deve remover os itens do localStorage quando o carrinho ficar vazio", () => {
    const product = createProduct();

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(localStorage.getItem("cart-items")).not.toBeNull();

    act(() => {
      result.current.removeItem(product.id);
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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(product, 12);
    });

    expect(result.current.total).toBeCloseTo(2998.8, 2);
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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

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

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(createProduct(), 12);
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao salvar o carrinho:",
      expect.any(Error),
    );

    expect(setItemSpy).toHaveBeenCalled();
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
