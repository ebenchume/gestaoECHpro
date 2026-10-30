/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  FileText, 
  Download, 
  CalendarPlus, 
  CreditCard, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Checkin, CheckinStatus } from '../../types';
import { formatCurrency, formatDate, exportInvoicePDF, exportToCSV } from '../../utils/export';
import { downloadICSFile, getGoogleCalendarUrl } from '../../utils/calendar';

interface CheckinsViewProps {
  onOpenCheckinModal: () => void;
  onSelectCheckin: (checkinId: number) => void;
}

export const CheckinsView: React.FC<CheckinsViewProps> = ({
  onOpenCheckinModal,
  onSelectCheckin
}) => {
  const { checkins, hospedes, quartos, empresa } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('CHECKIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredCheckins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return checkins.filter(c => {
      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const h = hospedes.find(guest => guest.id === c.hospede_id);
      const r = quartos.find(room => room.id === c.quarto_id);
      const guestName = h ? h.nome.toLowerCase() : '';
      const roomNum = r ? r.numero.toLowerCase() : '';
      const matchSearch = !q || guestName.includes(q) || roomNum.includes(q) || String(c.id).includes(q);
      return matchStatus && matchSearch;
    });
  }, [checkins, hospedes, quartos, filterStatus, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Hóspede', 'Quarto', 'Data Entrada', 'Data Saída', 'Noites',
      'Preço Diária', 'Total Quarto', 'Desconto', 'Consumos/Serviços', 'Total Líquido', 'Valor Pago', 'Saldo', 'Status'
    ];
    const rows = checkins.map(c => {
      const h = hospedes.find(g => g.id === c.hospede_id);
      const r = quartos.find(room => room.id === c.quarto_id);
      return [
        c.id,
        h?.nome || '',
        r?.numero || '',
        c.data_checkin,
        c.data_checkout || '',
        c.noites,
        c.preco_diaria,
        c.total_quarto,
        c.total_desconto,
        c.total_servicos,
        c.total_liquido,
        c.valor_pago,
        c.saldo,
        c.status
      ];
    });
    exportToCSV(`ECHpro_Estadias_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  // Calendar Timeline generation (Next 14 days)
  const calendarDays = useMemo(() => {
    const days: { date: Date; dateStr: string; label: string; weekday: string }[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = -2; i < 12; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      days.push({
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        weekday: d.toLocaleDateString('pt-MZ', { weekday: 'short' })
      });
    }
    return days;
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Check-in, Check-out & Reservas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controlo de estadias, cálculo automático de noites, consumos e sincronização de calendário.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Calendário
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Exportar CSV
          </button>
          <button
            onClick={onOpenCheckinModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Check-in / Reserva
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por hóspede, quarto ou código #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'CHECKIN', label: 'Em Andamento' },
            { id: 'RESERVADO', label: 'Reservas' },
            { id: 'CHECKOUT', label: 'Finalizados' },
            { id: 'todos', label: 'Todos os Registos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Hóspede</th>
                  <th className="p-3">Quarto</th>
                  <th className="p-3">Entrada</th>
                  <th className="p-3">Saída Prevista</th>
                  <th className="p-3 text-center">Noites</th>
                  <th className="p-3 text-right">Total Conta</th>
                  <th className="p-3 text-right">Valor Pago</th>
                  <th className="p-3 text-right">Saldo</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCheckins.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-400">
                      Nenhuma estadia encontrada para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredCheckins.map(c => {
                    const h = hospedes.find(g => g.id === c.hospede_id);
                    const q = quartos.find(r => r.id === c.quarto_id);

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-500">#{c.id}</td>
                        <td className="p-3">
                          <button
                            onClick={() => onSelectCheckin(c.id)}
                            className="font-bold text-slate-900 dark:text-white hover:text-teal-600 text-left"
                          >
                            {h?.nome || `Hóspede #${c.hospede_id}`}
                          </button>
                          <div className="text-[11px] text-slate-400">{h?.telefone1}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-teal-700 dark:text-teal-300">
                            {q?.numero}
                          </span>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {q?.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {formatDate(c.data_checkin)}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {c.data_checkout ? formatDate(c.data_checkout) : '—'}
                        </td>
                        <td className="p-3 text-center font-semibold">{c.noites}</td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(c.total_liquido)}
                        </td>
                        <td className="p-3 text-right font-semibold text-emerald-600">
                          {formatCurrency(c.valor_pago)}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {c.saldo > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">{formatCurrency(c.saldo)}</span>
                          ) : (
                            <span className="text-emerald-500">Liquidado</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            c.status === 'CHECKIN'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : c.status === 'RESERVADO'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectCheckin(c.id)}
                              className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-semibold"
                            >
                              Ver Detalhes
                            </button>
                            {h && q && (
                              <button
                                onClick={() => exportInvoicePDF(c, h, q, empresa)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Descarregar Recibo PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {h && q && (
                              <button
                                onClick={() => downloadICSFile(c, h, q, empresa)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Exportar para Calendário (.ics)"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Calendar / Timeline View */}
      {viewMode === 'calendar' && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Linha do Tempo das Ocupações & Reservas (Próximos 14 Dias)
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Check-in Ativo
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Reserva
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2 text-left w-28 bg-slate-50 dark:bg-slate-800/50 sticky left-0 font-bold">
                    Quarto
                  </th>
                  {calendarDays.map(d => (
                    <th key={d.dateStr} className="p-2 text-center min-w-[50px] border-l border-slate-100 dark:border-slate-800/60">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{d.weekday}</div>
                      <div className="font-bold text-slate-700 dark:text-slate-200">{d.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quartos.map(q => (
                  <tr key={q.id}>
                    <td className="p-2 font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/40 sticky left-0 truncate">
                      {q.numero}
                      <span className="block text-[10px] text-slate-400 font-normal">{q.tipo}</span>
                    </td>
                    {calendarDays.map(d => {
                      // Check if any checkin overlaps this day
                      const activeOnDay = checkins.find(c => {
                        if (c.quarto_id !== q.id) return false;
                        if (c.status === 'CANCELADO') return false;
                        const inDate = c.data_checkin.slice(0, 10);
                        const outDate = c.data_checkout ? c.data_checkout.slice(0, 10) : inDate;
                        return d.dateStr >= inDate && d.dateStr <= outDate;
                      });

                      if (activeOnDay) {
                        const h = hospedes.find(g => g.id === activeOnDay.hospede_id);
                        const isRes = activeOnDay.status === 'RESERVADO';
                        return (
                          <td 
                            key={d.dateStr} 
                            className="p-1 border-l border-slate-100 dark:border-slate-800/60"
                            onClick={() => onSelectCheckin(activeOnDay.id)}
                          >
                            <div className={`p-1.5 rounded text-[10px] font-bold text-center cursor-pointer truncate ${
                              isRes
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            }`}
                            title={`${h?.nome} (#${activeOnDay.id})`}
                            >
                              {h?.nome.split(' ')[0] || 'Ocupado'}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={d.dateStr} className="p-1 border-l border-slate-100 dark:border-slate-800/60 text-center">
                          <span className="text-[10px] text-slate-300 dark:text-slate-700">—</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
