import React, { useState, useEffect } from 'react';
import { fetchRodovias, Rodovia } from '../services/rodoviasService';
import { getCalendario, getLocalidade, getTipoAcidente } from '../services/dimensoesService';
import { motion } from 'motion/react';
import { Car, AlertCircle, TrendingDown, TrendingUp, Navigation, X, Calendar, MapPin } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

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

    fetchRodovias(filters)
      .then(setRodovias)
      .catch(() => setError('Erro ao buscar dados das rodovias'))
      .finally(() => setLoading(false));
  }, [
    dateStart, dateEnd,
    selectedMonth, selectedYear, selectedDayOfWeek, selectedWeekend,
    selectedUF, selectedMunicipio, selectedTipoAcidente, selectedCausaAcidente, selectedCategoriaAcidente
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
                    width: f.width - 40, 
                  }),
                  container: (base) => ({
                    ...base,
                    width: f.width - 40,
                  }),
                  menu: (base) => ({
                    ...base,
                    width: f.width - 40,
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
                    width: f.width - 40, 
                  }),
                  container: (base) => ({
                    ...base,
                    width: f.width - 40, 
                  }),
                  menu: (base) => ({
                    ...base,
                    width: f.width - 40,
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

      {/* Cards mockados */}
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

      {/* Gráficos mockados */}
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

      {/* Tabela dinâmica */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Acidentes em Rodovias (Dados Reais)</CardTitle>
            <CardDescription>Dados filtrados conforme seleção</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-blue-600">Carregando...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead>Dia Semana</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Causa</TableHead>
                    <TableHead>Mortos</TableHead>
                    <TableHead>Feridos</TableHead>
                    <TableHead>Veículos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rodovias.length === 0 ? (
                    <TableRow><TableCell colSpan={12} className="text-center text-gray-500">Nenhum dado encontrado</TableCell></TableRow>
                  ) : (
                    rodovias.map((item, i) => (
                      <TableRow key={i} className="hover:bg-blue-50">
                        <TableCell>{item.data_completa}</TableCell>
                        <TableCell>{item.ano}</TableCell>
                        <TableCell>{item.nome_mes}</TableCell>
                        <TableCell>{item.nome_dia_semana}</TableCell>
                        <TableCell>{item.municipio}</TableCell>
                        <TableCell>{(item as any).uf_abrev || (item as any).uf}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
