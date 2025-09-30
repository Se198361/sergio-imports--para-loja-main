import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Calculator, 
  RefreshCw, 
  Tags, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Page } from '../App';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products' as Page, label: 'Produtos', icon: Package },
  { id: 'clients' as Page, label: 'Clientes', icon: Users },
  { id: 'sales' as Page, label: 'Vendas', icon: ShoppingCart },
  { id: 'pdv' as Page, label: 'PDV', icon: Calculator },
  { id: 'exchanges' as Page, label: 'Trocas', icon: RefreshCw },
  { id: 'labels' as Page, label: 'Etiquetas', icon: Tags },
  { id: 'reports' as Page, label: 'Relatórios', icon: BarChart3 },
  { id: 'settings' as Page, label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SI</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Sérgio Imports</span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
