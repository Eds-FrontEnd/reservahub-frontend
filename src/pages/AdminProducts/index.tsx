import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Header from "../../components/Header";
import { useLoading } from "../../contexts/LoadingContext";
import {
  adminProductSchema,
  type AdminProductFormData,
} from "../../schemas/AdminProductsSchema";
import {
  atualizarProdutoAdmin,
  criarProdutoAdmin,
  excluirProdutoAdmin,
  listarPlanosAdmin,
  listarProdutosAdmin,
  enviarImagemProduto,
  type AdminPlan,
  type AdminProduct,
  type AdminProductPage,
} from "../../services/AdminProductsService";

import "./AdminProductsStyles.css";

type ProductFormState = {
  nome: string;
  stock: string;
  modelo_produto: string;
  description: string;
  id_plano: string;
  image_url: string;
};

type FieldErrors = Partial<Record<keyof ProductFormState, string>>;

const INITIAL_FORM: ProductFormState = {
  nome: "",
  stock: "0",
  modelo_produto: "",
  description: "",
  id_plano: "",
  image_url: "",
};

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

/**
 * Importa as imagens locais pelo Vite.
 *
 * O caminho é relativo a este arquivo:
 * src/pages/admin/AdminProducts.tsx
 *
 * Os arquivos em src/assets são processados pelo Vite e não devem
 * ser solicitados diretamente ao backend Spring Boot.
 */
