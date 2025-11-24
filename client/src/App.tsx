import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Rodovias } from './components/Rodovias';
import { Ocorrencias } from './components/Ocorrencias'; // novo

export default function App() {
  const [currentPage, setCurrentPage] = useState('rodovias');

  const renderPage = () => {
    switch (currentPage) {
      case 'rodovias':
        return <Rodovias />;
      case 'ocorrencias':
        return <Ocorrencias />;
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