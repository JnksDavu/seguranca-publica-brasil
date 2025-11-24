import React from 'react';
import { Ocorrencia } from '../../services/ocorrenciasService';

interface ReportsProps {
  data: Ocorrencia[];
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onChangePageSize: (n: number) => void;
  onExportCsv: () => void;
  exportLoading: boolean;
}

export const Reports: React.FC<ReportsProps> = ({
  data,
  total,
  pageSize,
  currentPage,
  totalPages,
  loading,
  onPrevPage,
  onNextPage,
  onChangePageSize,
  onExportCsv,
  exportLoading
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-700 font-semibold">Relatório de Ocorrências</h3>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => onChangePageSize(parseInt(e.target.value, 10))}
            className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
          >
            {[50, 100, 200, 500].map(s => <option key={s} value={s}>{s} / pág</option>)}
          </select>
          <button
            onClick={onExportCsv}
            disabled={exportLoading || loading || !data.length}
            className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {exportLoading ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        Total registros filtrados: {total.toLocaleString('pt-BR')}
      </div>

      <div className="overflow-x-auto rounded border border-blue-100">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              {[
                'Data','Município','UF','Evento','Categoria',
                'Qtd Ocorrências','Qtd Vítimas','Peso Apreendido',
                'Feminino','Masculino','Não Informado'
              ].map(h => (
                <th key={h} className="px-2 py-2 text-left font-semibold text-blue-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="px-2 py-6 text-center text-blue-600">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={11} className="px-2 py-6 text-center text-gray-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
            {!loading && data.map(o => (
              <tr key={o.id_ocorrencia} className="odd:bg-white even:bg-blue-50/40">
                <td className="px-2 py-1 whitespace-nowrap">{o.data_completa}</td>
                <td className="px-2 py-1">{o.municipio}</td>
                <td className="px-2 py-1">{(o as any).uf_abrev || ''}</td>
                <td className="px-2 py-1">{o.evento}</td>
                <td className="px-2 py-1">{o.categoria_crime}</td>
                <td className="px-2 py-1 text-right">{o.quantidade_ocorrencias}</td>
                <td className="px-2 py-1 text-right">{o.quantidade_vitimas}</td>
                <td className="px-2 py-1 text-right">{o.peso_apreendido}</td>
                <td className="px-2 py-1 text-right">{o.total_feminino}</td>
                <td className="px-2 py-1 text-right">{o.total_masculino}</td>
                <td className="px-2 py-1 text-right">{o.total_nao_informado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded bg-blue-100 text-blue-700 text-sm disabled:opacity-50"
        >Anterior</button>
        <div className="text-sm">
          Página {currentPage} de {totalPages}
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded bg-blue-100 text-blue-700 text-sm disabled:opacity-50"
        >Próxima</button>
      </div>
    </div>
  );
};