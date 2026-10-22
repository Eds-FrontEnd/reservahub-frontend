import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { SmartphoneSubscriptionItem } from "../components/Product";
import { SmartphoneService } from "../services/SmartphoneService";

const CART_STORAGE_KEY = "cart-items";
const PURCHASE_STORAGE_KEY = "purchase-payload";

export interface CartItem extends SmartphoneSubscriptionItem {
  quantity: number;
  planMonths: number;
}

interface CartContextData {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  total: number;
  addItem: (product: SmartphoneSubscriptionItem, planMonths: number) => void;
  updateQuantity: (id: string, planMonths: number, value: number) => void;
  removeItem: (id: string, planMonths: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  savePurchasePayload: (payload: unknown) => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error);

      return [];
    }
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Erro ao salvar o carrinho:", error);
    }
  }, [items]);

  useEffect(() => {
    let active = true;

    const sincronizarEstoque = async () => {
      try {
        const produtosDisponiveis = await SmartphoneService.listarDisponiveis();

        if (!active) {
          return;
        }

        const estoquePorId = new Map(
          produtosDisponiveis.map((produto) => [produto.id, produto]),
        );

        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            const produtoAtualizado = estoquePorId.get(item.id);

            if (
              !produtoAtualizado ||
              !Number.isFinite(produtoAtualizado.stock) ||
              produtoAtualizado.stock <= 0
            ) {
              return [];
            }

            return [
              {
                ...item,
                ...produtoAtualizado,
                quantity: Math.min(item.quantity, produtoAtualizado.stock),
              },
            ];
          }),
        );
      } catch (error) {
        if (active) {
          console.error("Erro ao sincronizar o estoque do carrinho:", error);
        }
      }
    };

    void sincronizarEstoque();

    const cancelarAtualizacoes = SmartphoneService.escutarAtualizacoesEstoque(
      () => {
        void sincronizarEstoque();
      },
    );

    return () => {
      active = false;
      cancelarAtualizacoes();
    };
  }, []);

  const addItem = useCallback(
    (product: SmartphoneSubscriptionItem, planMonths: number) => {
      if (!Number.isFinite(product.stock) || product.stock <= 0) {
        return;
      }

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === product.id && item.planMonths === planMonths,
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === product.id && item.planMonths === planMonths
              ? {
                  ...item,
                  ...product,
                  quantity: Math.min(item.quantity + 1, product.stock),
                }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            ...product,
            quantity: 1,
            planMonths,
          },
        ];
      });

      setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(
    (id: string, planMonths: number, value: number) => {
      setItems((currentItems) =>
        currentItems
          .map((item) =>
            item.id === id && item.planMonths === planMonths
              ? {
                  ...item,
                  quantity: Math.min(
                    Math.max(item.quantity + value, 0),
                    item.stock,
                  ),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string, planMonths: number) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id || item.planMonths !== planMonths,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);

    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const savePurchasePayload = useCallback((payload: unknown) => {
    try {
      localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Erro ao salvar payload da compra:", error);
    }
  }, []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () =>
      Math.round(
        (items.reduce(
          (sum, item) =>
            sum + item.monthlyPrice * item.quantity * item.planMonths,
          0,
        ) +
          Number.EPSILON) *
          100,
      ) / 100,
    [items],
  );

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
};
