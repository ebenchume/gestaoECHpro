/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  KeyRound, 
  Coffee, 
  CreditCard, 
  BookOpen, 
  TrendingUp, 
  History, 
  Settings, 
  PhoneCall, 
  Mail, 
  X,
  Monitor
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavTab = 
  | 'dashboard'
  | 'quartos'
  | 'hospedes'
  | 'checkins'
  | 'servicos'
  | 'pagamentos'
  | 'caixa'
  | 'relatorios'
  | 'audit'
  | 'config';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenWindowsSetup?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onOpenWindowsSetup
}) => {
  const { quartos, checkins, unreadNotificationsCount } = useApp();

  const occupiedCount = quartos.filter(q => q.status === 'ocupado').length;
  const activeCheckins = checkins.filter(c => c.status === 'CHECKIN').length;
  const cleaningCount = quartos.filter(q => q.status === 'limpeza').length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'quartos' as NavTab, 
      label: 'Quartos', 
      icon: BedDouble,
      badge: cleaningCount > 0 ? `${cleaningCount} limpeza` : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    },
    { id: 'hospedes' as NavTab, label: 'Hóspedes', icon: Users },
    { 
      id: 'checkins' as NavTab, 
      label: 'Check-in / Out', 
      icon: KeyRound,
      badge: activeCheckins > 0 ? `${activeCheckins} ativos` : undefined,
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
    },
    { id: 'servicos' as NavTab, label: 'Serviços & Bar', icon: Coffee },
    { id: 'pagamentos' as NavTab, label: 'Pagamentos', icon: CreditCard },
    { id: 'caixa' as NavTab, label: 'Livro de Caixa', icon: BookOpen },
    { id: 'relatorios' as NavTab, label: 'Relatórios Semanais', icon: TrendingUp },
    { id: 'audit' as NavTab, label: 'Histórico de Edições', icon: History },
    { id: 'config' as NavTab, label: 'Configurações & Nuvem', icon: Settings }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand & Close on Mobile */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo_ech.png" alt="ECHpro Logo" className="h-9 w-auto rounded shadow-sm" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span className="text-teal-400">ECH</span>pro
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Hotel & Guest Management</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Room Occupancy Bar */}
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Ocupação Atual</span>
            <span className="font-bold text-teal-400">
              {quartos.length > 0 ? Math.round((occupiedCount / quartos.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{
                width: `${quartos.length > 0 ? (occupiedCount / quartos.length) * 100 : 0}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>{occupiedCount} ocupados</span>
            <span>{quartos.length - occupiedCount} livres</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Windows Setup Quick Trigger */}
        {onOpenWindowsSetup && (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                onOpenWindowsSetup();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-blue-900/40 to-teal-900/40 border border-blue-500/30 hover:border-blue-400 text-xs text-blue-200 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Setup Windows 10/11</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                v2.5
              </span>
            </button>
          </div>
        )}

        {/* Support & Developer Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Apoio ao Cliente</span>
            <span className="text-[9px] text-teal-400">08h–17h</span>
          </div>
          <a
            href="tel:+258827473434"
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-teal-400 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">+258 82 747 3434</span>
          </a>
          <a
            href="mailto:ebenchume@sapo.mz"
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-teal-400 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">ebenchume@sapo.mz</span>
          </a>
          <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>Dev: Eben Chume</span>
            <span>Build 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};
