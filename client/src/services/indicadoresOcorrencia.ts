import api from './api';

export interface IndicadoresOcorrenciasResponse {
  indicadores_gerais: {
    total_registros: number;
    total_ocorrencias: number;
    total_vitimas: number;
    peso_apreendido_total: number;
    vitimas_femininas: number;
    vitimas_masculinas: number;
    vitimas_nao_informadas: number;
    ufs_monitoradas: number;
    municipios_monitorados: number;
    eventos_monitorados: number;
    categorias_monitoradas: number;
  };
  ocorrencias_por_mes: any[];
  ocorrencias_por_categoria: any[];
  ocorrencias_por_evento: any[];
  ocorrencias_por_uf: any[];
  ocorrencias_por_municipio: any[];
  ocorrencias_por_dia_semana: any[];
  ocorrencias_por_trimestre: any[];
  ocorrencias_por_sexo: {
    total_feminino: number;
    total_masculino: number;
    total_nao_informado: number;
  };
}

export async function fetchIndicadoresOcorrencias(params: Record<string, any>): Promise<IndicadoresOcorrenciasResponse> {
    const res = await api.get('/ocorrencias/indicadores', { params });
    return res.data;
  }