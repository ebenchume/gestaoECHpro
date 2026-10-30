/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BedDouble, 
  Users, 
  KeyRound, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  SlidersHorizontal, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/export';
import { NavTab } from '../layout/Sidebar';
import { QuartoStatus } from '../../types';
import { ProTipsWidget } from '../widgets/ProTipsWidget';

interface DashboardViewProps {
  onNavigateToTab: (tab: NavTab) => void;
  onOpenCheckinModal: () => void;
  onOpenHospedeModal: () => void;
  onSelectCheckin: (checkinId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
  onOpenCheckinModal,
  onOpenHospedeModal,
  onSelectCheckin
}) => {
  const { 
    quartos, 
    checkins, 
    hospedes, 
    livroCaixa, 
    widgets, 
    toggleWidget, 
    updateQuartoStatus,
    empresa,
    licenca
  } = useApp();

  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  // Statistics
  const totalQuartos = quartos.filter(q => q.activo === 1).length;
  const ocupados = quartos.filter(q => q.status === 'ocupado' && q.activo === 1).length;
  const livres = quartos.filter(q => q.status === 'disponivel' && q.activo === 1).length;
  const limpeza = quartos.filter(q => q.status === 'limpeza' && q.activo === 1).length;
  const manutencao = quartos.filter(q => q.status === 'manutencao' && q.activo === 1).length;
  const reservado = quartos.filter(q => q.status === 'reservado' && q.activo === 1).length;

  const taxaOcupacao = totalQuartos > 0 ? Math.round((ocupados / totalQuartos) * 100) : 0;
  const checkinsAtivos = checkins.filter(c => c.status === 'CHECKIN');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Today financial entries & exits
  const caixaHoje = useMemo(() => {
    return livroCaixa.filter(c => c.data_movimento.startsWith(todayStr));
  }, [livroCaixa, todayStr]);

  const receitaHoje = caixaHoje.filter(c => c.tipo === 'Entrada').reduce((acc, c) => acc + c.valor, 0);
  const despesasHoje = caixaHoje.filter(c => c.tipo === 'Saída').reduce((acc, c) => acc + c.valor, 0);
  const totalSaldoPendente = checkinsAtivos.reduce((acc, c) => acc + c.saldo, 0);

  // Today arrivals and departures
  const chegadasHoje = useMemo(() => {
    return checkins.filter(c => c.data_checkin.startsWith(todayStr));
  }, [checkins, todayStr]);

  const saidasHoje = useMemo(() => {
    return checkins.filter(c => c.data_checkout && c.data_checkout.startsWith(todayStr) && c.status === 'CHECKIN');
  }, [checkins, todayStr]);

  // Is a widget enabled?
  const isEnabled = (id: string) => widgets.find(w => w.id === id)?.enabled ?? true;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {empresa.cidade} — Moçambique
              </span>
              <span className="text-xs text-teal-200/80">
                {new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel de Controlo Principal
            </h1>
            <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
              Sistema ativo com sincronização em nuvem e suporte offline completo.
              Gerencie reservas, quartos e emissão de faturas instantaneamente.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCheckinModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-950/40 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              Novo Check-in
            </button>
            <button
              onClick={onOpenHospedeModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-xs transition-colors"
            >
              <Users className="w-4 h-4 text-teal-300" />
              Novo Hóspede
            </button>
            <button
              onClick={() => setShowWidgetConfig(!showWidgetConfig)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-colors"
              title="Personalizar Widgets do Dashboard"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Personalizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Widget Customizer Drawer (when open) */}
      {showWidgetConfig && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personalização de Widgets da Tela Inicial
              </h3>
            </div>
            <button
              onClick={() => setShowWidgetConfig(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Concluir
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Ative ou oculte widgets para adaptar o painel à rotina da recepção ou gerência.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {widgets.map(w => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  w.enabled
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                }`}
              >
                {w.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WIDGET 1: Quick Stats Cards */}
      {isEnabled('quick_stats') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Quartos</span>
              <BedDouble className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {totalQuartos}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
              {livres} disponíveis
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Ocupados</span>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {ocupados}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {taxaOcupacao}% da capacidade
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Disponíveis</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {livres}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Prontos para entrada
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Em Limpeza</span>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
              {limpeza}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              Aguardando camareira
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Check-ins Ativos</span>
              <KeyRound className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">
              {checkinsAtivos.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {hospedes.length} hóspedes na base
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Entradas Hoje</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2 truncate">
              {formatCurrency(receitaHoje)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Livro de Caixa
            </div>
          </div>
        </div>
      )}

      {/* WIDGET: Pro-tips & Smart Operational Suggestions */}
      {isEnabled('pro_tips') && (
        <ProTipsWidget
          onNavigateToTab={onNavigateToTab}
          onOpenCheckinModal={onOpenCheckinModal}
          onSelectCheckin={onSelectCheckin}
        />
      )}

      {/* Main Grid: Occupancy Chart + Flow of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WIDGET 2: Occupancy Visual Chart */}
        {isEnabled('occupancy_chart') && (
          <div className="lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  Taxa de Ocupação Hoje
                </h3>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {taxaOcupacao}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {ocupados} de {totalQuartos} quartos ocupados
              </p>

              {/* Visual Ring Gauge */}
              <div className="py-6 flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-teal-500 transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * taxaOcupacao) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {taxaOcupacao}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Ocupação
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Disponíveis:</span>
                <strong className="text-slate-800 dark:text-slate-200">{livres}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Ocupados:</span>
                <strong className="text-slate-800 dark:text-slate-200">{ocupados}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Em Limpeza:</span>
                <strong className="text-slate-800 dark:text-slate-200">{limpeza}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-400">Reservados:</span>
                <strong className="text-slate-800 dark:text-slate-200">{reservado}</strong>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET 3: Today's Arrivals and Departures */}
        {isEnabled('today_flow') && (
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Fluxo Operacional de Hoje
                </h3>
                <span className="text-xs text-slate-500">
                  {chegadasHoje.length} chegadas | {saidasHoje.length} saídas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entradas */}
                <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Chegadas / Check-ins Hoje</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                      {chegadasHoje.length}
                    </span>
                  </div>
                  {chegadasHoje.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Nenhum check-in novo registrado para hoje até ao momento.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {chegadasHoje.map(c => {
                        const h = hospedes.find(guest => guest.id === c.hospede_id);
                        const q = quartos.find(room => room.id === c.quarto_id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => onSelectCheckin(c.id)}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 border border-transparent shadow-2xs"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{h?.nome}</span>
                              <p className="text-[11px] text-slate-500">{q?.numero} — {q?.tipo}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                              {c.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Saídas */}
                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center justify-between">
                    <span>Saídas / Check-outs Previstos</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px]">
                      {saidasHoje.length}
                    </span>
                  </div>
                  {saidasHoje.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Sem check-outs vencendo hoje.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {saidasHoje.map(c => {
                        const h = hospedes.find(guest => guest.id === c.hospede_id);
                        const q = quartos.find(room => room.id === c.quarto_id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => onSelectCheckin(c.id)}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-xs flex items-center justify-between cursor-pointer hover:border-rose-400 border border-transparent shadow-2xs"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{h?.nome}</span>
                              <p className="text-[11px] text-slate-500">{q?.numero} — Saldo: {formatCurrency(c.saldo)}</p>
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 shrink-0">
                              Check-out
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Para emitir o recibo oficial ou fechar conta, clique sobre a estadia.</span>
              <button
                onClick={() => onNavigateToTab('checkins')}
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
              >
                Ver todos os check-ins <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WIDGET 4: Interactive Room Map Grid */}
      {isEnabled('room_map') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-teal-500" />
                Mapa Rápido dos Quartos
              </h3>
              <p className="text-xs text-slate-500">
                Clique num quarto para alterar o status ou criar check-in imediato.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Livre
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Ocupado
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Limpeza
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Reservado
              </span>
              <button
                onClick={() => onNavigateToTab('quartos')}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline ml-2"
              >
                Gerenciar Quartos →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {quartos.map(q => {
              const activeCheckin = checkins.find(c => c.quarto_id === q.id && c.status === 'CHECKIN');
              const guest = activeCheckin ? hospedes.find(h => h.id === activeCheckin.hospede_id) : null;

              const statusColor = 
                q.status === 'disponivel'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100'
                  : q.status === 'ocupado'
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                  : q.status === 'limpeza'
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100'
                  : q.status === 'reservado'
                  ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[96px] ${statusColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-extrabold tracking-tight block">
                        {q.numero}
                      </span>
                      <span className="text-[10px] uppercase font-bold opacity-75">
                        {q.tipo}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      {q.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                    {guest ? (
                      <span 
                        onClick={() => activeCheckin && onSelectCheckin(activeCheckin.id)}
                        className="truncate font-semibold underline cursor-pointer hover:text-teal-600"
                        title={guest.nome}
                      >
                        {guest.nome.split(' ')[0]}
                      </span>
                    ) : q.status === 'limpeza' ? (
                      <button
                        onClick={() => updateQuartoStatus(q.id, 'disponivel')}
                        className="text-[10px] font-bold text-amber-800 dark:text-amber-300 underline hover:text-teal-600"
                      >
                        Marcar Limpo
                      </button>
                    ) : (
                      <span className="text-[10px] opacity-75">{formatCurrency(q.preco_diaria)}</span>
                    )}

                    {q.status === 'disponivel' && (
                      <button
                        onClick={onOpenCheckinModal}
                        className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                      >
                        + Ocupar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WIDGET 5 & 6: Active Check-ins Table & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Check-ins Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-500" />
              Check-ins em Andamento ({checkinsAtivos.length})
            </h3>
            <button
              onClick={() => onNavigateToTab('checkins')}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              Ver Tabela Completa →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Hóspede</th>
                  <th className="p-2.5">Quarto</th>
                  <th className="p-2.5">Entrada</th>
                  <th className="p-2.5">Saída Prev.</th>
                  <th className="p-2.5 text-right">Saldo</th>
                  <th className="p-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {checkinsAtivos.slice(0, 6).map(c => {
                  const h = hospedes.find(guest => guest.id === c.hospede_id);
                  const q = quartos.find(room => room.id === c.quarto_id);
                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => onSelectCheckin(c.id)}
                    >
                      <td className="p-2.5 font-bold text-slate-600 dark:text-slate-400">#{c.id}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{h?.nome}</td>
                      <td className="p-2.5 font-semibold text-teal-600 dark:text-teal-400">{q?.numero}</td>
                      <td className="p-2.5 text-slate-500">{formatDate(c.data_checkin)}</td>
                      <td className="p-2.5 text-slate-500">{c.data_checkout ? formatDate(c.data_checkout) : '—'}</td>
                      <td className="p-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        {c.saldo > 0 ? formatCurrency(c.saldo) : <span className="text-emerald-500">Pago</span>}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-[11px] font-bold text-teal-600 hover:underline">
                          Abrir Conta
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* WIDGET 6: Financial Summary Widget */}
        {isEnabled('finance_summary') && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Resumo Financeiro & Caixa
                </h3>
                <button
                  onClick={() => onNavigateToTab('caixa')}
                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                >
                  Livro Caixa →
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                  <div className="text-slate-500">Entradas de Hoje:</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{formatCurrency(receitaHoje)}
                  </div>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                  <div className="text-slate-500">Saídas / Despesas Hoje:</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                    -{formatCurrency(despesasHoje)}
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-xl">
                  <div className="text-slate-500">Saldos Devedores Ativos:</div>
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatCurrency(totalSaldoPendente)}
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                    Valor a receber no check-out
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              Licença ECHpro: <span className="font-semibold text-emerald-600">{licenca.status.toUpperCase()}</span> ({licenca.dias_restantes} dias restantes)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
