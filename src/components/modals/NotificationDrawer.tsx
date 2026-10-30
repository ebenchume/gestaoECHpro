/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Volume2, 
  Smartphone,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playNotificationSound, requestPushPermission } from '../../utils/notifications';
import { NavTab } from '../layout/Sidebar';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    settings,
    updateSettings
  } = useApp();

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      updateSettings({ pushEnabled: true });
      playNotificationSound('success');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notificações & Lembretes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions & Settings */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
          <button
            onClick={markAllNotificationsAsRead}
            disabled={notifications.length === 0}
            className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas como lidas
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playNotificationSound('alert')}
              title="Testar sinal sonoro"
              className="p-1.5 rounded text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleEnablePush}
              title="Ativar Notificações no Navegador"
              className="flex items-center gap-1 px-2 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-medium"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Push Web
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30 text-teal-500" />
              <p className="text-sm font-medium">Sem notificações pendentes</p>
              <p className="text-xs mt-1">Todos os check-outs e tarefas estão em dia!</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationAsRead(item.id);
                  if (item.linkTab) {
                    onNavigateToTab(item.linkTab as NavTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  !item.read
                    ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 pr-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    {item.linkTab && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 mt-2 hover:underline">
                        Acessar módulo <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    dismissNotification(item.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Dispensar notificação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 text-center">
          Os alertas são gerados automaticamente para check-outs do dia, dívidas e quartos em limpeza.
        </div>
      </div>
    </div>
  );
};
