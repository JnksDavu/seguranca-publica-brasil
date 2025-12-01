import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Reports, { Column } from './Reports';
import Select from 'react-select';
import { X, Calendar, MapPin, Building2, BadgeInfo, Globe, FileQuestion } from 'lucide-react';

interface Presidio {
  id_fato_presidio: number;
  ano: number;
  semestre_nome: string;
  data_referencia_formatada: string;
  data_completa: string;
  municipio: string;
  uf_abrev: string;
  cod_municipio: string;
  nome_estabelecimento: string;
  tipo_estabelecimento: string;
  situacao_estabelecimento: string;
  ambito: string;
  cap_provisorios_total: number;
  cap_fechado_total: number;
  cap_semiaberto_total: number;
  cap_aberto_total: number;
  cap_total_geral: number;
  cap_total_masc: number;
  cap_total_fem: number;
}

export function Presidios() {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string[]>([]);

  const [selectedUF, setSelectedUF] = useState<string[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string[]>([]);
  const [selectedNomeEstabelecimento, setSelectedNomeEstabelecimento] = useState<string[]>([]);
  const [selectedTipoEstabelecimento, setSelectedTipoEstabelecimento] = useState<string[]>([]);
  const [selectedAmbito, setSelectedAmbito] = useState<string[]>([]);

  const [presidios, setPresidios] = useState<Presidio[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const [monthOptions, setMonthOptions] = useState<{value:string;label:string}[]>([]);
  const [yearOptions, setYearOptions] = useState<{value:string;label:string}[]>([]);
  const [dayOfWeekOptions, setDayOfWeekOptions] = useState<{value:string;label:string}[]>([]);
  const [ufOptions, setUfOptions] = useState<{value:string;label:string}[]>([]);
  const [municipioOptions, setMunicipioOptions] = useState<{value:string;label:string}[]>([]);
  const [nomeEstabelecimentoOptions, setNomeEstabelecimentoOptions] = useState<{value:string;label:string}[]>([]);
  const [tipoEstabelecimentoOptions, setTipoEstabelecimentoOptions] = useState<{value:string;label:string}[]>([]);
  const [ambitoOptions, setAmbitoOptions] = useState<{value:string;label:string}[]>([]);

  const buildFilters = () => ({
    data_inicio: dateStart || undefined,
    data_fim: dateEnd || undefined,
    mes: selectedMonth.join(',') || undefined,
    ano: selectedYear.join(',') || undefined,
    nome_dia_semana: selectedDayOfWeek.join(',') || undefined,
    uf: selectedUF.join(',') || undefined,
    municipio: selectedMunicipio.join(',') || undefined,
    nome_estabelecimento: selectedNomeEstabelecimento.join(',') || undefined,
    tipo_estabelecimento: selectedTipoEstabelecimento.join(',') || undefined,
    ambito: selectedAmbito.join(',') || undefined
  });

  const fetchPresidios = async (page: number, limit: number) => {
    const params = { ...buildFilters(), page, limit };
    const res = await api.get('/presidios', { params });
    const rows: Presidio[] = res.data || [];
    const totalHeader = res.headers['x-total-count'];
    return { rows, total: totalHeader ? parseInt(totalHeader, 10) : rows.length };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        const { rows, total } = await fetchPresidios(1, pageSize);
        if (!cancelled) {
          setPresidios(rows);
          setTotalCount(total);
        }
      } catch {
        if (!cancelled) {
          setPresidios([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [
    dateStart,
    dateEnd,
    selectedMonth,
    selectedYear,
    selectedDayOfWeek,
    selectedUF,
    selectedMunicipio,
    selectedNomeEstabelecimento,
    selectedTipoEstabelecimento,
    selectedAmbito,
    pageSize
  ]);

  useEffect(() => {
    (async () => {
      try {
        const calendario = await api.get('/dimensoes/calendario');
        const monthsSet = new Set<string>();
        const yearsSet = new Set<string>();
        const daysSet = new Set<string>();
        (calendario.data || []).forEach((c: any) => {
          if (c?.nome_mes) monthsSet.add(String(c.nome_mes));
          if (c?.ano !== undefined && c?.ano !== null) yearsSet.add(String(c.ano));
          if (c?.nome_dia_semana) daysSet.add(String(c.nome_dia_semana));
        });
        setMonthOptions(Array.from(monthsSet).map(m => ({ value: m, label: m })));
        setYearOptions(Array.from(yearsSet).sort().reverse().map(y => ({ value: String(y), label: String(y) })));
        setDayOfWeekOptions(Array.from(daysSet).map(d => ({ value: d, label: d })));

        const local = await api.get('/dimensoes/localidade');
        const ufsSet = new Set<string>();
        const municipiosSet = new Set<string>();
        (local.data || []).forEach((l: any) => {
          if (l.uf_abrev) ufsSet.add(String(l.uf_abrev));
          if (l.municipio) municipiosSet.add(String(l.municipio));
        });
        setUfOptions(Array.from(ufsSet).map(v => ({ value: v, label: v })));
        setMunicipioOptions(Array.from(municipiosSet).map(v => ({ value: v, label: v })));

        const estab = await api.get('/dimensoes/estabelecimento');
        const nomeSet = new Set<string>();
        const tipoSet = new Set<string>();
        const ambitoSet = new Set<string>();
        (estab.data || []).forEach((e: any) => {
          if (e.nome_estabelecimento) nomeSet.add(String(e.nome_estabelecimento));
          if (e.tipo_estabelecimento) tipoSet.add(String(e.tipo_estabelecimento));
          if (e.ambito) ambitoSet.add(String(e.ambito));
        });
        setNomeEstabelecimentoOptions(Array.from(nomeSet).map(v => ({ value: v, label: v })));
        setTipoEstabelecimentoOptions(Array.from(tipoSet).map(v => ({ value: v, label: v })));
        setAmbitoOptions(Array.from(ambitoSet).map(v => ({ value: v, label: v })));
      } catch {}
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const pagedData = presidios.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleChangePageSize = (size: number) => { setPageSize(size); setCurrentPage(1); };
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setSelectedMonth([]);
    setSelectedYear([]);
    setSelectedDayOfWeek([]);
    setSelectedUF([]);
    setSelectedMunicipio([]);
    setSelectedNomeEstabelecimento([]);
    setSelectedTipoEstabelecimento([]);
    setSelectedAmbito([]);
  };

  const handleExportAll = async (format: 'csv' | 'json') => {
    const filters = buildFilters();
    if (format === 'csv') {
      try {
        setExportLoading(true);
        const res = await api.get('/presidios/export', { params: filters, responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_presidios_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {} finally { setExportLoading(false); }
      return;
    }
    if (format === 'json') {
      try {
        setExportLoading(true);
        const all: Presidio[] = [];
        let page = 1;
        while (true) {
          const { rows } = await fetchPresidios(page, 10000);
          if (!rows.length) break;
          all.push(...rows);
          page++;
        }
        const json = JSON.stringify(all, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_presidios_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}_${all.length}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {} finally { setExportLoading(false); }
    }
  };

  const multiSelectStyle = (w: number | string) => ({
    control: (base: any) => ({ ...base, minHeight: '34px', border: 'none', backgroundColor: 'transparent', boxShadow: 'none', width: typeof w === 'number' ? w - 40 : undefined }),
    container: (base: any) => ({ ...base, width: typeof w === 'number' ? w - 40 : undefined }),
    menu: (base: any) => ({ ...base, width: typeof w === 'number' ? w - 40 : undefined }),
    menuList: (base: any) => ({ ...base, maxHeight: 36 * 5 })
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Linha 1: Datas + Mês + Ano + Dia Semana (tamanhos iguais aos de ocorrências) */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100">
        {[
          { icon: Calendar, type: 'date', value: dateStart, set: setDateStart, width: 180, placeholder: 'Data Início' },
          { icon: Calendar, type: 'date', value: dateEnd, set: setDateEnd, width: 180, placeholder: 'Data Fim' },
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2" />
            <input
              type={f.type}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="border-none bg-transparent outline-none text-blue-900 text-sm w-full h-[34px]"
              placeholder={f.placeholder}
            />
            {f.value && (
              <button type="button" onClick={() => f.set('')} className="text-gray-400 hover:text-gray-700 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {[
          { icon: Calendar, state: selectedMonth, set: setSelectedMonth, options: monthOptions, placeholder: 'Mês', width: 270 },
          { icon: Calendar, state: selectedYear, set: setSelectedYear, options: yearOptions, placeholder: 'Ano', width: 200 },
          { icon: Calendar, state: selectedDayOfWeek, set: setSelectedDayOfWeek, options: dayOfWeekOptions, placeholder: 'Dia Semana', width: 275 }
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2" />
            <Select
              styles={multiSelectStyle(f.width)}
              isMulti
              closeMenuOnSelect={false}
              options={f.options}
              value={f.options.filter(o => f.state.includes(o.value))}
              onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
              placeholder={f.placeholder}
            />
            {f.state.length > 0 && (
              <button type="button" onClick={() => f.set([])} className="text-gray-400 hover:text-gray-700 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Linha 2: UF + Município + Nome Estabelecimento + Tipo + Âmbito */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100">
        {[
          { icon: MapPin, state: selectedUF, set: setSelectedUF, options: ufOptions, placeholder: 'UF', width: 140 },
          { icon: MapPin, state: selectedMunicipio, set: setSelectedMunicipio, options: municipioOptions, placeholder: 'Município', width: 400 },
          { icon: Building2, state: selectedNomeEstabelecimento, set: setSelectedNomeEstabelecimento, options: nomeEstabelecimentoOptions, placeholder: 'Nome Estabelecimento', width: 380 },
          { icon: BadgeInfo, state: selectedTipoEstabelecimento, set: setSelectedTipoEstabelecimento, options: tipoEstabelecimentoOptions, placeholder: 'Tipo Estabelecimento', width: 300 },
          { icon: Globe, state: selectedAmbito, set: setSelectedAmbito, options: ambitoOptions, placeholder: 'Âmbito', width: 220 },
        ].map((f, i) => (
          <div key={i} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 shadow-sm" style={{ width: f.width }}>
            <f.icon className="h-5 w-5 text-blue-600 mr-2" />
            <Select
              styles={multiSelectStyle(f.width)}
              isMulti
              closeMenuOnSelect={false}
              options={f.options}
              value={f.options.filter(o => f.state.includes(o.value))}
              onChange={(v: any) => f.set((v || []).map((x: any) => x.value))}
              placeholder={f.placeholder}
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
            className="flex items-center bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-200 transition shadow-sm"
          >
            <X className="h-4 w-4 mr-1" /> Limpar Filtros
          </button>
        </div>
      </div>

      <Reports<Presidio>
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
          { header: 'Data', render: p => p.data_completa },
          { header: 'Data Ref', render: p => p.data_referencia_formatada },
          { header: 'Ano', render: p => p.ano, className: 'text-right' },
          { header: 'Município', render: p => p.municipio },
          { header: 'UF', render: p => p.uf_abrev },
          { header: 'Nome Estabelecimento', render: p => p.nome_estabelecimento },
          { header: 'Tipo', render: p => p.tipo_estabelecimento },
          { header: 'Âmbito', render: p => p.ambito },
          { header: 'Cap Provisórios', render: p => p.cap_provisorios_total, className: 'text-right' },
          { header: 'Cap Fechado', render: p => p.cap_fechado_total, className: 'text-right' },
          { header: 'Cap Semiaberto', render: p => p.cap_semiaberto_total, className: 'text-right' },
          { header: 'Cap Aberto', render: p => p.cap_aberto_total, className: 'text-right' },
          { header: 'Cap Total Masc', render: p => p.cap_total_masc, className: 'text-right' },
          { header: 'Cap Total Fem', render: p => p.cap_total_fem, className: 'text-right' },
          { header: 'Cap Total Geral', render: p => p.cap_total_geral, className: 'text-right' }
        ] as Column<Presidio>[]}
        rowKey={p => p.id_fato_presidio ? String(p.id_fato_presidio) : `${p.data_completa}-${p.municipio}-${p.uf_abrev}-${p.nome_estabelecimento}`}
        onExportAll={handleExportAll}
        exportLoading={exportLoading}
        exportProgress={{ fetched: 0, pages: 0 }}
      />
    </div>
  );
}

export default Presidios;