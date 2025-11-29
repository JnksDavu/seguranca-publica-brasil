import api from "./api";

export interface Ocorrencia {
        id_ocorrencia: number,

		    quantidade_ocorrencias: number,
		    quantidade_vitimas: number,
		    peso_apreendido: number,
		    
		    total_feminino: number,
		    total_masculino: number,
		    total_nao_informado: number,
		
		    data_formatada: string,
		    data_completa: Date,
		    nome_mes: string,
		    nome_dia_semana: string,
		    flag_fim_de_semana: boolean,
		    trimestre_nome: string,
		    ano: number,
		    
		    municipio: string,
		    uf_abrev: string,
		
		    cod_municipio: string, 
		
		    evento: string, 
		    categoria_crime: string
}


export interface OcorrenciasFilters {
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
  km?: number;
  br?: string;
  delegacia?: string;
  condicao_metereologica?: string;
  tipo_pista?: string;
  fase_dia?: string;

  page?: number;
  limit?: number;
}

export async function fetchOcorrencias(filters: OcorrenciasFilters = {}): Promise<{ rows: Ocorrencia[]; total: number }> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
  );
  const res = await api.get<Ocorrencia[]>('/ocorrencias', { params });
  const totalHeader = res.headers ? res.headers['x-total-count'] || res.headers['X-Total-Count'] : undefined;
  const total = totalHeader ? parseInt(String(totalHeader), 10) : (Array.isArray(res.data) ? res.data.length : 0);
  return { rows: res.data, total };
}
