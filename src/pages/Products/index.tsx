import React, { useEffect, useState } from "react";
import "./ProductsStyle.css";

import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard, {
  type SmartphoneSubscriptionItem,
} from "../../components/Product/index";
import { Button } from "../../components/Button";
import Modal from "../../components/Modal";
import { SmartphoneService } from "../../services/SmartphoneService";

const ITEMS_PER_PAGE = 4;

export const ProductsPage: React.FC = () => {
  const [smartphones, setSmartphones] = useState<SmartphoneSubscriptionItem[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  const carregarSmartphones = async (page: number) => {
    try {
      setIsLoading(true);

      const data = await SmartphoneService.listarPagina(page, ITEMS_PER_PAGE);

      setSmartphones((prevSmartphones) =>
        page === 0 ? data.produtos : [...prevSmartphones, ...data.produtos],
      );

      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar smartphones:", error);

      if (page === 0) {
        setSmartphones([]);
        setCurrentPage(0);
        setTotalPages(0);
      }

      setModalMessage(
        "Tivemos um problema ao carregar os smartphones. Tente novamente mais tarde ou entre em contato com a nossa equipe para mais informações.",
      );

      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarSmartphones(0);
  }, []);

  const hasMore = currentPage + 1 < totalPages;

  const handleLoadMore = () => {
    if (isLoading || !hasMore) {
      return;
    }

    carregarSmartphones(currentPage + 1);
  };

  return (
    <main className="catalog-container">
      <Header />

      <header className="catalog-header">
        <h1>Clube de Assinatura de Smartphones</h1>
      </header>

      <section className="catalog-grid" aria-label="Lista de Smartphones">
        {smartphones.map((smartphone) => (
          <ProductCard key={smartphone.id} item={smartphone} />
        ))}

        {hasMore && (
          <span className="catalog-button">
            <Tooltip title="Carregar mais produtos" placement="top" arrow>
              <Button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                backgroundColor="var(--color-primary)"
                hoverBackgroundColor="var(--color-secondary)"
              >
                <AddIcon />
              </Button>
            </Tooltip>
          </span>
        )}
      </section>

      <Footer />

      <Modal
        open={modalOpen}
        title="Não foi possível carregar os smartphones"
        message={modalMessage}
        closeUrl="/smartphones"
        onNavigate={() => setModalOpen(false)}
      />
    </main>
  );
};

export default ProductsPage;
