import api from "./api";

export interface Rodovia {
  total_mortos: number;
  total_feridos_graves: number;
  total_veiculos: number;
  data_completa: string;
  ano: number;
  nome_mes: string;
  nome_dia_semana: string;
  flag_fim_de_semana: boolean;
  municipio: string;
  uf: string;
  tipo_acidente: string;
  causa_acidente: string;
  categoria_acidente: string;
}

export interface RodoviasFilters {
  ano?: number;
  uf?: string;
  categoria_acidente?: string;
  municipio?: string;
  mes?: string;
  nome_dia_semana?: string;
  flag_fim_de_semana?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo_acidente?: string;
  causa_acidente?: string;
}

export async function fetchRodovias(filters: RodoviasFilters = {}): Promise<Rodovia[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
  );
  const res = await api.get<Rodovia[]>("/rodovias", { params });
  return res.data;
}
