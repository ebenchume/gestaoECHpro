/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Download, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck, 
  Wifi, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  X,
  FileCode,
  Zap,
  HelpCircle,
  FolderArchive,
  ArrowRight
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface WindowsInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsInstallerModal: React.FC<WindowsInstallerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'bat' | 'silent' | 'network' | 'inno'>('quick');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    // Listen for PWA install prompt in Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running in standalone mode (already installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Instalação Direta no Microsoft Edge ou Google Chrome:\n\n' +
        '1. Clique no ícone de "Instalar Aplicativo" (+) localizado no canto direito da barra de endereço.\n' +
        '2. Ou clique no menu (...) -> "Aplicativos" -> "Instalar este site como aplicativo".\n\n' +
        'O ECHpro será integrado diretamente à Área de Trabalho e Barra de Tarefas do Windows 10/11!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-md">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Instalador do ECHpro para Windows 10 & 11
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-teal-500 text-slate-950">
                  v2.5 Oficial
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Assistente de instalação com atalho no Ambiente de Trabalho, modo silencioso e suporte para múltiplos computadores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner / Quick Download */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Windows 10 / 11 (64-bit)
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              Pacote ZIP completo: <strong>~56 KB</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Sem necessidade de compilação complexa
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/download/windows-setup"
              download="ECHpro_Windows_Setup_v2.5.zip"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Instalador ZIP</span>
            </a>

            <button
              onClick={handlePwaInstall}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isPwaInstalled ? '✓ App Instalado' : 'Instalar via Edge / Chrome'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto text-xs">
          {[
            { id: 'quick', label: '1. Passo a Passo Rápido', icon: Zap },
            { id: 'bat', label: '2. Assistente Batch (.bat)', icon: Terminal },
            { id: 'silent', label: '3. Modo Silencioso (.vbs)', icon: Layers },
            { id: 'network', label: '4. Rede Local & Firewall', icon: Wifi },
            { id: 'inno', label: '5. Compilar Setup .EXE', icon: FileCode },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 flex-1">
          {/* TAB 1: Quick Step by Step */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                <h3 className="font-bold text-teal-900 dark:text-teal-200 text-sm mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Instalação em 3 Passos Simples no Windows 10/11
                </h3>
                <p className="text-teal-700 dark:text-teal-300 text-xs">
                  Siga os passos abaixo para ter o ECHpro a funcionar como um programa nativo no computador da recepção do hotel ou da gerência:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Baixar o Pacote ZIP</h4>
                  <p className="text-slate-500 text-[11px]">
                    Clique no botão verde acima para baixar o arquivo <code>ECHpro_Windows_Setup_v2.5.zip</code> e extraia numa pasta (ex: <code>C:\ECHpro</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Executar o Instalador</h4>
                  <p className="text-slate-500 text-[11px]">
                    Clique com o botão direito em <code>Instalar_ECHpro_Windows.bat</code> e selecione <strong>"Executar como Administrador"</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Abrir e Trabalhar</h4>
                  <p className="text-slate-500 text-[11px]">
                    Será criado automaticamente o atalho <strong>"ECHpro Hotel PMS"</strong> na sua Área de Trabalho e Menu Iniciar com o logotipo oficial.
                  </p>
                </div>
              </div>

              {/* Files in Zip */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-teal-600" />
                  Arquivos Incluídos no Pacote Windows:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">Instalar_ECHpro_Windows.bat</span>
                    <span className="text-slate-400">Instalador</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Iniciar_ECHpro.bat</span>
                    <span className="text-slate-400">Iniciador</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Iniciar_ECHpro_Silencioso.vbs</span>
                    <span className="text-slate-400">Sem CMD preto</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">configurar_firewall_rede_local.bat</span>
                    <span className="text-slate-400">Rede Hotel</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Desinstalar_ECHpro.bat</span>
                    <span className="text-slate-400">Remover atalhos</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 font-mono flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">inno_setup_echpro.iss</span>
                    <span className="text-slate-400">Script .EXE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Batch Installer Details */}
          {activeTab === 'bat' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Script do Instalador Automático (Instalar_ECHpro_Windows.bat)
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Verifica privilégios, instala dependências, cria atalhos do Windows e configura o firewall.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(
                    `@echo off\nchcp 65001 >nul\ntitle ECHpro v2.5 — Assistente de Instalacao para Windows 10 e 11\ncall npm install\npowershell -NoProfile -ExecutionPolicy Bypass -Command "$wsh = New-Object -ComObject WScript.Shell; $desk = [System.Environment]::GetFolderPath('Desktop'); $s = $wsh.CreateShortcut($desk + '\\ECHpro Hotel PMS.lnk'); $s.TargetPath = '%~dp0Iniciar_ECHpro_Silencioso.vbs'; $s.WorkingDirectory = '%~dp0'; $s.Save();"\npause`,
                    'bat_code'
                  )}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {copiedKey === 'bat_code' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bat_code' ? 'Copiado!' : 'Copiar Resumo'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <span className="text-teal-400">:: 1. Verificação de Node.js</span><br/>
                where node &gt;nul 2&gt;&amp;1 || winget install OpenJS.NodeJS.LTS --silent<br/><br/>
                <span className="text-teal-400">:: 2. Criação automática de atalho .LNK na Área de Trabalho com PowerShell</span><br/>
                powershell -Command "$wsh=New-Object -Com WScript.Shell; $s=$wsh.CreateShortcut([Environment]::GetFolderPath('Desktop')+'\\ECHpro Hotel PMS.lnk'); $s.TargetPath='%~dp0Iniciar_ECHpro_Silencioso.vbs'; $s.IconLocation='%~dp0public\\logo_ech.png'; $s.Save()"<br/><br/>
                <span className="text-teal-400">:: 3. Abertura imediata do sistema</span><br/>
                start http://localhost:3000
              </div>
            </div>
          )}

          {/* TAB 3: Silent Runner */}
          {activeTab === 'silent' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Iniciador Silencioso em Segundo Plano (Iniciar_ECHpro_Silencioso.vbs)
              </h4>
              <p className="text-slate-500 text-[11px]">
                No ambiente de recepção de um hotel, não é agradável para o recepcionista ter uma janela de terminal preta aberta na barra de tarefas.
                O arquivo VBScript executa o servidor silenciosamente e abre o browser diretamente no ECHpro:
              </p>

              <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <span className="text-indigo-400">' ECHpro — Execução em Segundo Plano</span><br/>
                Set WshShell = CreateObject("WScript.Shell")<br/>
                Set fso = CreateObject("Scripting.FileSystemObject")<br/>
                strBatPath = fso.GetParentFolderName(WScript.ScriptFullName) &amp; "\Iniciar_ECHpro.bat"<br/>
                WshShell.Run Chr(34) &amp; strBatPath &amp; Chr(34), 0, False
              </div>
            </div>
          )}

          {/* TAB 4: Hotel Network LAN */}
          {activeTab === 'network' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-600" />
                Configuração para Vários Computadores no Hotel (Rede Local / Wi-Fi)
              </h4>
              <p className="text-slate-500 text-[11px]">
                O ECHpro permite que o computador principal da recepção funcione como o <strong>Servidor Central</strong> e outros computadores (gerência, restaurante, governança) acessem o mesmo banco de dados em tempo real pela rede Wi-Fi ou cabo:
              </p>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs">
                <strong>Comando para liberar a porta 3000 no Firewall do Windows:</strong>
                <div className="mt-1.5 p-2 bg-slate-900 text-amber-300 font-mono text-[11px] rounded flex items-center justify-between">
                  <span>netsh advfirewall firewall add rule name="ECHpro Hotel Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000</span>
                  <button
                    onClick={() => handleCopy('netsh advfirewall firewall add rule name="ECHpro Hotel Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000', 'netsh')}
                    className="ml-2 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'netsh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                <p>1. Execute o script <code>configurar_firewall_rede_local.bat</code> como Administrador no PC Servidor.</p>
                <p>2. O script exibirá o IP local do servidor (exemplo: <code>192.168.1.100</code>).</p>
                <p>3. Nos outros computadores ou tablets do hotel, basta abrir o navegador e aceder a: <code>http://192.168.1.100:3000</code>.</p>
              </div>
            </div>
          )}

          {/* TAB 5: Inno Setup Compiler */}
          {activeTab === 'inno' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Compilando um Instalador Executável Standalone (.EXE)
              </h4>
              <p className="text-slate-500 text-[11px]">
                Se desejar distribuir um arquivo único <code>Setup_ECHpro_v2.5_Windows.exe</code> pronto para clicar e instalar com assistente padrão do Windows:
              </p>

              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>Instale o software gratuito <strong>Inno Setup Compiler</strong> (jrsoftware.org).</li>
                <li>Abra o arquivo <code>inno_setup_echpro.iss</code> incluído na pasta do instalador.</li>
                <li>Clique em <strong>"Build &gt; Compile"</strong> no menu superior.</li>
                <li>Será gerado o arquivo <code>Setup_ECHpro_v2.5_Windows.exe</code> com assistente em português!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-500 flex items-center gap-2">
            <span>Desenvolvido por: <strong>Eben Chume</strong> (+258 82 747 3434)</span>
            <span>•</span>
            <span>ebenchume@sapo.mz</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
            >
              Fechar
            </button>
            <a
              href="/api/download/windows-setup"
              download="ECHpro_Windows_Setup_v2.5.zip"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Pacote .ZIP</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
