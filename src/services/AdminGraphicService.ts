export type TipoPlano = "MENSAL" | "ANUAL" | "OUTRO";

export interface AdminGraphicCompra {
  idDetalhe: number;
  quantidade: number;
  idPlano: string;
  idProduto: string;
  mesesContratados: number | null;
  tipoPlano: TipoPlano;
  valorOriginal: number;
  cupomDesconto: string | null;
  valorTotal: number;
  dataCompra: string | null;
}

export interface AdminGraphicMes {
  mes: number;
  quantidadeMensal: number;
  quantidadeAnual: number;
  faturamentoMensal: number;
  faturamentoAnual: number;
  faturamentoTotal: number;
}

export interface AdminGraphicResumo {
  ano: number;
  totalRegistros: number;
  totalUnidades: number;
  planosMensais: number;
  planosAnuais: number;
  faturamentoTotal: number;
  faturamentoPorMes: AdminGraphicMes[];
  compras: AdminGraphicCompra[];
}

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export async function buscarAdminGraphic(
  ano: number,
  signal?: AbortSignal,
): Promise<AdminGraphicResumo> {
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    throw new Error("Selecione um ano válido.");
  }

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente como administrador.");
  }

  const response = await fetch(
    `${API_URL}/api/admin/graphic?ano=${encodeURIComponent(ano)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal,
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Sua sessão expirou ou você não tem permissão para consultar o relatório.",
    );
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dados de vendas.");
  }

  return (await response.json()) as AdminGraphicResumo;
}

export const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export const formatarMes = (mes: number): string => {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(2026, mes - 1, 1)))
    .replace(".", "");
};

export const formatarDataHora = (data: string | null): string => {
  if (!data) {
    return "—";
  }

  const dataNormalizada = data.includes("T") ? data : data.replace(" ", "T");
  const dataValida = new Date(dataNormalizada);

  if (Number.isNaN(dataValida.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(dataValida);
};
