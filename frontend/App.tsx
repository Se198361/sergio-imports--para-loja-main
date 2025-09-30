import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Clients } from './pages/Clients';
import { Sales } from './pages/Sales';
import { PDV } from './pages/PDV';
import { Exchanges } from './pages/Exchanges';
import { Labels } from './pages/Labels';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';

export type Page = 'dashboard' | 'products' | 'clients' | 'sales' | 'pdv' | 'exchanges' | 'labels' | 'settings' | 'reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'clients':
        return <Clients />;
      case 'sales':
        return <Sales />;
      case 'pdv':
        return <PDV />;
      case 'exchanges':
        return <Exchanges />;
      case 'labels':
        return <Labels />;
      case 'settings':
        return <Settings />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="p-6">
              {renderPage()}
            </main>
          </div>
        </div>
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
