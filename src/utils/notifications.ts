/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Checkin, Quarto, Hospede, NotificationItem } from '../types';

/**
 * Web Audio API gentle notification chime (zero external audio files needed)
 */
export function playNotificationSound(type: 'chime' | 'alert' | 'success' = 'chime') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'alert') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

/**
 * Request Browser Push Notification Permission
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Fire native push notification if supported and granted
 */
export function sendPushNotification(title: string, body: string, icon = '/logo_ech.png') {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon
      });
    } catch {
      // Notification failed
    }
  }
}

/**
 * Scan database records and generate smart notification reminders
 */
export function scanSmartReminders(checkins: Checkin[], quartos: Quarto[], hospedes: Hospede[]): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // 1. Check-outs due today or overdue
  checkins.filter(c => c.status === 'CHECKIN').forEach(c => {
    const hospede = hospedes.find(h => h.id === c.hospede_id);
    const quarto = quartos.find(q => q.id === c.quarto_id);
    const guestName = hospede ? hospede.nome : `Hóspede #${c.hospede_id}`;
    const roomNum = quarto ? quarto.numero : `Quarto #${c.quarto_id}`;

    if (c.data_checkout) {
      const checkoutDateStr = c.data_checkout.slice(0, 10);
      const checkoutDate = new Date(c.data_checkout);

      if (checkoutDateStr === todayStr) {
        notifications.push({
          id: `reminder-checkout-today-${c.id}`,
          title: `Check-out Previsto Hoje: ${roomNum}`,
          message: `${guestName} tem check-out programado para hoje. Saldo pendente: ${c.saldo} MT.`,
          type: c.saldo > 0 ? 'urgent' : 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'checkins'
        });
      } else if (checkoutDate < now) {
        notifications.push({
          id: `reminder-checkout-overdue-${c.id}`,
          title: `Check-out Ultrapassado: ${roomNum}`,
          message: `A data prevista de saída de ${guestName} era ${checkoutDateStr}. Verificar com a recepção.`,
          type: 'urgent',
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'checkins'
        });
      }
    }

    // 2. High pending balance alert
    if (c.saldo > 3000) {
      notifications.push({
        id: `reminder-balance-${c.id}`,
        title: `Saldo Pendente Alto: ${roomNum}`,
        message: `${guestName} possui ${c.saldo} MT em dívida em aberto. Solicitar acerto de diárias.`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'pagamentos'
      });
    }
  });

  // 3. Rooms needing cleaning
  const cleaningRooms = quartos.filter(q => q.status === 'limpeza');
  if (cleaningRooms.length > 0) {
    notifications.push({
      id: 'reminder-cleaning',
      title: `${cleaningRooms.length} Quarto(s) em Limpeza`,
      message: `Quartos [${cleaningRooms.map(q => q.numero).join(', ')}] aguardam higienização para ficarem disponíveis.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'quartos'
    });
  }

  // 4. Maintenance rooms
  const maintRooms = quartos.filter(q => q.status === 'manutencao');
  if (maintRooms.length > 0) {
    notifications.push({
      id: 'reminder-maint',
      title: `Aviso de Manutenção`,
      message: `Quarto ${maintRooms.map(q => q.numero).join(', ')} está indisponível para reservas devido a reparações.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: true,
      linkTab: 'quartos'
    });
  }

  return notifications;
}
