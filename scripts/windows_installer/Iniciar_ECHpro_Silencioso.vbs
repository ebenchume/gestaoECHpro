' ECHpro — Iniciador Silencioso para Windows 10 e 11
' Permite executar o ECHpro em segundo plano sem janela de prompt de comando preta permanente.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
strBatPath = strScriptDir & "\Iniciar_ECHpro.bat"

' 0 = Ocultar janela, True = Aguardar término (não aguardamos, deixamos correr em background)
WshShell.CurrentDirectory = strScriptDir
WshShell.Run Chr(34) & strBatPath & Chr(34), 0, False

Set WshShell = Nothing
Set fso = Nothing
