import { Shield, Activity, Car, AlertCircle, Building2, Database, BookOpenText } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const navItems = [
    { id: 'rodovias', label: 'Rodovias', icon: Car },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle },
    { id: 'presidios', label: 'Presídios', icon: Building2 },
    { id: 'fontes', label: 'Fontes', icon: BookOpenText },
    { id: 'acesso aos dados', label: 'Acesso aos dados', icon: Database }
  ];

  return (
    <nav className="bg-white shadow-md border-b-2 border-blue-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onPageChange('rodovias')}
          >
            <motion.img
              src="/logo_seguranca_brasil.png"
              alt="Logo"
              style={{ height: '5rem' }}
              transition={{ duration: 0.6 }}
            />

            <div>
              <h1 className="text-blue-900">Segurança Pública Brasil</h1>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
