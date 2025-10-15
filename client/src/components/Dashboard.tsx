import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Car, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Mock data
  const statsCards = [
    {
      title: 'Ocorrências Totais',
      value: '47.328',
      change: '+12.5%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Acidentes em Rodovias',
      value: '8.942',
      change: '-8.3%',
      trend: 'down',
      icon: Car,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'População Carcerária',
      value: '832.295',
      change: '+3.2%',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Taxa de Criminalidade',
      value: '24.3/100k',
      change: '-5.1%',
      trend: 'down',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const monthlyData = [
    { month: 'Jan', ocorrencias: 3820, acidentes: 742, prisoes: 1240 },
    { month: 'Fev', ocorrencias: 3950, acidentes: 698, prisoes: 1180 },
    { month: 'Mar', ocorrencias: 4100, acidentes: 812, prisoes: 1320 },
    { month: 'Abr', ocorrencias: 3780, acidentes: 756, prisoes: 1265 },
    { month: 'Mai', ocorrencias: 4220, acidentes: 689, prisoes: 1410 },
    { month: 'Jun', ocorrencias: 3990, acidentes: 734, prisoes: 1295 },
  ];

  const stateData = [
    { state: 'SP', value: 12500 },
    { state: 'RJ', value: 8300 },
    { state: 'MG', value: 6200 },
    { state: 'BA', value: 5100 },
    { state: 'PR', value: 4800 },
    { state: 'RS', value: 4200 },
  ];

  const typeDistribution = [
    { name: 'Roubo', value: 35 },
    { name: 'Furto', value: 28 },
    { name: 'Homicídio', value: 12 },
    { name: 'Tráfico', value: 15 },
    { name: 'Outros', value: 10 },
  ];

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-8"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px] border-blue-200 focus:border-blue-600">
              <SelectValue placeholder="Selecione o Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="sp">São Paulo</SelectItem>
              <SelectItem value="rj">Rio de Janeiro</SelectItem>
              <SelectItem value="mg">Minas Gerais</SelectItem>
              <SelectItem value="sc">Santa Catarina</SelectItem>
              <SelectItem value="pr">Paraná</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px] border-blue-200 focus:border-blue-600">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-blue-700 mb-2">{stat.title}</p>
                      <h3 className="text-blue-900 mb-2">{stat.value}</h3>
                      <div className={`flex items-center space-x-1 ${
                        stat.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm">{stat.change}</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className={`${stat.bgColor} p-3 rounded-lg`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Tendências Mensais</CardTitle>
              <CardDescription>Evolução dos indicadores ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" stroke="#3b82f6" />
                  <YAxis stroke="#3b82f6" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #3b82f6' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ocorrencias" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="acidentes" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  <Line type="monotone" dataKey="prisoes" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Distribuição por Tipo</CardTitle>
              <CardDescription>Percentual de ocorrências por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Ranking por Estado</CardTitle>
            <CardDescription>Estados com maior número de ocorrências registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="state" stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #3b82f6' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
