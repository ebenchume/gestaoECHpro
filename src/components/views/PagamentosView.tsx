/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportInvoicePDF } from '../../utils/export';

interface PagamentosViewProps {
  onSelectCheckin: (checkinId: number) => void;
}

export const PagamentosView: React.FC<PagamentosViewProps> = ({ onSelectCheckin }) => {
  const { checkins, hospedes, quartos, empresa, addPagamentoToCheckin } = useApp();

  const [filterType, setFilterType] = useState<'pendentes' | 'liquidados' | 'todos'>('pendentes');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick payment modal
  const [quickPayCheckinId, setQuickPayCheckinId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('M-Pesa');
  const [payRef, setPayRef] = useState<string>('');

  const targetCheckin = checkins.find(c => c.id === quickPayCheckinId);

  const filteredCheckins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return checkins.filter(c => {
      const matchStatus = 
        filterType === 'todos' ? true :
        filterType === 'pendentes' ? c.saldo > 0 :
        c.saldo === 0;

      const h = hospedes.find(guest => guest.id === c.hospede_id);
      const r = quartos.find(room => room.id === c.quarto_id);
      const matchSearch = !q || 
        (h && h.nome.toLowerCase().includes(q)) || 
        (r && r.numero.toLowerCase().includes(q)) ||
        String(c.id).includes(q);

      return matchStatus && matchSearch;
    });
  }, [checkins, hospedes, quartos, filterType, searchTerm]);

  // Overall totals
  const totalFaturado = checkins.reduce((acc, c) => acc + c.total_liquido, 0);
  const totalRecebido = checkins.reduce((acc, c) => acc + c.valor_pago, 0);
  const totalPendente = checkins.reduce((acc, c) => acc + c.saldo, 0);

  const handleOpenPay = (checkinId: number, saldo: number) => {
    setQuickPayCheckinId(checkinId);
    setPayAmount(saldo);
    setPayRef('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayCheckinId || payAmount <= 0) return;

    addPagamentoToCheckin(quickPayCheckinId, {
      valor_parcela: payAmount,
      data_pagamento: new Date().toISOString().slice(0, 10),
      forma_pagamento: payMethod,
      referencia: payRef,
      valor_pago: payAmount
    });

    setQuickPayCheckinId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Controlo de Pagamentos & Contas a Receber
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de amortizações, parcelas pagas, dívidas em aberto e formas de liquidação.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Faturado (Estadias)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalFaturado)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Liquidado / Recebido</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRecebido)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total a Receber (Em Aberto)</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalPendente)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por hóspede ou quarto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'pendentes', label: 'Com Saldo Devedor' },
            { id: 'liquidados', label: 'Totalmente Pagos' },
            { id: 'todos', label: 'Todos os Registos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Estadia</th>
                <th className="p-3">Hóspede</th>
                <th className="p-3">Quarto</th>
                <th className="p-3 text-right">Total Conta</th>
                <th className="p-3 text-right">Total Pago</th>
                <th className="p-3 text-right">Saldo Pendente</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCheckins.map(c => {
                const h = hospedes.find(g => g.id === c.hospede_id);
                const q = quartos.find(r => r.id === c.quarto_id);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-500">#{c.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{h?.nome}</div>
                      <div className="text-[11px] text-slate-400">{h?.telefone1}</div>
                    </td>
                    <td className="p-3 font-semibold text-teal-600 dark:text-teal-400">
                      {q?.numero}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(c.total_liquido)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatCurrency(c.valor_pago)}
                    </td>
                    <td className="p-3 text-right font-black">
                      {c.saldo > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">{formatCurrency(c.saldo)}</span>
                      ) : (
                        <span className="text-emerald-500">Liquidado</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        c.saldo === 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                      }`}>
                        {c.saldo === 0 ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.saldo > 0 && (
                          <button
                            onClick={() => handleOpenPay(c.id, c.saldo)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
                          >
                            + Receber
                          </button>
                        )}
                        <button
                          onClick={() => onSelectCheckin(c.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
                        >
                          Ver Conta
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Receive Payment Modal */}
      {quickPayCheckinId && targetCheckin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Registar Pagamento (Estadia #{quickPayCheckinId})
                </h3>
              </div>
              <button onClick={() => setQuickPayCheckinId(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor a Receber (MT) *</label>
                <input
                  type="number"
                  min="1"
                  max={targetCheckin.saldo}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-base font-bold text-emerald-700 dark:text-emerald-300 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="E-Mola">E-Mola</option>
                  <option value="Cartão">Cartão / POS</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência">Transferência Bancária</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Referência do Comprovativo</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="Ex: Talão MP-998822"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPayCheckinId(null)}
                  className="px-4 py-2 rounded-lg text-slate-500 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
