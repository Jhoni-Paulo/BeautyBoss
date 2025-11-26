import React from 'react';
import { Home, Calendar, Users, DollarSign, Settings } from 'lucide-react';
import { PageView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageView;
  onNavigate: (page: PageView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  
  const navItems = [
    { id: 'DASHBOARD' as PageView, icon: Home, label: 'Início' },
    { id: 'SCHEDULE' as PageView, icon: Calendar, label: 'Agenda' },
    { id: 'CLIENTS' as PageView, icon: Users, label: 'Clientes' },
    { id: 'FINANCE' as PageView, icon: DollarSign, label: 'Caixa' },
    { id: 'SETTINGS' as PageView, icon: Settings, label: 'Perfil' },
  ];

  // If viewing the public booking page, render without the admin navigation
  if (activePage === 'PUBLIC_BOOKING') {
    return (
      <div className="min-h-screen bg-stone-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Main Content Area - pb-24 ensures content isn't hidden behind bottom nav */}
      <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Sticky Bottom Navigation - Thumb Zone */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'animate-pulse-once' : ''}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe Area spacing for iPhone Home Indicator */}
        <div className="h-safe-bottom bg-white" />
      </nav>
    </div>
  );
};

export default Layout;