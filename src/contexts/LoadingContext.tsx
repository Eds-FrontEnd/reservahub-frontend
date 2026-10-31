import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import LoadingModal from "../components/LoadingModal";

interface LoadingContextData {
  isLoading: boolean;
  startLoading: () => () => void;
}

interface LoadingProviderProps {
  children: ReactNode;
}

const LoadingContext = createContext<LoadingContextData | undefined>(undefined);

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [pendingCount, setPendingCount] = useState(0);
  const activeOperations = useRef(new Set<symbol>());

  const startLoading = useCallback(() => {
    const operationId = Symbol("loading-operation");

    activeOperations.current.add(operationId);
    setPendingCount(activeOperations.current.size);

    let finished = false;

    const finishLoading = () => {
      if (finished) return;

      finished = true;

      const operationRemoved = activeOperations.current.delete(operationId);

      if (operationRemoved) {
        setPendingCount(activeOperations.current.size);
      }
    };

    return finishLoading;
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoading: pendingCount > 0,
      startLoading,
    }),
    [pendingCount, startLoading],
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      <LoadingModal
        open={contextValue.isLoading}
        message="Aguarde um instante..."
      />
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading deve ser utilizado dentro de LoadingProvider.");
  }

  return context;
};
