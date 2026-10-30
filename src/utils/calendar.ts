/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Checkin, Hospede, Quarto, Empresa } from '../types';

/**
 * Format a Date to iCalendar UTC string format: YYYYMMDDTHHMMSSZ
 */
function formatToICSDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * Generate standard RFC 5545 .ics file content for external calendar apps (Google Calendar, Outlook, Apple Calendar)
 */
export function generateICSForCheckin(checkin: Checkin, hospede: Hospede, quarto: Quarto, empresa: Empresa): string {
  const now = new Date().toISOString();
  const dtStamp = formatToICSDate(now);
  const dtStart = formatToICSDate(checkin.data_checkin);
  const checkoutDate = checkin.data_checkout || new Date(new Date(checkin.data_checkin).getTime() + checkin.noites * 86400000).toISOString();
  const dtEnd = formatToICSDate(checkoutDate);

  const summary = `Estadia ECHpro: ${hospede.nome} - Quarto ${quarto.numero}`;
  const description = `Reserva / Check-in #${checkin.id}\\nHóspede: ${hospede.nome}\\nTelefone: ${hospede.telefone1}\\nQuarto: ${quarto.numero} (${quarto.tipo})\\nTotal Diárias: ${checkin.total_quarto} MZN\\nStatus: ${checkin.status}\\nSaldo Pendente: ${checkin.saldo} MZN\\nLocal: ${empresa.nome}, ${empresa.endereco}, ${empresa.cidade}`;
  const location = `${empresa.nome}, ${empresa.endereco}, ${empresa.cidade}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ECHpro//Sistema de Gestao de Hospedes v2.5//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:echpro-checkin-${checkin.id}-${Date.now()}@echpro.mz`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: Check-in/Estadia ${hospede.nome} no Quarto ${quarto.numero}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers direct download of .ics calendar file
 */
export function downloadICSFile(checkin: Checkin, hospede: Hospede, quarto: Quarto, empresa: Empresa) {
  const icsContent = generateICSForCheckin(checkin, hospede, quarto, empresa);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ECHpro_Reserva_${checkin.id}_${quarto.numero.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds Google Calendar web add link
 */
export function getGoogleCalendarUrl(checkin: Checkin, hospede: Hospede, quarto: Quarto, empresa: Empresa): string {
  const checkoutDate = checkin.data_checkout || new Date(new Date(checkin.data_checkin).getTime() + checkin.noites * 86400000).toISOString();
  const dtStart = formatToICSDate(checkin.data_checkin);
  const dtEnd = formatToICSDate(checkoutDate);
  const title = encodeURIComponent(`ECHpro: ${hospede.nome} - Quarto ${quarto.numero}`);
  const details = encodeURIComponent(`Check-in #${checkin.id}\nHóspede: ${hospede.nome} (${hospede.telefone1})\nQuarto: ${quarto.numero} - ${quarto.tipo}\nValor Total: ${checkin.total_liquido} MZN\nSaldo: ${checkin.saldo} MZN\nNotas: ${checkin.observacao || 'N/A'}`);
  const location = encodeURIComponent(`${empresa.nome}, ${empresa.cidade}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
}

/**
 * Builds Microsoft Outlook web add link
 */
export function getOutlookCalendarUrl(checkin: Checkin, hospede: Hospede, quarto: Quarto, empresa: Empresa): string {
  const checkoutDate = checkin.data_checkout || new Date(new Date(checkin.data_checkin).getTime() + checkin.noites * 86400000).toISOString();
  const title = encodeURIComponent(`ECHpro: ${hospede.nome} - Quarto ${quarto.numero}`);
  const body = encodeURIComponent(`Check-in #${checkin.id} - ${hospede.nome} - Quarto ${quarto.numero} (${quarto.tipo})`);
  const location = encodeURIComponent(`${empresa.nome}, ${empresa.cidade}`);
  const startdt = new Date(checkin.data_checkin).toISOString();
  const enddt = new Date(checkoutDate).toISOString();

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${body}&location=${location}&startdt=${startdt}&enddt=${enddt}`;
}
