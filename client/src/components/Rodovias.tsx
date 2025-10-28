import { useState } from 'react';
import { motion } from 'motion/react';
import { Car, AlertCircle, MapPin, Calendar, TrendingDown, TrendingUp, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Rodovias() {
  const [selectedHighway, setSelectedHighway] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  const statsCards = [
    {
      title: 'Total de Acidentes',
      value: '8.942',
      change: '-8.3%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Vítimas Fatais',
      value: '1.234',
      change: '-12.1%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Feridos',
      value: '5.678',
      change: '-6.5%',
      trend: 'down',
      icon: Car,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Rodovias Monitoradas',
      value: '327',
      change: '+5',
      trend: 'up',
      icon: Navigation,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const monthlyAccidents = [
    { month: 'Jan', total: 842, fatal: 124, comFeridos: 456 },
    { month: 'Fev', total: 798, fatal: 112, comFeridos: 423 },
    { month: 'Mar', total: 912, fatal: 138, comFeridos: 498 },
    { month: 'Abr', total: 856, fatal: 119, comFeridos: 445 },
    { month: 'Mai', total: 789, fatal: 108, comFeridos: 412 },
    { month: 'Jun', total: 834, fatal: 115, comFeridos: 434 },
  ];

  const highwayRanking = [
    { highway: 'BR-101', state: 'SC', accidents: 1247, fatalities: 189, severity: 'Alta' },
    { highway: 'BR-116', state: 'PR', accidents: 1156, fatalities: 176, severity: 'Alta' },
    { highway: 'BR-381', state: 'MG', accidents: 987, fatalities: 142, severity: 'Média' },
    { highway: 'BR-153', state: 'GO', accidents: 834, fatalities: 121, severity: 'Média' },
    { highway: 'BR-262', state: 'ES', accidents: 756, fatalities: 98, severity: 'Média' },
    { highway: 'BR-040', state: 'RJ', accidents: 698, fatalities: 87, severity: 'Baixa' },
  ];

  const causeData = [
    { cause: 'Excesso de Velocidade', value: 2847 },
    { cause: 'Falta de Atenção', value: 2134 },
    { cause: 'Não Guardar Distância', value: 1245 },
    { cause: 'Ultrapassagem Indevida', value: 987 },
    { cause: 'Condições Climáticas', value: 756 },
    { cause: 'Falha Mecânica', value: 534 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-8"
      >
        <div className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          <Select value={selectedHighway} onValueChange={setSelectedHighway}>
            <SelectTrigger className="w-[200px] border-blue-200 focus:border-blue-600">
              <SelectValue placeholder="Rodovia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Rodovias</SelectItem>
              <SelectItem value="br101">BR-101</SelectItem>
              <SelectItem value="br116">BR-116</SelectItem>
              <SelectItem value="br381">BR-381</SelectItem>
              <SelectItem value="br153">BR-153</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px] border-blue-200 focus:border-blue-600">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="sc">Santa Catarina</SelectItem>
              <SelectItem value="pr">Paraná</SelectItem>
              <SelectItem value="sp">São Paulo</SelectItem>
              <SelectItem value="mg">Minas Gerais</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-blue-700 mb-2">{stat.title}</p>
                      <h3 className="text-blue-900 mb-2">{stat.value}</h3>
                      <div className={`flex items-center space-x-1 ${
                        stat.trend === 'down' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm">{stat.change}</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Evolução Mensal</CardTitle>
              <CardDescription>Acidentes registrados por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyAccidents}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" stroke="#3b82f6" />
                  <YAxis stroke="#3b82f6" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #3b82f6' }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="fatal" name="Fatais" stroke="#dc2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="comFeridos" name="Com Feridos" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Principais Causas</CardTitle>
              <CardDescription>Fatores que mais causam acidentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={causeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" stroke="#3b82f6" />
                  <YAxis dataKey="cause" type="category" width={150} stroke="#3b82f6" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #3b82f6' }} />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Highway Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Ranking de Rodovias Mais Perigosas</CardTitle>
            <CardDescription>Ordenadas por número de acidentes e fatalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-blue-100">
                  <TableHead className="text-blue-900">Rodovia</TableHead>
                  <TableHead className="text-blue-900">Estado</TableHead>
                  <TableHead className="text-blue-900">Acidentes</TableHead>
                  <TableHead className="text-blue-900">Fatalidades</TableHead>
                  <TableHead className="text-blue-900">Gravidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highwayRanking.map((item, index) => (
                  <motion.tr
                    key={item.highway}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="border-blue-50 hover:bg-blue-50 transition-colors"
                  >
                    <TableCell>{item.highway}</TableCell>
                    <TableCell>{item.state}</TableCell>
                    <TableCell>{item.accidents}</TableCell>
                    <TableCell>{item.fatalities}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(item.severity)}>
                        {item.severity}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
