/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { SearchModal } from './components/modals/SearchModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { CheckinModal } from './components/modals/CheckinModal';
import { CheckinDetailModal } from './components/modals/CheckinDetailModal';
import { HospedeModal } from './components/modals/HospedeModal';
import { QuartoModal } from './components/modals/QuartoModal';
import { DashboardView } from './components/views/DashboardView';
import { QuartosView } from './components/views/QuartosView';
import { HospedesView } from './components/views/HospedesView';
import { CheckinsView } from './components/views/CheckinsView';
import { ServicosView } from './components/views/ServicosView';
import { PagamentosView } from './components/views/PagamentosView';
import { CaixaView } from './components/views/CaixaView';
import { RelatoriosView } from './components/views/RelatoriosView';
import { AuditLogView } from './components/views/AuditLogView';
import { ConfigView } from './components/views/ConfigView';
import { WindowsInstallerModal } from './components/views/WindowsInstallerModal';
import { Hospede, Quarto } from './types';
import { WifiOff, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isOnline, isSyncing, offlineQueueLength } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWindowsSetupOpen, setIsWindowsSetupOpen] = useState(false);
  
  // Checkin Modal
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinDefaultQuartoId, setCheckinDefaultQuartoId] = useState<number | undefined>(undefined);

  // Detail Modal
  const [selectedCheckinId, setSelectedCheckinId] = useState<number | null>(null);

  // Hospede Modal
  const [isHospedeModalOpen, setIsHospedeModalOpen] = useState(false);
  const [hospedeToEdit, setHospedeToEdit] = useState<Hospede | null>(null);

  // Quarto Modal
  const [isQuartoModalOpen, setIsQuartoModalOpen] = useState(false);
  const [quartoToEdit, setQuartoToEdit] = useState<Quarto | null>(null);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  const handleOpenCheckinForRoom = (quartoId: number) => {
    setCheckinDefaultQuartoId(quartoId);
    setIsCheckinModalOpen(true);
  };

  const handleOpenHospedeModalWithData = (hospede?: Hospede) => {
    setHospedeToEdit(hospede || null);
    setIsHospedeModalOpen(true);
  };

  const handleOpenQuartoModalWithData = (quarto?: Quarto) => {
    setQuartoToEdit(quarto || null);
    setIsQuartoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenWindowsSetup={() => setIsWindowsSetupOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onOpenWindowsSetup={() => setIsWindowsSetupOpen(true)}
        />

        {/* Offline notification banner if network is down */}
        {!isOnline && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-16 z-20 animate-fade-in">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>
                <strong>Modo Offline Ativo:</strong> Pode continuar a registrar hóspedes, diárias e check-ins sem interrupções.
                {offlineQueueLength > 0 && ` (${offlineQueueLength} alteração(ões) pendente(s) de sincronização).`}
              </span>
            </div>
            <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded">
              Sincronização automática na reconexão
            </span>
          </div>
        )}

        {/* Main Body per tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToTab={setCurrentTab}
              onOpenCheckinModal={() => {
                setCheckinDefaultQuartoId(undefined);
                setIsCheckinModalOpen(true);
              }}
              onOpenHospedeModal={() => handleOpenHospedeModalWithData()}
              onSelectCheckin={id => setSelectedCheckinId(id)}
            />
          )}

          {currentTab === 'quartos' && (
            <QuartosView
              onOpenQuartoModal={q => handleOpenQuartoModalWithData(q)}
              onOpenCheckinModalForRoom={handleOpenCheckinForRoom}
            />
          )}

          {currentTab === 'hospedes' && (
            <HospedesView
              onOpenHospedeModal={h => handleOpenHospedeModalWithData(h)}
              onSelectCheckin={id => setSelectedCheckinId(id)}
            />
          )}

          {currentTab === 'checkins' && (
            <CheckinsView
              onOpenCheckinModal={() => {
                setCheckinDefaultQuartoId(undefined);
                setIsCheckinModalOpen(true);
              }}
              onSelectCheckin={id => setSelectedCheckinId(id)}
            />
          )}

          {currentTab === 'servicos' && (
            <ServicosView
              onSelectCheckin={id => setSelectedCheckinId(id)}
            />
          )}

          {currentTab === 'pagamentos' && (
            <PagamentosView
              onSelectCheckin={id => setSelectedCheckinId(id)}
            />
          )}

          {currentTab === 'caixa' && (
            <CaixaView />
          )}

          {currentTab === 'relatorios' && (
            <RelatoriosView />
          )}

          {currentTab === 'audit' && (
            <AuditLogView />
          )}

          {currentTab === 'config' && (
            <ConfigView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToTab={setCurrentTab}
        onSelectCheckin={id => setSelectedCheckinId(id)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={setCurrentTab}
      />

      <CheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        defaultQuartoId={checkinDefaultQuartoId}
      />

      {selectedCheckinId && (
        <CheckinDetailModal
          checkinId={selectedCheckinId}
          isOpen={true}
          onClose={() => setSelectedCheckinId(null)}
        />
      )}

      <HospedeModal
        isOpen={isHospedeModalOpen}
        onClose={() => {
          setIsHospedeModalOpen(false);
          setHospedeToEdit(null);
        }}
        hospedeToEdit={hospedeToEdit}
      />

      <QuartoModal
        isOpen={isQuartoModalOpen}
        onClose={() => {
          setIsQuartoModalOpen(false);
          setQuartoToEdit(null);
        }}
        quartoToEdit={quartoToEdit}
      />

      <WindowsInstallerModal
        isOpen={isWindowsSetupOpen}
        onClose={() => setIsWindowsSetupOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
