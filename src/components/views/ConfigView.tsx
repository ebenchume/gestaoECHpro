/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Building2, 
  Cloud, 
  HardDrive, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Save, 
  Upload, 
  Download, 
  CheckCircle2, 
  Key, 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Volume2, 
  Bell,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Clock,
  Play,
  Terminal,
  CheckCheck,
  Lock,
  Link2,
  Unlink,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  createBackupPayload, 
  downloadBackupFile, 
  exportToGoogleDrive, 
  exportToDropbox, 
  parseBackupFile 
} from '../../utils/syncAndBackup';
import { requestPushPermission, playNotificationSound } from '../../utils/notifications';
import { WindowsInstallerModal } from './WindowsInstallerModal';

export const ConfigView: React.FC = () => {
  const { 
    empresa, 
    setEmpresa, 
    quartos, 
    hospedes, 
    checkins, 
    servicosCatalogo, 
    livroCaixa, 
    auditLogs, 
    licenca, 
    activateLicenseKey,
    settings, 
    updateSettings, 
    restoreFromBackup,
    isOnline,
    lastSyncedAt,
    isSyncing,
    triggerCloudSync
  } = useApp();

  // Company Form state
  const [nome, setNome] = useState(empresa.nome);
  const [endereco, setEndereco] = useState(empresa.endereco);
  const [cidade, setCidade] = useState(empresa.cidade);
  const [bairro, setBairro] = useState(empresa.bairro);
  const [nuit, setNuit] = useState(empresa.nuit);
  const [telefone1, setTelefone1] = useState(empresa.telefone1);
  const [telefone2, setTelefone2] = useState(empresa.telefone2);
  const [email, setEmail] = useState(empresa.email);
  const [observacao, setObservacao] = useState(empresa.observacao || '');
  const [savedEmpresaMsg, setSavedEmpresaMsg] = useState(false);
  const [showWindowsModal, setShowWindowsModal] = useState(false);

  // License key input
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseMsg, setLicenseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File restore ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string>('');

  // Cron Scheduled Backup states
  const [cronRunning, setCronRunning] = useState(false);
  const [cronHistory, setCronHistory] = useState<Array<{
    id: string;
    filename: string;
    timestamp: string;
    sizeFormatted: string;
    sha256: string;
    integrityVerified: boolean;
    destinations: {
      googleDrive: { status: string; details: string };
      dropbox: { status: string; details: string };
    };
  }>>([]);
  const [cronMessage, setCronMessage] = useState<string>('');

  // Cloud Account Linking states
  const [cloudStatus, setCloudStatus] = useState<{
    googleDrive: {
      connected: boolean;
      hasToken: boolean;
      maskedToken: string;
      folderId: string;
      accountEmail: string;
      accountName: string;
      linkedAt: string;
      lastTestStatus: string;
      lastTestMessage: string;
    };
    dropbox: {
      connected: boolean;
      hasToken: boolean;
      maskedToken: string;
      folderPath: string;
      accountEmail: string;
      accountName: string;
      linkedAt: string;
      lastTestStatus: string;
      lastTestMessage: string;
    };
  }>({
    googleDrive: { connected: false, hasToken: false, maskedToken: '', folderId: '', accountEmail: '', accountName: '', linkedAt: '', lastTestStatus: 'none', lastTestMessage: '' },
    dropbox: { connected: false, hasToken: false, maskedToken: '', folderPath: '/ECHpro_Backups', accountEmail: '', accountName: '', linkedAt: '', lastTestStatus: 'none', lastTestMessage: '' }
  });

  // Google Drive Form
  const [driveToken, setDriveToken] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [showDriveToken, setShowDriveToken] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveFeedback, setDriveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dropbox Form
  const [dropboxToken, setDropboxToken] = useState('');
  const [dropboxFolderPath, setDropboxFolderPath] = useState('/ECHpro_Backups');
  const [showDropboxToken, setShowDropboxToken] = useState(false);
  const [dropboxLoading, setDropboxLoading] = useState(false);
  const [dropboxFeedback, setDropboxFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch cloud accounts status
  const loadCloudStatus = async () => {
    try {
      const res = await fetch('/api/cloud/status');
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          setCloudStatus(json.status);
          if (json.status.googleDrive?.folderId) setDriveFolderId(json.status.googleDrive.folderId);
          if (json.status.dropbox?.folderPath) setDropboxFolderPath(json.status.dropbox.folderPath);
        }
      }
    } catch {
      // Backend route pending or offline
    }
  };

  // Fetch backup history on load
  const loadBackupHistory = async () => {
    try {
      const res = await fetch('/api/backup/history');
      if (res.ok) {
        const json = await res.json();
        if (json.history) setCronHistory(json.history);
      }
    } catch {
      // Backend route pending or offline
    }
  };

  React.useEffect(() => {
    loadBackupHistory();
    loadCloudStatus();
  }, []);

  // Google Drive Handlers
  const handleTestDrive = async () => {
    const tokenToTest = driveToken.trim() || (cloudStatus.googleDrive.hasToken ? 'CURRENT_SAVED_TOKEN' : '');
    if (!tokenToTest) {
      setDriveFeedback({ type: 'error', message: 'Por favor, insira o token de acesso do Google Drive.' });
      return;
    }

    setDriveLoading(true);
    setDriveFeedback(null);
    try {
      const res = await fetch('/api/cloud/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToTest, folderId: driveFolderId })
      });
      const data = await res.json();
      if (data.success) {
        setDriveFeedback({ type: 'success', message: data.message });
        playNotificationSound('success');
      } else {
        setDriveFeedback({ type: 'error', message: data.message });
      }
    } catch (err: unknown) {
      setDriveFeedback({ type: 'error', message: `Erro ao testar: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setDriveLoading(false);
    }
  };

  const handleSaveDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveToken.trim() && !cloudStatus.googleDrive.hasToken) {
      setDriveFeedback({ type: 'error', message: 'Insira o token de acesso do Google Drive.' });
      return;
    }

    setDriveLoading(true);
    setDriveFeedback(null);
    try {
      const res = await fetch('/api/cloud/save-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: driveToken, folderId: driveFolderId })
      });
      const data = await res.json();
      if (data.success) {
        setDriveFeedback({ type: 'success', message: '✓ Conta do Google Drive vinculada e verificada com sucesso!' });
        setDriveToken('');
        loadCloudStatus();
        playNotificationSound('success');
      } else {
        setDriveFeedback({ type: 'error', message: data.message });
      }
    } catch (err: unknown) {
      setDriveFeedback({ type: 'error', message: `Erro ao vincular: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setDriveLoading(false);
    }
  };

  const handleUnlinkDrive = async () => {
    if (!confirm('Deseja desvincular a conta do Google Drive? Os backups automáticos não serão mais enviados para o Drive.')) return;
    try {
      await fetch('/api/cloud/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'googleDrive' })
      });
      setDriveToken('');
      setDriveFeedback(null);
      loadCloudStatus();
    } catch {
      // Unlink error
    }
  };

  // Dropbox Handlers
  const handleTestDropbox = async () => {
    const tokenToTest = dropboxToken.trim() || (cloudStatus.dropbox.hasToken ? 'CURRENT_SAVED_TOKEN' : '');
    if (!tokenToTest) {
      setDropboxFeedback({ type: 'error', message: 'Por favor, insira o token de acesso do Dropbox.' });
      return;
    }

    setDropboxLoading(true);
    setDropboxFeedback(null);
    try {
      const res = await fetch('/api/cloud/test-dropbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToTest, folderPath: dropboxFolderPath })
      });
      const data = await res.json();
      if (data.success) {
        setDropboxFeedback({ type: 'success', message: data.message });
        playNotificationSound('success');
      } else {
        setDropboxFeedback({ type: 'error', message: data.message });
      }
    } catch (err: unknown) {
      setDropboxFeedback({ type: 'error', message: `Erro ao testar: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setDropboxLoading(false);
    }
  };

  const handleSaveDropbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropboxToken.trim() && !cloudStatus.dropbox.hasToken) {
      setDropboxFeedback({ type: 'error', message: 'Insira o token de acesso do Dropbox.' });
      return;
    }

    setDropboxLoading(true);
    setDropboxFeedback(null);
    try {
      const res = await fetch('/api/cloud/save-dropbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: dropboxToken, folderPath: dropboxFolderPath })
      });
      const data = await res.json();
      if (data.success) {
        setDropboxFeedback({ type: 'success', message: '✓ Conta do Dropbox vinculada e verificada com sucesso!' });
        setDropboxToken('');
        loadCloudStatus();
        playNotificationSound('success');
      } else {
        setDropboxFeedback({ type: 'error', message: data.message });
      }
    } catch (err: unknown) {
      setDropboxFeedback({ type: 'error', message: `Erro ao vincular: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setDropboxLoading(false);
    }
  };

  const handleUnlinkDropbox = async () => {
    if (!confirm('Deseja desvincular a conta do Dropbox? Os backups automáticos não serão mais enviados para o Dropbox.')) return;
    try {
      await fetch('/api/cloud/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'dropbox' })
      });
      setDropboxToken('');
      setDropboxFeedback(null);
      loadCloudStatus();
    } catch {
      // Unlink error
    }
  };

  const handleRunCronBackup = async () => {
    setCronRunning(true);
    setCronMessage('A executar rotina cron de backup diário (Google Drive + Dropbox)...');
    try {
      const res = await fetch('/api/backup/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: handleBackupPayload() })
      });
      const data = await res.json();
      if (data.success && data.backup) {
        setCronMessage(`✓ Backup diário concluído com integridade SHA-256 verificada (${data.backup.sha256.slice(0, 16)}...)`);
        loadBackupHistory();
        playNotificationSound('success');
      } else {
        setCronMessage(`❌ Erro no backup: ${data.error || 'Falha desconhecida'}`);
      }
    } catch (err: unknown) {
      setCronMessage(`❌ Erro de comunicação: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCronRunning(false);
    }
  };

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    setEmpresa({
      nome,
      endereco,
      cidade,
      bairro,
      nuit,
      telefone1,
      telefone2,
      email,
      observacao
    });
    setSavedEmpresaMsg(true);
    setTimeout(() => setSavedEmpresaMsg(false), 2000);
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateLicenseKey(licenseInput);
    if (res.success) {
      setLicenseMsg({ type: 'success', text: res.message });
      setLicenseInput('');
    } else {
      setLicenseMsg({ type: 'error', text: res.message });
    }
  };

  const handleBackupPayload = () => ({
    empresa,
    quartos,
    hospedes,
    checkins,
    servicos: servicosCatalogo,
    livroCaixa,
    auditLogs,
    licenca,
    settings
  });

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreStatus('A analisar ficheiro de backup...');
    const res = await parseBackupFile(file);
    if (res.success && res.data) {
      if (confirm('Atenção: A restauração substituirá os dados atuais pelo backup selecionado. Deseja continuar?')) {
        restoreFromBackup(res.data);
        setRestoreStatus('✓ Base de dados restaurada com sucesso!');
      } else {
        setRestoreStatus('');
      }
    } else {
      setRestoreStatus(`❌ ${res.error || 'Erro ao processar ficheiro.'}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Configurações, Nuvem & Licenciamento
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dados da empresa para faturas, integração de backups com Google Drive e Dropbox, aparência e suporte.
        </p>
      </div>

      {/* SECTION 1: Vinculação de Contas em Nuvem (Google Drive & Dropbox) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vinculação de Contas em Nuvem para Automação de Backup
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Armazenamento Seguro
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vincule suas credenciais do Google Drive e Dropbox. Os tokens são salvos de forma protegida para alimentar a tarefa agendada de backup diário.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerCloudSync()}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'A sincronizar...' : 'Sincronizar Nuvem'}
            </button>
          </div>
        </div>

        {/* Cloud Account Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Google Drive */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                    G
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Google Drive API v3
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upload automático diário em pasta dedicada
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  cloudStatus.googleDrive.connected
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                }`}>
                  {cloudStatus.googleDrive.connected ? '✓ Vinculado' : 'Não Vinculado'}
                </span>
              </div>

              {/* Connected Account Badge */}
              {cloudStatus.googleDrive.connected && (
                <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      Conta Conectada
                    </span>
                    <button
                      type="button"
                      onClick={handleUnlinkDrive}
                      className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Unlink className="w-3 h-3" /> Desvincular
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {cloudStatus.googleDrive.accountName || 'Conta Google'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {cloudStatus.googleDrive.accountEmail || 'google.drive@hotel-belavista.mz'}
                  </div>
                  {cloudStatus.googleDrive.maskedToken && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Token ativo: {cloudStatus.googleDrive.maskedToken}
                    </div>
                  )}
                </div>
              )}

              {/* Form to link/update token */}
              <form onSubmit={handleSaveDrive} className="mt-3 space-y-2.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {cloudStatus.googleDrive.connected ? 'Atualizar Token de Acesso' : 'Token de Acesso / OAuth Bearer Token *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDriveToken(!showDriveToken)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      {showDriveToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showDriveToken ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showDriveToken ? 'text' : 'password'}
                      value={driveToken}
                      onChange={e => setDriveToken(e.target.value)}
                      placeholder={cloudStatus.googleDrive.hasToken ? cloudStatus.googleDrive.maskedToken : 'ya29.a0AfH6SM...'}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Token com escopo <code>https://www.googleapis.com/auth/drive.file</code>.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ID da Pasta no Google Drive (Opcional)
                  </label>
                  <input
                    type="text"
                    value={driveFolderId}
                    onChange={e => setDriveFolderId(e.target.value)}
                    placeholder="Ex: 1BxiMVs0XRA5nFMdKv_... (Deixe em branco para raiz)"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                {driveFeedback && (
                  <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    driveFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {driveFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{driveFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestDrive}
                    disabled={driveLoading || (!driveToken.trim() && !cloudStatus.googleDrive.hasToken)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors disabled:opacity-40"
                  >
                    {driveLoading ? 'A testar...' : 'Testar Conexão'}
                  </button>
                  <button
                    type="submit"
                    disabled={driveLoading || (!driveToken.trim() && !cloudStatus.googleDrive.hasToken)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Salvar Token
                  </button>
                </div>
              </form>
            </div>

            {/* Quick action: Save snapshot manually */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Snapshot manual com 1 clique:</span>
              <button
                type="button"
                onClick={() => exportToGoogleDrive(handleBackupPayload())}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Abrir no Google Drive
              </button>
            </div>
          </div>

          {/* Card 2: Dropbox */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                    D
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Dropbox API v2
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upload automático diário em pasta da nuvem
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  cloudStatus.dropbox.connected
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                }`}>
                  {cloudStatus.dropbox.connected ? '✓ Vinculado' : 'Não Vinculado'}
                </span>
              </div>

              {/* Connected Account Badge */}
              {cloudStatus.dropbox.connected && (
                <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      Conta Conectada
                    </span>
                    <button
                      type="button"
                      onClick={handleUnlinkDropbox}
                      className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Unlink className="w-3 h-3" /> Desvincular
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {cloudStatus.dropbox.accountName || 'Conta Dropbox'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {cloudStatus.dropbox.accountEmail || 'dropbox.backup@hotel-belavista.mz'}
                  </div>
                  {cloudStatus.dropbox.maskedToken && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Token ativo: {cloudStatus.dropbox.maskedToken}
                    </div>
                  )}
                </div>
              )}

              {/* Form to link/update token */}
              <form onSubmit={handleSaveDropbox} className="mt-3 space-y-2.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {cloudStatus.dropbox.connected ? 'Atualizar Token de Acesso' : 'Token de Acesso Dropbox (Access Token) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDropboxToken(!showDropboxToken)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      {showDropboxToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showDropboxToken ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showDropboxToken ? 'text' : 'password'}
                      value={dropboxToken}
                      onChange={e => setDropboxToken(e.target.value)}
                      placeholder={cloudStatus.dropbox.hasToken ? cloudStatus.dropbox.maskedToken : 'sl.B6m4pQ...'}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Gerado na consola <code>dropbox.com/developers/apps</code> com permissão <code>files.content.write</code>.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Caminho da Pasta no Dropbox
                  </label>
                  <input
                    type="text"
                    value={dropboxFolderPath}
                    onChange={e => setDropboxFolderPath(e.target.value)}
                    placeholder="/ECHpro_Backups"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                {dropboxFeedback && (
                  <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    dropboxFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {dropboxFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{dropboxFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestDropbox}
                    disabled={dropboxLoading || (!dropboxToken.trim() && !cloudStatus.dropbox.hasToken)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors disabled:opacity-40"
                  >
                    {dropboxLoading ? 'A testar...' : 'Testar Conexão'}
                  </button>
                  <button
                    type="submit"
                    disabled={dropboxLoading || (!dropboxToken.trim() && !cloudStatus.dropbox.hasToken)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Salvar Token
                  </button>
                </div>
              </form>
            </div>

            {/* Quick action: Save snapshot manually */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Snapshot manual com 1 clique:</span>
              <button
                type="button"
                onClick={() => exportToDropbox(handleBackupPayload())}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Guardar no Dropbox
              </button>
            </div>
          </div>
        </div>

        {/* Local Snapshot Download & Restore sub-panel */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-teal-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Arquivo Físico Local & Restauração</span>
              <p className="text-[11px] text-slate-500">Transfira o ficheiro JSON ou importe para restaurar a base de dados.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadBackupFile(handleBackupPayload())}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Ficheiro
            </button>
            <label className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" /> Restaurar Backup
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {restoreStatus && (
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {restoreStatus}
          </div>
        )}
      </div>

      {/* SECTION 2: Tarefa Agendada (Cron) de Backup Diário Automático */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tarefa Agendada (Cron) de Backup Diário Automático
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                  Cron Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Execução programada diária às 02h00 com upload direto para Google Drive e Dropbox e validação SHA-256.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunCronBackup}
            disabled={cronRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all disabled:opacity-50 shrink-0"
          >
            {cronRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            {cronRunning ? 'A executar cron...' : 'Executar Tarefa Cron Agora'}
          </button>
        </div>

        {cronMessage && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-200 animate-fade-in flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{cronMessage}</span>
          </div>
        )}

        {/* Cron Specs and Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Expressão Cron</div>
            <div className="font-mono text-sm font-extrabold text-teal-600 dark:text-teal-400">
              0 2 * * *
            </div>
            <p className="text-[11px] text-slate-500">
              Executa todos os dias às 02:00:00 da madrugada
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Garantia de Integridade</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Checksum SHA-256
            </div>
            <p className="text-[11px] text-slate-500">
              Validação imediata de consistência byte a byte
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Política de Retenção</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              30 Dias de Histórico
            </div>
            <p className="text-[11px] text-slate-500">
              Expurgo automático de snapshots mais antigos
            </p>
          </div>
        </div>

        {/* Command line instructions for Linux & Windows administrators */}
        <div className="p-3 bg-slate-950 text-slate-200 rounded-xl space-y-2 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase">
            <span className="flex items-center gap-1.5 text-teal-400">
              <Terminal className="w-3.5 h-3.5" />
              Comando CLI & Agendador Externo (Linux Crontab / Servidor)
            </span>
            <span className="font-mono text-slate-500">Node / TSX</span>
          </div>
          <div className="p-2 bg-slate-900 rounded-lg font-mono text-[11px] text-teal-300 overflow-x-auto select-all">
            0 2 * * * cd /app/applet && npx tsx scripts/backup_cron.ts &gt;&gt; /var/log/echpro_backup.log 2&gt;&amp;1
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Também disponível via script Python em <code>scripts/backup_cron.py</code></span>
            <span className="text-emerald-400 font-semibold">Node-Cron Ativo em Segundo Plano</span>
          </div>
        </div>

        {/* History Table of Recent Cron Backups */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Histórico de Backups Diários Automatizados ({cronHistory.length})</span>
            <button
              onClick={loadBackupHistory}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline normal-case text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Atualizar
            </button>
          </div>

          {cronHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Nenhum backup cron registrado ainda. Clique em "Executar Tarefa Cron Agora" para gerar o primeiro snapshot diário.
            </p>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">Ficheiro & Data</th>
                    <th className="p-2.5">Tamanho</th>
                    <th className="p-2.5">Integridade SHA-256</th>
                    <th className="p-2.5">Destinos em Nuvem</th>
                    <th className="p-2.5 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cronHistory.slice(0, 5).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                        {b.filename}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(b.timestamp).toLocaleString('pt-MZ')}
                        </div>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                        {b.sizeFormatted}
                      </td>
                      <td className="p-2.5">
                        <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 block truncate max-w-[150px]" title={b.sha256}>
                          {b.sha256.slice(0, 16)}...
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          ✓ Hash Verificado
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px]">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold mr-1">
                          Drive: {b.destinations?.googleDrive?.status || 'OK'}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                          Dropbox: {b.destinations?.dropbox?.status || 'OK'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <a
                          href={`/api/backup/download/${b.filename}`}
                          download={b.filename}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:text-teal-600"
                        >
                          <Download className="w-3 h-3" /> Baixar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: Instalação & Setup no Windows 10 e Windows 11 */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-slate-700/80 shadow-lg text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Instalação no Windows 10 & 11 (PC de Recepção & Servidor Local)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/30">
                  Setup v2.5
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Execute o ECHpro com atalho na Área de Trabalho, modo silencioso em segundo plano e acesso multi-terminais no hotel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/download/windows-setup"
              download="ECHpro_Windows_Setup_v2.5.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Pacote ZIP</span>
            </a>

            <button
              type="button"
              onClick={() => setShowWindowsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>Ver Guia & Scripts</span>
            </button>
          </div>
        </div>

        {/* 3 cards highlighting features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instalador com 1 Clique (.BAT)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              O script <code>Instalar_ECHpro_Windows.bat</code> checa o Node.js LTS, instala dependências e cria automaticamente o atalho com o logotipo oficial no Desktop e Iniciar.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-indigo-400" />
              Modo Silencioso (.VBS)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              O iniciador <code>Iniciar_ECHpro_Silencioso.vbs</code> roda o servidor em segundo plano e abre o navegador imediatamente sem nenhuma janela preta de prompt visível.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Rede Local do Hotel & Firewall
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Inclui script para liberar a porta 3000 no Windows Defender Firewall, permitindo que outros computadores da recepção, bar ou gerência usem o sistema pelo Wi-Fi.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80">
          <span>Compatível com: <strong>Windows 10, Windows 11, Windows Server 2019/2022</strong> (64-bit)</span>
          <span className="text-teal-400">Desenvolvido por Eben Chume (+258 82 747 3434)</span>
        </div>
      </div>

      {/* SECTION 3: Appearance & Visual Ergonomics */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Aparência, Modo Escuro Automático & Ergonomia Visual
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Modo Escuro / Claro
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'Automático', desc: 'Segue o sistema', icon: Monitor },
                { id: 'dark', label: 'Modo Escuro', desc: 'Slate escuro', icon: Moon },
                { id: 'light', label: 'Modo Claro', desc: 'Nítido e limpo', icon: Sun },
              ].map(t => {
                const Icon = t.icon;
                const active = settings.themeMode === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ themeMode: t.id as typeof settings.themeMode })}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      active
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                    <div>{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Notificações & Sons Operacionais
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushEnabled}
                  onChange={e => {
                    if (e.target.checked) requestPushPermission();
                    updateSettings({ pushEnabled: e.target.checked });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Notificações push inteligentes no navegador (check-outs do dia, dívidas)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={e => {
                    if (e.target.checked) playNotificationSound('success');
                    updateSettings({ soundAlerts: e.target.checked });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Sinal sonoro suave ao confirmar check-ins, pagamentos e alertas
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dados da Empresa / Hotel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Identificação do Estabelecimento (Impressão de Faturas & Recibos)
            </h2>
          </div>
          {savedEmpresaMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Dados atualizados!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveEmpresa} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Hotel / Pousada *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">NUIT *</label>
              <input
                type="text"
                required
                value={nuit}
                onChange={e => setNuit(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Endereço</label>
              <input
                type="text"
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Telefone Principal *</label>
              <input
                type="text"
                required
                value={telefone1}
                onChange={e => setTelefone1(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Telefone Secundário</label>
              <input
                type="text"
                value={telefone2}
                onChange={e => setTelefone2(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Oficial</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Dados da Empresa
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: Licença & Chave de Ativação Oficial */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Sistema de Licenciamento & Ativação ECHpro
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-extrabold text-xs uppercase border border-emerald-500/30">
            {licenca.status === 'activa' ? '✓ Licença Ativa' : 'Período de Avaliação'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700/60">
            <div className="font-bold text-slate-700 dark:text-slate-300">Detalhes da Licença:</div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Status Atual:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 uppercase">{licenca.status}</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Dias Restantes:</span>
              <strong className="text-slate-900 dark:text-white">{licenca.dias_restantes} dias</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Chave Ativada:</span>
              <code className="font-mono text-teal-600 dark:text-teal-400 font-bold">{licenca.chave_usada || 'Nenhuma'}</code>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>ID da Estação:</span>
              <span className="font-mono text-slate-500">{licenca.machine_id}</span>
            </div>
          </div>

          <form onSubmit={handleActivateKey} className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ativar com Nova Chave de Licença (Formato: ECHP-XXXX-XXXX-XXXX-XXXX)
              </label>
              <input
                type="text"
                value={licenseInput}
                onChange={e => setLicenseInput(e.target.value)}
                placeholder="ECHP-5FA3-A9C0-8EF0-9737"
                className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Quick sample keys from CHAVES_ACTIVACAO.txt */}
            <div className="text-[11px] text-slate-500">
              Chave de teste rápido:{' '}
              <button
                type="button"
                onClick={() => setLicenseInput('ECHP-5FA3-A9C0-8EF0-9737')}
                className="text-teal-600 dark:text-teal-400 underline font-mono"
              >
                ECHP-5FA3-A9C0-8EF0-9737
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
            >
              Validar & Ativar Licença
            </button>

            {licenseMsg && (
              <div className={`p-2 rounded-lg text-xs font-semibold ${
                licenseMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {licenseMsg.text}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* SECTION 5: Apoio ao Cliente & Contatos Oficiais */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/60">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold">Apoio ao Cliente & Linha Oficial</h2>
          </div>
          <span className="text-xs text-teal-300 font-semibold">Segunda a Sexta, 08h–17h</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-slate-400 text-[11px]">Telefone / WhatsApp</div>
            <a href="tel:+258827473434" className="text-sm font-bold text-teal-300 hover:underline block mt-1">
              +258 82 747 3434
            </a>
            <div className="text-[10px] text-slate-400 mt-0.5">Atendimento prioritário</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-slate-400 text-[11px]">Email de Apoio Técnico</div>
            <a href="mailto:ebenchume@sapo.mz" className="text-sm font-bold text-teal-300 hover:underline block mt-1">
              ebenchume@sapo.mz
            </a>
            <div className="text-[10px] text-slate-400 mt-0.5">Resposta em até 2 horas</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-slate-400 text-[11px]">Desenvolvimento & Licenças</div>
            <div className="text-sm font-bold text-white mt-1">Eben Chume</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ECHpro v2.5.0 Suite Completa</div>
          </div>
        </div>
      </div>

      <WindowsInstallerModal
        isOpen={showWindowsModal}
        onClose={() => setShowWindowsModal(false)}
      />
    </div>
  );
};
