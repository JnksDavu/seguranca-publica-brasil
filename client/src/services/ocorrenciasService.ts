import api from './api';

export interface Ocorrencia {
  id_ocorrencia: string;
  quantidade_ocorrencias: number;
  quantidade_vitimas: number;
  peso_apreendido: number;
  total_feminino: number;
  total_masculino: number;
  total_nao_informado: number;
  data_completa: string;
  ano: number;
  nome_mes: string;
  nome_dia_semana: string;
  flag_fim_de_semana: boolean;
  trimestre_nome: string;
  municipio: string;
  uf_abrev: string;
  cod_municipio: string;
  evento: string;
  categoria_crime: string;
}

export async function fetchOcorrencias(params: Record<string, any>): Promise<any> {
    const res = await api.get('/ocorrencias', { params });
    return res.data; // já retorna {page, limit, total, rows}
  }