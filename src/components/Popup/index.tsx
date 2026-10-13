import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import axios from "axios";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import {
  generateCoupon,
  getDiscountByState,
} from "../../services/DiscountService";
import { fetchCepData } from "../../services/ViaCepService";

import "./PopupStyle.css";

import { Loyalty } from "@mui/icons-material";
import { Button } from "../Button";

interface DiscountResult {
  cep: string;
  city: string;
  state: string;
  region: string;
  discount: number;
  coupon: string;
}

const STORAGE_KEY = "reservahub-exit-discount-shown";
const POPUP_DELAY = 2500;

const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return digits;
};

function Popup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let alreadyShown = false;

    try {
      alreadyShown = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      alreadyShown = false;
    }

    if (alreadyShown) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        setIsOpen(true);
        return;
      }

      setIsOpen(true);
    }, POPUP_DELAY);

    return () => {
      window.clearTimeout(timer);
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

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
    };
  }, []);

  const handleClose = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    setIsLoading(false);
    setIsOpen(false);
  };

  const handleDialogClose = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    setIsLoading(false);
    setIsOpen(false);
  };

  const handleCepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(event.target.value));
    setError("");
    setResult(null);
    setCopyMessage("");
    setShowResult(false);
  };

  const handleCopyCoupon = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.coupon);
      setCopyMessage("Cupom copiado com sucesso!");
    } catch {
      setCopyMessage(
        "Não foi possível copiar automaticamente. Tente novamente pelo navegador.",
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCep = cep.replace(/\D/g, "");

    if (!/^\d{8}$/.test(normalizedCep)) {
      setError("Informe um CEP válido com 8 dígitos.");
      setResult(null);
      setShowResult(false);
      setCopyMessage("");
      return;
    }

    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setIsLoading(true);
    setError("");
    setResult(null);
    setCopyMessage("");
    setShowResult(false);

    try {
      const data = await fetchCepData(normalizedCep, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      if (data.erro || !data.localidade || !data.uf) {
        setError("CEP não encontrado. Confira os números e tente novamente.");
        return;
      }

      const discount = getDiscountByState(data.uf);

      setResult({
        cep: formatCep(data.cep || normalizedCep),
        city: data.localidade,
        state: data.uf,
        region: data.regiao || "Brasil",
        discount,
        coupon: generateCoupon(discount),
      });

      setShowResult(true);
    } catch (caughtError: unknown) {
      if (controller.signal.aborted || axios.isCancel(caughtError)) {
        return;
      }

      setError(
        axios.isAxiosError(caughtError) && caughtError.code === "ECONNABORTED"
          ? "A consulta demorou demais. Tente novamente."
          : "Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.",
      );
    } finally {
      if (!controller.signal.aborted) {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }

        setIsLoading(false);
      }
    }
  };

  const handleNewSearch = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    setIsLoading(false);
    setShowResult(false);
    setResult(null);
    setCopyMessage("");
    setError("");
  };

  return (
    <dialog
      ref={dialogRef}
      className="exit-discount__dialog"
      aria-labelledby={
        showResult ? "exit-discount-result-title" : "exit-discount-title"
      }
      aria-describedby={showResult ? undefined : "exit-discount-description"}
      onClose={handleDialogClose}
    >
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

        {!showResult && (
          <>
            <header className="exit-discount__header">
              <div className="exit-discount__icon">
                <Loyalty aria-hidden="true" sx={{ fontSize: 72 }} />
              </div>
              <h1 className="exit-discount__eyebrow">UMA SURPRESA PARA VOCÊ</h1>
              <p
                className="exit-discount__description"
                id="exit-discount-description"
              >
                Consulte seu CEP e descubra um cupom de desconto especial para
                sua região.
              </p>
            </header>

            <form
              className="exit-discount__form"
              onSubmit={handleSubmit}
              aria-busy={isLoading}
            >
              <div className="exit-discount__field">
                <label htmlFor="exit-discount-cep">Digite seu CEP</label>

                <input
                  id="exit-discount-cep"
                  className="exit-discount__input"
                  name="cep"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "exit-discount-error" : undefined}
                />
              </div>

              {error && (
                <p
                  className="exit-discount__error"
                  id="exit-discount-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button
                className="exit-discount__submit"
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                loadingText="Consultando CEP..."
                hoverBackgroundColor="var(--color-secondary)"
                fullWidth
              >
                Buscar desconto
              </Button>
            </form>
          </>
        )}

        {showResult && result && (
          <section
            className="exit-discount__result"
            aria-labelledby="exit-discount-result-title"
          >
            <button
              className="exit-discount__back"
              type="button"
              onClick={handleNewSearch}
              aria-label="Voltar para consultar outro CEP"
            >
              <ArrowBackIcon
                className="exit-discount__back-icon"
                aria-hidden="true"
              />
              <span>Nova consulta</span>
            </button>

            <h2
              className="exit-discount__result-title"
              id="exit-discount-result-title"
            >
              Seu resultado
            </h2>

            <p className="exit-discount__location">
              <LocationOnIcon
                className="exit-discount__location-icon"
                aria-hidden="true"
              />
              {result.city} - {result.state}
            </p>

            <p className="exit-discount__region">Região: {result.region}</p>

            <p className="exit-discount__result-description">
              Cupom de desconto para o CEP {result.cep}:
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

            <p className="exit-discount__discount">
              Parabéns!! Você ganhou {result.discount}% de desconto!
            </p>

            <footer className="exit-discount__footer">
              <p className="exit-discount__disclaimer">
                Use esse cupom no carrinho e obtenha desconto no plano da sua
                assinatura!
              </p>
            </footer>
          </section>
        )}
      </section>
    </dialog>
  );
}

export default Popup;
