/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Empresa, Quarto, Hospede, Checkin, ServicoCatalogo, LivroCaixa, AuditLog, LicencaInfo, AppSettings } from '../types';

export interface ECHproBackupPayload {
  app: string;
  version: string;
  timestamp: string;
  checksum: string;
  data: {
    empresa: Empresa;
    quartos: Quarto[];
    hospedes: Hospede[];
    checkins: Checkin[];
    servicos: ServicoCatalogo[];
    livroCaixa: LivroCaixa[];
    auditLogs: AuditLog[];
    licenca: LicencaInfo;
    settings: AppSettings;
  };
}

/**
 * Computes a simple checksum for backup integrity check
 */
function simpleChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Creates a structured JSON backup snapshot
 */
export function createBackupPayload(data: ECHproBackupPayload['data']): ECHproBackupPayload {
  const jsonStr = JSON.stringify(data);
  return {
    app: "ECHpro",
    version: "2.5.0",
    timestamp: new Date().toISOString(),
    checksum: simpleChecksum(jsonStr),
    data
  };
}

/**
 * Triggers a download of the full ECHpro backup file
 */
export function downloadBackupFile(data: ECHproBackupPayload['data'], providerName = 'Local') {
  const payload = createBackupPayload(data);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `ECHpro_Backup_${providerName}_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses and verifies an uploaded backup JSON file
 */
export async function parseBackupFile(file: File): Promise<{ success: boolean; data?: ECHproBackupPayload['data']; error?: string }> {
  try {
    const text = await file.text();
    const payload = JSON.parse(text) as ECHproBackupPayload;

    if (!payload.app || payload.app !== 'ECHpro') {
      return { success: false, error: 'Ficheiro de backup inválido: cabeçalho ECHpro não reconhecido.' };
    }

    if (!payload.data || !Array.isArray(payload.data.quartos) || !Array.isArray(payload.data.hospedes)) {
      return { success: false, error: 'Ficheiro corrompido ou formato de dados incompatível.' };
    }

    return { success: true, data: payload.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Erro ao ler ficheiro: ${message}` };
  }
}

/**
 * Direct Google Drive backup launcher (opens Google Drive web storage / picker with instruction)
 */
export function exportToGoogleDrive(data: ECHproBackupPayload['data']) {
  downloadBackupFile(data, 'GoogleDrive');
  // Open Google Drive upload location in external window
  window.open('https://drive.google.com/drive/u/0/my-drive', '_blank');
}

/**
 * Direct Dropbox backup launcher
 */
export function exportToDropbox(data: ECHproBackupPayload['data']) {
  downloadBackupFile(data, 'Dropbox');
  window.open('https://www.dropbox.com/home', '_blank');
}