const localProductImages = import.meta.glob<string>(
  "../../assets/images/products/*",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const getLocalProductImage = (imageUrl: string): string | undefined => {
  const normalizedPath = imageUrl.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop();

  if (!fileName) {
    return undefined;
  }

  const imageEntry = Object.entries(localProductImages).find(
    ([path]) => path.split("/").pop() === fileName,
  );

  return imageEntry?.[1];
};

/**
 * Resolve imagens locais do frontend e imagens enviadas ao backend.
 *
 * Exemplos:
 * /src/assets/images/products/09-sub-ph-rog8.webp
 * -> URL processada pelo Vite
 *
 * /uploads/products/arquivo.webp
 * -> URL do backend Spring Boot
 */
const getImageSource = (imageUrl: string): string => {
  const value = imageUrl.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^(data:|blob:)/i.test(value)) {
    return value;
  }

  if (value.includes("assets/images/products/") || !value.startsWith("/")) {
    const localImage = getLocalProductImage(value);

    if (localImage) {
      return localImage;
    }
  }

  if (value.startsWith("http://localhost:8080/uploads/products/")) {
    return value;
  }

  return `${API_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getPlanLabel = (plan: AdminPlan): string => {
  const tipo = plan.tipo.toUpperCase();

  const prazo =
    tipo === "ANUAL" ? "12 meses" : tipo === "MENSAL" ? "Mensal" : plan.tipo;

  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(plan.preco_mensal);

  return `${prazo} — ${price}/mês`;
};

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getDefaultPlanId = (plans: AdminPlan[]): string => {
  return (
    plans.find((plan) => plan.tipo.toUpperCase() === "ANUAL")?.id ??
    plans.find((plan) => plan.tipo.toUpperCase() === "MENSAL")?.id ??
    plans[0]?.id ??
    ""
  );
};

const AdminProducts = () => {
  const { startLoading } = useLoading();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageData, setPageData] = useState<AdminProductPage | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const listController = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  const loadProducts = useCallback(
    async (search: string, page: number, signal?: AbortSignal) => {
      const result = await listarProdutosAdmin(search, page, signal);

      if (signal?.aborted || !mounted.current) {
        return;
      }

      setProducts(result.content);
      setPageData(result);
    },
    [],
  );

  useEffect(() => {
    let ignore = false;
    mounted.current = true;

    const initialize = async () => {
      setLoading(true);
      setError("");

      try {
        const [loadedPlans, loadedPage] = await Promise.all([
          listarPlanosAdmin(),
          listarProdutosAdmin("", 0),
        ]);

        if (ignore || !mounted.current) {
          return;
        }

        setPlans(loadedPlans);
        setProducts(loadedPage.content);
        setPageData(loadedPage);

        setForm((current) => ({
          ...current,
          id_plano: current.id_plano || getDefaultPlanId(loadedPlans),
        }));
      } catch (requestError) {
        if (ignore) {
          return;
        }

        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        if (mounted.current) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar os produtos.",
          );
        }
      } finally {
        if (!ignore && mounted.current) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      ignore = true;
      mounted.current = false;

      if (listController.current) {
        listController.current.abort();
        listController.current = null;
      }
    };
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      ...INITIAL_FORM,
      id_plano: getDefaultPlanId(plans),
    });

    setSelectedImage(null);
    setEditingId(null);
    setFieldErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [plans]);

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setError("");
    setFeedback("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedImage(file);
    setError("");
    setFeedback("");

    if (!file) {
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setSelectedImage(null);
      event.target.value = "";
      setError("Selecione uma imagem PNG, JPEG ou WebP.");
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setSelectedImage(null);
      event.target.value = "";
      setError("A imagem deve ter no máximo 5 MB.");
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    listController.current?.abort();

    const controller = new AbortController();
    listController.current = controller;

    const term = searchInput.trim();

    setActiveSearch(term);
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      await loadProducts(term, 0, controller.signal);
    } catch (requestError) {
      if (
        controller.signal.aborted ||
        (requestError instanceof DOMException &&
          requestError.name === "AbortError")
      ) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível pesquisar os produtos.",
      );
    } finally {
      if (!controller.signal.aborted && mounted.current) {
        setLoading(false);
      }

      if (listController.current === controller) {
        listController.current = null;
      }
    }
  };

  const handlePageChange = async (page: number) => {
    if (loading || !pageData || page < 0 || page >= pageData.totalPages) {
      return;
    }

    listController.current?.abort();

    const controller = new AbortController();
    listController.current = controller;

    setLoading(true);
    setError("");

    try {
      await loadProducts(activeSearch, page, controller.signal);
    } catch (requestError) {
      if (
        controller.signal.aborted ||
        (requestError instanceof DOMException &&
          requestError.name === "AbortError")
      ) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar esta página.",
      );
    } finally {
      if (!controller.signal.aborted && mounted.current) {
        setLoading(false);
      }

      if (listController.current === controller) {
        listController.current = null;
      }
    }
  };

  const handleStartEditing = (product: AdminProduct) => {
    if (submitting || processingId !== null) {
      return;
    }

    setEditingId(product.id);
    setIsFormOpen(true);

    setForm({
      nome: product.nome,
      stock: String(product.stock),
      modelo_produto: product.modelo_produto,
      description: product.description,
      id_plano: product.id_plano,
      image_url: product.image_url,
    });

    setSelectedImage(null);
    setFieldErrors({});
    setError("");
    setFeedback("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    document.getElementById("admin-products-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting || processingId !== null) {
      return;
    }

    setError("");
    setFeedback("");
    setFieldErrors({});

    const initialValidation = adminProductSchema.safeParse({
      ...form,
      stock: form.stock,
      image_url: selectedImage ? "pending" : form.image_url,
    });

    if (!initialValidation.success) {
      const errors = Object.fromEntries(
        initialValidation.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      ) as FieldErrors;

      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    const finishLoading = startLoading();

    try {
      let imageUrl = form.image_url;

      if (selectedImage) {
        const uploadedImage = await enviarImagemProduto(
          selectedImage,
          form.modelo_produto,
        );

        imageUrl = uploadedImage.url;
      }

      const validation = adminProductSchema.safeParse({
        ...form,
        stock: form.stock,
        image_url: imageUrl,
      });

      if (!validation.success) {
        const errors = Object.fromEntries(
          validation.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ) as FieldErrors;

        setFieldErrors(errors);
        return;
      }

      const payload: AdminProductFormData = validation.data;

      if (editingId) {
        await atualizarProdutoAdmin(editingId, payload);
        setFeedback("Produto atualizado com sucesso.");
      } else {
        await criarProdutoAdmin(payload);
        setFeedback("Produto cadastrado com sucesso.");
      }

      resetForm();
      await loadProducts(activeSearch, 0);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      finishLoading();

      if (mounted.current) {
        setSubmitting(false);
      }
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (submitting || processingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o produto "${product.nome}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(product.id);
    setError("");
    setFeedback("");

    const finishLoading = startLoading();

    try {
      await excluirProdutoAdmin(product.id);

      if (editingId === product.id) {
        resetForm();
      }

      setFeedback(`Produto "${product.nome}" excluído com sucesso.`);

      const currentPage = pageData?.number ?? 0;
      const pageToLoad =
        products.length === 1 && currentPage > 0
          ? currentPage - 1
          : currentPage;

      await loadProducts(activeSearch, pageToLoad);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir o produto.",
      );
    } finally {
      finishLoading();

      if (mounted.current) {
        setProcessingId(null);
      }
    }
  };

  return (
    <>
      <Header />

      <main className="admin-products">
        <div className="admin-products__container">
          <header className="admin-products__header">
            <div>
              <h1 className="admin-products__title">Gerenciar produtos</h1>

              <p className="admin-products__description">
                Cadastre, edite, pesquise e gerencie os smartphones disponíveis
                para assinatura.
              </p>
            </div>

            <button
              className="admin-products__button admin-products__button--secondary"
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              disabled={submitting || processingId !== null}
            >
              Novo produto
            </button>
          </header>

          {error && (
            <p
              className="admin-products__alert admin-products__alert--error"
              role="alert"
            >
              {error}
            </p>
          )}

          {feedback && (
            <p
              className="admin-products__alert admin-products__alert--success"
              role="status"
              aria-live="polite"
            >
              {feedback}
            </p>
          )}

          <section
            className="admin-products__form-section"
            id="admin-products-form"
            aria-labelledby="admin-products-form-title"
          >
            <button
              className="admin-products__accordion-trigger"
              id="admin-products-form-title"
              type="button"
              aria-expanded={isFormOpen}
              aria-controls="admin-products-form-content"
              onClick={() => setIsFormOpen((current) => !current)}
            >
              <span className="admin-products__section-title">
                {editingId ? "Editar produto" : "Cadastrar produto"}
              </span>

              <span
                className={`admin-products__accordion-icon${
                  isFormOpen ? " admin-products__accordion-icon--open" : ""
                }`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            <div
              className="admin-products__form-content"
              id="admin-products-form-content"
              hidden={!isFormOpen}
            >
              <p className="admin-products__section-description">
                Os campos marcados com * são obrigatórios.
              </p>

              <form
                className="admin-products__form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="admin-products__field">
                  <label htmlFor="admin-product-name">Nome do produto *</label>

                  <input
                    id="admin-product-name"
                    name="nome"
                    type="text"
                    value={form.nome}
                    onChange={handleInputChange}
                    maxLength={150}
                    required
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.nome)}
                    aria-describedby={
                      fieldErrors.nome ? "admin-product-name-error" : undefined
                    }
                    disabled={submitting}
                  />

                  {fieldErrors.nome && (
                    <span
                      className="admin-products__field-error"
                      id="admin-product-name-error"
                    >
                      {fieldErrors.nome}
                    </span>
                  )}
                </div>

                <div className="admin-products__field">
                  <label htmlFor="admin-product-model">Modelo *</label>

                  <input
                    id="admin-product-model"
                    name="modelo_produto"
                    type="text"
                    value={form.modelo_produto}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.modelo_produto)}
                    aria-describedby={
                      fieldErrors.modelo_produto
                        ? "admin-product-model-error"
                        : undefined
                    }
                    disabled={submitting}
                  />

                  {fieldErrors.modelo_produto && (
                    <span
                      className="admin-products__field-error"
                      id="admin-product-model-error"
                    >
                      {fieldErrors.modelo_produto}
                    </span>
                  )}
                </div>

                <div className="admin-products__field">
                  <label htmlFor="admin-product-stock">Estoque *</label>

                  <input
                    id="admin-product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleInputChange}
                    required
                    aria-invalid={Boolean(fieldErrors.stock)}
                    aria-describedby={
                      fieldErrors.stock
                        ? "admin-product-stock-error"
                        : undefined
                    }
                    disabled={submitting}
                  />

                  {fieldErrors.stock && (
                    <span
                      className="admin-products__field-error"
                      id="admin-product-stock-error"
                    >
                      {fieldErrors.stock}
                    </span>
                  )}
                </div>

                <div className="admin-products__field">
                  <label htmlFor="admin-product-plan">
                    Plano padrão do produto *
                  </label>

                  <select
                    id="admin-product-plan"
                    name="id_plano"
                    value={form.id_plano}
                    onChange={handleInputChange}
                    required
                    aria-invalid={Boolean(fieldErrors.id_plano)}
                    aria-describedby={
                      fieldErrors.id_plano
                        ? "admin-product-plan-error"
                        : undefined
                    }
                    disabled={submitting || plans.length === 0}
                  >
                    <option value="">Selecione um plano</option>

                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {getPlanLabel(plan)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.id_plano && (
                    <span
                      className="admin-products__field-error"
                      id="admin-product-plan-error"
                    >
                      {fieldErrors.id_plano}
                    </span>
                  )}

                  <span className="admin-products__field-help">
                    O plano anual de 12 meses é selecionado por padrão. Você
                    pode escolher o mensal.
                  </span>
                </div>

                <div className="admin-products__field admin-products__field--full">
                  <label htmlFor="admin-product-description">Descrição *</label>

                  <textarea
                    id="admin-product-description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={
                      fieldErrors.description
                        ? "admin-product-description-error"
                        : undefined
                    }
                    disabled={submitting}
                  />

                  {fieldErrors.description && (
                    <span
                      className="admin-products__field-error"
                      id="admin-product-description-error"
                    >
                      {fieldErrors.description}
                    </span>
                  )}
                </div>

                <div className="admin-products__field admin-products__field--full">
                  <label htmlFor="admin-product-image">Imagem do produto</label>

                  <input
                    ref={fileInputRef}
                    id="admin-product-image"
                    name="imagem"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    aria-describedby="admin-product-image-help"
                    disabled={submitting}
                  />

                  <span
                    className="admin-products__field-help"
                    id="admin-product-image-help"
                  >
                    Formatos aceitos: PNG, JPEG e WebP. Tamanho máximo: 5 MB.
                    {editingId &&
                      " Se não selecionar uma nova imagem, a imagem atual será mantida."}
                  </span>

                  {form.image_url && (
                    <div className="admin-products__image-preview">
                      <img
                        src={getImageSource(form.image_url)}
                        alt={`Imagem atual de ${form.nome || "produto"}`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />

                      <span>
                        {selectedImage
                          ? `Nova imagem: ${selectedImage.name}`
                          : "Imagem atual"}
                      </span>
                    </div>
                  )}

                  {selectedImage && !form.image_url && (
                    <p className="admin-products__field-help">
                      Nova imagem selecionada: {selectedImage.name}
                    </p>
                  )}
                </div>

                <div className="admin-products__form-actions">
                  {editingId && (
                    <button
                      className="admin-products__button admin-products__button--secondary"
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancelar edição
                    </button>
                  )}

                  <button
                    className="admin-products__button admin-products__button--primary"
                    type="submit"
                    disabled={submitting || plans.length === 0}
                  >
                    {submitting
                      ? "Salvando..."
                      : editingId
                        ? "Salvar alterações"
                        : "Cadastrar produto"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section
            className="admin-products__list-section"
            aria-labelledby="admin-products-list-title"
          >
            <div className="admin-products__list-header">
              <div>
                <h2
                  className="admin-products__section-title"
                  id="admin-products-list-title"
                >
                  Produtos cadastrados
                </h2>

                <p className="admin-products__section-description">
                  {pageData
                    ? `${pageData.totalElements} produto(s) encontrado(s).`
                    : "Consulte os produtos cadastrados."}
                </p>
              </div>
            </div>

            <form
              className="admin-products__search"
              onSubmit={handleSearch}
              role="search"
            >
              <div className="admin-products__field">
                <label htmlFor="admin-products-search">
                  Pesquisar por nome ou modelo
                </label>

                <input
                  id="admin-products-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Ex.: Galaxy, iPhone..."
                  autoComplete="off"
                />
              </div>

              <button
                className="admin-products__button admin-products__button--primary"
                type="submit"
                disabled={loading}
              >
                Pesquisar
              </button>
            </form>

            {loading ? (
              <p className="admin-products__message" role="status">
                Carregando produtos...
              </p>
            ) : products.length === 0 ? (
              <p className="admin-products__message">
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="admin-products__table-wrapper">
                <table className="admin-products__table">
                  <caption className="admin-products__caption">
                    Produtos e informações de estoque, plano e preço mensal.
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Imagem</th>
                      <th scope="col">Produto</th>
                      <th scope="col">Modelo</th>
                      <th scope="col">Estoque</th>
                      <th scope="col">Plano</th>
                      <th scope="col">Preço mensal</th>
                      <th scope="col">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td data-label="Imagem">
                          <img
                            className="admin-products__table-image"
                            src={getImageSource(product.image_url)}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </td>

                        <td data-label="Produto">
                          <span className="admin-products__product-name">
                            {product.nome}
                          </span>

                          <span className="admin-products__product-id">
                            {product.id}
                          </span>
                        </td>

                        <td data-label="Modelo">{product.modelo_produto}</td>

                        <td data-label="Estoque">
                          <span
                            className={`admin-products__stock ${
                              product.stock > 0
                                ? "admin-products__stock--available"
                                : "admin-products__stock--empty"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td data-label="Plano">
                          {product.plano.toUpperCase() === "ANUAL"
                            ? "12 meses"
                            : product.plano.toUpperCase() === "MENSAL"
                              ? "Mensal"
                              : product.plano}
                        </td>

                        <td data-label="Preço mensal">
                          {formatPrice(product.preco_mensal)}
                        </td>

                        <td
                          className="admin-products__actions"
                          data-label="Ações"
                        >
                          <button
                            className="admin-products__button admin-products__button--small admin-products__button--secondary"
                            type="button"
                            onClick={() => handleStartEditing(product)}
                            disabled={submitting || processingId !== null}
                            aria-label={`Editar ${product.nome}`}
                          >
                            Editar
                          </button>

                          <button
                            className="admin-products__button admin-products__button--small admin-products__button--danger"
                            type="button"
                            onClick={() => void handleDelete(product)}
                            disabled={submitting || processingId !== null}
                            aria-label={`Excluir ${product.nome}`}
                          >
                            {processingId === product.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pageData && pageData.totalPages > 1 && (
              <nav
                className="admin-products__pagination"
                aria-label="Paginação de produtos"
              >
                <button
                  className="admin-products__button admin-products__button--secondary"
                  type="button"
                  onClick={() => void handlePageChange(pageData.number - 1)}
                  disabled={loading || pageData.first}
                >
                  Anterior
                </button>

                <span aria-live="polite">
                  Página {pageData.number + 1} de {pageData.totalPages}
                </span>

                <button
                  className="admin-products__button admin-products__button--secondary"
                  type="button"
                  onClick={() => void handlePageChange(pageData.number + 1)}
                  disabled={loading || pageData.last}
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default AdminProducts;
