import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FileText, Info } from 'lucide-react';

export type ExportFormat = 'csv' | 'json';

export interface Column<Row> {
  header: string;
  render: (row: Row) => React.ReactNode;
  className?: string;
}

export interface ReportsProps<Row> {
  // Table data + pagination
  pagedData: Row[];
  totalCount: number;
  loading: boolean;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onChangePageSize: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;

  columns: Column<Row>[];
  rowKey: (row: Row, index: number) => React.Key;

  onExportAll: (format: ExportFormat) => void;
  exportLoading?: boolean;
  exportProgress?: { fetched: number; pages: number };

  exportInfoTitle?: string;
}

export default function Reports<Row>({
  pagedData,
  totalCount,
  loading,
  pageSize,
  currentPage,
  totalPages,
  onChangePageSize,
  onPrevPage,
  onNextPage,
  columns,
  rowKey,
  onExportAll,
  exportLoading = false,
  exportProgress = { fetched: 0, pages: 0 },
  exportInfoTitle = 'O botão Exportar irá baixar todos os registros que correspondem aos filtros; a tabela abaixo pode estar limitada para manter a UI responsiva.'
}: ReportsProps<Row>) {
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const exportBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!exportMenuOpen || !exportBtnRef.current) return;

    const menuWidth = 176;
    const updatePosition = () => {
      const rect = exportBtnRef.current!.getBoundingClientRect();
      const top = rect.bottom + 8;
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
      if (left < 8) left = 8;
      setMenuStyle({ position: 'fixed', top: `${top}px`, left: `${left}px`, width: `${menuWidth}px`, zIndex: 9999 });
    };

    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (exportBtnRef.current && exportBtnRef.current.contains(target)) return;
      setExportMenuOpen(false);
    };

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('mousedown', onDocClick);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [exportMenuOpen]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="border-blue-100 shadow-lg bg-white rounded-xl">
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-700 font-medium">Linhas por página:</label>
              <select
                value={pageSize}
                onChange={(e) => onChangePageSize(Number(e.target.value))}
                className="border border-blue-200 rounded px-3 py-2 text-sm bg-white hover:border-blue-300 transition"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={500}>500</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <button
                  ref={exportBtnRef}
                  onClick={() => setExportMenuOpen((s) => !s)}
                  disabled={exportLoading}
                  className={`flex items-center gap-2 mb-3 px-4 py-2 rounded shadow transition ${
                    exportLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Exportar</span>
                  <span className="ml-1 text-xs">▾</span>
                </button>
                <div className="ml-2 flex items-center" title={exportInfoTitle}>
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                {exportLoading && (
                  <div className="text-sm text-gray-600">Exportando... {exportProgress.fetched} registros ({exportProgress.pages} páginas)</div>
                )}
              </div>

              {exportMenuOpen && exportBtnRef.current && createPortal(
                <div
                  ref={menuRef}
                  style={menuStyle}
                  className="bg-white border border-blue-200 rounded shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onExportAll('csv');
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-blue-100 transition"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      onExportAll('json');
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition"
                  >
                    JSON
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>

        {/* Top pagination controls */}
        <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-700 font-medium">Página {currentPage} de {totalPages} — {totalCount.toLocaleString('pt-BR')} registros filtrados</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
            >
              Anterior
            </button>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
            >
              Próximo
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto rounded-lg border border-blue-100">
          <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.header}
                    title={c.header} // mostra o título completo no tooltip
                    className={`px-2 py-2 text-left font-semibold text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis ${c.className ?? ''}`}
                    style={{ maxWidth: 180 }} // ajuste conforme necessário ou torne dinâmico
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-gray-500 py-8">
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                pagedData.map((row, i) => (
                  <tr key={rowKey(row, i) ?? i} className="hover:bg-blue-50 border-b border-blue-100 odd:bg-white even:bg-blue-50/40">
                    {columns.map((c, ci) => (
                      <td
                        key={ci}
                        className={`px-2 py-1 ${c.className ?? ''} whitespace-nowrap overflow-hidden text-ellipsis`}
                        style={{ maxWidth: 180 }}
                        title={(() => {
                          const content = c.render(row);
                          return typeof content === 'string' ? content : undefined;
                        })()}
                      >
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Carregando...</div>
            </div>
          )}
        </div>

        {/* Bottom pagination controls */}
        <div className="flex items-center justify-between mt-4 bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-700 font-medium">Página {currentPage} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
            >
              Anterior
            </button>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
