import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import Select from 'react-select';
import { motion } from 'motion/react';
import { Calendar, MapPin, X, FileText, BarChart2, AlertCircle, UsersRound, Weight, Search } from 'lucide-react';
import { StatCard } from './ui/StatCard';
import { Charts } from './OcorrenciasComponents/Charts';
import { Reports } from './OcorrenciasComponents/Reports';
import { fetchOcorrencias, Ocorrencia } from '../services/ocorrenciasService';
import { fetchIndicadoresOcorrencias, IndicadoresOcorrenciasResponse } from '../services/indicadoresOcorrencia';
import { getCalendario, getLocalidade, getCrime } from '../services/dimensoesService';

export function Ocorrencias() {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string[]>([]);
  const [selectedWeekend, setSelectedWeekend] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState<string[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<string[]>([]);
  const [selectedCategoriaCrime, setSelectedCategoriaCrime] = useState<string[]>([]);

  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [dayOfWeekOptions, setDayOfWeekOptions] = useState<{ value: string; label: string }[]>([]);
  const [weekendOptions] = useState<{ value: string; label: string }[]>([
    { value: 'true', label: 'Fim de Semana' },
    { value: 'false', label: 'Dia Útil' },
  ]);
  const [ufOptions, setUfOptions] = useState<{ value: string; label: string }[]>([]);
  const [municipioOptions, setMunicipioOptions] = useState<{ value: string; label: string }[]>([]);
  const [eventoOptions, setEventoOptions] = useState<{ value: string; label: string }[]>([]);
  const [categoriaCrimeOptions, setCategoriaCrimeOptions] = useState<{ value: string; label: string }[]>([]);

  const [viewMode, setViewMode] = useState<'graficos' | 'relatorio'>('graficos');

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [indicadoresLoading, setIndicadoresLoading] = useState(false);
  const [indicadores, setIndicadores] = useState<IndicadoresOcorrenciasResponse | null>(null);

  const [exportLoading, setExportLoading] = useState(false);

  const filtersState = {
    dateStart,
    dateEnd,
    selectedMonth,
    selectedYear,
    selectedDayOfWeek,
    selectedWeekend,
    selectedUF,
    selectedMunicipio,
    selectedEvento,
    selectedCategoriaCrime,
  };

  const debouncedFilters = useDebounce(filtersState, 500);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const calendario = await getCalendario();
        const monthsSet = new Set<string>();
        const yearsSet = new Set<string>();
        const daysSet = new Set<string>();
        (calendario || []).forEach((c: any) => {
          if (c?.nome_mes) monthsSet.add(String(c.nome_mes));
          if (c?.ano !== undefined && c?.ano !== null) yearsSet.add(String(c.ano));
          if (c?.nome_dia_semana) daysSet.add(String(c.nome_dia_semana));
        });
        setMonthOptions(Array.from(monthsSet).map(m => ({ value: m, label: m })));
        setYearOptions(Array.from(yearsSet).sort().reverse().map(y => ({ value: y, label: y })));
        setDayOfWeekOptions(Array.from(daysSet).map(d => ({ value: d, label: d })));

        const localidade = await getLocalidade();
        const ufsSet = new Set<string>();
        const municipiosSet = new Set<string>();
        (localidade || []).forEach((l: any) => {
          if (l?.uf_abrev) ufsSet.add(String(l.uf_abrev));
          if (l?.municipio) municipiosSet.add(String(l.municipio));
        });
        setUfOptions(Array.from(ufsSet).map(u => ({ value: u, label: u })));
        setMunicipioOptions(Array.from(municipiosSet).map(m => ({ value: m, label: m })));

        const crimes = await getCrime();
        const eventoSet = new Set<string>();
        const categoriaSet = new Set<string>();
        (crimes || []).forEach((cr: any) => {
          if (cr?.evento) eventoSet.add(String(cr.evento));
          if (cr?.categoria_crime) categoriaSet.add(String(cr.categoria_crime));
        });
        setEventoOptions(Array.from(eventoSet).map(e => ({ value: e, label: e })));
        setCategoriaCrimeOptions(Array.from(categoriaSet).map(c => ({ value: c, label: c })));
      } catch (e) {
        if (!cancelled) console.error('Erro ao carregar dimensões ocorrencias', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const buildFiltersForRequest = () => ({
    data_inicio: debouncedFilters.dateStart || undefined,
    data_fim: debouncedFilters.dateEnd || undefined,
    mes: debouncedFilters.selectedMonth.join(',') || undefined,
    ano: debouncedFilters.selectedYear.join(',') || undefined,
    nome_dia_semana: debouncedFilters.selectedDayOfWeek.join(',') || undefined,
    flag_fim_de_semana: debouncedFilters.selectedWeekend.join(',') || undefined,
    uf: debouncedFilters.selectedUF.join(',') || undefined,
    municipio: debouncedFilters.selectedMunicipio.join(',') || undefined,
    evento: debouncedFilters.selectedEvento.join(',') || undefined,
    categoria_crime: debouncedFilters.selectedCategoriaCrime.join(',') || undefined,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        const filters = buildFiltersForRequest();
        const res = await fetchOcorrencias({ ...filters, page: 1, limit: 10000 });
        if (cancelled) return;
        setOcorrencias(res.rows || res || []);
        setTotalCount(res.total || res.length || 0);
      } catch (e) {
        if (!cancelled) console.error('Erro ao buscar ocorrencias', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedFilters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIndicadoresLoading(true);
      try {
        const filters = buildFiltersForRequest();
        const data = await fetchIndicadoresOcorrencias(filters);
        if (!cancelled) setIndicadores(data);
      } catch (e) {
        if (!cancelled) console.error('Erro indicadores ocorrencias', e);
      } finally {
        if (!cancelled) setIndicadoresLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedFilters]);

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setSelectedMonth([]);
    setSelectedYear([]);
    setSelectedDayOfWeek([]);
    setSelectedWeekend([]);
    setSelectedUF([]);
    setSelectedMunicipio([]);
    setSelectedEvento([]);
    setSelectedCategoriaCrime([]);
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const pagedData = ocorrencias.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleChangePageSize = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const exportCsv = () => {
    if (!ocorrencias.length) return;
    const headers = [
      'ID','Data','Ano','Mês','Dia Semana','Município','UF','Evento','Categoria Crime',
      'Qtd Ocorrencias','Qtd Vitimas','Peso Apreendido','Fem','Masc','Não Informado'
    ];
    const rows = [headers.join(',')];
    ocorrencias.forEach(o => {
      rows.push([
        o.id_ocorrencia,
        o.data_completa,
        o.ano,
        o.nome_mes,
        o.nome_dia_semana,
        o.municipio,
        (o as any).uf_abrev || '',
        o.evento,
        o.categoria_crime,
        o.quantidade_ocorrencias,
        o.quantidade_vitimas,
        o.peso_apreendido,
        o.total_feminino,
        o.total_masculino,
        o.total_nao_informado,
      ].map(v => `"${v ?? ''}"`).join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_ocorrencias_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statsCards = [
    {
      title: 'Total Registros',
      value: indicadores?.indicadores_gerais?.total_registros?.toLocaleString('pt-BR') || '0',
      icon: Search,
      color: 'text-blue-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Total Ocorrências',
      value: indicadores?.indicadores_gerais?.total_ocorrencias?.toLocaleString('pt-BR') || '0',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: '#ddf3ffff'
    },
    {
      title: 'Total Vítimas',
      value: indicadores?.indicadores_gerais?.total_vitimas?.toLocaleString('pt-BR') || '0',
      icon: UsersRound,
      color: 'text-purple-600',
      bgColor: '#dfe9ffff'
    },
    {
      title: 'Peso Apreendido (kg)',
      value: indicadores?.indicadores_gerais?.peso_apreendido_total?.toLocaleString('pt-BR') || '0',
      icon: Weight,
      color: 'text-green-600',
      bgColor: '#ddf3ffff'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filtros linha 1 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100"
      >
        {[
          { icon: Calendar, type: 'date', value: dateStart, set: setDateStart, placeholder: 'Data Início', width: 180 },
          { icon: Calendar, type: 'date', value: dateEnd, set: setDateEnd, placeholder: 'Data Fim', width: 180 },
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="border-none bg-transparent outline-none text-blue-900 text-sm w-full h-[34px]"
            />
            {f.value && (
              <button type="button" onClick={() => f.set('')} className="text-gray-400 hover:text-gray-700 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {[
          { icon: Calendar, state: selectedMonth, set: setSelectedMonth, options: monthOptions, placeholder: 'Mês', width: 220 },
          { icon: Calendar, state: selectedYear, set: setSelectedYear, options: yearOptions, placeholder: 'Ano', width: 160 },
          { icon: Calendar, state: selectedDayOfWeek, set: setSelectedDayOfWeek, options: dayOfWeekOptions, placeholder: 'Dia Semana', width: 260 },
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm mr-3" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={f.options}
              value={f.options.filter(o => f.state.includes(o.value))}
              onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
              placeholder={f.placeholder}
              styles={{
                control: base => ({ ...base, minHeight: '34px', border: 'none', background: 'transparent', boxShadow: 'none' }),
                menuList: base => ({ ...base, maxHeight: 36 * 5 }),
              }}
            />
            {f.state.length > 0 && (
              <button type="button" onClick={() => f.set([])} className="text-gray-400 hover:text-gray-700 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </motion.div>

      {/* Filtros linha 2 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100"
      >
        {[
          { icon: MapPin, state: selectedUF, set: setSelectedUF, options: ufOptions, placeholder: 'UF', width: 160 },
          { icon: MapPin, state: selectedMunicipio, set: setSelectedMunicipio, options: municipioOptions, placeholder: 'Município', width: 480 },
          { icon: AlertCircle, state: selectedEvento, set: setSelectedEvento, options: eventoOptions, placeholder: 'Evento', width: 420 },
          { icon: AlertCircle, state: selectedCategoriaCrime, set: setSelectedCategoriaCrime, options: categoriaCrimeOptions, placeholder: 'Categoria Crime', width: 360 },
          { icon: Calendar, state: selectedWeekend, set: setSelectedWeekend, options: weekendOptions, placeholder: 'Fim de Semana', width: 200 },
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm mr-3" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={f.options}
              value={f.options.filter(o => f.state.includes(o.value))}
              onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
              placeholder={f.placeholder}
              styles={{
                control: base => ({ ...base, minHeight: '34px', border: 'none', background: 'transparent', boxShadow: 'none' }),
                menuList: base => ({ ...base, maxHeight: 36 * 5 }),
              }}
            />
            {f.state.length > 0 && (
              <button type="button" onClick={() => f.set([])} className="text-gray-400 hover:text-gray-700 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <div className="ml-auto">
          <button
            onClick={clearFilters}
            className="flex items-center bg-blue-100 text-blue-800 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-200 transition shadow-sm"
          >
            <X className="h-4 w-4 mr-1" /> Limpar Filtros
          </button>
        </div>
      </motion.div>

      {/* Toggle View */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm gap-4">
          <button
            onClick={() => setViewMode('graficos')}
            className={`flex items-center gap-2 px-6 py-6 rounded-md text-base transition ${viewMode === 'graficos' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-50'}`}
          >
            <BarChart2 className="w-5 h-5" />
            Gráficos
          </button>
          <button
            onClick={() => setViewMode('relatorio')}
            className={`flex items-center gap-2 px-6 py-6 rounded-md text-base transition ${viewMode === 'relatorio' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-50'}`}
          >
            <FileText className="w-5 h-5" />
            Relatório
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
                transition={{ delay: i * 0.05 }}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  bgColor={stat.bgColor}
                  loading={indicadoresLoading}
                />
              </motion.div>
            ))}
          </div>
          <Charts indicadores={indicadores} loading={indicadoresLoading} />
        </div>
      )}

      {viewMode === 'relatorio' && (
        <Reports
          data={pagedData}
          total={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onChangePageSize={handleChangePageSize}
            onExportCsv={exportCsv}
            exportLoading={exportLoading}
        />
      )}
    </div>
  );
}