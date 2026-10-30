================================================================================
          ECHpro — SISTEMA DE GESTÃO DE HÓSPEDES PROFISSIONAL (v2.5)
                 GUIA DE INSTALAÇÃO NO WINDOWS 10 E WINDOWS 11
================================================================================

Este pacote contém os scripts de instalação e inicialização automática do ECHpro
otimizados especificamente para ambientes Microsoft Windows 10 e Windows 11.

--------------------------------------------------------------------------------
MÉTODO 1: INSTALAÇÃO AUTOMATIZADA (RECOMENDADO PARA RECEPÇÃO / SERVIDOR LOCAL)
--------------------------------------------------------------------------------
1. Extraia o conteúdo deste arquivo ZIP numa pasta definitiva no seu computador:
   (Exemplo recomendado: C:\ECHpro ou na pasta Documentos)

2. Clique duas vezes em:
   "Instalar_ECHpro_Windows.bat"
   (Dica: Para configurar regras de firewall automaticamente, clique com botão
   direito e selecione "Executar como Administrador").

3. O assistente irá:
   - Verificar se o Node.js está instalado (e oferecer instalação automática caso falte)
   - Instalar e compilar os pacotes necessários
   - Criar o atalho "ECHpro Hotel PMS" na sua Área de Trabalho
   - Criar a entrada no Menu Iniciar
   - Liberar a porta 3000 no Firewall do Windows (opcional)

4. Pronto! O sistema abrirá diretamente no seu navegador padrão.

--------------------------------------------------------------------------------
MÉTODO 2: APLICATIVO NATIVO DE ÁREA DE TRABALHO (PWA NO EDGE OU CHROME)
--------------------------------------------------------------------------------
Se você já estiver acessando o sistema pelo Microsoft Edge ou Google Chrome:

1. Abra o ECHpro no navegador (http://localhost:3000 ou link de produção).
2. Na barra de endereços, clique no ícone "+" ou "Instalar Aplicativo".
   - No Edge: Menu (...) -> "Aplicativos" -> "Instalar ECHpro como aplicativo"
   - No Chrome: Menu (...) -> "Instalar ECHpro..."
3. O ECHpro funcionará com uma janela independente, sem barra de endereços do
   navegador, fixável na Barra de Tarefas e no Iniciar do Windows 10/11.

--------------------------------------------------------------------------------
COMO ACESSAR A PARTIR DE OUTROS COMPUTADORES DO HOTEL (MULTI-TERMINAL)
--------------------------------------------------------------------------------
O ECHpro permite que vários computadores usem o mesmo sistema:
1. No computador principal (onde o instalador foi rodado), execute:
   "configurar_firewall_rede_local.bat" (como Administrador).
2. O script mostrará o endereço IPv4 do computador (ex.: 192.168.1.150).
3. Nos outros computadores da recepção, bar, restaurante ou gerência, basta
   abrir o navegador e digitar:
   http://192.168.1.150:3000

--------------------------------------------------------------------------------
ARQUIVOS INCLUÍDOS NESTE PACOTE:
--------------------------------------------------------------------------------
- Instalar_ECHpro_Windows.bat       : Assistente de instalação principal com atalhos
- Iniciar_ECHpro.bat                : Inicia o servidor e abre o navegador
- Iniciar_ECHpro_Silencioso.vbs     : Inicia sem a janela preta de comando
- Desinstalar_ECHpro.bat            : Remove os atalhos e regras criadas
- configurar_firewall_rede_local.bat: Libera porta 3000 para acesso na rede Wi-Fi/LAN
- inno_setup_echpro.iss             : Script para compilar Setup .exe completo
- README_WINDOWS.txt                : Este arquivo de documentação

--------------------------------------------------------------------------------
SUPORTE TÉCNICO & ASSISTÊNCIA PERSONALIZADA:
--------------------------------------------------------------------------------
Desenvolvedor: Eben Chume
Celular / WhatsApp: +258 82 747 3434
E-mail: ebenchume@sapo.mz / ebenchume@gmail.com
Sistema ECHpro — Moçambique
================================================================================
