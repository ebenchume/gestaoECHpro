/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  Users, 
  BedDouble, 
  KeyRound, 
  CreditCard, 
  BookOpen, 
  Filter, 
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../layout/Sidebar';
import { formatCurrency, formatDate } from '../../utils/export';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavTab) => void;
  onSelectCheckin: (checkinId: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onSelectCheckin
}) => {
  const { hospedes, quartos, checkins, livroCaixa } = useApp();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'hospedes' | 'quartos' | 'checkins' | 'caixa'>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchesHospedes = (activeFilter === 'todos' || activeFilter === 'hospedes')
      ? hospedes.filter(h => 
          !q || 
          h.nome.toLowerCase().includes(q) || 
          h.telefone1.includes(q) || 
          (h.email && h.email.toLowerCase().includes(q)) ||
          h.numero_documento.toLowerCase().includes(q) ||
          h.nacionalidade.toLowerCase().includes(q) ||
          (h.empresa && h.empresa.toLowerCase().includes(q))
        ).map(h => ({
          type: 'hospede' as const,
          id: h.id,
          title: h.nome,
          subtitle: `${h.tipo_documento}: ${h.numero_documento} | Tel: ${h.telefone1} | ${h.nacionalidade}`,
          extra: h.empresa || h.cidade,
          data: h
        }))
      : [];

    const matchesQuartos = (activeFilter === 'todos' || activeFilter === 'quartos')
      ? quartos.filter(r => {
          const matchQ = !q || r.numero.toLowerCase().includes(q) || r.tipo.toLowerCase().includes(q);
          const matchStatus = statusFilter === 'todos' || r.status === statusFilter;
          return matchQ && matchStatus;
        }).map(r => ({
          type: 'quarto' as const,
          id: r.id,
          title: `Quarto ${r.numero} — ${r.tipo}`,
          subtitle: `Capacidade: ${r.capacidade} pessoa(s) | Diária: ${formatCurrency(r.preco_diaria)}`,
          status: r.status,
          data: r
        }))
      : [];

    const matchesCheckins = (activeFilter === 'todos' || activeFilter === 'checkins')
      ? checkins.filter(c => {
          const h = hospedes.find(guest => guest.id === c.hospede_id);
          const r = quartos.find(room => room.id === c.quarto_id);
          const guestName = h ? h.nome.toLowerCase() : '';
          const roomNum = r ? r.numero.toLowerCase() : '';
          const matchQ = !q || guestName.includes(q) || roomNum.includes(q) || String(c.id).includes(q);
          const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
          return matchQ && matchStatus;
        }).map(c => {
          const h = hospedes.find(guest => guest.id === c.hospede_id);
          const r = quartos.find(room => room.id === c.quarto_id);
          return {
            type: 'checkin' as const,
            id: c.id,
            title: `Check-in #${c.id} — ${h ? h.nome : 'Hóspede'} (${r ? r.numero : 'Quarto'})`,
            subtitle: `Entrada: ${formatDate(c.data_checkin)} | Total: ${formatCurrency(c.total_liquido)} | Saldo: ${formatCurrency(c.saldo)}`,
            status: c.status,
            data: c
          };
        })
      : [];

    const matchesCaixa = (activeFilter === 'todos' || activeFilter === 'caixa')
      ? livroCaixa.filter(k => 
          !q || 
          k.descricao.toLowerCase().includes(q) || 
          k.categoria.toLowerCase().includes(q) || 
          k.forma_pagamento.toLowerCase().includes(q) ||
          String(k.valor).includes(q)
        ).slice(0, 15).map(k => ({
          type: 'caixa' as const,
          id: k.id,
          title: `${k.tipo}: ${k.descricao}`,
          subtitle: `${formatDate(k.data_movimento)} | ${k.categoria} | ${k.forma_pagamento}`,
          extra: formatCurrency(k.valor),
          data: k
        }))
      : [];

    return {
      hospedes: matchesHospedes.slice(0, 8),
      quartos: matchesQuartos.slice(0, 8),
      checkins: matchesCheckins.slice(0, 8),
      caixa: matchesCaixa.slice(0, 8),
      total: matchesHospedes.length + matchesQuartos.length + matchesCheckins.length + matchesCaixa.length
    };
  }, [query, activeFilter, statusFilter, hospedes, quartos, checkins, livroCaixa]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-10 animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/60 dark:bg-slate-900/60">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Digite para pesquisar em tempo real (nome, quarto, documento, telefone, ID)..."
            autoFocus
            className="w-full bg-transparent border-0 text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          {[
            { id: 'todos', label: 'Todos os Módulos' },
            { id: 'checkins', label: 'Check-ins / Reservas' },
            { id: 'quartos', label: 'Quartos' },
            { id: 'hospedes', label: 'Hóspedes' },
            { id: 'caixa', label: 'Livro Caixa' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeFilter === f.id
                  ? 'bg-teal-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {results.total === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-xs mt-1">Tente pesquisar por número de quarto, nome ou documento.</p>
            </div>
          ) : (
            <>
              {/* Check-ins results */}
              {results.checkins.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-teal-500" />
                      Check-ins & Estadias ({results.checkins.length})
                    </span>
                    <button
                      onClick={() => { onNavigateToTab('checkins'); onClose(); }}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 normal-case font-semibold"
                    >
                      Ver no Módulo <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.checkins.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectCheckin(item.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-700/60 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'CHECKIN'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : item.status === 'RESERVADO'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hóspedes results */}
              {results.hospedes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      Hóspedes ({results.hospedes.length})
                    </span>
                    <button
                      onClick={() => { onNavigateToTab('hospedes'); onClose(); }}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 normal-case font-semibold"
                    >
                      Ver no Módulo <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.hospedes.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onNavigateToTab('hospedes'); onClose(); }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                        {item.extra && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                            {item.extra}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quartos results */}
              {results.quartos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-500" />
                      Quartos ({results.quartos.length})
                    </span>
                    <button
                      onClick={() => { onNavigateToTab('quartos'); onClose(); }}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 normal-case font-semibold"
                    >
                      Ver no Módulo <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.quartos.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onNavigateToTab('quartos'); onClose(); }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.status === 'disponivel'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'ocupado'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : item.status === 'limpeza'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Livro Caixa results */}
              {results.caixa.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      Livro de Caixa ({results.caixa.length})
                    </span>
                    <button
                      onClick={() => { onNavigateToTab('caixa'); onClose(); }}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 normal-case font-semibold"
                    >
                      Ver no Módulo <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.caixa.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onNavigateToTab('caixa'); onClose(); }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
                          {item.extra}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>Dica: Use <strong>⌘K</strong> para abrir a qualquer momento</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
