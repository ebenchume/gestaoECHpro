/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coffee, 
  Plus, 
  Search, 
  BedDouble, 
  CheckCircle, 
  DollarSign, 
  Wine, 
  UtensilsCrossed, 
  Shirt, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServicoCatalogo } from '../../types';
import { formatCurrency } from '../../utils/export';

interface ServicosViewProps {
  onSelectCheckin: (checkinId: number) => void;
}

export const ServicosView: React.FC<ServicosViewProps> = ({ onSelectCheckin }) => {
  const { servicosCatalogo, checkins, quartos, hospedes, addServicoToCheckin } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick order modal to active room
  const [orderingItem, setOrderingItem] = useState<ServicoCatalogo | null>(null);
  const [targetCheckinId, setTargetCheckinId] = useState<number>(0);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string>('');

  const activeCheckins = checkins.filter(c => c.status === 'CHECKIN');

  const categories = ['todos', 'Bar', 'Restaurante', 'Lavandaria', 'Extra'];

  const filteredItems = servicosCatalogo.filter(item => {
    const matchCat = activeCategory === 'todos' || item.categoria === activeCategory;
    const matchSearch = !searchTerm || item.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleLaunchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingItem || !targetCheckinId) return;

    addServicoToCheckin(targetCheckinId, {
      servico_id: orderingItem.id,
      descricao: `${orderingItem.nome} (x${orderQty})`,
      categoria: orderingItem.categoria,
      quantidade: orderQty,
      preco_unitario: orderingItem.preco_unitario,
      total: orderingItem.preco_unitario * orderQty,
      data: new Date().toISOString()
    });

    setOrderSuccessMsg(`Serviço lançado com sucesso no quarto!`);
    setTimeout(() => {
      setOrderingItem(null);
      setOrderSuccessMsg('');
      setOrderQty(1);
    }, 1200);
  };

  const getCatIcon = (cat: string) => {
    switch (cat) {
      case 'Bar': return <Wine className="w-4 h-4 text-purple-500" />;
      case 'Restaurante': return <UtensilsCrossed className="w-4 h-4 text-amber-500" />;
      case 'Lavandaria': return <Shirt className="w-4 h-4 text-blue-500" />;
      default: return <Sparkles className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-500" />
            Catálogo de Serviços, Bar & Restaurante
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamento rápido de bebidas, refeições e serviços adicionais nas contas dos quartos.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar produto ou serviço..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'todos' ? 'Todos os Produtos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {getCatIcon(item.categoria)}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.categoria}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                {item.nome}
              </h3>
              <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-2">
                {formatCurrency(item.preco_unitario)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Pronta entrega</span>
              <button
                onClick={() => {
                  setOrderingItem(item);
                  if (activeCheckins.length > 0) {
                    setTargetCheckinId(activeCheckins[0].id);
                  }
                }}
                disabled={activeCheckins.length === 0}
                className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-600 hover:text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Lançar no Quarto
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch Order Modal */}
      {orderingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lançar {orderingItem.nome}
                </h3>
              </div>
              <button
                onClick={() => setOrderingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-center font-bold text-sm">
                ✓ {orderSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleLaunchOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Selecione o Quarto / Hóspede Ativo *
                  </label>
                  <select
                    value={targetCheckinId}
                    onChange={e => setTargetCheckinId(Number(e.target.value))}
                    required
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {activeCheckins.map(c => {
                      const h = hospedes.find(g => g.id === c.hospede_id);
                      const q = quartos.find(r => r.id === c.quarto_id);
                      return (
                        <option key={c.id} value={c.id}>
                          {q?.numero} — {h?.nome} (#{c.id})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={orderQty}
                      onChange={e => setOrderQty(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total a Lançar</label>
                    <div className="mt-1 px-3 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-lg text-teal-600 dark:text-teal-400">
                      {formatCurrency(orderingItem.preco_unitario * orderQty)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderingItem(null)}
                    className="px-4 py-2 rounded-lg text-slate-500 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md"
                  >
                    Confirmar Lançamento
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
