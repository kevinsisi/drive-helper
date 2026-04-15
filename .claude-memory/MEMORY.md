# Drive Helper Memory

## Purpose
- `drive-helper` is a standalone Google Drive upload helper for the HomeProject homelab.
- It provides a web UI for saving Google OAuth settings and uploading images into a target Google Drive folder.

## Final Architecture
- Frontend: React + Vite, served by nginx in Docker.
- Backend: Express on port `3211` inside Docker.
- Reverse proxy: Caddy routes `drive.sisihome.org` to frontend port `9321`.
- Persistence: backend writes settings to `/app/data/settings.json`.

## Production URLs
- App URL: `https://drive.sisihome.org`
- OAuth callback: `https://drive.sisihome.org/oauth/callback`
- Health check: `https://drive.sisihome.org/api/health`

## Google Auth Decisions
- Initial service-account approach was abandoned.
- Real-world failure reasons:
  - service account could not reliably access the user's existing Drive folder
  - service account flow hit quota / visibility limitations for personal Drive usage
- Final implementation uses Google OAuth Web Client JSON plus refresh token storage.

## Required Google Cloud Setup
- OAuth client type must be `Web application`.
- Authorized redirect URI must include `https://drive.sisihome.org/oauth/callback`.
- Authorized JavaScript origin should include `https://drive.sisihome.org`.
- If OAuth consent screen is in testing mode, the operator Google account must be added as a test user.

## Production Runtime Notes
- Backend container runs as UID/GID `1001` (`appuser`).
- Host directory `/home/kevin/DockerCompose/drive-helper/data` must be writable by UID `1001`.
- If settings save fails with `EACCES: permission denied, open '/app/data/settings.json'`, fix with:
  - `sudo chown -R 1001:1001 /home/kevin/DockerCompose/drive-helper/data`

## Current Production State
- Deployed domain is live and healthy.
- `docker-app-portal` auto-discovers the service from Docker + Caddy.
- Portal display name was updated in the DB to `Drive Helper`.
- Target upload folder currently in use:
  - name: `Drive Helper Uploads`
  - folder id: `1igsTfasYuXi9TlvTZweYr38v8ZBoAb6a`

## Verified Behaviors
- OAuth authorization succeeded and refresh token is stored.
- Google Drive connection test succeeded against the production folder.
- Image upload succeeded in production.
- Chinese filename handling required normalization from `latin1` to `utf8` before storing the uploaded file name.

## CI/CD Notes
- Docker images publish via `.github/workflows/docker-publish.yml`.
- Deployment runs via `.github/workflows/deploy.yml`.
- A real deploy bug was fixed by running `docker compose down --remove-orphans` before `docker compose up -d`, otherwise named containers could conflict with stale instances.

## Known Follow-ups
- If users need to choose an existing Drive folder visually, add a folder picker or `create folder` UI action.
- If the app appears blank after deploy, force-refresh or open in a clean session first; stale frontend assets may persist briefly during rollout.
