#!/usr/bin/env tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ECHpro v2.5 — Script de Tarefa Agendada (Cron) para Backup Diário
 * =================================================================
 * Executa o backup automático de todos os dados do sistema diretamente
 * para o Google Drive e Dropbox, com verificação estrita de integridade SHA-256.
 * 
 * Uso:
 *   npx tsx scripts/backup_cron.ts
 * 
 * Configuração no Crontab do Linux:
 *   0 2 * * * cd /caminho/do/app && npx tsx scripts/backup_cron.ts >> /var/log/echpro_backup.log 2>&1
 */

import { executeDailyBackup, getBackupHistory, pruneOldBackups } from '../server/backupService';

async function main() {
  const startTime = Date.now();
  console.log('================================================================');
  console.log('  ECHpro v2.5 — TAREFA AGENDADA (CRON) DE BACKUP DIÁRIO');
  console.log('  Data/Hora: ' + new Date().toISOString());
  console.log('================================================================');

  try {
    console.log('[1/4] Extraindo todos os registos do sistema e gerando snapshot...');
    const result = await executeDailyBackup();

    console.log('[2/4] Verificação de integridade dos dados:');
    console.log(`      • Ficheiro gerado : ${result.filename}`);
    console.log(`      • Tamanho         : ${result.sizeFormatted} (${result.sizeBytes} bytes)`);
    console.log(`      • Checksum SHA-256: ${result.sha256}`);
    console.log(`      • Status Hash     : ${result.integrityVerified ? '✓ VÁLIDO E ÍNTEGRO' : '❌ ERRO'}`);

    console.log('[3/4] Transmissão para destinos em nuvem:');
    console.log(`      • Google Drive : ${result.destinations.googleDrive.status.toUpperCase()} — ${result.destinations.googleDrive.details}`);
    console.log(`      • Dropbox      : ${result.destinations.dropbox.status.toUpperCase()} — ${result.destinations.dropbox.details}`);
    console.log(`      • Cópia Local  : ${result.destinations.local.path}`);

    console.log('[4/4] Limpeza e política de retenção (30 dias):');
    const pruned = pruneOldBackups();
    console.log(`      • Backups antigos expurgados: ${pruned}`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('----------------------------------------------------------------');
    console.log(`✓ Tarefa Cron concluída com sucesso em ${elapsed}s.`);
    console.log('================================================================\n');
    process.exit(0);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ ERRO CRÍTICO no backup agendado:', msg);
    process.exit(1);
  }
}

main();
