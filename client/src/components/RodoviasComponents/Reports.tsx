import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FileText, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Rodovia } from '../../services/rodoviasService';
import api from '../../services/api';

interface ReportsProps {
  pagedData: Rodovia[];
  totalCount: number;
  loading: boolean;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onChangePageSize: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onExportAll: (format: 'csv' | 'json') => void;
  exportLoading: boolean;
  exportProgress: { fetched: number; pages: number };
  buildFiltersForRequest: () => any;
}

export function Reports({
  pagedData,
  totalCount,
  loading,
  pageSize,
  currentPage,
  totalPages,
  onChangePageSize,
  onPrevPage,
  onNextPage,
  onExportAll,
  exportLoading,
  exportProgress,
  buildFiltersForRequest,
}: ReportsProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const exportBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  React.useEffect(() => {
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
      <Card className="border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900">Relatório Completo - Rodovias</CardTitle>
        </CardHeader>
        <CardContent>
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
                <div className="ml-2 flex items-center" title="O botão Exportar irá baixar todos os registros que correspondem aos filtros; a tabela abaixo está limitada aos primeiros 10.000 registros para manter a UI responsiva.">
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

          <div className="relative overflow-auto rounded-lg border border-blue-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900 font-bold">Data</TableHead>
                  <TableHead className="text-blue-900 font-bold">Dia Semana</TableHead>
                  <TableHead className="text-blue-900 font-bold">Localidade</TableHead>
                  <TableHead className="text-blue-900 font-bold">Tipo</TableHead>
                  <TableHead className="text-blue-900 font-bold">Categoria</TableHead>
                  <TableHead className="text-blue-900 font-bold">Causa</TableHead>
                  <TableHead className="text-blue-900 font-bold">Mortos</TableHead>
                  <TableHead className="text-blue-900 font-bold">Feridos</TableHead>
                  <TableHead className="text-blue-900 font-bold">Feridos Graves</TableHead>
                  <TableHead className="text-blue-900 font-bold">Feridos Leves</TableHead>
                  <TableHead className="text-blue-900 font-bold">Tipo Veículo</TableHead>
                  <TableHead className="text-blue-900 font-bold">Modelo Veículo</TableHead>
                  <TableHead className="text-blue-900 font-bold">Marcas</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-gray-500 py-8">
                      Nenhum dado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedData.map((item, i) => (
                    <TableRow key={i} className="hover:bg-blue-50 border-b border-blue-100">
                      <TableCell className="text-sm">{item.data_completa}</TableCell>
                      <TableCell className="text-sm">{item.nome_dia_semana}</TableCell>
                      <TableCell className="text-sm">{item.localidade}</TableCell>
                      <TableCell className="text-sm">{item.tipo_acidente}</TableCell>
                      <TableCell className="text-sm">{item.categoria_acidente}</TableCell>
                      <TableCell className="text-sm">{item.causa_acidente}</TableCell>
                      <TableCell className="text-sm text-center font-semibold text-red-600">{item.total_mortos}</TableCell>
                      <TableCell className="text-sm text-center font-semibold text-yellow-600">{item.total_feridos}</TableCell>
                      <TableCell className="text-sm text-center">{item.total_feridos_graves}</TableCell>
                      <TableCell className="text-sm text-center">{item.total_feridos_leves}</TableCell>
                      <TableCell className="text-sm">{item.tipo_veiculo}</TableCell>
                      <TableCell className="text-sm">{item.modelo_veiculo}</TableCell>
                      <TableCell className="text-sm">{item.marcas}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

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
        </CardContent>
      </Card>
    </motion.div>
  );
}
