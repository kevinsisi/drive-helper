import { Readable } from 'node:stream';
import { google } from 'googleapis';
import { config } from './config.js';

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

function normalizeFilename(name) {
  return Buffer.from(name, 'latin1').toString('utf8');
}

function createOauthClient(oauthClientConfig) {
  return new google.auth.OAuth2(
    oauthClientConfig.client_id,
    oauthClientConfig.client_secret,
    `${config.appUrl}/oauth/callback`
  );
}

function getAuthorizedClient(settings) {
  if (!settings.tokens?.refresh_token) {
    throw new Error('Google Drive 尚未完成 OAuth 授權');
  }

  const auth = createOauthClient(settings.oauthClient);
  auth.setCredentials(settings.tokens);
  return auth;
}

export function buildAuthorizationUrl(settings) {
  const auth = createOauthClient(settings.oauthClient);

  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES,
  });
}

export async function exchangeCodeForTokens(settings, code) {
  const auth = createOauthClient(settings.oauthClient);
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function testDriveAccess(settings) {
  const drive = google.drive({ version: 'v3', auth: getAuthorizedClient(settings) });

  const response = await drive.files.get({
    fileId: settings.folderId,
    fields: 'id,name,mimeType,capabilities(canAddChildren,canEdit)',
    supportsAllDrives: true,
  });

  const folder = response.data;

  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('指定的 ID 不是 Google Drive 資料夾');
  }

  if (!folder.capabilities?.canAddChildren && !folder.capabilities?.canEdit) {
    throw new Error('目前 Google 帳號沒有寫入該資料夾的權限');
  }

  return {
    folderId: folder.id,
    folderName: folder.name,
  };
}

export async function uploadImageToDrive(settings, file) {
  const drive = google.drive({ version: 'v3', auth: getAuthorizedClient(settings) });
  const normalizedName = normalizeFilename(file.originalname);
  const response = await drive.files.create({
    requestBody: {
      name: normalizedName,
      parents: [settings.folderId],
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    },
    fields: 'id,name,webViewLink,webContentLink,mimeType',
    supportsAllDrives: true,
  });

  return response.data;
}
