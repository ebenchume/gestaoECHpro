; =====================================================================
; Script Inno Setup para ECHpro — Sistema de Gestão de Hóspedes Profissional
; Gera instalador executável nativo (.exe) para Windows 10 e Windows 11
; =====================================================================

#define MyAppName "ECHpro Hotel PMS"
#define MyAppVersion "2.5"
#define MyAppPublisher "Eben Chume"
#define MyAppURL "https://echpro.co.mz"
#define MyAppExeName "Iniciar_ECHpro_Silencioso.vbs"

[Setup]
AppId={{9B78B452-9E17-47C0-8B39-847250DEB331}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\ECHpro
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=.
OutputBaseFilename=Setup_ECHpro_v2.5_Windows
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

[Languages]
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode
Name: "startuprun"; Description: "Iniciar ECHpro automaticamente ao ligar o computador (Recomendado para Recepção)"; GroupDescription: "Opções de Inicialização:"

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTA: Não incluir pastas temporárias ou dist antigas se necessário

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\public\logo_ech.png"
Name: "{group}\Iniciar Servidor (Janela de Depuração)"; Filename: "{app}\Iniciar_ECHpro.bat"
Name: "{group}\Desinstalar ECHpro"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\public\logo_ech.png"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startuprun

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent
