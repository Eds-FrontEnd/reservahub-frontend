import { Loyalty } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { fetchCepData } from "../../services/ViaCepService";
import "./PopupStyle.css";

interface DiscountResult {
  cep: string;
  city: string;
  state: string;
  region: string;
  discount: number;
  coupon: string;
}

interface CepResponse {
  cep: string;
  mensagem?: string;
}

interface CouponIssueResponse {
  novo: boolean;
  utilizado: boolean;
  cupom: string | null;
  percentual: number;
  mensagem: string;
}

interface AuthenticatedUser {
  perfil?: string;
  role?: string;
}

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

const LOGIN_EVENT = "reservahub:login";
const TRIGGER_KEY = "reservahub-show-discount-after-login";
const AUTHENTICATED_USER_KEY = "authenticatedUser";

const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return digits;
};

const isAdminUser = (): boolean => {
  try {
    const authenticatedUser = localStorage.getItem(AUTHENTICATED_USER_KEY);

    if (!authenticatedUser) {
      return false;
    }

    const user = JSON.parse(authenticatedUser) as AuthenticatedUser;
    const profile = user.perfil ?? user.role;

    return profile?.toUpperCase() === "ADMIN";
  } catch {
    return false;
  }
};

function Popup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadDiscount = async () => {
      if (isAdminUser()) {
        setIsOpen(false);
        return;
      }

      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      const controller = new AbortController();
      requestControllerRef.current = controller;

      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/cep`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CepResponse;
        const normalizedCep = data.cep?.replace(/\D/g, "");

        if (!normalizedCep || !/^\d{8}$/.test(normalizedCep)) {
          return;
        }

        const cepData = await fetchCepData(normalizedCep, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        if (cepData.erro || !cepData.localidade || !cepData.uf) {
          return;
        }

        const couponResponse = await fetch(
          `${API_URL}/api/cupons/promocional`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              uf: cepData.uf,
            }),
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted || !couponResponse.ok) {
          return;
        }

        const couponIssue =
          (await couponResponse.json()) as CouponIssueResponse;

        if (controller.signal.aborted || couponIssue.utilizado) {
          return;
        }

        if (
          !couponIssue.cupom ||
          !/^DESC(100|[1-9]\d?)%$/.test(couponIssue.cupom)
        ) {
          return;
        }

        setResult({
          cep: formatCep(cepData.cep || normalizedCep),
          city: cepData.localidade,
          state: cepData.uf,
          region: cepData.regiao || "Brasil",
          discount: couponIssue.percentual,
          coupon: couponIssue.cupom,
        });

        setCopyMessage("");
        setIsOpen(true);
      } catch (error: unknown) {
        if (controller.signal.aborted || axios.isCancel(error)) {
          return;
        }
      } finally {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
          requestInProgressRef.current = false;
          setIsLoading(false);
        }
      }
    };

    const handleLogin = () => {
      if (localStorage.getItem(TRIGGER_KEY) !== "true") {
        return;
      }

      localStorage.removeItem(TRIGGER_KEY);

      if (isAdminUser()) {
        setIsOpen(false);
        return;
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        void loadDiscount();
      }, 3000);
    };

    window.addEventListener(LOGIN_EVENT, handleLogin);
    handleLogin();

    return () => {
      window.removeEventListener(LOGIN_EVENT, handleLogin);

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      requestInProgressRef.current = false;
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const handleDialogClose = () => setIsOpen(false);

  const handleCopyCoupon = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.coupon);
      setCopyMessage("Cupom copiado com sucesso!");
    } catch {
      setCopyMessage(
        "Não foi possível copiar automaticamente. Tente copiar o cupom manualmente.",
      );
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="exit-discount__dialog"
      aria-labelledby="exit-discount-result-title"
      onClose={handleDialogClose}
    >
      {result && (
        <section className="exit-discount__container">
          <button
            className="exit-discount__close"
            type="button"
            onClick={handleClose}
            aria-label="Fechar e continuar navegando"
            autoFocus
          >
            <CloseIcon aria-hidden="true" />
          </button>

          <section
            className="exit-discount__result"
            aria-labelledby="exit-discount-result-title"
            aria-busy={isLoading}
          >
            <div className="exit-discount__icon">
              <Loyalty aria-hidden="true" sx={{ fontSize: 72 }} />
            </div>

            <h1
              className="exit-discount__result-title"
              id="exit-discount-result-title"
            >
              Parabéns!
            </h1>

            <p className="exit-discount__result-title">
              Você ganhou um cupom de desconto!
            </p>

            <button
              className="exit-discount__coupon"
              type="button"
              onClick={handleCopyCoupon}
              aria-label={`Copiar cupom ${result.coupon}`}
            >
              {result.coupon}
            </button>

            <p
              className="exit-discount__copy-message"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {copyMessage}
            </p>

            <footer className="exit-discount__footer">
              <p className="exit-discount__disclaimer">
                Use esse cupom no carrinho e obtenha desconto no plano da sua
                assinatura!
              </p>
            </footer>
          </section>
        </section>
      )}
    </dialog>
  );
}

export default Popup;
