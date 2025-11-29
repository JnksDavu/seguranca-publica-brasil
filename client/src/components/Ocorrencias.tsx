import React, { useState, useEffect } from 'react';
import { fetchOcorrencias, Ocorrencia } from '../services/ocorrenciasService';
import { IndicadoresOcorrenciasResponse, fetchIndicadoresOcorrencias } from '../services/indicadoresOcorrencia';
import { useDebounce } from '../hooks/useDebounce';
import { StatCard } from './ui/StatCard';
import Reports, { Column } from './Reports';
import { Charts } from './OcorrenciasComponents/Charts';
import MapaAnaliticoHex from './MapaAnaliticoHex';
import api from '../services/api';
import { getCalendario, getLocalidade, getCrime } from '../services/dimensoesService';
import { motion } from 'motion/react';
import { Car, AlertCircle, Navigation, X, Calendar, MapPin, FileText, BarChart2, Skull, ShieldAlert, CircleAlert, Bandage, Route, MapPinned, UsersRound, Thermometer } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import Select from 'react-select';

export function Ocorrencias() {
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

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [serverChunkSize] = useState<number>(10000);
  const [lastServerPageFetched, setLastServerPageFetched] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [indicadores, setIndicadores] = useState<IndicadoresOcorrenciasResponse | null>(null);
  const [indicadoresLoading, setIndicadoresLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'graficos' | 'relatorio' | 'heatmap'>('graficos');

  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
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

  const [filtersState, setFiltersState] = useState({
    dateStart,
    dateEnd,
    selectedMonth,
    selectedYear,
    selectedDayOfWeek,
    selectedWeekend,
    selectedUF,
    selectedMunicipio,
    selectedTipoAcidente,
    selectedCausaAcidente,
    selectedCategoriaAcidente,
  });

  // Debounce dos filtros
  const debouncedFilters = useDebounce(filtersState, 500);

  useEffect(() => {
    setFiltersState({
      dateStart,
      dateEnd,
      selectedMonth,
      selectedYear,
      selectedDayOfWeek,
      selectedWeekend,
      selectedUF,
      selectedMunicipio,
      selectedTipoAcidente,
      selectedCausaAcidente,
      selectedCategoriaAcidente,
    });
  }, [
    dateStart,
    dateEnd,
    selectedMonth,
    selectedYear,
    selectedDayOfWeek,
    selectedWeekend,
    selectedUF,
    selectedMunicipio,
    selectedTipoAcidente,
    selectedCausaAcidente,
    selectedCategoriaAcidente,
  ]);

  const selectStyles = {
    menuList: (base: any) => ({ ...base, maxHeight: 36 * 5 }), 
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setOcorrencias([]);
      setTotalCount(0);
      setLastServerPageFetched(0);
      const filters = {
        data_inicio: debouncedFilters.dateStart || undefined,
        data_fim: debouncedFilters.dateEnd || undefined,
        mes: (debouncedFilters.selectedMonth as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
        ano: (debouncedFilters.selectedYear as (string | { value: string })[]).map(y => typeof y === 'string' ? y : y.value).join(',') || undefined,
        nome_dia_semana: (debouncedFilters.selectedDayOfWeek as (string | { value: string })[]).map(d => typeof d === 'string' ? d : d.value).join(',') || undefined,
        flag_fim_de_semana: (debouncedFilters.selectedWeekend as (string | { value: string })[]).map(v => typeof v === 'string' ? v : v.value).join(',') || undefined,
        uf: (debouncedFilters.selectedUF as (string | { value: string })[]).map(u => typeof u === 'string' ? u : u.value).join(',') || undefined,
        municipio: (debouncedFilters.selectedMunicipio as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
        tipo_acidente: (debouncedFilters.selectedTipoAcidente as (string | { value: string })[]).map(t => typeof t === 'string' ? t : t.value).join(',') || undefined,
        causa_acidente: (debouncedFilters.selectedCausaAcidente as (string | { value: string })[]).map(c => typeof c === 'string' ? c : c.value).join(',') || undefined,
        categoria_acidente: (debouncedFilters.selectedCategoriaAcidente as (string | { value: string })[]).map(c => typeof c === 'string' ? c : c.value).join(',') || undefined,
      };
      try {
        const res = await fetchOcorrencias({ ...filters, page: 1, limit: serverChunkSize } as any);
        if (cancelled) return;
        setOcorrencias(res.rows || []);
        setTotalCount(res.total || (res.rows ? res.rows.length : 0));
        setLastServerPageFetched(res.rows && res.rows.length ? 1 : 0);
      } catch (err) {
        console.error('Erro ao buscar ocorrências', err);
        if (!cancelled) setError('Erro ao buscar ocorrências');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedFilters, serverChunkSize]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIndicadoresLoading(true);
      const filters = {
        data_inicio: debouncedFilters.dateStart || undefined,
        data_fim: debouncedFilters.dateEnd || undefined,
        mes: (debouncedFilters.selectedMonth as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
        ano: (debouncedFilters.selectedYear as (string | { value: string })[]).map(y => typeof y === 'string' ? y : y.value).join(',') || undefined,
        nome_dia_semana: (debouncedFilters.selectedDayOfWeek as (string | { value: string })[]).map(d => typeof d === 'string' ? d : d.value).join(',') || undefined,
        flag_fim_de_semana: (debouncedFilters.selectedWeekend as (string | { value: string })[]).map(v => typeof v === 'string' ? v : v.value).join(',') || undefined,
        uf: (debouncedFilters.selectedUF as (string | { value: string })[]).map(u => typeof u === 'string' ? u : u.value).join(',') || undefined,
        municipio: (debouncedFilters.selectedMunicipio as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
        categoria_crime: (debouncedFilters.selectedCategoriaAcidente as (string | { value: string })[]).map(c => typeof c === 'string' ? c : c.value).join(',') || undefined,
      };
      try {
        const res = await fetchIndicadoresOcorrencias(filters);
        if (!cancelled) {
          setIndicadores(res);
        }
      } catch (err) {
        console.error('Erro ao buscar indicadores', err);
      } finally {
        if (!cancelled) setIndicadoresLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedFilters]);

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

        // Carrega categorias de dim_crime
        const crimes = await getCrime();
        const categoriaSet = new Set<string>();
        (crimes || []).forEach((row: any) => {
          if (row && row.categoria_crime) categoriaSet.add(String(row.categoria_crime));
        });
        const categoriaList = Array.from(categoriaSet).map((c: any) => ({ value: String(c), label: String(c) }));
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

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const pagedData = ocorrencias.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const exportCsv = (rows: Ocorrencia[], filename?: string) => {
    if (!rows || rows.length === 0) return;
    const headers = ['Data','Município','UF','Evento','Categoria','Qtd Ocorrências','Qtd Vítimas','Peso Apreendido','Feminino','Masculino','Não Informado'];
    const csvRows = [headers.join(',')];
    rows.forEach((item) => {
      const cols = [
        `"${item.data_completa ?? ''}"`,
        `"${item.municipio ?? ''}"`,
        `"${(item as any).uf_abrev || ''}"`,
        `"${item.evento ?? ''}"`,
        `"${item.categoria_crime ?? ''}"`,
        `"${item.quantidade_vitimas ?? ''}"`,
        `"${item.peso_apreendido ?? ''}"`,
        `"${item.total_feminino ?? ''}"`,
        `"${item.total_masculino ?? ''}"`,
        `"${item.total_nao_informado ?? ''}"`,
      ];
      csvRows.push(cols.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = filename || `relatorio_ocorrencias_${new Date().toISOString()}.csv`;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportJson = (rows: Ocorrencia[], filename?: string) => {
    if (!rows || rows.length === 0) return;
    const jsonString = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = filename || `relatorio_ocorrencias_${new Date().toISOString()}.json`;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildFiltersForRequest = () => ({
    data_inicio: dateStart || undefined,
    data_fim: dateEnd || undefined,
    mes: (selectedMonth as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
    ano: (selectedYear as (string | { value: string })[]).map(y => typeof y === 'string' ? y : y.value).join(',') || undefined,
    nome_dia_semana: (selectedDayOfWeek as (string | { value: string })[]).map(d => typeof d === 'string' ? d : d.value).join(',') || undefined,
    flag_fim_de_semana: (selectedWeekend as (string | { value: string })[]).map(v => typeof v === 'string' ? v : v.value).join(',') || undefined,
    uf: (selectedUF as (string | { value: string })[]).map(u => typeof u === 'string' ? u : u.value).join(',') || undefined,
    municipio: (selectedMunicipio as (string | { value: string })[]).map(m => typeof m === 'string' ? m : m.value).join(',') || undefined,
    // Ajuste para ocorrências: não usar tipo/causa/categoria_acidente
    categoria_crime: (selectedCategoriaAcidente as (string | { value: string })[]).map(c => typeof c === 'string' ? c : c.value).join(',') || undefined,
  });

  const fetchAllFiltered = async (chunkSize = serverChunkSize) : Promise<Ocorrencia[]> => {
    setExportLoading(true);
    setExportProgress({ fetched: 0, pages: 0 });
    const filtersBase = buildFiltersForRequest();
    const all: Ocorrencia[] = [];
    let page = 1;
    while (true) {
      try {
        const res = await fetchOcorrencias({ ...filtersBase, page, limit: chunkSize } as any);
        const chunk = res.rows || [];
        if (!chunk || chunk.length === 0) /* Line 324 omitted */
        all.push(...chunk);
        /* Lines 326-329 omitted */
      } catch (err) {
        /* Lines 330-332 omitted */
      }
    }
    setExportLoading(false);
    return all;
  };

 
  useEffect(() => {
    let cancelled = false;
    const ensureDataForPage = async (pageNum: number) => {
      const requiredIndex = pageNum * pageSize;
      try {
        while (!cancelled && ocorrencias.length < requiredIndex && ocorrencias.length < totalCount) {
          const nextServerPage = lastServerPageFetched + 1;
          const filters = buildFiltersForRequest();
          const res = await fetchOcorrencias({ ...filters, page: nextServerPage, limit: serverChunkSize } as any);
          const rows = res.rows || [];
          if (!rows || rows.length === 0) break;
          setOcorrencias((prev) => {
            const exists = prev.length >= (nextServerPage - 1) * serverChunkSize + rows.length;
            if (exists) return prev;
            return [...prev, ...rows];
          });
          setLastServerPageFetched(nextServerPage);
        }
      } catch (err) {
        if (!cancelled) console.error('Erro ao buscar páginas adicionais', err);
      }
    };

    ensureDataForPage(currentPage);
    return () => { cancelled = true; };
  }, [currentPage, pageSize, ocorrencias.length, totalCount, lastServerPageFetched]);

  const handleExportAll = async (format: 'csv' | 'json') => {
    const filters = buildFiltersForRequest();

    if (format === 'csv') {
      try {
        setExportLoading(true);
        const res = await api.get('/ocorrencias/export', {
          params: filters,
          responseType: 'blob'
        });
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `relatorio_ocorrencias_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erro ao exportar CSV', err);
      } finally {
        setExportLoading(false);
      }
      return;
    }

    if (format === 'json') {
      const chunkSize = 1000;
      try {
        const data = await fetchAllFiltered(chunkSize);
        const nameSuffix = `${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}_${data.length}`;
        exportJson(data, `relatorio_ocorrencias_${nameSuffix}.json`);
      } catch (err) {
        console.error('Erro ao exportar JSON', err);
        setExportLoading(false);
      }
    }
  };

  const statsCards = [
    {
      title: 'Total de Ocorrências',
      value: indicadores?.indicadores_gerais?.total_ocorrencias?.toLocaleString('pt-BR') || '0',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Total de Vítimas',
      value: indicadores?.indicadores_gerais?.total_vitimas?.toLocaleString('pt-BR') || '0',
      icon: ShieldAlert,
      color: 'text-yellow-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Peso Apreendido (kg)',
      value: indicadores?.indicadores_gerais?.peso_apreendido_total?.toLocaleString('pt-BR') || '0',
      icon: CircleAlert,
      color: 'text-blue-600',
      bgColor: '#ddf3ffff'
    },
    {
      title: 'Vítimas Femininas',
      value: indicadores?.indicadores_gerais?.vitimas_femininas?.toLocaleString('pt-BR') || '0',
      icon: UsersRound,
      color: 'text-pink-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Vítimas Masculinas',
      value: indicadores?.indicadores_gerais?.vitimas_masculinas?.toLocaleString('pt-BR') || '0',
      icon: UsersRound,
      color: 'text-blue-600',
      bgColor: '#ddf3ffff'
    },
    {
      title: 'Vítimas Não Informadas',
      value: indicadores?.indicadores_gerais?.vitimas_nao_informadas?.toLocaleString('pt-BR') || '0',
      icon: Bandage,
      color: 'text-gray-600',
      bgColor: '#ddf3ffff'
    },
    {
      title: 'UFs Monitoradas',
      value: indicadores?.indicadores_gerais?.ufs_monitoradas?.toLocaleString('pt-BR') || '0',
      icon: Route,
      color: 'text-blue-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Municípios Monitorados',
      value: indicadores?.indicadores_gerais?.municipios_monitorados?.toLocaleString('pt-BR') || '0',
      icon: MapPinned,
      color: 'text-blue-600',
      bgColor: '#ddf3ffff'
    }
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
            placeholder: 'Tipo do acidente',
            width: 500,
          },
          {
            icon: AlertCircle,
            state: selectedCausaAcidente,
            set: setSelectedCausaAcidente,
            options: causaOptions,
            placeholder: 'Causa do acidente',
            width: 550,
          },
          {
            icon: AlertCircle,
            state: selectedCategoriaAcidente,
            set: setSelectedCategoriaAcidente,
            options: categoriaOptions,
            placeholder: 'Categoria do acidente',
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

          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-2 px-6 py-6 rounded-md text-base transition ${
              viewMode === 'heatmap'
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Thermometer className="w-5 h-5" />
            Mapa de Calor
          </button>
        </div>
      </div>

      
      {viewMode === 'graficos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, i) => (
        <motion.div
          key={stat.title}
          className="w-full min-w-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <StatCard
            title={stat.title}
            value={indicadoresLoading ? '' : stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            loading={indicadoresLoading}
          />
        </motion.div>
      ))}

          </div>
          
          <Charts indicadores={indicadores} indicadoresLoading={indicadoresLoading} />
        </div>
      )}

      {viewMode === 'relatorio' && (
        <Reports<Ocorrencia>
          pagedData={pagedData}
          totalCount={totalCount}
          loading={loading}
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          onChangePageSize={handleChangePageSize}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          columns={[
            { header: 'Data', render: (o) => o.data_completa },
            { header: 'Município', render: (o) => o.municipio },
            { header: 'UF', render: (o) => (o as any).uf_abrev || '' },
            { header: 'Evento', render: (o) => o.evento },
            { header: 'Categoria', render: (o) => o.categoria_crime },
            { header: 'Qtd Vítimas', render: (o) => o.quantidade_vitimas, className: 'text-right' },
            { header: 'Peso Apreendido', render: (o) => o.peso_apreendido, className: 'text-right' },
            { header: 'Feminino', render: (o) => o.total_feminino, className: 'text-right' },
            { header: 'Masculino', render: (o) => o.total_masculino, className: 'text-right' },
            { header: 'Não Informado', render: (o) => o.total_nao_informado, className: 'text-right' },
          ] as Column<Ocorrencia>[]}
          rowKey={(o) => (o as any).id_ocorrencia ?? `${o.data_completa}-${o.municipio}-${(o as any).uf_abrev || ''}-${o.evento}`}
          onExportAll={handleExportAll}
          exportLoading={exportLoading}
          exportProgress={exportProgress}
        />
      )}

      {viewMode === 'heatmap' && (
        <div className="mt-8 text-sm text-gray-600">
          Heatmap para ocorrências ainda não disponível.
        </div>
      )}
    </div>
  );
}
