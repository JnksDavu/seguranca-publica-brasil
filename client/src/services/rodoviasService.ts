import api from "./api";

export interface Rodovia {
  total_mortos: number;
  total_feridos_graves: number;
  total_veiculos: number;
  data_completa: string;
  ano: number;
  nome_mes: string;
  nome_dia_semana: string;
  localidade: string;
  flag_fim_de_semana: boolean;
  municipio: string;
  uf_abrev: string;
  tipo_acidente: string;
  causa_acidente: string;
  categoria_acidente: string;
}

export interface RodoviasFilters {
  ano?: string | number;
  uf?: string;
  categoria_acidente?: string;
  municipio?: string;
  mes?: string;
  semana?: string;
  nome_dia_semana?: string;
  flag_fim_de_semana?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo_acidente?: string;
  causa_acidente?: string;
  page?: number;
  limit?: number;
}
export async function fetchRodovias(filters: RodoviasFilters = {}): Promise<{ rows: Rodovia[]; total: number }> {
  // Ensure we don't send empty strings
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
  );
  const res = await api.get<Rodovia[]>('/rodovias', { params });
  const totalHeader = res.headers ? res.headers['x-total-count'] || res.headers['X-Total-Count'] : undefined;
  const total = totalHeader ? parseInt(String(totalHeader), 10) : (Array.isArray(res.data) ? res.data.length : 0);
  return { rows: res.data, total };
}
