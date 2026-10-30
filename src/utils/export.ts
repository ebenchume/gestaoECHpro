/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkin, Hospede, Quarto, Empresa, LivroCaixa } from '../types';

/**
 * Format currency to Mozambican Meticais (MZN)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' MT';
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates and downloads official Stay Invoice / Receipt PDF
 */
export function exportInvoicePDF(checkin: Checkin, hospede: Hospede, quarto: Quarto, empresa: Empresa) {
  const doc = new jsPDF();

  // Primary banner
  doc.setFillColor(15, 118, 110); // Teal #0f766e
  doc.rect(0, 0, 210, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(empresa.nome.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${empresa.endereco}, ${empresa.bairro} — ${empresa.cidade}`, 14, 18);
  doc.text(`NUIT: ${empresa.nuit} | Tel: ${empresa.telefone1} | Email: ${empresa.email}`, 14, 23);

  // Document Info
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`RECIBO & FATURA DE HOSPEDAGEM #${checkin.id}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Emissão: ${formatDateTime(new Date().toISOString())}`, 14, 44);
  doc.text(`Status: ${checkin.status}`, 150, 44);

  // Guest & Room Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 48, 182, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO HÓSPEDE', 18, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${hospede.nome}`, 18, 62);
  doc.text(`Documento: ${hospede.tipo_documento} nº ${hospede.numero_documento}`, 18, 68);
  doc.text(`Telefone: ${hospede.telefone1} | Email: ${hospede.email || '—'}`, 18, 74);
  doc.text(`Nacionalidade: ${hospede.nacionalidade} | Cidade: ${hospede.cidade || '—'}`, 18, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA ESTADIA', 110, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quarto: ${quarto.numero} (${quarto.tipo})`, 110, 62);
  doc.text(`Check-in: ${formatDateTime(checkin.data_checkin)}`, 110, 68);
  doc.text(`Check-out: ${checkin.data_checkout ? formatDateTime(checkin.data_checkout) : 'Em aberto'}`, 110, 74);
  doc.text(`Ocupação: ${checkin.nr_adultos} adulto(s), ${checkin.nr_criancas} criança(s)`, 110, 80);

  // Table of Items
  const tableRows: (string | number)[][] = [
    [
      `Diárias no Quarto ${quarto.numero}`,
      `${checkin.noites} noite(s)`,
      formatCurrency(checkin.preco_diaria),
      formatCurrency(checkin.total_quarto)
    ]
  ];

  if (checkin.total_desconto > 0) {
    tableRows.push([
      `Desconto Aplicado`,
      `${checkin.noites} noite(s)`,
      `-${formatCurrency(checkin.desconto_noite)}`,
      `-${formatCurrency(checkin.total_desconto)}`
    ]);
  }

  // Services
  checkin.servicos.forEach(serv => {
    tableRows.push([
      serv.descricao,
      serv.quantidade,
      formatCurrency(serv.preco_unitario),
      formatCurrency(serv.total)
    ]);
  });

  autoTable(doc, {
    startY: 89,
    head: [['Descrição / Consumos', 'Qtd / Noites', 'Valor Unitário', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' }
    }
  });

  // Totals Box
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(110, finalY, 86, 40, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal Quartos:', 114, finalY + 8);
  doc.text(formatCurrency(checkin.subtotal), 190, finalY + 8, { align: 'right' });

  doc.text('Total Consumos/Serviços:', 114, finalY + 14);
  doc.text(formatCurrency(checkin.total_servicos), 190, finalY + 14, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL GERAL:', 114, finalY + 22);
  doc.text(formatCurrency(checkin.total_liquido), 190, finalY + 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // green
  doc.text('Total Pago:', 114, finalY + 29);
  doc.text(formatCurrency(checkin.valor_pago), 190, finalY + 29, { align: 'right' });

  doc.setTextColor(checkin.saldo > 0 ? 239 : 100, checkin.saldo > 0 ? 68 : 116, checkin.saldo > 0 ? 68 : 139);
  doc.setFont('helvetica', 'bold');
  doc.text('SALDO PENDENTE:', 114, finalY + 36);
  doc.text(formatCurrency(checkin.saldo), 190, finalY + 36, { align: 'right' });

  // Payments History Table
  if (checkin.parcelas && checkin.parcelas.length > 0) {
    const payRows = checkin.parcelas.map(p => [
      formatDate(p.data_pagamento),
      p.forma_pagamento,
      p.referencia || '—',
      formatCurrency(p.valor_pago)
    ]);

    autoTable(doc, {
      startY: finalY + 46,
      head: [['Data Pagamento', 'Forma', 'Referência', 'Valor Pago']],
      body: payRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255]
      },
      styles: { fontSize: 8 }
    });
  }

  // Footer notes and signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Obrigado pela preferência! Guarde este recibo para efeitos de comprovação fiscal.', 14, 270);
  doc.text('Processado por computador via ECHpro v2.5 — Eben Chume Softwares (+258 82 747 3434)', 14, 276);

  doc.line(130, 260, 195, 260);
  doc.text('Assinatura / Carimbo da Recepção', 135, 265);

  doc.save(`Recibo_Checkin_${checkin.id}_${hospede.nome.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Export Cash Book / Livro de Caixa PDF report
 */
export function exportCaixaReportPDF(items: LivroCaixa[], empresa: Empresa, dataInicio?: string, dataFim?: string) {
  const doc = new jsPDF();

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`LIVRO DE CAIXA & FLUXO FINANCEIRO — ${empresa.nome}`, 14, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${dataInicio || 'Início'} até ${dataFim || 'Presente'} | Gerado em ${formatDateTime(new Date().toISOString())}`, 14, 18);

  const totalEntradas = items.filter(i => i.tipo === 'Entrada').reduce((acc, i) => acc + i.valor, 0);
  const totalSaidas = items.filter(i => i.tipo === 'Saída').reduce((acc, i) => acc + i.valor, 0);
  const saldoFinal = totalEntradas - totalSaidas;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Total Entradas: ${formatCurrency(totalEntradas)}   |   Total Saídas: ${formatCurrency(totalSaidas)}   |   Saldo Líquido: ${formatCurrency(saldoFinal)}`, 14, 32);

  const tableRows = items.map(i => [
    formatDateTime(i.data_movimento),
    i.tipo,
    i.categoria,
    i.descricao,
    i.forma_pagamento,
    i.tipo === 'Entrada' ? `+${formatCurrency(i.valor)}` : `-${formatCurrency(i.valor)}`,
    i.utilizador
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Data/Hora', 'Tipo', 'Categoria', 'Descrição', 'Forma', 'Valor', 'Operador']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110] },
    styles: { fontSize: 8 }
  });

  doc.save(`Livro_Caixa_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Universal CSV Export with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
