/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  BedDouble, 
  CloudCheck, 
  ChevronRight, 
  X, 
  RefreshCw, 
  ArrowRight,
  Filter,
  Lightbulb,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/export';
import { NavTab } from '../layout/Sidebar';

export type TipCategory = 'todos' | 'ocupacao' | 'checkouts' | 'governanca' | 'financeiro';
export type TipSeverity = 'urgent' | 'warning' | 'opportunity' | 'info';

export interface ProTip {
  id: string;
  category: 'ocupacao' | 'checkouts' | 'governanca' | 'financeiro';
  severity: TipSeverity;
  title: string;
  message: string;
  badge: string;
  metric?: string;
  actionText: string;
  actionIcon?: React.ReactNode;
  onAction: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

interface ProTipsWidgetProps {
  onNavigateToTab: (tab: NavTab) => void;
  onOpenCheckinModal: () => void;
  onSelectCheckin: (checkinId: number) => void;
}

export const ProTipsWidget: React.FC<ProTipsWidgetProps> = ({
  onNavigateToTab,
  onOpenCheckinModal,
  onSelectCheckin
}) => {
  const { 
    quartos, 
    checkins, 
    hospedes, 
    livroCaixa, 
    updateQuartoStatus,
    empresa
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<TipCategory>('todos');
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute operational statistics for today
  const activeQuartos = useMemo(() => quartos.filter(q => q.activo === 1), [quartos]);
  const totalQuartos = activeQuartos.length;
  const ocupados = activeQuartos.filter(q => q.status === 'ocupado').length;
  const livres = activeQuartos.filter(q => q.status === 'disponivel').length;
  const emLimpeza = activeQuartos.filter(q => q.status === 'limpeza');
  const taxaOcupacao = totalQuartos > 0 ? Math.round((ocupados / totalQuartos) * 100) : 0;

  const checkinsAtivos = useMemo(() => checkins.filter(c => c.status === 'CHECKIN'), [checkins]);

  // Checkouts expiring today or overdue
  const checkoutsHoje = useMemo(() => {
    return checkinsAtivos.filter(c => c.data_checkout && c.data_checkout.slice(0, 10) <= todayStr);
  }, [checkinsAtivos, todayStr]);

  // Checkouts tomorrow
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const checkoutsAmanha = useMemo(() => {
    return checkinsAtivos.filter(c => c.data_checkout && c.data_checkout.slice(0, 10) === tomorrowStr);
  }, [checkinsAtivos, tomorrowStr]);

  // Arrivals today
  const chegadasHoje = useMemo(() => {
    return checkins.filter(c => c.data_checkin.slice(0, 10) === todayStr);
  }, [checkins, todayStr]);

  // Active checkins with unpaid balance
  const checkinsComSaldo = useMemo(() => {
    return checkinsAtivos.filter(c => c.saldo > 0);
  }, [checkinsAtivos]);

  const totalSaldoPendente = useMemo(() => {
    return checkinsComSaldo.reduce((acc, c) => acc + c.saldo, 0);
  }, [checkinsComSaldo]);

  // Generate dynamic, context-aware Pro-Tips
  const tips = useMemo<ProTip[]>(() => {
    const list: ProTip[] = [];

    // 1. LOW OCCUPANCY DETECTION (< 50% or available > occupied)
    if (taxaOcupacao < 50 && totalQuartos > 0) {
      list.push({
        id: 'tip-low-occupancy',
        category: 'ocupacao',
        severity: taxaOcupacao < 30 ? 'warning' : 'opportunity',
        badge: taxaOcupacao < 30 ? 'Baixa Ocupação' : 'Oportunidade',
        metric: `${taxaOcupacao}% Ocupação`,
        title: `Alerta de Demanda: Taxa de Ocupação Atual em ${taxaOcupacao}%`,
        message: `Com ${livres} de ${totalQuartos} quartos disponíveis, sugerimos aplicar tarifas promocionais corporativas para estadias de meio de semana em ${empresa.cidade || 'Moçambique'}, oferecer pacotes para empresas parceiras ou aproveitar o período para manutenção preventiva.`,
        actionText: 'Ver Quartos Livres',
        actionIcon: <BedDouble className="w-3.5 h-3.5" />,
        onAction: () => onNavigateToTab('quartos'),
        secondaryActionText: 'Novo Check-in Rápido',
        onSecondaryAction: onOpenCheckinModal
      });
    } else if (taxaOcupacao >= 80) {
      // HIGH OCCUPANCY TIPS
      list.push({
        id: 'tip-high-occupancy',
        category: 'ocupacao',
        severity: 'opportunity',
        badge: 'Alta Demanda',
        metric: `${taxaOcupacao}% Ocupado`,
        title: `Alta Ocupação (${taxaOcupacao}%): Otimização de Receita e Upsell`,
        message: `Excelente desempenho! Restam apenas ${livres} quarto(s) disponíveis. Para maximizar a receita (RevPAR), garanta diárias completas sem desconto para as últimas unidades e ofereça serviços adicionais (restaurante, lavandaria) aos hóspedes presentes.`,
        actionText: 'Gerenciar Quartos',
        actionIcon: <TrendingUp className="w-3.5 h-3.5" />,
        onAction: () => onNavigateToTab('quartos')
      });
    }

    // 2. EXPIRING BOOKINGS / CHECK-OUTS EXPIRING TODAY
    if (checkoutsHoje.length > 0) {
      const pendingCheckoutBalances = checkoutsHoje.filter(c => c.saldo > 0);
      const totalBalanceExpiring = pendingCheckoutBalances.reduce((acc, c) => acc + c.saldo, 0);

      const guestNames = checkoutsHoje
        .slice(0, 3)
        .map(c => {
          const h = hospedes.find(guest => guest.id === c.hospede_id);
          const q = quartos.find(room => room.id === c.quarto_id);
          return `${h?.nome || 'Hóspede'} (Q-${q?.numero || '?'})`;
        })
        .join(', ');

      list.push({
        id: 'tip-expiring-checkouts',
        category: 'checkouts',
        severity: 'urgent',
        badge: 'Vencendo Hoje',
        metric: `${checkoutsHoje.length} Saída(s)`,
        title: `${checkoutsHoje.length} Check-out(s) Programado(s) para Hoje`,
        message: `Estadias com término hoje: ${guestNames}${checkoutsHoje.length > 3 ? ` e mais ${checkoutsHoje.length - 3}` : ''}. ${
          pendingCheckoutBalances.length > 0
            ? `Atenção: ${pendingCheckoutBalances.length} estadia(s) possuem saldo pendente totalizando ${formatCurrency(totalBalanceExpiring)}. Conclua a cobrança antes da entrega das chaves.`
            : 'Todas as estadias de saída estão com contas liquidadas.'
        }`,
        actionText: 'Processar Check-outs',
        actionIcon: <Clock className="w-3.5 h-3.5" />,
        onAction: () => {
          if (checkoutsHoje.length > 0) {
            onSelectCheckin(checkoutsHoje[0].id);
          } else {
            onNavigateToTab('checkins');
          }
        },
        secondaryActionText: 'Ver Todos os Check-ins',
        onSecondaryAction: () => onNavigateToTab('checkins')
      });
    }

    // 3. UPCOMING CHECKOUTS TOMORROW (PROACTIVE PLANNING)
    if (checkoutsAmanha.length > 0 && checkoutsHoje.length <= 1) {
      list.push({
        id: 'tip-checkouts-tomorrow',
        category: 'checkouts',
        severity: 'info',
        badge: 'Previsão 24h',
        metric: `${checkoutsAmanha.length} Amanhã`,
        title: `Planejamento de Saídas: ${checkoutsAmanha.length} Check-out(s) Previstos para Amanhã`,
        message: `Antecipe a emissão de prévias de fatura e alinhe a escala de governança com as camareiras para liberação rápida dos quartos após a saída.`,
        actionText: 'Ver Estadias',
        actionIcon: <Clock className="w-3.5 h-3.5" />,
        onAction: () => onNavigateToTab('checkins')
      });
    }

    // 4. HOUSEKEEPING / QUARTOS EM LIMPEZA COM CHEGADAS HOJE
    if (emLimpeza.length > 0) {
      const roomNumbers = emLimpeza.map(q => q.numero).join(', ');
      list.push({
        id: 'tip-housekeeping',
        category: 'governanca',
        severity: chegadasHoje.length > 0 ? 'warning' : 'info',
        badge: 'Governança',
        metric: `${emLimpeza.length} em Limpeza`,
        title: `Governança: ${emLimpeza.length} Quarto(s) Aguardando Camareira`,
        message: `Os quartos ${roomNumbers} estão marcados como em limpeza. ${
          chegadasHoje.length > 0
            ? `Com ${chegadasHoje.length} chegada(s) hoje, priorize a liberação destes quartos para reduzir o tempo de espera no lobby.`
            : 'Mantenha a rotina de inspeção em dia para disponibilidade imediata no balcão.'
        }`,
        actionText: 'Liberar Todos como Disponíveis',
        actionIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
        onAction: () => {
          emLimpeza.forEach(q => updateQuartoStatus(q.id, 'disponivel'));
        },
        secondaryActionText: 'Ver Mapa de Quartos',
        onSecondaryAction: () => onNavigateToTab('quartos')
      });
    }

    // 5. PENDING UNPAID BALANCES (FINANCIAL HEALTH)
    if (totalSaldoPendente > 0 && checkinsComSaldo.length > 0) {
      list.push({
        id: 'tip-unpaid-balances',
        category: 'financeiro',
        severity: 'warning',
        badge: 'Gestão de Caixa',
        metric: formatCurrency(totalSaldoPendente),
        title: `Aviso Financeiro: ${formatCurrency(totalSaldoPendente)} em Saldos Pendentes`,
        message: `Existem ${checkinsComSaldo.length} estadia(s) ativas com saldo devedor. É recomendável solicitar adiantamentos ou garantia no cartão / M-Pesa / E-Mola para consumos e diárias estendidas.`,
        actionText: 'Ver Check-ins com Saldo',
        actionIcon: <DollarSign className="w-3.5 h-3.5" />,
        onAction: () => {
          if (checkinsComSaldo.length > 0) {
            onSelectCheckin(checkinsComSaldo[0].id);
          } else {
            onNavigateToTab('checkins');
          }
        },
        secondaryActionText: 'Ver Livro Caixa',
        onSecondaryAction: () => onNavigateToTab('caixa')
      });
    }

    // 6. CLOUD BACKUP & OPERATIONAL CONTINUITY
    list.push({
      id: 'tip-backup-cloud',
      category: 'financeiro',
      severity: 'info',
      badge: 'Segurança Cloud',
      metric: 'Backup Automático',
      title: 'Proteção de Dados: Backup Diário Automático Ativo',
      message: 'O sistema realiza rotinas de segurança na nuvem (Google Drive e Dropbox) com verificação de integridade SHA-256 e suporte offline total para evitar interrupções operacionais.',
      actionText: 'Configurações de Backup',
      actionIcon: <CloudCheck className="w-3.5 h-3.5" />,
      onAction: () => onNavigateToTab('config')
    });

    return list;
  }, [
    taxaOcupacao,
    totalQuartos,
    livres,
    empresa.cidade,
    checkoutsHoje,
    checkoutsAmanha,
    emLimpeza,
    chegadasHoje.length,
    totalSaldoPendente,
    checkinsComSaldo,
    hospedes,
    quartos,
    onNavigateToTab,
    onOpenCheckinModal,
    onSelectCheckin,
    updateQuartoStatus
  ]);

  // Filtered tips
  const visibleTips = useMemo(() => {
    return tips.filter(tip => {
      if (dismissedTips.includes(tip.id)) return false;
      if (activeCategory === 'todos') return true;
      return tip.category === activeCategory;
    });
  }, [tips, dismissedTips, activeCategory]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedTips(prev => [...prev, id]);
  };

  const handleRestoreDismissed = () => {
    setDismissedTips([]);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const getSeverityBadge = (severity: TipSeverity) => {
    switch (severity) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'opportunity':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const getSeverityCardBorder = (severity: TipSeverity) => {
    switch (severity) {
      case 'urgent':
        return 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700';
      case 'warning':
        return 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700';
      case 'opportunity':
        return 'border-l-4 border-l-teal-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dicas Inteligentes & Ações Recomendadas (Pro-tips)
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {visibleTips.length} ativas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sugestões baseadas na data atual ({formatDate(todayStr)}), ocupação em tempo real e vencimento de reservas.
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {dismissedTips.length > 0 && (
            <button
              onClick={handleRestoreDismissed}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
              title="Restaurar dicas ocultadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restaurar ({dismissedTips.length})</span>
            </button>
          )}

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            title="Recalcular indicadores em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-500' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {[
          { key: 'todos' as TipCategory, label: 'Todas as Dicas' },
          { key: 'ocupacao' as TipCategory, label: 'Ocupação & Demanda' },
          { key: 'checkouts' as TipCategory, label: 'Check-outs & Prazos' },
          { key: 'governanca' as TipCategory, label: 'Governança' },
          { key: 'financeiro' as TipCategory, label: 'Caixa & Saldo' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips List */}
      {visibleTips.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Tudo em perfeita ordem operacional!
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Não há pendências críticas ou ações de baixa ocupação requerendo intervenção imediata nesta categoria.
          </p>
          {dismissedTips.length > 0 && (
            <button
              onClick={handleRestoreDismissed}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar {dismissedTips.length} dica(s) dispensadas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visibleTips.map(tip => (
            <div
              key={tip.id}
              className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col justify-between ${getSeverityCardBorder(
                tip.severity
              )}`}
            >
              <div>
                {/* Badge row and dismiss button */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        tip.severity
                      )}`}
                    >
                      {tip.badge}
                    </span>
                    {tip.metric && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tip.metric}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDismiss(tip.id, e)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                    title="Dispensar sugestão"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {tip.title}
                </h3>

                {/* Message body */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {tip.message}
                </p>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={tip.onAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    {tip.actionIcon}
                    <span>{tip.actionText}</span>
                  </button>
                  {tip.secondaryActionText && tip.onSecondaryAction && (
                    <button
                      onClick={tip.onSecondaryAction}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                    >
                      {tip.secondaryActionText}
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400">
                  ECHpro Intelligence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
