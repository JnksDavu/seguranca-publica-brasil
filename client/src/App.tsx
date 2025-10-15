import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Rodovias } from './components/Rodovias';


export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'rodovias':
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
