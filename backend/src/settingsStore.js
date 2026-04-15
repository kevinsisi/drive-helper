import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

const REQUIRED_OAUTH_KEYS = ['client_id', 'project_id', 'client_secret', 'redirect_uris'];

function validateOauthClientShape(client) {
  const missingKeys = REQUIRED_OAUTH_KEYS.filter((key) => !client?.[key]);

  if (missingKeys.length > 0) {
    throw new Error(`OAuth client 缺少必要欄位: ${missingKeys.join(', ')}`);
  }
}

export function parseOauthClientJson(rawClientJson) {
  let parsed;

  try {
    parsed = JSON.parse(rawClientJson);
  } catch {
    throw new Error('OAuth client JSON 格式不正確');
  }

  const client = parsed.installed || parsed.web;

  if (!client) {
    throw new Error('OAuth client JSON 需要包含 installed 或 web 設定');
  }

  validateOauthClientShape(client);
  return client;
}

export async function readSettings() {
  try {
    const raw = await fs.readFile(config.settingsFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function writeSettings(settings) {
  await fs.mkdir(path.dirname(config.settingsFile), { recursive: true });
  await fs.writeFile(config.settingsFile, JSON.stringify(settings, null, 2), 'utf8');
}

export async function saveSettings({ oauthClientJson, folderId }) {
  const trimmedFolderId = folderId?.trim();

  if (!trimmedFolderId) {
    throw new Error('請輸入 Google Drive 資料夾 ID');
  }

  const oauthClient = parseOauthClientJson(oauthClientJson);
  const currentSettings = await readSettings();
  const settings = {
    authMode: 'oauth',
    folderId: trimmedFolderId,
    oauthClient,
    tokens: currentSettings?.oauthClient?.client_id === oauthClient.client_id ? currentSettings.tokens || null : null,
    updatedAt: new Date().toISOString(),
  };

  await writeSettings(settings);
  return settings;
}

export async function saveTokens(tokens) {
  const settings = await readSettings();

  if (!settings) {
    throw new Error('尚未儲存 OAuth 設定');
  }

  const nextSettings = {
    ...settings,
    tokens: {
      ...settings.tokens,
      ...tokens,
    },
    updatedAt: new Date().toISOString(),
  };

  await writeSettings(nextSettings);
  return nextSettings;
}

export function toSafeSettings(settings) {
  if (!settings) {
    return {
      configured: false,
      authMode: 'oauth',
      folderId: '',
      projectId: '',
      clientId: '',
      hasRefreshToken: false,
      updatedAt: null,
    };
  }

  return {
    configured: true,
    authMode: settings.authMode || 'oauth',
    folderId: settings.folderId,
    projectId: settings.oauthClient.project_id,
    clientId: settings.oauthClient.client_id,
    hasRefreshToken: Boolean(settings.tokens?.refresh_token),
    updatedAt: settings.updatedAt,
  };
}
