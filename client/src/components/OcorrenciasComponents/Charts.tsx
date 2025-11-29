import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IndicadoresOcorrenciasResponse } from '../../services/indicadoresOcorrencia';

interface ChartsProps {
  indicadores: IndicadoresOcorrenciasResponse | null;
  indicadoresLoading: boolean;
}

const monthOrder = {
  'janeiro': 1,
  'fevereiro': 2,
  'março': 3,
  'abril': 4,
  'maio': 5,
  'junho': 6,
  'julho': 7,
  'agosto': 8,
  'setembro': 9,
  'outubro': 10,
  'novembro': 11,
  'dezembro': 12,
};

const dayOfWeekOrder = {
  'segunda-feira': 1,
  'terça-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  'sábado': 6,
  'domingo': 7,
};

export function Charts({ indicadores, indicadoresLoading }: ChartsProps) {
  // Mensal: ocorrências e vítimas
  const monthly = (indicadores?.ocorrencias_por_mes || [])
    .sort((a, b) => (monthOrder[a.nome_mes?.toLowerCase() as keyof typeof monthOrder] || 0) - (monthOrder[b.nome_mes?.toLowerCase() as keyof typeof monthOrder] || 0))
    .map((m) => ({
      month: m.nome_mes,
      ocorrencias: Number(m.total_ocorrencias || 0),
      vitimas: Number(m.total_vitimas || 0),
    }));

  // Categoria e Evento (Top N)
  const categorias = (indicadores?.ocorrencias_por_categoria || [])
    .slice(0, 15)
    .map((c) => ({ categoria: c.categoria_crime, ocorrencias: Number(c.total_ocorrencias || 0), vitimas: Number(c.total_vitimas || 0) }));

  const eventos = (indicadores?.ocorrencias_por_evento || [])
    .slice(0, 15)
    .map((e) => ({ evento: e.evento, ocorrencias: Number(e.total_ocorrencias || 0), vitimas: Number(e.total_vitimas || 0) }));

  // UF e Município
  const ufs = (indicadores?.ocorrencias_por_uf || []).map((u) => ({ uf: u.uf_abrev, ocorrencias: Number(u.total_ocorrencias || 0), vitimas: Number(u.total_vitimas || 0) }));
  const municipios = (indicadores?.ocorrencias_por_municipio || [])
    .slice(0, 15)
    .map((m) => ({ municipio: m.municipio, ocorrencias: Number(m.total_ocorrencias || 0), vitimas: Number(m.total_vitimas || 0) }));

  // Dia da semana e Trimestre
  const diaSemana = (indicadores?.ocorrencias_por_dia_semana || [])
    .sort((a, b) => (dayOfWeekOrder[a.nome_dia_semana?.toLowerCase() as keyof typeof dayOfWeekOrder] || 0) - (dayOfWeekOrder[b.nome_dia_semana?.toLowerCase() as keyof typeof dayOfWeekOrder] || 0))
    .map((d) => ({ dia: d.nome_dia_semana, ocorrencias: Number(d.total_ocorrencias || 0), vitimas: Number(d.total_vitimas || 0) }));

  const trimestres = (indicadores?.ocorrencias_por_trimestre || [])
    .map((t) => ({ trimestre: t.trimestre_nome, ocorrencias: Number(t.total_ocorrencias || 0), vitimas: Number(t.total_vitimas || 0) }));

  // Sexo
  const sexoRaw = indicadores?.ocorrencias_por_sexo || { total_feminino: 0, total_masculino: 0, total_nao_informado: 0 };
  const sexo = [
    { label: 'Feminino', total: Number(sexoRaw.total_feminino || 0) },
    { label: 'Masculino', total: Number(sexoRaw.total_masculino || 0) },
    { label: 'Não Informado', total: Number(sexoRaw.total_nao_informado || 0) },
  ];

  const maxOcorrencias = Math.max(1, ...[
    ...categorias.map(c => c.ocorrencias),
    ...eventos.map(e => e.ocorrencias),
    ...ufs.map(u => u.ocorrencias),
    ...municipios.map(m => m.ocorrencias),
    ...diaSemana.map(d => d.ocorrencias),
    ...trimestres.map(t => t.ocorrencias),
  ]);

  if (indicadoresLoading) {
    return (
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
  <div className="space-y-12">

   {/* Correlação Mensal: Ocorrências x Vítimas */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="border-blue-200 shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900">Ocorrências x Vítimas (Mensal)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="month" stroke="#3b82f6" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#3b82f6" />
              <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
              <Legend />
              <Line dataKey="ocorrencias" name="Ocorrências" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              <Line dataKey="vitimas" name="Vítimas" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>

      {/* Ocorrências por Categoria */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Ocorrências por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-72 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(250, categorias.length * 45)}>
                <BarChart data={categorias} layout="vertical" margin={{ top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#5757E6" domain={[0, Math.ceil(maxOcorrencias * 1.1)]} />
                  <YAxis dataKey="categoria" type="category" width={220} stroke="#5757E6" tick={{ fontSize: 13 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="ocorrencias" fill="#5757E6" name="Ocorrências" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="vitimas" fill="#ef4444" name="Vítimas" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ocorrências por Evento */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Ocorrências por Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-72 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(250, eventos.length * 55)}>
                <BarChart data={eventos} layout="vertical" margin={{ top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#5784E6" domain={[0, Math.ceil(maxOcorrencias * 1.1)]} />
                  <YAxis dataKey="evento" type="category" width={220} stroke="#5784E6" tick={{ fontSize: 13 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="ocorrencias" fill="#5784E6" name="Ocorrências" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="vitimas" fill="#ef4444" name="Vítimas" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Evolução Mensal */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Ocorrências por UF</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={ufs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="uf" stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                <Legend />
                <Bar dataKey="ocorrencias" fill="#06b6d4" name="Ocorrências" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vitimas" fill="#ef4444" name="Vítimas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ocorrências por Município */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Top Municípios (Ocorrências)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-72 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(250, municipios.length * 45)}>
                <BarChart data={municipios} layout="vertical" margin={{ top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#06b6d4" domain={[0, Math.ceil(maxOcorrencias * 1.1)]} />
                  <YAxis dataKey="municipio" type="category" width={260} stroke="#06b6d4" tick={{ fontSize: 13 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="ocorrencias" fill="#06b6d4" name="Ocorrências" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="vitimas" fill="#ef4444" name="Vítimas" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ocorrências por Dia da Semana */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Ocorrências por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={diaSemana}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="dia" angle={-45} textAnchor="end" height={80} stroke="#8657E6" />
                <YAxis type="number" stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                <Legend />
                <Bar dataKey="ocorrencias" name="Ocorrências" fill="#8657E6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vitimas" name="Vítimas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ocorrências por Trimestre */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Ocorrências por Trimestre</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={trimestres}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="trimestre" stroke="#1e75a7" />
                <YAxis stroke="#1e75a7" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                <Legend />
                <Bar dataKey="ocorrencias" name="Ocorrências" fill="#1e75a7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vitimas" name="Vítimas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Distribuição por Sexo */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Distribuição por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sexo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="label" stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} formatter={(v) => Number(v).toLocaleString('pt-BR')} />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
