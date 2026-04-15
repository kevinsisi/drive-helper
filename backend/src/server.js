import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config.js';
import { readSettings, saveSettings, saveTokens, toSafeSettings } from './settingsStore.js';
import { buildAuthorizationUrl, exchangeCodeForTokens, testDriveAccess, uploadImageToDrive } from './driveService.js';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/settings', async (_req, res, next) => {
  try {
    const settings = await readSettings();
    res.json(toSafeSettings(settings));
  } catch (error) {
    next(error);
  }
});

app.post('/api/settings', async (req, res, next) => {
  try {
    const settings = await saveSettings(req.body);
    res.json({ message: '設定已儲存', settings: toSafeSettings(settings) });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

app.get('/api/oauth/url', async (_req, res, next) => {
  try {
    const settings = await readSettings();

    if (!settings) {
      const error = new Error('請先儲存 OAuth 設定');
      error.statusCode = 400;
      throw error;
    }

    res.json({ authorizationUrl: buildAuthorizationUrl(settings) });
  } catch (error) {
    next(error);
  }
});

app.get('/oauth/callback', async (req, res) => {
  try {
    const settings = await readSettings();

    if (!settings) {
      res.status(400).send('<h1>OAuth 設定不存在</h1>');
      return;
    }

    if (!req.query.code) {
      res.status(400).send('<h1>缺少授權碼</h1>');
      return;
    }

    const tokens = await exchangeCodeForTokens(settings, String(req.query.code));
    await saveTokens(tokens);
    res.send('<h1>Google Drive 已連接</h1><p>回到 Drive Helper 頁面後再按一次「測試連線」。</p>');
  } catch (error) {
    res.status(400).send(`<h1>授權失敗</h1><p>${error.message}</p>`);
  }
});

app.post('/api/settings/test', async (_req, res, next) => {
  try {
    const settings = await readSettings();

    if (!settings) {
      const error = new Error('尚未儲存 Google Drive 設定');
      error.statusCode = 400;
      throw error;
    }

    const result = await testDriveAccess(settings);
    res.json({ message: 'Google Drive 連線成功', ...result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 400;
    }
    next(error);
  }
});

app.post('/api/upload', upload.array('photos', 20), async (req, res, next) => {
  try {
    const settings = await readSettings();

    if (!settings) {
      const error = new Error('請先儲存 Google Drive 設定');
      error.statusCode = 400;
      throw error;
    }

    const files = req.files || [];

    if (files.length === 0) {
      const error = new Error('請至少選擇一張圖片');
      error.statusCode = 400;
      throw error;
    }

    const results = [];

    for (const file of files) {
      if (!allowedMimeTypes.has(file.mimetype)) {
        results.push({
          name: file.originalname,
          success: false,
          error: '不支援的圖片格式',
        });
        continue;
      }

      try {
        const uploaded = await uploadImageToDrive(settings, file);
        results.push({
          name: file.originalname,
          success: true,
          driveFileId: uploaded.id,
          webViewLink: uploaded.webViewLink,
        });
      } catch (error) {
        results.push({
          name: file.originalname,
          success: false,
          error: error.message || '上傳失敗',
        });
      }
    }

    res.json({
      message: '上傳完成',
      results,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: `單檔大小不可超過 ${config.maxFileSizeMb} MB` });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ message: error.message || '伺服器錯誤' });
});

app.listen(config.port, () => {
  console.log(`drive-helper backend listening on http://localhost:${config.port}`);
});
