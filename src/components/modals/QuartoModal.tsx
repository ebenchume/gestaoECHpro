/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, BedDouble, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quarto, QuartoStatus } from '../../types';

interface QuartoModalProps {
  isOpen: boolean;
  onClose: () => void;
  quartoToEdit?: Quarto | null;
}

export const QuartoModal: React.FC<QuartoModalProps> = ({
  isOpen,
  onClose,
  quartoToEdit
}) => {
  const { addOrUpdateQuarto } = useApp();

  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('CASAL');
  const [precoDiaria, setPrecoDiaria] = useState<number>(3500);
  const [capacidade, setCapacidade] = useState<number>(2);
  const [status, setStatus] = useState<QuartoStatus>('disponivel');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (quartoToEdit) {
      setNumero(quartoToEdit.numero);
      setTipo(quartoToEdit.tipo);
      setPrecoDiaria(quartoToEdit.preco_diaria);
      setCapacidade(quartoToEdit.capacidade);
      setStatus(quartoToEdit.status);
      setObservacao(quartoToEdit.observacao || '');
    } else {
      setNumero('');
      setTipo('CASAL');
      setPrecoDiaria(3500);
      setCapacidade(2);
      setStatus('disponivel');
      setObservacao('');
    }
  }, [quartoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) {
      alert('O número ou nome do quarto é obrigatório.');
      return;
    }

    addOrUpdateQuarto({
      id: quartoToEdit ? quartoToEdit.id : undefined,
      numero,
      tipo,
      preco_diaria: precoDiaria,
      capacidade,
      status,
      observacao,
      activo: 1
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {quartoToEdit ? 'Editar Quarto' : 'Novo Quarto'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure a numeração, tipo, preço da diária e capacidade.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Número do Quarto *</label>
            <input
              type="text"
              required
              value={numero}
              onChange={e => setNumero(e.target.value)}
              placeholder="Ex: Q 125, Suíte 301"
              className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Quarto</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full mt-1 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="CASAL">CASAL</option>
                <option value="KING">KING</option>
                <option value="SOLTEIRO 2 CAMAS">SOLTEIRO 2 CAMAS</option>
                <option value="SUITE MASTER">SUITE MASTER</option>
                <option value="ARMAZEM">ARMAZÉM / EXECUTIVO</option>
                <option value="OUTRO">OUTRO</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Capacidade Máxima</label>
              <input
                type="number"
                min="1"
                max="10"
                value={capacidade}
                onChange={e => setCapacidade(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preço Diária (MT) *</label>
              <input
                type="number"
                min="0"
                required
                value={precoDiaria}
                onChange={e => setPrecoDiaria(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Inicial</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as QuartoStatus)}
                className="w-full mt-1 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="disponivel">Disponível</option>
                <option value="ocupado">Ocupado</option>
                <option value="limpeza">Em Limpeza</option>
                <option value="manutencao">Em Manutenção</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Comodidades & Observações</label>
            <textarea
              rows={2}
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Ex: Ar condicionado, Wi-Fi 6, Frigobar, Vista Piscina"
              className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {quartoToEdit ? 'Salvar Alterações' : 'Criar Quarto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
