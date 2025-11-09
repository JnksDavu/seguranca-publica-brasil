import React, { useState, useEffect } from 'react';
import { fetchRodovias, Rodovia } from '../services/rodoviasService';
import { motion } from 'motion/react';
import { Car, AlertCircle, TrendingDown, TrendingUp, Navigation, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select'; // multi-select

export function Rodovias() {
  // ==========================
  // Estados de filtro
  // ==========================
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

  // ==========================
  // Opções fixas (mock)
  // ==========================
  const monthOptions = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'].map(m => ({ value: m, label: m }));
  const yearOptions = ['2022', '2023', '2024', '2025'].map(y => ({ value: y, label: y }));
  const dayOfWeekOptions = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => ({ value: d, label: d }));
  const weekendOptions = [
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' },
  ];
  const ufOptions = ['SC', 'PR', 'SP', 'MG', 'RJ', 'RS'].map(u => ({ value: u, label: u }));
  const municipioOptions = ['Florianópolis', 'Curitiba', 'São Paulo', 'Belo Horizonte', 'Rio de Janeiro', 'Porto Alegre'].map(m => ({ value: m, label: m }));
  const tipoOptions = ['Colisão', 'Capotamento', 'Atropelamento'].map(t => ({ value: t, label: t }));
  const causaOptions = ['Falta de atenção', 'Alta velocidade', 'Chuva', 'Ultrapassagem indevida'].map(c => ({ value: c, label: c }));
  const categoriaOptions = ['Grave', 'Leve', 'Fatais'].map(c => ({ value: c, label: c }));

  // ==========================
  // Buscar dados conforme filtros
  // ==========================
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

  // ==========================
  // Resetar filtros
  // ==========================
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

  // ==========================
  // Dados mockados (cards e gráficos)
  // ==========================
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

  // ==========================
  // Render
  // ==========================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filtros de Tempo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-4 items-center bg-white rounded-lg shadow p-4 border border-blue-200"
      >
        <div className="flex flex-col">
          <label className="text-blue-700 text-xs mb-1">Data Início</label>
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="border border-blue-300 rounded px-2 py-1 text-blue-900" />
        </div>
        <div className="flex flex-col">
          <label className="text-blue-700 text-xs mb-1">Data Fim</label>
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="border border-blue-300 rounded px-2 py-1 text-blue-900" />
        </div>
        <div className="w-[150px]">
          <label className="text-blue-700 text-xs mb-1">Mês</label>
          <Select isMulti options={monthOptions} value={monthOptions.filter(o => selectedMonth.includes(o.value))} onChange={(v) => setSelectedMonth(v.map(x => x.value))} />
        </div>
        <div className="w-[120px]">
          <label className="text-blue-700 text-xs mb-1">Ano</label>
          <Select isMulti options={yearOptions} value={yearOptions.filter(o => selectedYear.includes(o.value))} onChange={(v) => setSelectedYear(v.map(x => x.value))} />
        </div>
        <div className="w-[160px]">
          <label className="text-blue-700 text-xs mb-1">Dia da Semana</label>
          <Select isMulti options={dayOfWeekOptions} value={dayOfWeekOptions.filter(o => selectedDayOfWeek.includes(o.value))} onChange={(v) => setSelectedDayOfWeek(v.map(x => x.value))} />
        </div>
        <div className="w-[140px]">
          <label className="text-blue-700 text-xs mb-1">Final de Semana</label>
          <Select isMulti options={weekendOptions} value={weekendOptions.filter(o => selectedWeekend.includes(o.value))} onChange={(v) => setSelectedWeekend(v.map(x => x.value))} />
        </div>
        <button onClick={clearFilters} className="ml-auto flex items-center text-blue-800 border border-blue-300 px-3 py-1 rounded hover:bg-blue-50">
          <X className="h-4 w-4 mr-1" /> Limpar Filtros
        </button>
      </motion.div>

      {/* Filtros de Localização e Tipo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-4 mb-8 items-center bg-white rounded-lg shadow p-4 border border-blue-200"
      >
        <div className="w-[120px]">
          <label className="text-blue-700 text-xs mb-1">UF</label>
          <Select isMulti options={ufOptions} value={ufOptions.filter(o => selectedUF.includes(o.value))} onChange={(v) => setSelectedUF(v.map(x => x.value))} />
        </div>
        <div className="w-[200px]">
          <label className="text-blue-700 text-xs mb-1">Município</label>
          <Select isMulti options={municipioOptions} value={municipioOptions.filter(o => selectedMunicipio.includes(o.value))} onChange={(v) => setSelectedMunicipio(v.map(x => x.value))} />
        </div>
        <div className="w-[200px]">
          <label className="text-blue-700 text-xs mb-1">Tipo de Acidente</label>
          <Select isMulti options={tipoOptions} value={tipoOptions.filter(o => selectedTipoAcidente.includes(o.value))} onChange={(v) => setSelectedTipoAcidente(v.map(x => x.value))} />
        </div>
        <div className="w-[200px]">
          <label className="text-blue-700 text-xs mb-1">Causa</label>
          <Select isMulti options={causaOptions} value={causaOptions.filter(o => selectedCausaAcidente.includes(o.value))} onChange={(v) => setSelectedCausaAcidente(v.map(x => x.value))} />
        </div>
        <div className="w-[200px]">
          <label className="text-blue-700 text-xs mb-1">Categoria</label>
          <Select isMulti options={categoriaOptions} value={categoriaOptions.filter(o => selectedCategoriaAcidente.includes(o.value))} onChange={(v) => setSelectedCategoriaAcidente(v.map(x => x.value))} />
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
                        <TableCell>{item.uf}</TableCell>
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
