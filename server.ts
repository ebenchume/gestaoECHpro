/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { 
  executeDailyBackup, 
  getBackupHistory, 
  initDailyCronSchedule,
  getPublicCloudStatus,
  saveCloudCredentials,
  testGoogleDrive,
  testDropbox
} from './server/backupService';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Backup API Routes
app.get('/api/backup/history', (req, res) => {
  try {
    const history = getBackupHistory();
    res.json({ success: true, history });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/backup/run', async (req, res) => {
  try {
    const clientData = req.body?.data;
    const result = await executeDailyBackup(clientData);
    res.json({ success: true, backup: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/backup/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.resolve(process.cwd(), 'backups/daily', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
  } else {
    res.status(404).json({ success: false, error: 'Ficheiro de backup não encontrado.' });
  }
});

// Cache latest state from client for cron backup
app.post('/api/backup/sync-state', (req, res) => {
  try {
    const data = req.body;
    const cacheFile = path.resolve(process.cwd(), 'backups/latest_state.json');
    const dir = path.dirname(cacheFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// Cloud Accounts (Google Drive & Dropbox) Management Routes
app.get('/api/cloud/status', (req, res) => {
  try {
    const status = getPublicCloudStatus();
    res.json({ success: true, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/cloud/test-drive', async (req, res) => {
  try {
    const { token, folderId } = req.body;
    const result = await testGoogleDrive(token, folderId);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/cloud/test-dropbox', async (req, res) => {
  try {
    const { token, folderPath } = req.body;
    const result = await testDropbox(token, folderPath);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/cloud/save-drive', async (req, res) => {
  try {
    const { token, folderId } = req.body;
    const test = await testGoogleDrive(token, folderId);
    
    saveCloudCredentials({
      googleDrive: {
        token: token.trim(),
        folderId: (folderId || '').trim(),
        connected: test.success,
        accountEmail: test.accountEmail || '',
        accountName: test.accountName || '',
        linkedAt: new Date().toISOString(),
        lastTestStatus: test.success ? 'valid' : 'invalid',
        lastTestMessage: test.message
      }
    });

    res.json({
      success: test.success,
      message: test.message,
      status: getPublicCloudStatus()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/cloud/save-dropbox', async (req, res) => {
  try {
    const { token, folderPath } = req.body;
    const test = await testDropbox(token, folderPath);

    saveCloudCredentials({
      dropbox: {
        token: token.trim(),
        folderPath: (folderPath || '/ECHpro_Backups').trim(),
        connected: test.success,
        accountEmail: test.accountEmail || '',
        accountName: test.accountName || '',
        linkedAt: new Date().toISOString(),
        lastTestStatus: test.success ? 'valid' : 'invalid',
        lastTestMessage: test.message
      }
    });

    res.json({
      success: test.success,
      message: test.message,
      status: getPublicCloudStatus()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/cloud/unlink', (req, res) => {
  try {
    const { provider } = req.body;
    if (provider === 'googleDrive') {
      saveCloudCredentials({
        googleDrive: {
          token: '',
          folderId: '',
          connected: false,
          accountEmail: '',
          accountName: '',
          linkedAt: '',
          lastTestStatus: 'none',
          lastTestMessage: 'Conta desvinculada'
        }
      });
    } else if (provider === 'dropbox') {
      saveCloudCredentials({
        dropbox: {
          token: '',
          folderPath: '/ECHpro_Backups',
          connected: false,
          accountEmail: '',
          accountName: '',
          linkedAt: '',
          lastTestStatus: 'none',
          lastTestMessage: 'Conta desvinculada'
        }
      });
    }

    res.json({ success: true, status: getPublicCloudStatus() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// Download Windows Setup Package
app.get('/api/download/windows-setup', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public/downloads/ECHpro_Windows_Setup_v2.5.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ECHpro_Windows_Setup_v2.5.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ success: false, error: 'Pacote de instalação do Windows não encontrado.' });
  }
});

// Setup Vite middleware in dev or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Start daily cron (at 02:00 AM)
  initDailyCronSchedule('0 2 * * *');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ECHpro Server] Servidor ativo em http://0.0.0.0:${PORT}`);
    console.log('[ECHpro Server] Tarefa agendada (Cron) de backup diário iniciada (02:00 AM)');
  });
}

startServer().catch((err) => {
  console.error('[ECHpro Server] Erro fatal:', err);
});
