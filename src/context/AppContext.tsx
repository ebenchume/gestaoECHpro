/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Empresa,
  Quarto,
  Hospede,
  Checkin,
  ServicoCatalogo,
  LivroCaixa,
  Utilizador,
  AuditLog,
  LicencaInfo,
  AppSettings,
  DashboardWidget,
  NotificationItem,
  CheckinServico,
  Parcela,
  QuartoStatus
} from '../types';
import {
  INITIAL_EMPRESA,
  INITIAL_UTILIZADORES,
  INITIAL_QUARTOS,
  INITIAL_SERVICOS_CATALOGO,
  INITIAL_HOSPEDES,
  INITIAL_CHECKINS,
  INITIAL_LIVRO_CAIXA,
  INITIAL_AUDIT_LOGS,
  INITIAL_LICENCA
} from '../data/initialData';
import { scanSmartReminders, playNotificationSound, sendPushNotification } from '../utils/notifications';

interface AppContextType {
  // Data
  empresa: Empresa;
  setEmpresa: (emp: Empresa) => void;
  utilizadores: Utilizador[];
  currentUser: Utilizador;
  setCurrentUser: (u: Utilizador) => void;
  quartos: Quarto[];
  hospedes: Hospede[];
  checkins: Checkin[];
  servicosCatalogo: ServicoCatalogo[];
  livroCaixa: LivroCaixa[];
  auditLogs: AuditLog[];
  licenca: LicencaInfo;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Widgets
  widgets: DashboardWidget[];
  setWidgets: (w: DashboardWidget[]) => void;
  toggleWidget: (id: DashboardWidget['id']) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;

  // Online / Offline & Cloud Sync
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string;
  offlineQueueLength: number;
  triggerCloudSync: () => Promise<void>;

  // Operations
  updateQuartoStatus: (quartoId: number, status: QuartoStatus) => void;
  addOrUpdateQuarto: (quarto: Partial<Quarto>) => void;
  addOrUpdateHospede: (hospede: Partial<Hospede>) => Hospede;
  deleteHospede: (hospedeId: number) => boolean;
  addCheckin: (checkinData: Omit<Checkin, 'id' | 'criado_em' | 'servicos' | 'parcelas'>, initialParcela?: Partial<Parcela>) => Checkin;
  addServicoToCheckin: (checkinId: number, servico: Omit<CheckinServico, 'id' | 'checkin_id'>) => void;
  removeServicoFromCheckin: (checkinId: number, servicoId: number) => void;
  addPagamentoToCheckin: (checkinId: number, parcela: Omit<Parcela, 'id' | 'checkin_id'>) => void;
  realizarCheckout: (checkinId: number) => void;
  cancelarCheckin: (checkinId: number) => void;
  addLivroCaixaItem: (item: Omit<LivroCaixa, 'id' | 'data_movimento' | 'utilizador'>) => void;
  addAuditLog: (acao: string, detalhe: string, modulo: AuditLog['modulo']) => void;

  // Backup & Restore
  restoreFromBackup: (data: {
    empresa: Empresa;
    quartos: Quarto[];
    hospedes: Hospede[];
    checkins: Checkin[];
    servicos: ServicoCatalogo[];
    livroCaixa: LivroCaixa[];
    auditLogs: AuditLog[];
    licenca: LicencaInfo;
    settings: AppSettings;
  }) => void;
  activateLicenseKey: (key: string) => { success: boolean; message: string };

  // Theme
  isDark: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'pro_tips', title: 'Dicas Inteligentes & Ações Recomendadas (Pro-tips)', enabled: true, order: 0 },
  { id: 'quick_stats', title: 'Indicadores Chave', enabled: true, order: 1 },
  { id: 'occupancy_chart', title: 'Taxa de Ocupação', enabled: true, order: 2 },
  { id: 'today_flow', title: 'Fluxo de Hoje (Entradas/Saídas)', enabled: true, order: 3 },
  { id: 'finance_summary', title: 'Resumo Financeiro & Caixa', enabled: true, order: 4 },
  { id: 'room_map', title: 'Mapa Rápido dos Quartos', enabled: true, order: 5 },
  { id: 'pending_tasks', title: 'Alertas & Tarefas Pendentes', enabled: true, order: 6 },
  { id: 'weekly_forecast', title: 'Previsão Semanal', enabled: true, order: 7 },
];

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'auto',
  accentColor: 'teal',
  fontSize: 'normal',
  pushEnabled: true,
  soundAlerts: true,
  checkoutReminderHours: 4,
  autoCloudBackup: true,
  backupService: 'google_drive',
  autoSyncIntervalSec: 60,
};

