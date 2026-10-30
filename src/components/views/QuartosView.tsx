/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BedDouble, 
  Plus, 
  Filter, 
  Search, 
  Edit, 
  Sparkles, 
  Wrench, 
  CheckCircle, 
  KeyRound, 
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quarto, QuartoStatus } from '../../types';
import { formatCurrency, exportToCSV } from '../../utils/export';

interface QuartosViewProps {
  onOpenQuartoModal: (quarto?: Quarto) => void;
  onOpenCheckinModalForRoom: (quartoId: number) => void;
}

export const QuartosView: React.FC<QuartosViewProps> = ({
  onOpenQuartoModal,
  onOpenCheckinModalForRoom
}) => {
  const { quartos, checkins, hospedes, updateQuartoStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredQuartos = useMemo(() => {
    return quartos.filter(q => {
      const matchStatus = filterStatus === 'todos' || q.status === filterStatus;
      const matchSearch = !searchTerm || 
        q.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch && q.activo === 1;
    });
  }, [quartos, filterStatus, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Número', 'Tipo', 'Capacidade', 'Preço Diária', 'Status', 'Observações'];
    const rows = quartos.map(q => [
      q.id,
      q.numero,
      q.tipo,
      q.capacidade,
      q.preco_diaria,
      q.status,
      q.observacao || ''
    ]);
    exportToCSV(`ECHpro_Quartos_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Gestão de Quartos & Acomodações
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize o status em tempo real, capacidade, tarifas e higienização.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Exportar CSV
          </button>
          <button
            onClick={() => onOpenQuartoModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Quarto
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por número ou tipo de quarto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'disponivel', label: 'Disponíveis' },
            { id: 'ocupado', label: 'Ocupados' },
            { id: 'limpeza', label: 'Limpeza' },
            { id: 'reservado', label: 'Reservados' },
            { id: 'manutencao', label: 'Manutenção' },
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredQuartos.map(q => {
          const activeCheckin = checkins.find(c => c.quarto_id === q.id && c.status === 'CHECKIN');
          const guest = activeCheckin ? hospedes.find(h => h.id === activeCheckin.hospede_id) : null;

          const badgeStyles = {
            disponivel: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            ocupado: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
            limpeza: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            reservado: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            manutencao: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          }[q.status];

          return (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {q.numero}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {q.tipo}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeStyles}`}>
                    {q.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preço Diária:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-bold">{formatCurrency(q.preco_diaria)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacidade:</span>
                    <span>{q.capacidade} pessoa(s)</span>
                  </div>
                  {q.observacao && (
                    <div className="text-[11px] text-slate-400 pt-1 line-clamp-1 italic">
                      {q.observacao}
                    </div>
                  )}
                </div>

                {/* Occupied Details if any */}
                {guest && (
                  <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Hóspede Atual</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">{guest.nome}</div>
                    <div className="text-[11px] text-slate-500">Entrada: {activeCheckin?.data_checkin.slice(0, 10)}</div>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={() => onOpenQuartoModal(q)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Editar dados do quarto"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {q.status === 'limpeza' && (
                    <button
                      onClick={() => updateQuartoStatus(q.id, 'disponivel')}
                      className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold"
                    >
                      ✓ Liberar
                    </button>
                  )}
                  {q.status === 'disponivel' && (
                    <button
                      onClick={() => onOpenCheckinModalForRoom(q.id)}
                      className="px-2.5 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 text-[10px] font-bold shadow-2xs"
                    >
                      + Check-in
                    </button>
                  )}
                  {q.status !== 'manutencao' && q.status !== 'ocupado' && (
                    <button
                      onClick={() => updateQuartoStatus(q.id, 'manutencao')}
                      className="px-2 py-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-[10px]"
                    >
                      Manutenção
                    </button>
                  )}
                  {q.status === 'manutencao' && (
                    <button
                      onClick={() => updateQuartoStatus(q.id, 'disponivel')}
                      className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold"
                    >
                      Pronto
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
