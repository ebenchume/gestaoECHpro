/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign, 
  BedDouble, 
  Coffee, 
  CreditCard,
  BarChart3,
  Percent,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, exportToCSV } from '../../utils/export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const RelatoriosView: React.FC = () => {
  const { checkins, quartos, livroCaixa, empresa } = useApp();
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);

  // Compute 7 days for the current week
  const weekData = useMemo(() => {
    const now = new Date();
    // Monday of current week
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now.getTime() + (diffToMon + selectedWeekOffset * 7) * 86400000);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    let weekDiariasRevenue = 0;
    let weekServicesRevenue = 0;
    let totalRoomsOccupiedAcrossWeek = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 86400000);
      const dStr = d.toISOString().slice(0, 10);

      // Check-ins active on this day
      const activeStays = checkins.filter(c => {
        if (c.status === 'CANCELADO') return false;
        const inDate = c.data_checkin.slice(0, 10);
        const outDate = c.data_checkout ? c.data_checkout.slice(0, 10) : inDate;
        return dStr >= inDate && dStr <= outDate;
      });

      const dayDiariasRev = activeStays.reduce((acc, c) => acc + (c.preco_diaria - c.desconto_noite), 0);
      const dayServicesRev = activeStays.flatMap(c => c.servicos)
        .filter(s => s.data.slice(0, 10) === dStr)
        .reduce((acc, s) => acc + s.total, 0);

      weekDiariasRevenue += dayDiariasRev;
      weekServicesRevenue += dayServicesRev;
      totalRoomsOccupiedAcrossWeek += activeStays.length;

      const totalActiveQuartos = quartos.filter(q => q.activo === 1).length;
      const dayOccupancyRate = totalActiveQuartos > 0 ? Math.round((activeStays.length / totalActiveQuartos) * 100) : 0;

      days.push({
        name: dayNames[i],
        dateStr: dStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        occupied: activeStays.length,
        totalRooms: totalActiveQuartos,
        rate: dayOccupancyRate,
        diariasRevenue: dayDiariasRev,
        servicesRevenue: dayServicesRev,
        totalRevenue: dayDiariasRev + dayServicesRev
      });
    }

    const totalRoomsAvailableWeek = quartos.filter(q => q.activo === 1).length * 7;
    const avgOccupancy = totalRoomsAvailableWeek > 0 
      ? Math.round((totalRoomsOccupiedAcrossWeek / totalRoomsAvailableWeek) * 100) 
      : 0;

    const totalRevenue = weekDiariasRevenue + weekServicesRevenue;
    const adr = totalRoomsOccupiedAcrossWeek > 0 ? Math.round(weekDiariasRevenue / totalRoomsOccupiedAcrossWeek) : 0;
    const revpar = totalRoomsAvailableWeek > 0 ? Math.round(totalRevenue / totalRoomsAvailableWeek) : 0;

    return {
      days,
      mondayStr: monday.toISOString().slice(0, 10),
      sundayStr: new Date(monday.getTime() + 6 * 86400000).toISOString().slice(0, 10),
      avgOccupancy,
      totalRevenue,
      weekDiariasRevenue,
      weekServicesRevenue,
      adr,
      revpar,
      totalRoomsOccupiedAcrossWeek
    };
  }, [checkins, quartos, selectedWeekOffset]);

  // Top services in the period
  const topServices = useMemo(() => {
    const map = new Map<string, { total: number; qty: number }>();
    checkins.forEach(c => {
      c.servicos.forEach(s => {
        const curr = map.get(s.descricao) || { total: 0, qty: 0 };
        map.set(s.descricao, { total: curr.total + s.total, qty: curr.qty + s.quantidade });
      });
    });
    return Array.from(map.entries())
      .map(([nome, val]) => ({ nome, ...val }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [checkins]);

  // Payment methods breakdown
  const paymentMethods = useMemo(() => {
    const map = new Map<string, number>();
    checkins.forEach(c => {
      c.parcelas.forEach(p => {
        map.set(p.forma_pagamento, (map.get(p.forma_pagamento) || 0) + p.valor_pago);
      });
    });
    return Array.from(map.entries()).map(([forma, total]) => ({ forma, total }));
  }, [checkins]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`RELATÓRIO SEMANAL DE DESEMPENHO — ${empresa.nome}`, 14, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Semana de ${weekData.mondayStr} a ${weekData.sundayStr} | ECHpro v2.5`, 14, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Ocupação Média: ${weekData.avgOccupancy}%  |  Receita Total: ${formatCurrency(weekData.totalRevenue)}  |  ADR: ${formatCurrency(weekData.adr)}  |  RevPAR: ${formatCurrency(weekData.revpar)}`, 14, 34);

    const rows = weekData.days.map(d => [
      `${d.name} (${d.label})`,
      `${d.occupied} / ${d.totalRooms}`,
      `${d.rate}%`,
      formatCurrency(d.diariasRevenue),
      formatCurrency(d.servicesRevenue),
      formatCurrency(d.totalRevenue)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Dia da Semana', 'Quartos Ocupados', 'Taxa Ocupação', 'Diárias', 'Serviços/Bar', 'Receita Total']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] },
      styles: { fontSize: 8 }
    });

    doc.save(`ECHpro_Relatorio_Semanal_${weekData.mondayStr}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = ['Dia', 'Data', 'Quartos Ocupados', 'Total Quartos', 'Taxa Ocupação (%)', 'Receita Diárias (MT)', 'Receita Serviços (MT)', 'Receita Total (MT)'];
    const rows = weekData.days.map(d => [
      d.name,
      d.dateStr,
      d.occupied,
      d.totalRooms,
      d.rate,
      d.diariasRevenue,
      d.servicesRevenue,
      d.totalRevenue
    ]);
    exportToCSV(`ECHpro_Desempenho_Semanal_${weekData.mondayStr}`, headers, rows);
  };

  const maxDayRevenue = Math.max(1, ...weekData.days.map(d => d.totalRevenue));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Relatórios Detalhados de Desempenho Semanal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de produtividade, taxa média de ocupação, RevPAR, ADR e receitas por dia da semana.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week offset controls */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedWeekOffset(prev => prev - 1)}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              ← Anterior
            </button>
            <span className="px-2.5 text-slate-700 dark:text-slate-300 font-bold">
              {selectedWeekOffset === 0 ? 'Semana Atual' : `${Math.abs(selectedWeekOffset)} sem ${selectedWeekOffset < 0 ? 'atrás' : 'à frente'}`}
            </span>
            <button
              onClick={() => setSelectedWeekOffset(prev => prev + 1)}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Próxima →
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Taxa Média Ocupação</span>
            <Percent className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {weekData.avgOccupancy}%
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            {weekData.totalRoomsOccupiedAcrossWeek} noites ocupadas na semana
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Receita Semanal Total</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {formatCurrency(weekData.totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Diárias: {formatCurrency(weekData.weekDiariasRevenue)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ADR (Diária Média)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(weekData.adr)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Média por quarto ocupado
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>RevPAR</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {formatCurrency(weekData.revpar)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Receita por quarto disponível
          </p>
        </div>
      </div>

      {/* Visual Day-by-Day Revenue & Occupancy Graph */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-500" />
            Desempenho Diário da Semana ({weekData.mondayStr} a {weekData.sundayStr})
          </h3>
          <span className="text-xs text-slate-500">Valores em Meticais (MT)</span>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end min-h-[180px]">
          {weekData.days.map(d => {
            const heightPercent = maxDayRevenue > 0 ? Math.max(12, Math.round((d.totalRevenue / maxDayRevenue) * 100)) : 12;
            return (
              <div key={d.dateStr} className="flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(d.totalRevenue)}
                </div>
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-32 relative">
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-xl transition-all duration-700 ease-out flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {d.rate}%
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {d.name.slice(0, 3)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{d.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Days Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Tabela Detalhada por Dia da Semana
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Dia da Semana</th>
                <th className="p-3 text-center">Ocupação</th>
                <th className="p-3 text-center">Taxa (%)</th>
                <th className="p-3 text-right">Diárias</th>
                <th className="p-3 text-right">Consumos / Serviços</th>
                <th className="p-3 text-right">Total Faturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {weekData.days.map(d => (
                <tr key={d.dateStr} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {d.name} <span className="font-normal text-slate-400">({d.dateStr})</span>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {d.occupied} / {d.totalRooms} quartos
                  </td>
                  <td className="p-3 text-center font-bold text-teal-600 dark:text-teal-400">
                    {d.rate}%
                  </td>
                  <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(d.diariasRevenue)}
                  </td>
                  <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(d.servicesRevenue)}
                  </td>
                  <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(d.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two columns: Top Services & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Services */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-500" />
            Top 5 Consumos / Serviços Mais Vendidos
          </h4>
          <div className="space-y-2 text-xs">
            {topServices.map(s => (
              <div key={s.nome} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-slate-800 dark:text-slate-200">{s.nome}</span>
                <div className="text-right">
                  <div className="font-extrabold text-teal-600 dark:text-teal-400">{formatCurrency(s.total)}</div>
                  <div className="text-[10px] text-slate-400">{s.qty} pedidos</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            Distribuição por Formas de Pagamento
          </h4>
          <div className="space-y-2 text-xs">
            {paymentMethods.map(p => (
              <div key={p.forma} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-slate-800 dark:text-slate-200">{p.forma}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