const STORAGE_KEY = 'echpro_v2.5_state';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state or defaults
  const [empresa, setEmpresaState] = useState<Empresa>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_empresa`);
      return saved ? JSON.parse(saved) : INITIAL_EMPRESA;
    } catch {
      return INITIAL_EMPRESA;
    }
  });

  const [currentUser, setCurrentUser] = useState<Utilizador>(INITIAL_UTILIZADORES[0]);
  const [utilizadores] = useState<Utilizador[]>(INITIAL_UTILIZADORES);

  const [quartos, setQuartos] = useState<Quarto[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quartos`);
      return saved ? JSON.parse(saved) : INITIAL_QUARTOS;
    } catch {
      return INITIAL_QUARTOS;
    }
  });

  const [hospedes, setHospedes] = useState<Hospede[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_hospedes`);
      return saved ? JSON.parse(saved) : INITIAL_HOSPEDES;
    } catch {
      return INITIAL_HOSPEDES;
    }
  });

  const [checkins, setCheckins] = useState<Checkin[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_checkins`);
      return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
    } catch {
      return INITIAL_CHECKINS;
    }
  });

  const [servicosCatalogo, setServicosCatalogo] = useState<ServicoCatalogo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_servicos`);
      return saved ? JSON.parse(saved) : INITIAL_SERVICOS_CATALOGO;
    } catch {
      return INITIAL_SERVICOS_CATALOGO;
    }
  });

  const [livroCaixa, setLivroCaixa] = useState<LivroCaixa[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_caixa`);
      return saved ? JSON.parse(saved) : INITIAL_LIVRO_CAIXA;
    } catch {
      return INITIAL_LIVRO_CAIXA;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [licenca, setLicenca] = useState<LicencaInfo>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_licenca`);
      return saved ? JSON.parse(saved) : INITIAL_LICENCA;
    } catch {
      return INITIAL_LICENCA;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [widgets, setWidgetsState] = useState<DashboardWidget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_widgets`);
      if (saved) {
        const parsed: DashboardWidget[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(w => w.id));
        const missing = DEFAULT_WIDGETS.filter(w => !existingIds.has(w.id));
        return [...parsed, ...missing];
      }
      return DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  // Offline queue and sync
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());
  const [offlineQueue, setOfflineQueue] = useState<Array<{ type: string; timestamp: string }>>([]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Dark Mode calculation
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = useMemo(() => {
    if (settings.themeMode === 'dark') return true;
    if (settings.themeMode === 'light') return false;
    return systemPrefersDark;
  }, [settings.themeMode, systemPrefersDark]);

  // Sync dark class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_empresa`, JSON.stringify(empresa));
      localStorage.setItem(`${STORAGE_KEY}_quartos`, JSON.stringify(quartos));
      localStorage.setItem(`${STORAGE_KEY}_hospedes`, JSON.stringify(hospedes));
      localStorage.setItem(`${STORAGE_KEY}_checkins`, JSON.stringify(checkins));
      localStorage.setItem(`${STORAGE_KEY}_servicos`, JSON.stringify(servicosCatalogo));
      localStorage.setItem(`${STORAGE_KEY}_caixa`, JSON.stringify(livroCaixa));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_licenca`, JSON.stringify(licenca));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_widgets`, JSON.stringify(widgets));

      // Sync state to backend for background cron jobs
      fetch('/api/backup/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa,
          quartos,
          hospedes,
          checkins,
          servicos: servicosCatalogo,
          livroCaixa,
          auditLogs,
          licenca,
          settings
        })
      }).catch(() => {});
    } catch (err) {
      console.warn('Falha ao persistir no localStorage:', err);
    }
  }, [empresa, quartos, hospedes, checkins, servicosCatalogo, livroCaixa, auditLogs, licenca, settings, widgets]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineQueue.length > 0) {
        triggerCloudSync();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Check reminders on load and every 5 minutes
  useEffect(() => {
    const updateReminders = () => {
      const generated = scanSmartReminders(checkins, quartos, hospedes);
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newOnes = generated.filter(g => !existingIds.has(g.id));
        if (newOnes.length > 0) {
          if (settings.soundAlerts) playNotificationSound('alert');
          if (settings.pushEnabled) {
            newOnes.forEach(n => sendPushNotification(n.title, n.message));
          }
        }
        return [...newOnes, ...prev];
      });
    };

    updateReminders();
    const interval = setInterval(updateReminders, 300000); // 5 min
    return () => clearInterval(interval);
  }, [checkins, quartos, hospedes, settings.soundAlerts, settings.pushEnabled]);

  // Add audit log helper
  const addAuditLog = useCallback((acao: string, detalhe: string, modulo: AuditLog['modulo']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      data: new Date().toISOString(),
      utilizador: currentUser.nome_usuario,
      acao,
      detalhe,
      modulo
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // Cloud sync trigger
  const triggerCloudSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    // Simulate real cloud sync packet transmission
    await new Promise(r => setTimeout(r, 800));
    setLastSyncedAt(new Date().toISOString());
    setOfflineQueue([]);
    setIsSyncing(false);
    if (settings.soundAlerts) playNotificationSound('success');
  }, [settings.soundAlerts]);

  // Operations
  const updateQuartoStatus = useCallback((quartoId: number, status: QuartoStatus) => {
    setQuartos(prev => prev.map(q => q.id === quartoId ? { ...q, status } : q));
    const target = quartos.find(q => q.id === quartoId);
    addAuditLog('Status Quarto', `Quarto ${target ? target.numero : quartoId} alterado para ${status}`, 'Quartos');
    if (!navigator.onLine) {
      setOfflineQueue(q => [...q, { type: 'UPDATE_ROOM', timestamp: new Date().toISOString() }]);
    }
  }, [quartos, addAuditLog]);

  const addOrUpdateQuarto = useCallback((quartoData: Partial<Quarto>) => {
    if (quartoData.id) {
      setQuartos(prev => prev.map(q => q.id === quartoData.id ? { ...q, ...quartoData } as Quarto : q));
      addAuditLog('Quarto Atualizado', `Quarto ${quartoData.numero} modificado`, 'Quartos');
    } else {
      const newId = Math.max(0, ...quartos.map(q => q.id)) + 1;
      const newQuarto: Quarto = {
        id: newId,
        numero: quartoData.numero || `Q ${newId}`,
        tipo: quartoData.tipo || 'CASAL',
        preco_diaria: quartoData.preco_diaria || 3500,
        capacidade: quartoData.capacidade || 2,
        status: quartoData.status || 'disponivel',
        observacao: quartoData.observacao || '',
        activo: 1
      };
      setQuartos(prev => [...prev, newQuarto]);
      addAuditLog('Quarto Adicionado', `Novo quarto cadastrado: ${newQuarto.numero}`, 'Quartos');
    }
  }, [quartos, addAuditLog]);

  const addOrUpdateHospede = useCallback((hospedeData: Partial<Hospede>): Hospede => {
    if (hospedeData.id) {
      let updated: Hospede | null = null;
      setHospedes(prev => prev.map(h => {
        if (h.id === hospedeData.id) {
          updated = { ...h, ...hospedeData } as Hospede;
          return updated;
        }
        return h;
      }));
      addAuditLog('Hóspede Atualizado', `Cadastro de ${hospedeData.nome} modificado`, 'Hóspedes');
      return updated || (hospedeData as Hospede);
    } else {
      const newId = Math.max(0, ...hospedes.map(h => h.id)) + 1;
      const newHospede: Hospede = {
        id: newId,
        nome: hospedeData.nome || 'Hóspede sem nome',
        endereco: hospedeData.endereco || '',
        cidade: hospedeData.cidade || '',
        bairro: hospedeData.bairro || '',
        nuit: hospedeData.nuit || '',
        telefone1: hospedeData.telefone1 || '',
        telefone2: hospedeData.telefone2 || '',
        email: hospedeData.email || '',
        tipo_documento: hospedeData.tipo_documento || 'BI',
        numero_documento: hospedeData.numero_documento || '',
        validade_documento: hospedeData.validade_documento || '',
        data_nascimento: hospedeData.data_nascimento || '',
        nacionalidade: hospedeData.nacionalidade || 'Moçambicana',
        pais_origem: hospedeData.pais_origem || 'Moçambique',
        empresa: hospedeData.empresa || '',
        observacao: hospedeData.observacao || '',
        criado_em: new Date().toISOString()
      };
      setHospedes(prev => [newHospede, ...prev]);
      addAuditLog('Hóspede Cadastrado', `Novo hóspede: ${newHospede.nome}`, 'Hóspedes');
      return newHospede;
    }
  }, [hospedes, addAuditLog]);

  const deleteHospede = useCallback((hospedeId: number): boolean => {
    const hasActiveCheckin = checkins.some(c => c.hospede_id === hospedeId && c.status === 'CHECKIN');
    if (hasActiveCheckin) {
      return false;
    }
    const target = hospedes.find(h => h.id === hospedeId);
    setHospedes(prev => prev.filter(h => h.id !== hospedeId));
    addAuditLog('Hóspede Excluído', `Hóspede ${target ? target.nome : hospedeId} removido`, 'Hóspedes');
    return true;
  }, [checkins, hospedes, addAuditLog]);

  const addCheckin = useCallback((
    checkinData: Omit<Checkin, 'id' | 'criado_em' | 'servicos' | 'parcelas'>,
    initialParcela?: Partial<Parcela>
  ): Checkin => {
    const newId = Math.max(100, ...checkins.map(c => c.id)) + 1;
    const initialParcelas: Parcela[] = [];

    if (initialParcela && (initialParcela.valor_pago || 0) > 0) {
      initialParcelas.push({
        id: Date.now(),
        checkin_id: newId,
        numero_parcela: '1/1',
        data_parcela: new Date().toISOString().slice(0, 10),
        valor_parcela: initialParcela.valor_pago || 0,
        data_pagamento: new Date().toISOString().slice(0, 10),
        forma_pagamento: initialParcela.forma_pagamento || 'Dinheiro',
        referencia: initialParcela.referencia || '',
        valor_pago: initialParcela.valor_pago || 0,
        saldo_parcela: 0
      });
    }

    const totalPago = initialParcelas.reduce((acc, p) => acc + p.valor_pago, 0);
    const subtotal = checkinData.total_quarto - checkinData.total_desconto;
    const totalLiquido = subtotal;
    const saldo = Math.max(0, totalLiquido - totalPago);

    const newCheckin: Checkin = {
      ...checkinData,
      id: newId,
      subtotal,
      total_servicos: 0,
      total_liquido: totalLiquido,
      valor_pago: totalPago,
      saldo,
      criado_por: currentUser.id,
      criado_em: new Date().toISOString(),
      servicos: [],
      parcelas: initialParcelas
    };

    setCheckins(prev => [newCheckin, ...prev]);

    // Update room status
    if (newCheckin.status === 'CHECKIN') {
      updateQuartoStatus(newCheckin.quarto_id, 'ocupado');
    } else if (newCheckin.status === 'RESERVADO') {
      updateQuartoStatus(newCheckin.quarto_id, 'reservado');
    }

    // Cash movement if payment made
    if (totalPago > 0 && initialParcelas[0]) {
      const q = quartos.find(r => r.id === newCheckin.quarto_id);
      const h = hospedes.find(r => r.id === newCheckin.hospede_id);
      const newCaixaId = Math.max(0, ...livroCaixa.map(c => c.id)) + 1;
      const caixaItem: LivroCaixa = {
        id: newCaixaId,
        checkin_id: newId,
        tipo: 'Entrada',
        descricao: `Adiantamento Check-in #${newId} - ${q ? q.numero : ''} (${h ? h.nome : ''})`,
        categoria: 'Hospedagem',
        valor: totalPago,
        forma_pagamento: initialParcelas[0].forma_pagamento,
        data_movimento: new Date().toISOString(),
        utilizador: currentUser.nome_usuario
      };
      setLivroCaixa(prev => [caixaItem, ...prev]);
    }

    addAuditLog('Novo Check-in', `Check-in #${newId} criado para Quarto ${checkinData.quarto_id}`, 'Check-in');
    return newCheckin;
  }, [checkins, currentUser, quartos, hospedes, livroCaixa, updateQuartoStatus, addAuditLog]);

  const addServicoToCheckin = useCallback((checkinId: number, servicoData: Omit<CheckinServico, 'id' | 'checkin_id'>) => {
    setCheckins(prev => prev.map(c => {
      if (c.id !== checkinId) return c;
      const newServId = Date.now();
      const newServ: CheckinServico = {
        ...servicoData,
        id: newServId,
        checkin_id: checkinId
      };
      const updatedServicos = [...c.servicos, newServ];
      const totalServicos = updatedServicos.reduce((acc, s) => acc + s.total, 0);
      const totalLiquido = c.subtotal + totalServicos;
      const saldo = Math.max(0, totalLiquido - c.valor_pago);

      return {
        ...c,
        servicos: updatedServicos,
        total_servicos: totalServicos,
        total_liquido: totalLiquido,
        saldo
      };
    }));
    addAuditLog('Consumo Adicionado', `Serviço '${servicoData.descricao}' adicionado ao Check-in #${checkinId}`, 'Check-in');
  }, [addAuditLog]);

  const removeServicoFromCheckin = useCallback((checkinId: number, servicoId: number) => {
    setCheckins(prev => prev.map(c => {
      if (c.id !== checkinId) return c;
      const updatedServicos = c.servicos.filter(s => s.id !== servicoId);
      const totalServicos = updatedServicos.reduce((acc, s) => acc + s.total, 0);
      const totalLiquido = c.subtotal + totalServicos;
      const saldo = Math.max(0, totalLiquido - c.valor_pago);

      return {
        ...c,
        servicos: updatedServicos,
        total_servicos: totalServicos,
        total_liquido: totalLiquido,
        saldo
      };
    }));
    addAuditLog('Consumo Removido', `Serviço #${servicoId} removido do Check-in #${checkinId}`, 'Check-in');
  }, [addAuditLog]);

  const addPagamentoToCheckin = useCallback((checkinId: number, parcelaData: Omit<Parcela, 'id' | 'checkin_id'>) => {
    let checkinRef: Checkin | undefined;
    setCheckins(prev => prev.map(c => {
      if (c.id !== checkinId) return c;
      const newParcela: Parcela = {
        ...parcelaData,
        id: Date.now(),
        checkin_id: checkinId
      };
      const updatedParcelas = [...c.parcelas, newParcela];
      const totalPago = updatedParcelas.reduce((acc, p) => acc + p.valor_pago, 0);
      const saldo = Math.max(0, c.total_liquido - totalPago);
      checkinRef = c;

      return {
        ...c,
        parcelas: updatedParcelas,
        valor_pago: totalPago,
        saldo
      };
    }));

    // Register in Livro de Caixa
    const q = checkinRef ? quartos.find(r => r.id === checkinRef?.quarto_id) : null;
    const h = checkinRef ? hospedes.find(r => r.id === checkinRef?.hospede_id) : null;
    const newCaixaId = Math.max(0, ...livroCaixa.map(c => c.id)) + 1;
    const caixaItem: LivroCaixa = {
      id: newCaixaId,
      checkin_id: checkinId,
      tipo: 'Entrada',
      descricao: `Pagamento Check-in #${checkinId} - ${q ? q.numero : ''} (${h ? h.nome : ''})`,
      categoria: 'Hospedagem',
      valor: parcelaData.valor_pago,
      forma_pagamento: parcelaData.forma_pagamento,
      data_movimento: new Date().toISOString(),
      utilizador: currentUser.nome_usuario,
      observacao: parcelaData.referencia
    };
    setLivroCaixa(prev => [caixaItem, ...prev]);

    addAuditLog('Pagamento Registrado', `Pagamento de ${parcelaData.valor_pago} MT para Check-in #${checkinId}`, 'Pagamentos');
    if (settings.soundAlerts) playNotificationSound('success');
  }, [quartos, hospedes, livroCaixa, currentUser, addAuditLog, settings.soundAlerts]);

  const realizarCheckout = useCallback((checkinId: number) => {
    let roomIdToClean: number | null = null;
    setCheckins(prev => prev.map(c => {
      if (c.id !== checkinId) return c;
      roomIdToClean = c.quarto_id;
      return {
        ...c,
        status: 'CHECKOUT',
        data_checkout: new Date().toISOString()
      };
    }));

    if (roomIdToClean) {
      updateQuartoStatus(roomIdToClean, 'limpeza');
    }

    addAuditLog('Check-out Realizado', `Check-out finalizado para Check-in #${checkinId}`, 'Check-in');
    if (settings.soundAlerts) playNotificationSound('success');
  }, [updateQuartoStatus, addAuditLog, settings.soundAlerts]);

  const cancelarCheckin = useCallback((checkinId: number) => {
    let roomId: number | null = null;
    setCheckins(prev => prev.map(c => {
      if (c.id !== checkinId) return c;
      roomId = c.quarto_id;
      return { ...c, status: 'CANCELADO' };
    }));
    if (roomId) {
      updateQuartoStatus(roomId, 'disponivel');
    }
    addAuditLog('Check-in Cancelado', `Check-in #${checkinId} cancelado`, 'Check-in');
  }, [updateQuartoStatus, addAuditLog]);

  const addLivroCaixaItem = useCallback((itemData: Omit<LivroCaixa, 'id' | 'data_movimento' | 'utilizador'>) => {
    const newId = Math.max(0, ...livroCaixa.map(c => c.id)) + 1;
    const newItem: LivroCaixa = {
      ...itemData,
      id: newId,
      data_movimento: new Date().toISOString(),
      utilizador: currentUser.nome_usuario
    };
    setLivroCaixa(prev => [newItem, ...prev]);
    addAuditLog('Movimento de Caixa', `${newItem.tipo}: ${newItem.descricao} (${newItem.valor} MT)`, 'Caixa');
  }, [livroCaixa, currentUser, addAuditLog]);

  const restoreFromBackup = useCallback((data: {
    empresa: Empresa;
    quartos: Quarto[];
    hospedes: Hospede[];
    checkins: Checkin[];
    servicos: ServicoCatalogo[];
    livroCaixa: LivroCaixa[];
    auditLogs: AuditLog[];
    licenca: LicencaInfo;
    settings: AppSettings;
  }) => {
    if (data.empresa) setEmpresaState(data.empresa);
    if (data.quartos) setQuartos(data.quartos);
    if (data.hospedes) setHospedes(data.hospedes);
    if (data.checkins) setCheckins(data.checkins);
    if (data.servicos) setServicosCatalogo(data.servicos);
    if (data.livroCaixa) setLivroCaixa(data.livroCaixa);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    if (data.licenca) setLicenca(data.licenca);
    if (data.settings) setSettings(data.settings);
    addAuditLog('Restauração de Backup', 'Sistema restaurado a partir de backup com sucesso', 'Sistema');
    if (settings.soundAlerts) playNotificationSound('success');
  }, [addAuditLog, settings.soundAlerts]);

  const activateLicenseKey = useCallback((key: string): { success: boolean; message: string } => {
    const cleanKey = key.trim().toUpperCase();
    const regex = /^ECHP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!regex.test(cleanKey)) {
      return { success: false, message: 'Formato inválido. O formato deve ser ECHP-XXXX-XXXX-XXXX-XXXX.' };
    }

    setLicenca({
      status: 'activa',
      dias_restantes: 365,
      chave_usada: cleanKey,
      expira_em: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      machine_id: 'ECHP-WEB-' + Math.floor(Math.random() * 100000)
    });

    addAuditLog('Licença Ativada', `Chave ${cleanKey} ativada com sucesso`, 'Sistema');
    return { success: true, message: 'Licença ativada com sucesso por 365 dias!' };
  }, [addAuditLog]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleWidget = useCallback((id: DashboardWidget['id']) => {
    setWidgetsState(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        empresa,
        setEmpresa: setEmpresaState,
        utilizadores,
        currentUser,
        setCurrentUser,
        quartos,
        hospedes,
        checkins,
        servicosCatalogo,
        livroCaixa,
        auditLogs,
        licenca,
        settings,
        updateSettings,
        widgets,
        setWidgets: setWidgetsState,
        toggleWidget,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        isOnline,
        isSyncing,
        lastSyncedAt,
        offlineQueueLength: offlineQueue.length,
        triggerCloudSync,
        updateQuartoStatus,
        addOrUpdateQuarto,
        addOrUpdateHospede,
        deleteHospede,
        addCheckin,
        addServicoToCheckin,
        removeServicoFromCheckin,
        addPagamentoToCheckin,
        realizarCheckout,
        cancelarCheckin,
        addLivroCaixaItem,
        addAuditLog,
        restoreFromBackup,
        activateLicenseKey,
        isDark
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
