/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  KeyRound, 
  Calendar, 
  BedDouble, 
  Users, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Plus,
  CalendarPlus,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Checkin, Hospede, Quarto } from '../../types';
import { formatCurrency } from '../../utils/export';
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICSFile } from '../../utils/calendar';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuartoId?: number;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  defaultQuartoId
}) => {
  const { quartos, hospedes, addCheckin, addOrUpdateHospede, empresa } = useApp();

  // Form states
  const [quartoId, setQuartoId] = useState<number>(defaultQuartoId || (quartos.find(q => q.status === 'disponivel')?.id || quartos[0]?.id || 1));
  const [hospedeId, setHospedeId] = useState<number>(hospedes[0]?.id || 0);
  const [isNewHospede, setIsNewHospede] = useState(false);

  // Inline new guest fields
  const [newHospedeNome, setNewHospedeNome] = useState('');
  const [newHospedeTelefone, setNewHospedeTelefone] = useState('');
  const [newHospedeDocTipo, setNewHospedeDocTipo] = useState('BI');
  const [newHospedeDocNum, setNewHospedeDocNum] = useState('');
  const [newHospedeNacionalidade, setNewHospedeNacionalidade] = useState('Moçambicana');

  // Dates
  const todayIso = new Date().toISOString().slice(0, 16);
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [dataCheckin, setDataCheckin] = useState(todayIso);
  const [dataCheckout, setDataCheckout] = useState(tomorrowIso);

  // Stays & Pricing
  const selectedQuarto = quartos.find(q => q.id === quartoId);
  const [precoDiaria, setPrecoDiaria] = useState<number>(selectedQuarto ? selectedQuarto.preco_diaria : 3500);
  const [descontoNoite, setDescontoNoite] = useState<number>(0);
  const [nrAdultos, setNrAdultos] = useState<number>(1);
  const [nrCriancas, setNrCriancas] = useState<number>(0);
  const [empresaRef, setEmpresaRef] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [isReserva, setIsReserva] = useState<boolean>(false);

  // Payment
  const [valorAdiantado, setValorAdiantado] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState<string>('M-Pesa');
  const [referenciaPagamento, setReferenciaPagamento] = useState<string>('');

  // Update room price when room changes
  const handleRoomChange = (id: number) => {
    setQuartoId(id);
    const q = quartos.find(r => r.id === id);
    if (q) setPrecoDiaria(q.preco_diaria);
  };

  // Calculate nights
  const noites = useMemo(() => {
    try {
      const d1 = new Date(dataCheckin).getTime();
      const d2 = new Date(dataCheckout).getTime();
      const diff = d2 - d1;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return Math.max(1, isNaN(days) ? 1 : days);
    } catch {
      return 1;
    }
  }, [dataCheckin, dataCheckout]);

  const totalQuarto = noites * precoDiaria;
  const totalDesconto = noites * descontoNoite;
  const subtotal = Math.max(0, totalQuarto - totalDesconto);
  const saldoPrevisto = Math.max(0, subtotal - (valorAdiantado || 0));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetHospedeId = hospedeId;
    if (isNewHospede) {
      if (!newHospedeNome.trim()) {
        alert('Por favor, insira o nome do hóspede.');
        return;
      }
      const createdGuest = addOrUpdateHospede({
        nome: newHospedeNome,
        telefone1: newHospedeTelefone,
        tipo_documento: newHospedeDocTipo,
        numero_documento: newHospedeDocNum,
        nacionalidade: newHospedeNacionalidade
      });
      targetHospedeId = createdGuest.id;
    }

    const newCheckin = addCheckin({
      hospede_id: targetHospedeId,
      quarto_id: quartoId,
      empresa_referencia: empresaRef,
      data_checkin: new Date(dataCheckin).toISOString(),
      data_checkout: new Date(dataCheckout).toISOString(),
      nr_adultos: nrAdultos,
      nr_criancas: nrCriancas,
      noites,
      preco_diaria: precoDiaria,
      total_quarto: totalQuarto,
      desconto_noite: descontoNoite,
      total_desconto: totalDesconto,
      subtotal,
      total_servicos: 0,
      total_liquido: subtotal,
      valor_pago: valorAdiantado,
      saldo: saldoPrevisto,
      status: isReserva ? 'RESERVADO' : 'CHECKIN',
      observacao
    }, valorAdiantado > 0 ? {
      valor_pago: valorAdiantado,
      forma_pagamento: formaPagamento,
      referencia: referenciaPagamento
    } : undefined);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isReserva ? 'Nova Reserva de Hóspede' : 'Novo Check-in de Hóspede'}
              </h2>
              <p className="text-xs text-slate-500">
                Preencha os dados do quarto, hóspede e adiantamento de diárias.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Mode Switch (Check-in Imediato vs Reserva) */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsReserva(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isReserva
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Check-in Imediato (Entrada Hoje)
            </button>
            <button
              type="button"
              onClick={() => setIsReserva(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isReserva
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Reserva Agendada
            </button>
          </div>

          {/* Quarto selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-teal-500" />
                Selecione o Quarto
              </span>
              {selectedQuarto && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedQuarto.status === 'disponivel'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  Status: {selectedQuarto.status}
                </span>
              )}
            </label>
            <select
              value={quartoId}
              onChange={e => handleRoomChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            >
              {quartos.map(q => (
                <option key={q.id} value={q.id}>
                  {q.numero} — {q.tipo} ({formatCurrency(q.preco_diaria)}/noite) — [{q.status.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          {/* Hóspede selection or quick create */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                Hóspede
              </label>
              <button
                type="button"
                onClick={() => setIsNewHospede(!isNewHospede)}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
              >
                {isNewHospede ? 'Selecionar existente' : '+ Cadastrar novo hóspede'}
              </button>
            </div>

            {!isNewHospede ? (
              <select
                value={hospedeId}
                onChange={e => setHospedeId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                {hospedes.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nome} — {h.tipo_documento}: {h.numero_documento} (Tel: {h.telefone1})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newHospedeNome}
                    onChange={e => setNewHospedeNome(e.target.value)}
                    placeholder="Ex: Manuel dos Santos"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Telefone</label>
                  <input
                    type="text"
                    value={newHospedeTelefone}
                    onChange={e => setNewHospedeTelefone(e.target.value)}
                    placeholder="+258 84 000 0000"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Tipo Doc</label>
                  <select
                    value={newHospedeDocTipo}
                    onChange={e => setNewHospedeDocTipo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="BI">BI</option>
                    <option value="Passaporte">Passaporte</option>
                    <option value="DIRE">DIRE</option>
                    <option value="Carta de Condução">Carta de Condução</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Número do Documento</label>
                  <input
                    type="text"
                    value={newHospedeDocNum}
                    onChange={e => setNewHospedeDocNum(e.target.value)}
                    placeholder="Ex: 110293849182B"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates & Nights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                Data & Hora de Entrada
              </label>
              <input
                type="datetime-local"
                value={dataCheckin}
                onChange={e => setDataCheckin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                Data & Hora Prevista de Saída
              </label>
              <input
                type="datetime-local"
                value={dataCheckout}
                onChange={e => setDataCheckout(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Occupancy and Rates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Noites</label>
              <div className="px-3 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">
                {noites} noite(s)
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Preço Diária (MT)</label>
              <input
                type="number"
                min="0"
                value={precoDiaria}
                onChange={e => setPrecoDiaria(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Desc./Noite (MT)</label>
              <input
                type="number"
                min="0"
                value={descontoNoite}
                onChange={e => setDescontoNoite(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Adultos / Crianças</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={nrAdultos}
                  onChange={e => setNrAdultos(Number(e.target.value))}
                  title="Adultos"
                  className="w-1/2 px-1.5 py-1.5 text-xs text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="number"
                  min="0"
                  value={nrCriancas}
                  onChange={e => setNrCriancas(Number(e.target.value))}
                  title="Crianças"
                  className="w-1/2 px-1.5 py-1.5 text-xs text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Payment advance */}
          <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              Pagamento Adiantado / Sinal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Valor Pago (MT)</label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={valorAdiantado}
                  onChange={e => setValorAdiantado(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 text-sm font-bold text-teal-700 dark:text-teal-300 rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Forma</label>
                <select
                  value={formaPagamento}
                  onChange={e => setFormaPagamento(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Ref. Comprovativo</label>
                <input
                  type="text"
                  value={referenciaPagamento}
                  onChange={e => setReferenciaPagamento(e.target.value)}
                  placeholder="Ex: MP-12345"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Total Diárias:</span>{' '}
              <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Adiantado:</span>{' '}
              <strong className="text-emerald-600">{formatCurrency(valorAdiantado || 0)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Saldo a Pagar:</span>{' '}
              <strong className={saldoPrevisto > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                {formatCurrency(saldoPrevisto)}
              </strong>
            </div>
          </div>

          {/* Footer Submit */}
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
              <KeyRound className="w-4 h-4" />
              {isReserva ? 'Confirmar Reserva' : 'Realizar Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
