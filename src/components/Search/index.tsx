import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";

import mockSmartphones from "../../data/mock-smartphones.json";

import { useAuth } from "../../contexts/AutContext";

import "./SearchStyle.css";

interface SmartphoneSubscriptionItem {
  id: string;
  product: string;
  quantity: number;
  stock: number;
  description: string;
  model: string;
  image: string;
  monthlyPrice: number;
  planType: string;
  benefits: string[];
}

interface SearchProps {
  open: boolean;
  onClose: () => void;
}

const Search: React.FC<SearchProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const smartphones = mockSmartphones as SmartphoneSubscriptionItem[];

  const filteredSmartphones = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return smartphones
      .filter((smartphone) => {
        const searchableText = [
          smartphone.product,
          smartphone.model,
          smartphone.description,
          smartphone.planType,
          ...smartphone.benefits,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .slice(0, 5);
  }, [searchTerm, smartphones]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleSearch = () => {
    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      searchInputRef.current?.focus();
      return;
    }

    onClose();

    navigate(`/smartphones?search=${encodeURIComponent(normalizedSearch)}`);
  };

  const handleViewProduct = (id: string) => {
    onClose();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(`/smartphones/${id}`);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        <header className="search-modal__header">
          <h2 id="search-modal-title">Pesquisar smartphone</h2>

          <button
            type="button"
            className="search-modal__close"
            onClick={onClose}
            aria-label="Fechar pesquisa"
          >
            ×
          </button>
        </header>

        <form
          className="search-form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <TextField
            inputRef={searchInputRef}
            fullWidth
            label="Pesquisar"
            placeholder="Digite o nome ou modelo"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            variant="outlined"
            size="small"
            autoComplete="off"
            slotProps={{
              htmlInput: {
                "aria-label": "Pesquisar smartphones",
              },
            }}
          />

          <button
            type="submit"
            className="search-form__button"
            aria-label="Buscar smartphone"
          >
            Buscar
          </button>
        </form>

        <div
          className="search-results"
          aria-live="polite"
          aria-label="Resultados da pesquisa"
        >
          {searchTerm.trim() && filteredSmartphones.length > 0 && (
            <>
              <h3 className="search-results__title">Resultados encontrados</h3>

              <ul className="search-results__list">
                {filteredSmartphones.map((smartphone) => (
                  <li className="search-results__item" key={smartphone.id}>
                    <div className="search-results__image">
                      <img
                        src={smartphone.image}
                        alt={smartphone.product}
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="search-results__info">
                      <strong>{smartphone.product}</strong>

                      <span>{smartphone.model}</span>
                    </div>

                    <button
                      type="button"
                      className="search-results__view"
                      onClick={() => handleViewProduct(smartphone.id)}
                      aria-label={
                        isAuthenticated
                          ? `Ver ${smartphone.product}`
                          : `Entre ou crie a conta para ver ${smartphone.product}`
                      }
                    >
                      {isAuthenticated
                        ? "Ver"
                        : "Entre ou crie a conta para ver"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {searchTerm.trim() && filteredSmartphones.length === 0 && (
            <p className="search-results__empty">
              Nenhum smartphone encontrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Search;
