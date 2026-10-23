import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";
import {
  buscarAdminGraphic,
  formatarDataHora,
  formatarMes,
  formatarMoeda,
  type AdminGraphicResumo,
} from "../../services/AdminGraphicService";

import "./AdminGraphicStyle.css";

const ANO_ATUAL = new Date().getFullYear();

const ANOS_DISPONIVEIS = Array.from(
  { length: 7 },
  (_, index) => ANO_ATUAL - index,
);

function AdminGraphic() {
  const [ano, setAno] = useState(ANO_ATUAL);
  const [dados, setDados] = useState<AdminGraphicResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const carregarDados = async () => {
      setLoading(true);
      setError("");

      try {
        const resultado = await buscarAdminGraphic(ano, controller.signal);

        if (!controller.signal.aborted) {
          setDados(resultado);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Ocorreu um erro ao carregar os dados.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void carregarDados();

    return () => controller.abort();
  }, [ano, atualizacao]);

  const meses = useMemo(() => dados?.faturamentoPorMes ?? [], [dados]);

  const maiorFaturamento = Math.max(
    1,
    ...meses.map((mes) =>
      Math.max(mes.faturamentoMensal, mes.faturamentoAnual),
    ),
  );

  const maiorQuantidade = Math.max(
    1,
    ...meses.map((mes) => Math.max(mes.quantidadeMensal, mes.quantidadeAnual)),
  );

  return (
    <>
      <Header />

      <main className="admin-graphic">
        <div className="admin-graphic__container">
          <header className="admin-graphic__header">
            <div>
              <h1 className="admin-graphic__title">Relatório de vendas</h1>

              <p className="admin-graphic__description">
                Acompanhe as quantidades vendidas e o faturamento por
                modalidade.
              </p>
            </div>

            <div className="admin-graphic__toolbar">
              <label
                className="admin-graphic__filter"
                htmlFor="admin-graphic-year"
              >
                <select
                  id="admin-graphic-year"
                  aria-label="Selecionar ano"
                  value={ano}
                  onChange={(event) => setAno(Number(event.target.value))}
                  disabled={loading}
                >
                  {ANOS_DISPONIVEIS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="admin-graphic__button"
                type="button"
                onClick={() => setAtualizacao((current) => current + 1)}
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </header>

          {error && (
            <div className="admin-graphic__alert" role="alert">
              {error}
            </div>
          )}

          {loading && !dados ? (
            <p className="admin-graphic__message" role="status">
              Carregando relatório de vendas...
            </p>
          ) : dados ? (
            <>
              <section
                className="admin-graphic__summary"
                aria-label="Resumo de vendas"
              >
                <article className="admin-graphic__summary-card">
                  <span className="admin-graphic__summary-label">
                    Faturamento do ano
                  </span>

                  <strong className="admin-graphic__summary-value">
                    {formatarMoeda(dados.faturamentoTotal)}
                  </strong>
                </article>

                <article className="admin-graphic__summary-card">
                  <span className="admin-graphic__summary-label">
                    Registros de itens
                  </span>

                  <strong className="admin-graphic__summary-value">
                    {dados.totalRegistros}
                  </strong>
                </article>

                <article className="admin-graphic__summary-card">
                  <span className="admin-graphic__summary-label">
                    Unidades vendidas
                  </span>

                  <strong className="admin-graphic__summary-value">
                    {dados.totalUnidades}
                  </strong>
                </article>

                <article className="admin-graphic__summary-card">
                  <span className="admin-graphic__summary-label">
                    Unidades de plano mensal
                  </span>

                  <strong className="admin-graphic__summary-value">
                    {dados.planosMensais}
                  </strong>
                </article>

                <article className="admin-graphic__summary-card">
                  <span className="admin-graphic__summary-label">
                    Unidades de plano anual
                  </span>

                  <strong className="admin-graphic__summary-value">
                    {dados.planosAnuais}
                  </strong>
                </article>
              </section>

              <section
                className="admin-graphic__panel"
                aria-labelledby="admin-graphic-revenue-title"
              >
                <div className="admin-graphic__panel-header">
                  <div>
                    <h2
                      className="admin-graphic__subtitle"
                      id="admin-graphic-revenue-title"
                    >
                      Faturamento por mês e modalidade
                    </h2>

                    <p className="admin-graphic__hint">
                      Valores das compras registradas em cada mês, separados por
                      plano mensal e anual.
                    </p>
                  </div>
                </div>

                <div
                  className="admin-graphic__legend"
                  aria-label="Legenda do gráfico"
                >
                  <span>
                    <i className="admin-graphic__legend-dot admin-graphic__legend-dot--monthly" />
                    Mensal
                  </span>

                  <span>
                    <i className="admin-graphic__legend-dot admin-graphic__legend-dot--annual" />
                    Anual
                  </span>
                </div>

                <div
                  className="admin-graphic__chart"
                  role="img"
                  aria-label={`Faturamento mensal e anual por mês em ${ano}`}
                >
                  {meses.map((mes) => (
                    <div className="admin-graphic__chart-column" key={mes.mes}>
                      <div className="admin-graphic__chart-bars">
                        <div className="admin-graphic__chart-series">
                          <span className="admin-graphic__chart-value">
                            {formatarMoeda(mes.faturamentoMensal)}
                          </span>

                          <div className="admin-graphic__chart-track">
                            <div
                              className="admin-graphic__chart-bar admin-graphic__chart-bar--monthly"
                              style={{
                                height: `${
                                  mes.faturamentoMensal > 0
                                    ? Math.max(
                                        2,
                                        (mes.faturamentoMensal /
                                          maiorFaturamento) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                              title={`${formatarMes(mes.mes)} — mensal: ${formatarMoeda(mes.faturamentoMensal)}`}
                            />
                          </div>
                        </div>

                        <div className="admin-graphic__chart-series">
                          <span className="admin-graphic__chart-value">
                            {formatarMoeda(mes.faturamentoAnual)}
                          </span>

                          <div className="admin-graphic__chart-track">
                            <div
                              className="admin-graphic__chart-bar admin-graphic__chart-bar--annual"
                              style={{
                                height: `${
                                  mes.faturamentoAnual > 0
                                    ? Math.max(
                                        2,
                                        (mes.faturamentoAnual /
                                          maiorFaturamento) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                              title={`${formatarMes(mes.mes)} — anual: ${formatarMoeda(mes.faturamentoAnual)}`}
                            />
                          </div>
                        </div>
                      </div>

                      <span className="admin-graphic__chart-label">
                        {formatarMes(mes.mes)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="admin-graphic__panel"
                aria-labelledby="admin-graphic-quantity-title"
              >
                <h2
                  className="admin-graphic__subtitle"
                  id="admin-graphic-quantity-title"
                >
                  Quantidade de unidades vendidas por mês
                </h2>

                <div
                  className="admin-graphic__legend"
                  aria-label="Legenda do gráfico"
                >
                  <span>
                    <i className="admin-graphic__legend-dot admin-graphic__legend-dot--monthly" />
                    Mensal
                  </span>

                  <span>
                    <i className="admin-graphic__legend-dot admin-graphic__legend-dot--annual" />
                    Anual
                  </span>
                </div>

                <div
                  className="admin-graphic__chart admin-graphic__chart--quantity"
                  role="img"
                  aria-label={`Quantidade de unidades de planos mensais e anuais por mês em ${ano}`}
                >
                  {meses.map((mes) => (
                    <div className="admin-graphic__chart-column" key={mes.mes}>
                      <div className="admin-graphic__chart-bars">
                        <div className="admin-graphic__chart-series">
                          <span className="admin-graphic__chart-value">
                            {mes.quantidadeMensal}
                          </span>

                          <div className="admin-graphic__chart-track">
                            <div
                              className="admin-graphic__chart-bar admin-graphic__chart-bar--monthly"
                              style={{
                                height: `${
                                  mes.quantidadeMensal > 0
                                    ? Math.max(
                                        2,
                                        (mes.quantidadeMensal /
                                          maiorQuantidade) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                              title={`${formatarMes(mes.mes)} — mensal: ${mes.quantidadeMensal}`}
                            />
                          </div>
                        </div>

                        <div className="admin-graphic__chart-series">
                          <span className="admin-graphic__chart-value">
                            {mes.quantidadeAnual}
                          </span>

                          <div className="admin-graphic__chart-track">
                            <div
                              className="admin-graphic__chart-bar admin-graphic__chart-bar--annual"
                              style={{
                                height: `${
                                  mes.quantidadeAnual > 0
                                    ? Math.max(
                                        2,
                                        (mes.quantidadeAnual /
                                          maiorQuantidade) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                              title={`${formatarMes(mes.mes)} — anual: ${mes.quantidadeAnual}`}
                            />
                          </div>
                        </div>
                      </div>

                      <span className="admin-graphic__chart-label">
                        {formatarMes(mes.mes)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="admin-graphic__panel"
                aria-labelledby="admin-graphic-purchases-title"
              >
                <h2
                  className="admin-graphic__subtitle"
                  id="admin-graphic-purchases-title"
                >
                  Itens registrados no ano
                </h2>

                {dados.compras.length === 0 ? (
                  <p className="admin-graphic__message">
                    Nenhum registro com data de compra em {ano}. Compras antigas
                    sem data não podem ser atribuídas a um mês.
                  </p>
                ) : (
                  <div className="admin-graphic__table-wrapper">
                    <table className="admin-graphic__table">
                      <caption>Itens de compra registrados em {ano}.</caption>

                      <thead>
                        <tr>
                          <th scope="col">Registro</th>
                          <th scope="col">Data e hora</th>
                          <th scope="col">Produto</th>
                          <th scope="col">Plano</th>
                          <th scope="col">Prazo</th>
                          <th scope="col">Quantidade</th>
                          <th scope="col">Valor original</th>
                          <th scope="col">Cupom</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {dados.compras.map((compra) => (
                          <tr key={compra.idDetalhe}>
                            <td data-label="Registro">#{compra.idDetalhe}</td>

                            <td data-label="Data e hora">
                              {formatarDataHora(compra.dataCompra)}
                            </td>

                            <td data-label="Produto">{compra.idProduto}</td>

                            <td data-label="Plano">
                              {compra.tipoPlano === "MENSAL"
                                ? "Mensal"
                                : compra.tipoPlano === "ANUAL"
                                  ? "Anual"
                                  : compra.idPlano}
                            </td>

                            <td data-label="Prazo">
                              {compra.mesesContratados === null
                                ? "Não identificado"
                                : `${compra.mesesContratados} ${
                                    compra.mesesContratados === 1
                                      ? "mês"
                                      : "meses"
                                  }`}
                            </td>

                            <td data-label="Quantidade">{compra.quantidade}</td>

                            <td data-label="Valor original">
                              {formatarMoeda(compra.valorOriginal)}
                            </td>

                            <td data-label="Cupom">
                              {compra.cupomDesconto || "—"}
                            </td>

                            <td data-label="Total">
                              <strong>
                                {formatarMoeda(compra.valorTotal)}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : !loading ? (
            <p className="admin-graphic__message">
              Não foi possível exibir o relatório.
            </p>
          ) : null}
        </div>
      </main>
    </>
  );
}

export default AdminGraphic;
