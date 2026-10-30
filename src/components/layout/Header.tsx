/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Sun, 
  Moon, 
  Monitor, 
  ShieldCheck, 
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  onOpenWindowsSetup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileMenu,
  onOpenWindowsSetup
}) => {
  const {
    empresa,
    isOnline,
    isSyncing,
    lastSyncedAt,
    offlineQueueLength,
    triggerCloudSync,
    isDark,
    settings,
    updateSettings,
    unreadNotificationsCount,
    currentUser,
    licenca
  } = useApp();

  const toggleThemeMode = () => {
    if (settings.themeMode === 'auto') {
      updateSettings({ themeMode: 'dark' });
    } else if (settings.themeMode === 'dark') {
      updateSettings({ themeMode: 'light' });
    } else {
      updateSettings({ themeMode: 'auto' });
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img src="/logo_ech.png" alt="ECHpro Logo" className="h-8 w-auto rounded object-contain shadow-xs" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {empresa.nome}
            </h1>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              ECHpro v2.5 — Gestão de Hóspedes
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
            <span className="truncate">Busca rápida (hóspedes, quartos, check-ins)...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network & Cloud Sync Badge */}
        <div className="flex items-center">
          {isOnline ? (
            <button
              onClick={() => triggerCloudSync()}
              disabled={isSyncing}
              title={`Sincronizado: ${new Date(lastSyncedAt).toLocaleTimeString('pt-MZ')}. Clique para sincronizar.`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {isSyncing ? 'Sincronizando...' : 'Online & Nuvem'}
              </span>
            </button>
          ) : (
            <div
              title="Modo Offline ativo. As alterações serão salvas localmente e sincronizadas assim que houver rede."
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
            >
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span>Offline {offlineQueueLength > 0 && `(${offlineQueueLength})`}</span>
            </div>
          )}
        </div>

        {/* Windows 10/11 Setup Button */}
        {onOpenWindowsSetup && (
          <button
            onClick={onOpenWindowsSetup}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
            title="Instalador e Setup para Windows 10 e Windows 11"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden md:inline">Instalar Windows</span>
            <span className="md:hidden">Win</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Notificações e Lembretes"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleThemeMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={`Tema: ${settings.themeMode === 'auto' ? 'Automático (Sistema)' : settings.themeMode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}`}
        >
          {settings.themeMode === 'auto' ? (
            <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          ) : isDark ? (
            <Moon className="w-5 h-5 text-amber-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
        </button>

        {/* User / License Indicator */}
        <div className="hidden lg:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {currentUser.nome_usuario.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {currentUser.nome_usuario}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              {licenca.status === 'activa' ? 'Licença Ativa' : 'Trial 15d'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
