import api from './api';

export interface IndicadoresGeraisOcorrencias {
  total_registros: number;
  total_ocorrencias: number;
  total_vitimas: number;
  quantidade_mortos: number;
  suicidios: number;
  estupros: number;
  peso_apreendido_total: number;
  vitimas_femininas: number;
  vitimas_masculinas: number;
  vitimas_nao_informadas: number;
  ufs_monitoradas: number;
  municipios_monitorados: number;
  eventos_monitorados: number;
  categorias_monitoradas: number;
}

export interface OcorrenciasPorMes { nome_mes: string; total_ocorrencias: number; total_vitimas: number; }
export interface OcorrenciasPorCategoria { categoria_crime: string; total_ocorrencias: number; total_vitimas: number; }
export interface OcorrenciasPorEvento { evento: string; total_ocorrencias: number; total_vitimas: number; peso_apreendido_total: number; }
export interface OcorrenciasPorUf { uf_abrev: string; total_ocorrencias: number; total_vitimas: number; peso_apreendido_total: number; }
export interface OcorrenciasPorMunicipio { municipio: string; total_ocorrencias: number; total_vitimas: number; }
export interface OcorrenciasPorDiaSemana { nome_dia_semana: string; total_ocorrencias: number; total_vitimas: number; }
export interface OcorrenciasPorTrimestre { trimestre_nome: string; total_ocorrencias: number; total_vitimas: number; }
export interface OcorrenciasPorSexo { total_feminino: number; total_masculino: number; total_nao_informado: number; }


export interface IndicadoresOcorrenciasResponse {
  indicadores_gerais: IndicadoresGeraisOcorrencias;
  ocorrencias_por_mes: OcorrenciasPorMes[];
  ocorrencias_por_categoria: OcorrenciasPorCategoria[];
  ocorrencias_por_evento: OcorrenciasPorEvento[];
  ocorrencias_por_uf: OcorrenciasPorUf[];
  ocorrencias_por_municipio: OcorrenciasPorMunicipio[];
  ocorrencias_por_dia_semana: OcorrenciasPorDiaSemana[];
  ocorrencias_por_trimestre: OcorrenciasPorTrimestre[];
  ocorrencias_por_sexo: OcorrenciasPorSexo;
}

export interface IndicadoresOcorrenciasFilters {
  ano?: string | number;
  uf?: string;
  municipio?: string;
  mes?: string;
  nome_dia_semana?: string;
  flag_fim_de_semana?: string;
  data_inicio?: string;
  data_fim?: string;
  evento?: string;
  categoria_crime?: string;
}

const CACHE_DURATION_MS = 5 * 60 * 1000;
const indicadoresCache = new Map<string, { data: IndicadoresOcorrenciasResponse; timestamp: number }>();

function generateCacheKey(filters: IndicadoresOcorrenciasFilters): string {
  const sorted = Object.keys(filters || {})
    .sort()
    .reduce((acc: Record<string, any>, k) => { acc[k] = (filters as any)[k]; return acc; }, {});
  return JSON.stringify(sorted);
}

export async function fetchIndicadoresOcorrencias(filters: IndicadoresOcorrenciasFilters = {}): Promise<IndicadoresOcorrenciasResponse> {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
  ) as IndicadoresOcorrenciasFilters;

  const cacheKey = generateCacheKey(cleanFilters);
  const now = Date.now();
  const cached = indicadoresCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  const res = await api.get<IndicadoresOcorrenciasResponse>('/ocorrencias/indicadores', { params: cleanFilters });
  indicadoresCache.set(cacheKey, { data: res.data, timestamp: now });
  return res.data;
}

export function clearIndicadoresOcorrenciasCache() {
  indicadoresCache.clear();
}