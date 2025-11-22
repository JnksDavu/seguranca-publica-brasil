import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IndicadoresResponse } from '../../services/indicadoresService';

interface ChartsProps {
  indicadores: IndicadoresResponse | null;
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
  // Ordena meses corretamente pelo calendário
  const monthlyAccidents = (indicadores?.acidentes_por_mes || [])
    .sort((a, b) => {
      const monthA = monthOrder[a.nome_mes?.toLowerCase() as keyof typeof monthOrder] || 0;
      const monthB = monthOrder[b.nome_mes?.toLowerCase() as keyof typeof monthOrder] || 0;
      return monthA - monthB;
    })
    .map((item) => ({
      month: item.nome_mes || '',
      total: item.total || 0,
      fatal: item.mortos || 0,
      comFeridos: (item.total || 0) - (item.mortos || 0),
    }));

  const causeData = (indicadores?.acidentes_por_causa || [])
    .slice(0, 10)
    .map((item) => ({
      cause: item.causa_acidente || '',
      value: item.total || 0,
    }));

  // Preparar dados para heatmap de UF (longitude/latitude agregado)
  const ufData = (indicadores?.acidentes_por_uf || []).map((item) => ({
    uf: item.uf_abrev || '',
    total: item.total || 0,
    mortos: item.mortos || 0,
  }));

  const dayOfWeekData = (indicadores?.acidentes_por_dia_semana || [])
    .sort((a, b) => {
      const dayA = dayOfWeekOrder[a.nome_dia_semana?.toLowerCase() as keyof typeof dayOfWeekOrder] || 0;
      const dayB = dayOfWeekOrder[b.nome_dia_semana?.toLowerCase() as keyof typeof dayOfWeekOrder] || 0;
      return dayA - dayB;
    })
    .map((item) => ({
      day: item.nome_dia_semana || '',
      total: item.total || 0,
    }));

  const weatherData = (indicadores?.acidentes_por_condicao_metereologica || [])
    .slice(0, 8)
    .map((item) => ({
      condition: item.condicao_metereologica || 'Desconhecido',
      total: item.total || 0,
    }));

  const brandsData = (indicadores?.acidentes_por_marcas || [])
    .slice(0, 12)
    .map((item) => ({
      brand: item.marcas || 'Desconhecida',
      total: item.total || 0,
    }));

  const modelData = (indicadores?.acidentes_por_modelo_veiculo || [])
    .slice(0, 12)
    .map((item) => ({
      model: item.modelo_veiculo || 'Desconhecido',
      total: item.total || 0,
    }));

  const roadTypeData = (indicadores?.acidentes_por_tipo_pista || []).map((item) => ({
    type: item.tipo_pista || 'Desconhecido',
    total: item.total || 0,
  }));

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
    {/* Evolução Mensal */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
      <Card className="border-blue-200 shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900">Evolução Mensal de Acidentes</CardTitle>
        </CardHeader>
        <CardContent className='pb-12'>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyAccidents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="month" stroke="#3b82f6" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#3b82f6" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Legend />
              <Line 
                dataKey="total" 
                stroke="#2563eb" 
                name="Total de Acidentes" 
                strokeWidth={2} 
                dot={{ r: 5, fill: '#2563eb' }}
                activeDot={{ r: 7 }}
                label={{ position: 'top', fill: '#2563eb' }}
              />
              <Line 
                dataKey="fatal" 
                stroke="#dc2626" 
                name="Vítimas Fatais" 
                strokeWidth={2} 
                dot={{ r: 5, fill: '#dc2626' }}
                activeDot={{ r: 7 }}
                label={{ position: 'top', fill: '#dc2626' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>

    {/* Principais Causas */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-blue-200 shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900">Principais Causas de Acidentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto max-h-96 pr-4">
            <ResponsiveContainer width="100%" height={Math.max(300, causeData.length * 35)}>
              <BarChart data={causeData} layout="vertical" margin={{ top: 5, right: 30, left: 300, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis type="number" stroke="#3b82f6" />
                <YAxis 
                  dataKey="cause" 
                  type="category" 
                  width={290} 
                  stroke="#3b82f6"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                  formatter={(value) => value.toLocaleString('pt-BR')}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>

      {/* Acidentes por Tipo - Barra Horizontal com Scroll */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Acidentes por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(300, (indicadores?.acidentes_por_tipo?.length || 0) * 35)}>
                <BarChart data={indicadores?.acidentes_por_tipo || []} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#8b5cf6" />
                  <YAxis 
                    dataKey="tipo_acidente" 
                    type="category" 
                    width={190} 
                    stroke="#8b5cf6"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                    formatter={(value) => value.toLocaleString('pt-BR')}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Categoria - Barra Horizontal com Scroll */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Acidentes por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(300, (indicadores?.acidentes_por_categoria?.length || 0) * 35)}>
                <BarChart data={indicadores?.acidentes_por_categoria || []} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#f59e0b" />
                  <YAxis 
                    dataKey="categoria_acidente" 
                    type="category" 
                    width={190} 
                    stroke="#f59e0b"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                    formatter={(value) => value.toLocaleString('pt-BR')}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Distribuição por UF */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Distribuição de Acidentes por Estado (UF)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={ufData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="uf" stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
                <Legend />
                <Bar dataKey="total" fill="#06b6d4" name="Total de Acidentes" radius={[8, 8, 0, 0]} />
                <Bar dataKey="mortos" fill="#ef4444" name="Vítimas Fatais" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Dia da Semana */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Acidentes por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Condição Meteorológica */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Acidentes por Condição Meteorológica</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="condition" angle={-45} textAnchor="end" height={100} stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
                <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Marca de Carro */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Principais Marcas de Veículos Envolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(300, (brandsData?.length || 0) * 30)}>
                <BarChart data={brandsData} layout="vertical" margin={{ top: 5, right: 30, left: 180, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#ec4899" />
                  <YAxis 
                    dataKey="brand" 
                    type="category" 
                    width={170} 
                    stroke="#ec4899"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                    formatter={(value) => value.toLocaleString('pt-BR')}
                  />
                  <Bar dataKey="total" fill="#ec4899" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Modelo de Carro */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="border-blue-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Principais Modelos de Veículos Envolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96 pr-4">
              <ResponsiveContainer width="100%" height={Math.max(300, (modelData?.length || 0) * 30)}>
                <BarChart data={modelData} layout="vertical" margin={{ top: 5, right: 30, left: 180, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#6366f1" />
                  <YAxis 
                    dataKey="model" 
                    type="category" 
                    width={170} 
                    stroke="#6366f1"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}
                    formatter={(value) => value.toLocaleString('pt-BR')}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acidentes por Tipo de Pista */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">Acidentes por Tipo de Pista</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={roadTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
                <Bar dataKey="total" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
