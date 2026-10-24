import { Loyalty } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";

import { fetchCepData } from "../../services/ViaCepService";
import { isValidCouponFormat } from "../../utils/isValidCouponFormat";
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
  ativo: boolean;
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
  const mountedRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadDiscount = async (): Promise<void> => {
      if (!mountedRef.current || isAdminUser()) {
        setIsOpen(false);
        return;
      }

      if (requestInProgressRef.current) {
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        console.warn(
          "[Popup] Consulta cancelada: token de autenticação não encontrado.",
        );
        return;
      }

      requestInProgressRef.current = true;

      const controller = new AbortController();
      requestControllerRef.current = controller;

      setIsLoading(true);

      try {
        const cepResponse = await fetch(`${API_URL}/api/auth/cep`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!cepResponse.ok) {
          console.error(
            "[Popup] Falha ao consultar CEP:",
            cepResponse.status,
            await cepResponse.text(),
          );
          return;
        }

        const cepDataResponse = (await cepResponse.json()) as CepResponse;

        const normalizedCep = cepDataResponse.cep?.replace(/\D/g, "");

        if (!normalizedCep || !/^\d{8}$/.test(normalizedCep)) {
          console.error(
            "[Popup] CEP ausente ou inválido na resposta da API:",
            cepDataResponse,
          );
          return;
        }

        const addressData = await fetchCepData(
          normalizedCep,
          controller.signal,
        );

        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }

        if (addressData.erro || !addressData.localidade || !addressData.uf) {
          console.error(
            "[Popup] Não foi possível obter cidade e UF pelo CEP.",
            addressData,
          );
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
              uf: addressData.uf,
            }),
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!couponResponse.ok) {
          console.error(
            "[Popup] Falha ao consultar cupom promocional:",
            couponResponse.status,
            await couponResponse.text(),
          );
          return;
        }

        const couponIssue =
          (await couponResponse.json()) as CouponIssueResponse;

        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }

        if (couponIssue.utilizado || !couponIssue.ativo) {
          console.info("[Popup] Cupom não exibido: já utilizado ou inativo.", {
            utilizado: couponIssue.utilizado,
            ativo: couponIssue.ativo,
          });
          return;
        }

        const normalizedCoupon = couponIssue.cupom?.trim().toUpperCase();

        const percentual = Number(couponIssue.percentual);

        const couponValid = normalizedCoupon
          ? isValidCouponFormat(normalizedCoupon)
          : false;

        const percentualInteger = Number.isInteger(percentual);

        const percentualInRange = percentual >= 1 && percentual <= 100;

        console.log("[Popup] Diagnóstico da validação:", {
          couponOriginal: couponIssue.cupom,
          normalizedCoupon,
          couponValid,
          percentualOriginal: couponIssue.percentual,
          percentual,
          percentualInteger,
          percentualInRange,
          ativo: couponIssue.ativo,
          utilizado: couponIssue.utilizado,
        });

        if (
          !normalizedCoupon ||
          !couponValid ||
          !percentualInteger ||
          !percentualInRange
        ) {
          console.error("[Popup] Dados do cupom inválidos:", couponIssue);
          return;
        }

        const discountResult: DiscountResult = {
          cep: formatCep(addressData.cep || normalizedCep),
          city: addressData.localidade,
          state: addressData.uf,
          region: addressData.regiao || "Brasil",
          discount: percentual,
          coupon: normalizedCoupon,
        };

        setResult(discountResult);
        setCopyMessage("");
        setIsOpen(true);
      } catch (error: unknown) {
        if (
          controller.signal.aborted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }

        console.error("[Popup] Erro ao carregar o desconto:", error);
      } finally {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
          requestInProgressRef.current = false;

          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      }
    };

    const handleLogin = (): void => {
      if (localStorage.getItem(TRIGGER_KEY) !== "true") {
        return;
      }

      if (isAdminUser()) {
        localStorage.removeItem(TRIGGER_KEY);
        setIsOpen(false);
        return;
      }

      if (!localStorage.getItem("token")) {
        console.warn(
          "[Popup] Login detectado, mas o token ainda não está disponível.",
        );
        return;
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      localStorage.removeItem(TRIGGER_KEY);

      timeoutId = setTimeout(() => {
        timeoutId = null;
        void loadDiscount();
      }, 1000);
    };

    window.addEventListener(LOGIN_EVENT, handleLogin);

    handleLogin();

    return () => {
      mountedRef.current = false;

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
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
  };

  const handleDialogClose = (): void => {
    setIsOpen(false);
  };

  const handleCopyCoupon = async (): Promise<void> => {
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
