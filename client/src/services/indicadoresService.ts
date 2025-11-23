import api from "./api";

export interface IndicadoresGerais {
  total_acidentes: number;
  total_mortos: number;
  total_feridos: number;
  total_feridos_graves: number;
  total_feridos_leves: number;
  rodovias_monitoradas: number;
  municipios_monitorados: number;
}

export interface AcidentesPorIdadeSexo {
  mulheres_envolvidas: number;
  homens_envolvidos: number;
  media_idade_feridos: number;
}

export interface AcidentePorMes {
  nome_mes: string;
  total: number;
  mortos: number;
}

export interface AcidentePorCausa {
  causa_acidente: string;
  total: number;
}

export interface AcidentePorTipo {
  tipo_acidente: string;
  total: number;
}

export interface AcidentePorCategoria {
  categoria_acidente: string;
  total: number;
}

export interface AcidentePorUf {
  uf_abrev: string;
  total: number;
  mortos: number;
}

export interface AcidentePorDiaSemana {
  nome_dia_semana: string;
  total: number;
}

export interface AcidentePorCondicaoMeterologica {
  condicao_metereologica: string;
  total: number;
}

export interface AcidentePorMarcas {
  marcas: string;
  total: number;
}

export interface AcidentePorModeloVeiculo {
  modelo_veiculo: string;
  total: number;
}

export interface AcidentePorTipoPista {
  tipo_pista: string;
  total: number;
}

export interface AcidentePorTipoVeiculo {
  tipo_veiculo: string;
  total: number;
}

export interface AcidentePorBr {
  br: string;
  total: number;
}

export interface LocalizacaoAcidente {
  longitude: number;
  latitude: number;
  municipio?: string;
  uf_abrev?: string; // novo campo vindo da query agregada
  total_acidentes: number;
  total_mortos: number;
  total_feridos: number;
  total_feridos_graves: number;
  total_feridos_leves: number;
}

export interface IndicadoresResponse {
  indicadores_gerais: IndicadoresGerais;
  acidentes_por_mes: AcidentePorMes[];
  acidentes_por_causa: AcidentePorCausa[];
  acidentes_por_tipo: AcidentePorTipo[];
  acidentes_por_categoria: AcidentePorCategoria[];
  acidentes_por_uf: AcidentePorUf[];
  acidentes_por_dia_semana: AcidentePorDiaSemana[];
  acidentes_por_condicao_metereologica: AcidentePorCondicaoMeterologica[];
  acidentes_por_marcas: AcidentePorMarcas[];
  acidentes_por_modelo_veiculo: AcidentePorModeloVeiculo[];
  acidentes_por_tipo_pista: AcidentePorTipoPista[];
  acidentes_por_tipo_veiculo: AcidentePorTipoVeiculo[];
  acidentes_por_br: AcidentePorBr[];
  acidentes_por_localizacao: LocalizacaoAcidente[];
  acidentes_por_idade_sexo: AcidentesPorIdadeSexo;
}

export interface IndicadoresFilters {
  ano?: string | number;
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

// Cache para indicadores (5 minutos)
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos
const indicadoresCache = new Map<string, { data: IndicadoresResponse; timestamp: number }>();

/**
 * Gera chave de cache baseada nos filtros
 */
function generateCacheKey(filters: IndicadoresFilters): string {
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = (filters as Record<string, any>)[key];
      return acc;
    }, {});
  return JSON.stringify(sortedFilters);
}

/**
 * Busca indicadores com cache de 5 minutos
 */
export async function fetchIndicadores(filters: IndicadoresFilters = {}): Promise<IndicadoresResponse> {
  // Ensure we don't send empty strings
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
  ) as IndicadoresFilters;

  const cacheKey = generateCacheKey(cleanFilters);
  const now = Date.now();

  // Verificar cache (lazy schema validation)
  const cached = indicadoresCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    const hasMunicipio = Array.isArray(cached.data?.acidentes_por_localizacao) && cached.data.acidentes_por_localizacao.length > 0 && 'municipio' in cached.data.acidentes_por_localizacao[0];
    if (hasMunicipio) {
      console.log('[Cache HIT] Usando indicadores do cache');
      return cached.data;
    } else {
      console.log('[Cache BYPASS] Schema atualizado, refazendo fetch');
    }
  }

  // Requisição ao servidor
  console.log('[Cache MISS] Buscando indicadores do servidor');
  const res = await api.get<IndicadoresResponse>('/rodovias/indicadores', { params: cleanFilters });
  
  // Armazenar no cache
  indicadoresCache.set(cacheKey, {
    data: res.data,
    timestamp: now,
  });

  return res.data;
}

/**
 * Limpa o cache de indicadores
 */
export function clearIndicadoresCache() {
  indicadoresCache.clear();
}

