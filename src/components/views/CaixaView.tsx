/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime, exportCaixaReportPDF, exportToCSV } from '../../utils/export';

export const CaixaView: React.FC = () => {
  const { livroCaixa, addLivroCaixaItem, empresa } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'Entrada' | 'Saída'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Movement form states
  const [tipo, setTipo] = useState<'Entrada' | 'Saída'>('Entrada');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Hospedagem');
  const [valor, setValor] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [observacao, setObservacao] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return livroCaixa.filter(item => {
      const matchTipo = filterTipo === 'todos' || item.tipo === filterTipo;
      const matchSearch = !q || 
        item.descricao.toLowerCase().includes(q) || 
        item.categoria.toLowerCase().includes(q) ||
        item.forma_pagamento.toLowerCase().includes(q) ||
        item.utilizador.toLowerCase().includes(q);
      return matchTipo && matchSearch;
    });
  }, [livroCaixa, filterTipo, searchTerm]);

  const totalEntradas = useMemo(() => {
    return filteredItems.filter(i => i.tipo === 'Entrada').reduce((acc, i) => acc + i.valor, 0);
  }, [filteredItems]);

  const totalSaidas = useMemo(() => {
    return filteredItems.filter(i => i.tipo === 'Saída').reduce((acc, i) => acc + i.valor, 0);
  }, [filteredItems]);

  const saldoLiquido = totalEntradas - totalSaidas;

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Forma Pagamento', 'Operador', 'Observações'];
    const rows = filteredItems.map(i => [
      i.id,
      i.data_movimento,
      i.tipo,
      i.categoria,
      i.descricao,
      i.valor,
      i.forma_pagamento,
      i.utilizador,
      i.observacao || ''
    ]);
    exportToCSV(`ECHpro_Livro_Caixa_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || valor <= 0) {
      alert('Preencha a descrição e um valor válido superior a zero.');
      return;
    }

    addLivroCaixaItem({
      tipo,
      descricao,
      categoria,
      valor,
      forma_pagamento: formaPagamento,
      observacao
    });

    setShowAddModal(false);
    setDescricao('');
    setValor(0);
    setObservacao('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Livro de Caixa & Fluxo Financeiro
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro detalhado de todas as entradas de estadias e saídas operacionais da pousada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCaixaReportPDF(filteredItems, empresa)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Relatório PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total de Entradas</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(totalEntradas)}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total de Saídas / Despesas</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              -{formatCurrency(totalSaidas)}
            </div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Saldo Líquido em Caixa</span>
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {formatCurrency(saldoLiquido)}
            </div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por descrição, categoria ou forma de pagamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'todos', label: 'Todos os Movimentos' },
            { id: 'Entrada', label: 'Apenas Entradas' },
            { id: 'Saída', label: 'Apenas Saídas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTipo(tab.id as typeof filterTipo)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterTipo === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
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
                <th className="p-3">Data/Hora</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Descrição</th>
                <th className="p-3">Forma Pagto</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-500">{formatDateTime(item.data_movimento)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      item.tipo === 'Entrada'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{item.categoria}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{item.descricao}</div>
                    {item.observacao && <div className="text-[11px] text-slate-400">{item.observacao}</div>}
                  </td>
                  <td className="p-3">{item.forma_pagamento}</td>
                  <td className="p-3 text-right font-black">
                    <span className={item.tipo === 'Entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {item.tipo === 'Entrada' ? '+' : '-'}{formatCurrency(item.valor)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-medium">{item.utilizador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Novo Lançamento no Livro de Caixa
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3 text-xs">
              {/* Type Switch */}
              <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setTipo('Entrada'); setCategoria('Hospedagem'); }}
                  className={`flex-1 py-1.5 font-bold transition-all ${
                    tipo === 'Entrada' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => { setTipo('Saída'); setCategoria('Suprimentos'); }}
                  className={`flex-1 py-1.5 font-bold transition-all ${
                    tipo === 'Saída' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descrição do Movimento *</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder={tipo === 'Entrada' ? 'Ex: Diária extra hóspede' : 'Ex: Compra de café, água e pão'}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor (MT) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={valor}
                    onChange={e => setValor(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoria</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {tipo === 'Entrada' ? (
                      <>
                        <option value="Hospedagem">Hospedagem</option>
                        <option value="Reserva">Reserva</option>
                        <option value="Bar/Restaurante">Bar/Restaurante</option>
                        <option value="Outras Receitas">Outras Receitas</option>
                      </>
                    ) : (
                      <>
                        <option value="Suprimentos">Suprimentos / Compras</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Limpeza">Produtos de Limpeza</option>
                        <option value="Serviços Públicos">Água / Energia / Net</option>
                        <option value="Outras Despesas">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={e => setFormaPagamento(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="E-Mola">E-Mola</option>
                  <option value="Cartão">Cartão / POS</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observações adicionais</label>
                <input
                  type="text"
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Número de talão, fatura ou notas"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-500 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                >
                  Registar Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
