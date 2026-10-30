/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Calendar, 
  CalendarPlus, 
  CreditCard, 
  Coffee, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Mail, 
  Download,
  Share2,
  BedDouble,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Checkin, Hospede, Quarto, CheckinServico } from '../../types';
import { formatCurrency, formatDateTime, exportInvoicePDF } from '../../utils/export';
import { downloadICSFile, getGoogleCalendarUrl, getOutlookCalendarUrl } from '../../utils/calendar';

interface CheckinDetailModalProps {
  checkinId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckinDetailModal: React.FC<CheckinDetailModalProps> = ({
  checkinId,
  isOpen,
  onClose
}) => {
  const { 
    checkins, 
    hospedes, 
    quartos, 
    empresa, 
    servicosCatalogo, 
    addServicoToCheckin, 
    removeServicoFromCheckin, 
    addPagamentoToCheckin, 
    realizarCheckout,
    cancelarCheckin 
  } = useApp();

  const checkin = checkins.find(c => c.id === checkinId);
  const hospede = hospedes.find(h => h.id === checkin?.hospede_id);
  const quarto = quartos.find(q => q.id === checkin?.quarto_id);

  // Add Service Form states
  const [showAddService, setShowAddService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(servicosCatalogo[0]?.id || 1);
  const [serviceQty, setServiceQty] = useState<number>(1);
  const [customServiceDesc, setCustomServiceDesc] = useState<string>('');
  const [customServicePrice, setCustomServicePrice] = useState<number>(100);

  // Add Payment Form states
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(checkin?.saldo || 0);
  const [payMethod, setPayMethod] = useState<string>('M-Pesa');
  const [payRef, setPayRef] = useState<string>('');

  if (!isOpen || !checkin || !hospede || !quarto) return null;

  const handleAddCatalogService = (e: React.FormEvent) => {
    e.preventDefault();
    const item = servicosCatalogo.find(s => s.id === selectedServiceId);
    if (!item) return;

    addServicoToCheckin(checkin.id, {
      servico_id: item.id,
      descricao: `${item.nome} (x${serviceQty})`,
      categoria: item.categoria,
      quantidade: serviceQty,
      preco_unitario: item.preco_unitario,
      total: item.preco_unitario * serviceQty,
      data: new Date().toISOString()
    });

    setShowAddService(false);
    setServiceQty(1);
  };

  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customServiceDesc.trim()) return;

    addServicoToCheckin(checkin.id, {
      descricao: `${customServiceDesc} (x${serviceQty})`,
      categoria: 'Extra',
      quantidade: serviceQty,
      preco_unitario: customServicePrice,
      total: customServicePrice * serviceQty,
      data: new Date().toISOString()
    });

    setShowAddService(false);
    setCustomServiceDesc('');
    setServiceQty(1);
  };

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    addPagamentoToCheckin(checkin.id, {
      numero_parcela: `${checkin.parcelas.length + 1}/${checkin.parcelas.length + 1}`,
      data_parcela: new Date().toISOString().slice(0, 10),
      valor_parcela: payAmount,
      data_pagamento: new Date().toISOString().slice(0, 10),
      forma_pagamento: payMethod,
      referencia: payRef,
      valor_pago: payAmount,
      saldo_parcela: 0
    });

