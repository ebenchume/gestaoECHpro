/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  Calendar,
  Building2,
  MapPin,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hospede } from '../../types';
import { exportToCSV, formatDate } from '../../utils/export';

interface HospedesViewProps {
  onOpenHospedeModal: (hospede?: Hospede) => void;
  onSelectCheckin: (checkinId: number) => void;
}

export const HospedesView: React.FC<HospedesViewProps> = ({
  onOpenHospedeModal,
  onSelectCheckin
}) => {
  const { hospedes, checkins, deleteHospede } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospede, setSelectedHospede] = useState<Hospede | null>(null);

  const filteredHospedes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return hospedes.filter(h => 
      !q ||
      h.nome.toLowerCase().includes(q) ||
      h.telefone1.includes(q) ||
      (h.email && h.email.toLowerCase().includes(q)) ||
      h.numero_documento.toLowerCase().includes(q) ||
      h.nacionalidade.toLowerCase().includes(q) ||
      (h.empresa && h.empresa.toLowerCase().includes(q))
    );
  }, [hospedes, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Nome', 'Documento Tipo', 'Número Doc', 'Telefone 1', 'Telefone 2',
      'Email', 'Nacionalidade', 'Cidade', 'Endereço', 'NUIT', 'Empresa', 'Data Cadastro'
    ];
    const rows = hospedes.map(h => [
      h.id,
      h.nome,
      h.tipo_documento,
      h.numero_documento,
      h.telefone1,
      h.telefone2 || '',
      h.email || '',
      h.nacionalidade,
      h.cidade || '',
      h.endereco || '',
      h.nuit || '',
      h.empresa || '',
      h.criado_em.slice(0, 10)
    ]);
    exportToCSV(`ECHpro_Hospedes_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem a certeza que deseja excluir o hóspede "${nome}"?`)) {
      const ok = deleteHospede(id);
      if (!ok) {
        alert('Não é possível excluir um hóspede com check-in ativo em andamento.');
      }
    }
  };

  const hospedeStays = useMemo(() => {
    if (!selectedHospede) return [];
    return checkins.filter(c => c.hospede_id === selectedHospede.id);
  }, [selectedHospede, checkins]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Diretório de Hóspedes & Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro completo de hóspedes, documentos oficiais, histórico de estadias e contactos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Exportar CSV
          </button>
          <button
            onClick={() => onOpenHospedeModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Hóspede
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por nome, documento, telefone, nacionalidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Total: <strong>{filteredHospedes.length}</strong> hóspedes cadastrados
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Hóspede</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Nacionalidade</th>
                <th className="p-3">Empresa / Cidade</th>
                <th className="p-3 text-center">Estadias</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHospedes.map(h => {
                const totalStays = checkins.filter(c => c.hospede_id === h.id).length;
                return (
                  <tr 
                    key={h.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{h.nome}</div>
                      {h.email && <div className="text-[11px] text-slate-400">{h.email}</div>}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {h.tipo_documento}: {h.numero_documento}
                      </span>
                      {h.validade_documento && (
                        <div className="text-[10px] text-slate-400">Val: {h.validade_documento}</div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      <div>{h.telefone1}</div>
                      {h.telefone2 && <div className="text-[11px] text-slate-400">{h.telefone2}</div>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {h.nacionalidade}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <div>{h.empresa || '—'}</div>
                      <div className="text-[11px] text-slate-400">{h.cidade}</div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedHospede(h)}
                        className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-100 border border-teal-200 dark:border-teal-800"
                        title="Ver histórico de estadias"
                      >
                        {totalStays} estadia(s)
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenHospedeModal(h)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Editar hóspede"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.nome)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Excluir hóspede"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Guest Stay History Modal (when clicking Stays) */}
      {selectedHospede && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico de Estadias: {selectedHospede.nome}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHospede.tipo_documento} nº {selectedHospede.numero_documento}
                </p>
              </div>
              <button
                onClick={() => setSelectedHospede(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {hospedeStays.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Nenhuma estadia registrada para este hóspede ainda.
                </p>
              ) : (
                hospedeStays.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectCheckin(s.id);
                      setSelectedHospede(null);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        Check-in #{s.id} — {s.noites} noites
                      </div>
                      <div className="text-slate-500">
                        Entrada: {formatDate(s.data_checkin)} | Total: {s.total_liquido} MT
                      </div>
                    </div>
                    <span className="font-bold text-teal-600 dark:text-teal-400 uppercase">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHospede(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
