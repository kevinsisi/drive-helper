import path from 'node:path';

const rootDir = path.resolve(process.cwd(), '..');

export const config = {
  port: Number(process.env.PORT || 3211),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3211}`,
  settingsFile: path.resolve(rootDir, process.env.SETTINGS_FILE || './data/settings.json'),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 20),
};