    setShowAddPayment(false);
    setPayRef('');
  };

  const handleCheckoutClick = () => {
    if (checkin.saldo > 0) {
      if (!confirm(`O hóspede possui um saldo pendente de ${formatCurrency(checkin.saldo)}. Deseja prosseguir com o check-out mesmo assim?`)) {
        return;
      }
    }
    realizarCheckout(checkin.id);
    onClose();
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Fatura e Comprovativo de Estadia - ${empresa.nome}`);
    const body = encodeURIComponent(
      `Estimado(a) ${hospede.nome},\n\n` +
      `Agradecemos a sua preferência pela ${empresa.nome}.\n\n` +
      `RESUMO DA ESTADIA (#${checkin.id}):\n` +
      `- Quarto: ${quarto.numero} (${quarto.tipo})\n` +
      `- Check-in: ${formatDateTime(checkin.data_checkin)}\n` +
      `- Check-out: ${checkin.data_checkout ? formatDateTime(checkin.data_checkout) : 'Em aberto'}\n` +
      `- Total de Diárias: ${formatCurrency(checkin.total_quarto)}\n` +
      `- Total Consumos: ${formatCurrency(checkin.total_servicos)}\n` +
      `- Total Líquido: ${formatCurrency(checkin.total_liquido)}\n` +
      `- Valor Pago: ${formatCurrency(checkin.valor_pago)}\n` +
      `- Saldo Pendente: ${formatCurrency(checkin.saldo)}\n\n` +
      `Para mais informações ou reservas, contacte-nos pelo telefone ${empresa.telefone1}.\n\n` +
      `Atenciosamente,\n${empresa.nome}`
    );
    window.location.href = `mailto:${hospede.email || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Detalhes da Estadia #{checkin.id}
                </h2>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  checkin.status === 'CHECKIN'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : checkin.status === 'CHECKOUT'
                    ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {checkin.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hospede.nome} — Quarto {quarto.numero} ({quarto.tipo})
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => exportInvoicePDF(checkin, hospede, quarto, empresa)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descarregar Recibo PDF
            </button>
            <button
              onClick={() => downloadICSFile(checkin, hospede, quarto, empresa)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Baixar ficheiro .ics compatível com Apple Calendar, Google Calendar e Outlook"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-teal-500" />
              Exportar Calendário (.ics)
            </button>
            <a
              href={getGoogleCalendarUrl(checkin, hospede, quarto, empresa)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Google Calendar
            </a>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              Enviar por E-mail
            </button>
          </div>

          {/* Cards Grid: Guest & Stay Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Guest Info Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                <Users className="w-4 h-4 text-teal-500" />
                Dados do Hóspede
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nome:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{hospede.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documento:</span>
                <span>{hospede.tipo_documento} nº {hospede.numero_documento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefone:</span>
                <span>{hospede.telefone1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nacionalidade:</span>
                <span>{hospede.nacionalidade}</span>
              </div>
              {hospede.empresa && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Empresa:</span>
                  <span>{hospede.empresa}</span>
                </div>
              )}
            </div>

            {/* Room & Dates Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                <BedDouble className="w-4 h-4 text-blue-500" />
                Dados da Acomodação
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quarto:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{quarto.numero} — {quarto.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entrada:</span>
                <span>{formatDateTime(checkin.data_checkin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saída Prevista:</span>
                <span>{checkin.data_checkout ? formatDateTime(checkin.data_checkout) : 'Em aberto'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diárias:</span>
                <span className="font-semibold">{checkin.noites} noite(s) × {formatCurrency(checkin.preco_diaria)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ocupantes:</span>
                <span>{checkin.nr_adultos} adulto(s), {checkin.nr_criancas} criança(s)</span>
              </div>
            </div>
          </div>

          {/* Consumos / Serviços Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                Consumos & Serviços Adicionais ({checkin.servicos.length})
              </h3>
              {checkin.status === 'CHECKIN' && (
                <button
                  type="button"
                  onClick={() => setShowAddService(!showAddService)}
                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddService ? 'Cancelar' : 'Adicionar Consumo'}
                </button>
              )}
            </div>

            {/* Inline Add Service Form */}
            {showAddService && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Lançar Serviço / Consumo na Conta
                </div>
                <form onSubmit={handleAddCatalogService} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-500">Item do Catálogo</label>
                    <select
                      value={selectedServiceId}
                      onChange={e => setSelectedServiceId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {servicosCatalogo.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nome} ({formatCurrency(s.preco_unitario)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={serviceQty}
                      onChange={e => setServiceQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                    >
                      Lançar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Services Table */}
            {checkin.servicos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Nenhum consumo adicional registrado nesta estadia.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 text-center">Qtd</th>
                      <th className="p-2.5 text-right">Preço Unit.</th>
                      <th className="p-2.5 text-right">Total</th>
                      {checkin.status === 'CHECKIN' && <th className="p-2.5 w-8"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checkin.servicos.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{s.descricao}</td>
                        <td className="p-2.5 text-center">{s.quantidade}</td>
                        <td className="p-2.5 text-right">{formatCurrency(s.preco_unitario)}</td>
                        <td className="p-2.5 text-right font-bold">{formatCurrency(s.total)}</td>
                        {checkin.status === 'CHECKIN' && (
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => removeServicoFromCheckin(checkin.id, s.id)}
                              className="text-slate-400 hover:text-rose-500"
                              title="Remover consumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagamentos & Parcelas Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Pagamentos Efetuados ({checkin.parcelas.length})
              </h3>
              {checkin.status === 'CHECKIN' && checkin.saldo > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddPayment(!showAddPayment)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddPayment ? 'Cancelar' : 'Registar Pagamento'}
                </button>
              )}
            </div>

            {/* Inline Add Payment Form */}
            {showAddPayment && (
              <form onSubmit={handleAddPaymentSubmit} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2.5">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Registar Pagamento / Amortização
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Valor (MT)</label>
                    <input
                      type="number"
                      min="1"
                      max={checkin.saldo}
                      value={payAmount}
                      onChange={e => setPayAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Forma</label>
                    <select
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                    <label className="text-[11px] font-medium text-slate-500">Ref / Talão</label>
                    <input
                      type="text"
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                      placeholder="Ex: MP-4492"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Payments Table */}
            {checkin.parcelas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Nenhum pagamento registrado até ao momento.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Forma</th>
                      <th className="p-2.5">Referência</th>
                      <th className="p-2.5 text-right">Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checkin.parcelas.map(p => (
                      <tr key={p.id}>
                        <td className="p-2.5">{p.data_pagamento}</td>
                        <td className="p-2.5 font-medium">{p.forma_pagamento}</td>
                        <td className="p-2.5 text-slate-500">{p.referencia || '—'}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-600">{formatCurrency(p.valor_pago)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial Summary Breakdown */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Diárias ({checkin.noites} noites):</span>
              <span className="font-semibold">{formatCurrency(checkin.total_quarto)}</span>
            </div>
            {checkin.total_desconto > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Desconto Concedido:</span>
                <span>-{formatCurrency(checkin.total_desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total de Consumos e Serviços:</span>
              <span className="font-semibold">{formatCurrency(checkin.total_servicos)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>TOTAL LÍQUIDO DA CONTA:</span>
              <span>{formatCurrency(checkin.total_liquido)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Total Pago:</span>
              <span>{formatCurrency(checkin.valor_pago)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>SALDO A PAGAR:</span>
              <span className={checkin.saldo > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                {checkin.saldo === 0 ? 'Conta Liquidada (0,00 MT)' : formatCurrency(checkin.saldo)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Final Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            {checkin.status === 'CHECKIN' && (
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalizar Check-out (Libera Quarto para Limpeza)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
