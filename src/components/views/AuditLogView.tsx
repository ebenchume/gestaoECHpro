/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  User, 
  Tag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, exportToCSV } from '../../utils/export';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModulo, setFilterModulo] = useState<string>('todos');

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return auditLogs.filter(log => {
      const matchMod = filterModulo === 'todos' || log.modulo === filterModulo;
      const matchSearch = !q || 
        log.acao.toLowerCase().includes(q) || 
        log.detalhe.toLowerCase().includes(q) ||
        log.utilizador.toLowerCase().includes(q);
      return matchMod && matchSearch;
    });
  }, [auditLogs, filterModulo, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Utilizador', 'Módulo', 'Ação', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.data,
      l.utilizador,
      l.modulo,
      l.acao,
      l.detalhe
    ]);
    exportToCSV(`ECHpro_Historico_Auditoria_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const modulos = ['todos', 'Check-in', 'Quartos', 'Hóspedes', 'Pagamentos', 'Caixa', 'Sistema'];

  const getModuloBadge = (mod: string) => {
    switch (mod) {
      case 'Check-in': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'Quartos': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Hóspedes': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Pagamentos': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Caixa': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Histórico de Edições & Auditoria em Tempo Real
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rastreamento completo de todas as alterações, reservas, pagamentos e manutenções efetuadas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
          Exportar Auditoria (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por utilizador, ação ou detalhes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {modulos.map(mod => (
            <button
              key={mod}
              onClick={() => setFilterModulo(mod)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterModulo === mod
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {mod === 'todos' ? 'Todos os Módulos' : mod}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Registo Cronológico ({filteredLogs.length} eventos)
          </span>
          <span className="text-slate-400">Armazenamento local + Sincronização em nuvem</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 mt-0.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.acao}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getModuloBadge(log.modulo)}`}>
                      {log.modulo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {log.detalhe}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      Operador: <strong className="text-slate-600 dark:text-slate-300">{log.utilizador}</strong>
                    </span>
                    <span>•</span>
                    <span>{formatDateTime(log.data)}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {log.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
