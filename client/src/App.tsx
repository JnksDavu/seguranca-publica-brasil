import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Rodovias } from './components/Rodovias';
import { Ocorrencias } from './components/Ocorrencias';
import { Acesso } from './components/Acesso';
import { Fontes } from './components/Fontes';
import { Presidios } from './components/Presidios';
export default function App() {
  const [currentPage, setCurrentPage] = useState('rodovias');

  const renderPage = () => {
    switch (currentPage) {
      case 'rodovias':
        return <Rodovias />;
      case 'ocorrencias':
        return <Ocorrencias />;
      case 'presidios':
        return <Presidios />;
      case 'fontes':
        return <Fontes />;
      case 'acesso aos dados':
        return <Acesso />;
      default:
        return <Rodovias />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="transition-all duration-500">
        {renderPage()}
      </main>
    </div>
  );
}