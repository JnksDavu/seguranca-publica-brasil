import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchRodovias, Rodovia } from '../services/rodoviasService';
import api from '../services/api';
import { getCalendario, getLocalidade, getTipoAcidente } from '../services/dimensoesService';
import { motion } from 'motion/react';
import { Car, AlertCircle, TrendingDown, TrendingUp, Navigation, X, Calendar, MapPin,FileText,BarChart2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';

export function Rodovias() {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string[]>([]);
  const [selectedWeekend, setSelectedWeekend] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState<string[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string[]>([]);
  const [selectedTipoAcidente, setSelectedTipoAcidente] = useState<string[]>([]);
  const [selectedCausaAcidente, setSelectedCausaAcidente] = useState<string[]>([]);
  const [selectedCategoriaAcidente, setSelectedCategoriaAcidente] = useState<string[]>([]);

  const [rodovias, setRodovias] = useState<Rodovia[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [serverChunkSize] = useState<number>(10000); // fetch 10k per server request
  const [lastServerPageFetched, setLastServerPageFetched] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // view mode: 'graficos' shows charts + small table; 'relatorio' shows the big paginated report
  const [viewMode, setViewMode] = useState<'graficos' | 'relatorio'>('graficos');

  // pagination for the report (tabelão)
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const exportBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{fetched:number, pages:number}>({ fetched: 0, pages: 0 });

  const [monthOptions, setMonthOptions] = useState<{value:string;label:string}[]>([]);
  const [yearOptions, setYearOptions] = useState<{value:string;label:string}[]>([]);
  const [dayOfWeekOptions, setDayOfWeekOptions] = useState<{value:string;label:string}[]>([]);
  const [weekendOptions, setWeekendOptions] = useState<{value:string;label:string}[]>([{ value: 'true', label: 'Sim' },{ value: 'false', label: 'Não' }]);
  const [ufOptions, setUfOptions] = useState<{value:string;label:string}[]>([]);
  const [municipioOptions, setMunicipioOptions] = useState<{value:string;label:string}[]>([]);
  const [tipoOptions, setTipoOptions] = useState<{value:string;label:string}[]>([]);
  const [causaOptions, setCausaOptions] = useState<{value:string;label:string}[]>([]);
  const [categoriaOptions, setCategoriaOptions] = useState<{value:string;label:string}[]>([]);


  const selectStyles = {
    menuList: (base: any) => ({ ...base, maxHeight: 36 * 5 }), 
  };

  useEffect(() => {
    // initial load: fetch first server chunk (10k) and total count
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setRodovias([]);
      setTotalCount(0);
      setLastServerPageFetched(0);
      const filters = {
        data_inicio: dateStart || undefined,
        data_fim: dateEnd || undefined,
        mes: selectedMonth.map(m => m).join(',') || undefined,
        ano: selectedYear.map(y => y).join(',') || undefined,
        nome_dia_semana: selectedDayOfWeek.map(d => d).join(',') || undefined,
        flag_fim_de_semana: selectedWeekend.map(v => v).join(',') || undefined,
        uf: selectedUF.map(u => u).join(',') || undefined,
        municipio: selectedMunicipio.map(m => m).join(',') || undefined,
        tipo_acidente: selectedTipoAcidente.map(t => t).join(',') || undefined,
        causa_acidente: selectedCausaAcidente.map(c => c).join(',') || undefined,
        categoria_acidente: selectedCategoriaAcidente.map(c => c).join(',') || undefined,
      };
      try {
        const res = await fetchRodovias({ ...filters, page: 1, limit: serverChunkSize } as any);
        if (cancelled) return;
        setRodovias(res.rows || []);
        setTotalCount(res.total || (res.rows ? res.rows.length : 0));
        setLastServerPageFetched(res.rows && res.rows.length ? 1 : 0);
      } catch (err) {
        console.error('Erro ao buscar dados das rodovias', err);
        if (!cancelled) setError('Erro ao buscar dados das rodovias');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [
    dateStart, dateEnd,
    selectedMonth, selectedYear, selectedDayOfWeek, selectedWeekend,
    selectedUF, selectedMunicipio, selectedTipoAcidente, selectedCausaAcidente, selectedCategoriaAcidente,
    serverChunkSize,
  ]);

  useEffect(() => {
    (async () => {
      try {
        const calendario = await getCalendario();
        const monthsSet = new Set();
        const yearsSet = new Set();
        const daysSet = new Set();
        (calendario || []).forEach((c: any) => {
          if (c && c.nome_mes) monthsSet.add(String(c.nome_mes));
          if (c && c.ano !== undefined && c.ano !== null) yearsSet.add(String(c.ano));
          if (c && c.nome_dia_semana) daysSet.add(String(c.nome_dia_semana));
        });
        const months = Array.from(monthsSet).map((m: any) => ({ value: String(m), label: String(m) }));
        const years = Array.from(yearsSet).map((y: any) => String(y)).sort().reverse().map((y: any) => ({ value: String(y), label: String(y) }));
        const days = Array.from(daysSet).map((d: any) => ({ value: String(d), label: String(d) }));
        setMonthOptions(months);
        setYearOptions(years);
        setDayOfWeekOptions(days);

        const local = await getLocalidade();
        const ufsSet = new Set();
        const municipiosSet = new Set();
        (local || []).forEach((l: any) => {
          if (l && l.uf_abrev) ufsSet.add(String(l.uf_abrev));
          if (l && l.municipio) municipiosSet.add(String(l.municipio));
        });
        const ufs = Array.from(ufsSet).map((u: any) => ({ value: String(u), label: String(u) }));
        const municipios = Array.from(municipiosSet).map((m: any) => ({ value: String(m), label: String(m) }));
        setUfOptions(ufs);
        setMunicipioOptions(municipios);

        const tipos = await getTipoAcidente();
        const tipoSet = new Set();
        const causaSet = new Set();
        const categoriaSet = new Set();
        (tipos || []).forEach((t: any) => {
          if (t && t.tipo_acidente) tipoSet.add(String(t.tipo_acidente));
          if (t && t.causa_acidente) causaSet.add(String(t.causa_acidente));
          if (t && t.categoria_acidente) categoriaSet.add(String(t.categoria_acidente));
        });
        const tipoList = Array.from(tipoSet).map((t: any) => ({ value: String(t), label: String(t) }));
        const causaList = Array.from(causaSet).map((c: any) => ({ value: String(c), label: String(c) }));
        const categoriaList = Array.from(categoriaSet).map((c: any) => ({ value: String(c), label: String(c) }));
        setTipoOptions(tipoList);
        setCausaOptions(causaList);
        setCategoriaOptions(categoriaList);
      } catch (err) {
        console.error('Erro ao carregar dimensões', err);
      }
    })();
  }, []);

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setSelectedMonth([]);
    setSelectedYear([]);
    setSelectedDayOfWeek([]);
    setSelectedWeekend([]);
    setSelectedUF([]);
    setSelectedMunicipio([]);
    setSelectedTipoAcidente([]);
    setSelectedCausaAcidente([]);
    setSelectedCategoriaAcidente([]);
  };

  // pagination helpers for the report view (use totalCount for total pages)
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const pagedData = rodovias.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const exportCsv = (rows: Rodovia[], filename?: string) => {
    if (!rows || rows.length === 0) return;
    const headers = ['Data','Ano','Mês','Dia Semana','Município','UF','Tipo','Categoria','Causa','Mortos','Feridos','Veículos'];
    const csvRows = [headers.join(',')];
    rows.forEach((item) => {
      const cols = [
        `"${item.data_completa ?? ''}"`,
        `"${item.ano ?? ''}"`,
        `"${item.nome_mes ?? ''}"`,
        `"${item.nome_dia_semana ?? ''}"`,
        `"${item.municipio ?? ''}"`,
        `"${(item as any).uf_abrev || (item as any).uf || ''}"`,
        `"${item.tipo_acidente ?? ''}"`,
        `"${item.categoria_acidente ?? ''}"`,
        `"${item.causa_acidente ?? ''}"`,
        `"${item.total_mortos ?? ''}"`,
        `"${item.total_feridos_graves ?? ''}"`,
        `"${item.total_veiculos ?? ''}"`,
      ];
      csvRows.push(cols.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = filename || `relatorio_rodovias_${new Date().toISOString()}.csv`;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportJson = (rows: Rodovia[], filename?: string) => {
    if (!rows || rows.length === 0) return;
    const jsonString = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = filename || `relatorio_rodovias_${new Date().toISOString()}.json`;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // XLSX export removed (client-side XLSX can OOM for very large datasets)

  // Build the filters object to send to the backend (same mapping used on initial fetch)
  const buildFiltersForRequest = () => ({
    data_inicio: dateStart || undefined,
    data_fim: dateEnd || undefined,
    mes: selectedMonth.map(m => m).join(',') || undefined,
    ano: selectedYear.map(y => y).join(',') || undefined,
    nome_dia_semana: selectedDayOfWeek.map(d => d).join(',') || undefined,
    flag_fim_de_semana: selectedWeekend.map(v => v).join(',') || undefined,
    uf: selectedUF.map(u => u).join(',') || undefined,
    municipio: selectedMunicipio.map(m => m).join(',') || undefined,
    tipo_acidente: selectedTipoAcidente.map(t => t).join(',') || undefined,
    causa_acidente: selectedCausaAcidente.map(c => c).join(',') || undefined,
    categoria_acidente: selectedCategoriaAcidente.map(c => c).join(',') || undefined,
  });

  // Fetch all pages from backend according to current filters. chunkSize controls how many rows per request.
  const fetchAllFiltered = async (chunkSize = serverChunkSize) : Promise<Rodovia[]> => {
    setExportLoading(true);
    setExportProgress({ fetched: 0, pages: 0 });
    const filtersBase = buildFiltersForRequest();
    const all: Rodovia[] = [];
    let page = 1;
    while (true) {
      try {
        // ask for this page
        // eslint-disable-next-line no-await-in-loop
        const res = await fetchRodovias({ ...filtersBase, page, limit: chunkSize } as any);
        const chunk = res.rows || [];
        if (!chunk || chunk.length === 0) break;
        all.push(...chunk);
        setExportProgress({ fetched: all.length, pages: page });
        if (chunk.length < chunkSize) break; // last page
        page += 1;
        // small pause to avoid hammering DB in tight loops (optional)
        // await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        console.error('Erro enquanto buscava páginas para exportação', err);
        break;
      }
    }
    setExportLoading(false);
    return all;
  };

  // When user navigates pages, ensure we have data loaded (fetch next 10k chunk(s) from server as needed)
  useEffect(() => {
    let cancelled = false;
    const ensureDataForPage = async (pageNum: number) => {
      const requiredIndex = pageNum * pageSize; // we need items up to this index
      try {
        while (!cancelled && rodovias.length < requiredIndex && rodovias.length < totalCount) {
          const nextServerPage = lastServerPageFetched + 1;
          const filters = buildFiltersForRequest();
          const res = await fetchRodovias({ ...filters, page: nextServerPage, limit: serverChunkSize } as any);
          const rows = res.rows || [];
          if (!rows || rows.length === 0) break;
          // append rows
          setRodovias((prev) => {
            // avoid duplicates if concurrent
            const exists = prev.length >= (nextServerPage - 1) * serverChunkSize + rows.length;
            if (exists) return prev;
            return [...prev, ...rows];
          });
          setLastServerPageFetched(nextServerPage);
          // loop will check again whether we have enough
        }
      } catch (err) {
        if (!cancelled) console.error('Erro ao buscar páginas adicionais', err);
      }
    };

    // trigger when page changes
    ensureDataForPage(currentPage);
    return () => { cancelled = true; };
  }, [currentPage, pageSize, rodovias.length, totalCount, lastServerPageFetched]);

  const handleExportAll = async (format: 'csv' | 'json' | 'xlsx') => {
    setExportMenuOpen(false);
    // Prefer server-side CSV streaming to avoid browser OOM
    if (format === 'csv') {
      try {
        setExportLoading(true);
        const filters = buildFiltersForRequest();
        // build query string from filters (only defined values)
        const params = Object.entries(filters)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&');
        // Build absolute backend URL from axios baseURL to avoid dev-server proxy inconsistencies
        const base = (api && (api.defaults && api.defaults.baseURL)) || '';
        const trimmedBase = base.replace(/\/$/, '');
        const url = `${trimmedBase}/rodovias/export${params ? `?${params}` : ''}`;

        // Create an anchor with download attribute and open in a new tab to force saving to disk
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `relatorio_rodovias_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`);
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // remove anchor after a short delay
        setTimeout(() => { try { document.body.removeChild(a); } catch (e) { /* ignore */ } }, 2000);
      } catch (err) {
        console.error('Erro ao iniciar exportação no servidor', err);
      } finally {
        setExportLoading(false);
      }
      return;
    }

    // For JSON/XLSX we fallback to client-side fetch-and-export (may be heavy for very large datasets)
    const chunkSize = 50000; // you can tune this
    try {
      const data = await fetchAllFiltered(chunkSize);
      const nameSuffix = `${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}_${data.length}`;
  if (format === 'json') exportJson(data, `relatorio_rodovias_${nameSuffix}.json`);
    } catch (err) {
      console.error('Erro na exportação completa', err);
      setExportLoading(false);
    }
  };

  // position and outside-click handling for the portal menu
  useEffect(() => {
    if (!exportMenuOpen || !exportBtnRef.current) return;

    const menuWidth = 176; // px
    const updatePosition = () => {
      const rect = exportBtnRef.current!.getBoundingClientRect();
      const top = rect.bottom + 8; // gap
      let left = rect.left;
      // keep menu inside viewport
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

  const statsCards = [
    { title: 'Total de Acidentes', value: '8.942', change: '-8.3%', trend: 'down', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Vítimas Fatais', value: '1.234', change: '-12.1%', trend: 'down', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Feridos', value: '5.678', change: '-6.5%', trend: 'down', icon: Car, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { title: 'Rodovias Monitoradas', value: '327', change: '+5', trend: 'up', icon: Navigation, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ];

  const monthlyAccidents = [
    { month: 'Jan', total: 842, fatal: 124, comFeridos: 456 },
    { month: 'Fev', total: 798, fatal: 112, comFeridos: 423 },
    { month: 'Mar', total: 912, fatal: 138, comFeridos: 498 },
  ];

  const causeData = [
    { cause: 'Excesso de Velocidade', value: 2847 },
    { cause: 'Falta de Atenção', value: 2134 },
    { cause: 'Ultrapassagem Indevida', value: 987 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100"
      >
        {[
          { icon: Calendar, type: 'date', value: dateStart, set: setDateStart, placeholder: 'Data Início', width: 180 },
          { icon: Calendar, type: 'date', value: dateEnd, set: setDateEnd, placeholder: 'Data Fim', width: 180 },
        ].map((f, i) => (
          <div
            key={i}
            className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm mr-3"
            style={{ width: f.width }}
          >
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <input
              type={f.type}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="border-none bg-transparent outline-none text-blue-900 text-sm w-full h-[34px]" // mesma altura
              title={f.value}
            />
            {f.value && (
              <button
                type="button"
                onClick={() => f.set('')}
                className="text-gray-400 hover:text-gray-700 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {[
          { icon: Calendar, state: selectedMonth, set: setSelectedMonth, options: monthOptions, placeholder: 'Mês', width: 270 },
          { icon: Calendar, state: selectedYear, set: setSelectedYear, options: yearOptions, placeholder: 'Ano', width: 200 },
          { icon: Calendar, state: selectedDayOfWeek, set: setSelectedDayOfWeek, options: dayOfWeekOptions, placeholder: 'Dia Semana', width: 275 },
        ].map((f, i) => (
          <div
            key={i}
            className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm group relative mr-3"
            style={{ width: f.width }}
          >
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <div className="truncate text-ellipsis">
              <Select
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '34px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  container: (base) => ({
                    ...base,
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  menu: (base) => ({
                    ...base,
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: 36 * 5,
                  }),
                }}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={f.options}
                value={f.options.filter((o) => f.state.includes(o.value))}
                onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
                placeholder={f.placeholder}
              />
            </div>

            {f.state.length > 0 && (
              <button
                type="button"
                onClick={() => f.set([])}
                className="text-gray-400 hover:text-gray-700 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-4 mb-8 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100"
      >
        {[
          {
            icon: MapPin,
            state: selectedUF,
            set: setSelectedUF,
            options: ufOptions,
            placeholder: 'UF',
            width: '10%',
          },
          {
            icon: MapPin,
            state: selectedMunicipio,
            set: setSelectedMunicipio,
            options: municipioOptions,
            placeholder: 'Município',
            width: 520,
          },
          {
            icon: Car,
            state: selectedTipoAcidente,
            set: setSelectedTipoAcidente,
            options: tipoOptions,
            placeholder: 'Tipo',
            width: 500,
          },
          {
            icon: AlertCircle,
            state: selectedCausaAcidente,
            set: setSelectedCausaAcidente,
            options: causaOptions,
            placeholder: 'Causa',
            width: 550,
          },
          {
            icon: AlertCircle,
            state: selectedCategoriaAcidente,
            set: setSelectedCategoriaAcidente,
            options: categoriaOptions,
            placeholder: 'Categoria',
            width: 450,
          },
        ].map((f, i) => (
          <div
            key={i}
            className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm group relative mr-3"
            style={{ width: f.width }}
          >
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />

            <div className="truncate text-ellipsis" title={f.state.join(', ') || f.placeholder}>
              <Select
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '34px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  container: (base) => ({
                    ...base,
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  menu: (base) => ({
                    ...base,
                    width: typeof f.width === 'number' ? f.width - 40 : undefined,
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: 36 * 5,
                  }),
                }}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={f.options}
                value={f.options.filter((o) => f.state.includes(o.value))}
                onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
                placeholder={f.placeholder}
              />
            </div>

            {f.state.length > 0 && (
              <button
                type="button"
                onClick={() => f.set([])}
                className="text-gray-400 hover:text-gray-700 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <div className="ml-auto">
          <button
            onClick={clearFilters}
            className="flex items-center bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-200 transition shadow-sm"
          >
            <X className="h-4 w-4 mr-1" /> Limpar Filtros
          </button>
        </div>
      </motion.div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm gap-4">
          <button
            onClick={() => setViewMode('graficos')}
            className={`flex items-center gap-2 px-6 py-6 rounded-md text-base transition ${
              viewMode === 'graficos'
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            Gráficos
          </button>

          <button
            onClick={() => setViewMode('relatorio')}
            className={`flex items-center gap-2 px-6 py-6 rounded-md text-base transition ${
              viewMode === 'relatorio'
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            Relatório
          </button>
        </div>
      </div>

      
      {viewMode === 'graficos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <motion.div key={stat.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-blue-100 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">{stat.title}</p>
                      <h3 className="text-blue-900">{stat.value}</h3>
                      <div className={`flex items-center ${stat.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendIcon className="h-4 w-4" /><span className="ml-1 text-sm">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}><Icon className={stat.color + ' h-6 w-6'} /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        </div>
      )}

      {/* Gráficos mockados */}
      {viewMode === 'graficos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-blue-100 shadow-lg">
          <CardHeader><CardTitle className="text-blue-900">Evolução Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyAccidents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" stroke="#3b82f6" /><YAxis stroke="#3b82f6" />
                <Tooltip /><Legend />
                <Line dataKey="total" stroke="#2563eb" />
                <Line dataKey="fatal" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-lg">
          <CardHeader><CardTitle className="text-blue-900">Principais Causas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={causeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" /><YAxis dataKey="cause" type="category" width={150} />
                <Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Relatório (tabelão) */}
      {viewMode === 'relatorio' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Relatório Completo - Rodovias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-blue-700">Linhas por página:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => handleChangePageSize(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
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
                      className={`flex items-center gap-2 mb-3 px-3 py-2 rounded shadow ${exportLoading ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Exportar</span>
                      <span className="ml-1 text-xs">▾</span>
                    </button>
                    <div className="ml-2 flex items-center" title="O botão Exportar irá baixar todos os registros que correspondem aos filtros; a tabela abaixo está limitada aos primeiros 10.000 registros para manter a UI responsiva.">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    {exportLoading && (
                      <div className="text-sm text-gray-600">Exportando... {exportProgress.fetched} registros ({exportProgress.pages} páginas)</div>
                    )}
                  </div>

                  {/* portal-based menu: rendered into document.body so it sits above other stacking contexts */}
                  {exportMenuOpen && exportBtnRef.current && createPortal(
                    <div
                      ref={menuRef}
                      style={menuStyle}
                      className="bg-white border rounded shadow z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={() => { handleExportAll('csv'); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">CSV</button>
                      <button onClick={() => { handleExportAll('json'); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">JSON</button>
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              {/* Top pagination controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Página {currentPage} de {totalPages} — {totalCount} registros filtrados</div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white hover:bg-blue-50 text-sm">Anterior</button>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white hover:bg-blue-50 text-sm">Próximo</button>
                </div>
              </div>

              <div className="relative">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Dia Semana</TableHead>
                      <TableHead>Localidade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Causa</TableHead>
                      <TableHead>Mortos</TableHead>
                      <TableHead>Feridos</TableHead>
                      <TableHead>Veículos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedData.length === 0 ? (
                      <TableRow><TableCell colSpan={12} className="text-center text-gray-500">Nenhum dado encontrado</TableCell></TableRow>
                    ) : (
                      pagedData.map((item, i) => (
                        <TableRow key={i} className="hover:bg-blue-50">
                          <TableCell>{item.data_completa}</TableCell>
                          <TableCell>{item.nome_dia_semana}</TableCell>
                          <TableCell>{item.localidade}</TableCell>
                          <TableCell>{item.tipo_acidente}</TableCell>
                          <TableCell>{item.categoria_acidente}</TableCell>
                          <TableCell>{item.causa_acidente}</TableCell>
                          <TableCell>{item.total_mortos}</TableCell>
                          <TableCell>{item.total_feridos_graves}</TableCell>
                          <TableCell>{item.total_veiculos}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {loading && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <div className="mt-3 text-sm text-blue-700">Carregando dados...</div>
                  </div>
                )}
              </div>

              {/* Bottom pagination controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">Página {currentPage} de {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white hover:bg-blue-50 text-sm">Anterior</button>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white hover:bg-blue-50 text-sm">Próximo</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
