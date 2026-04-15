## 1. Project Setup

- [x] 1.1 Initialize the `drive-helper` project structure for a React frontend and Express backend
- [x] 1.2 Add required dependencies for Google Drive API access, file upload handling, and local configuration storage
- [x] 1.3 Add environment and ignore files for local development and sensitive generated data

## 2. Backend Google Drive Integration

- [x] 2.1 Implement configuration persistence for OAuth Web Client JSON, refresh token, and target folder ID
- [x] 2.2 Implement a Google Drive service that loads stored credentials and validates folder access
- [x] 2.3 Add API endpoints for saving settings, reading safe settings status, and testing Google Drive connectivity
- [x] 2.4 Add an upload API that accepts image files, validates them, and uploads them to Google Drive with per-file results

## 3. Frontend Admin Interface

- [x] 3.1 Build a settings form for OAuth Web Client JSON and target folder ID
- [x] 3.2 Add UI actions for saving settings and testing the Google Drive connection
- [x] 3.3 Build a photo upload interface with multi-file selection, progress display, and result feedback

## 4. Verification

- [x] 4.1 Run the frontend build and fix any issues
- [x] 4.2 Run the backend start or test command and fix any issues
- [x] 4.3 Perform a manual end-to-end verification of settings save, connection test, and upload flow

## 5. Final Notes

- [x] 5.1 Confirm production domain `https://drive.sisihome.org` resolves through Caddy to the frontend service
- [x] 5.2 Confirm `docker-app-portal` auto-discovers the deployed service and exposes it as `Drive Helper`
- [x] 5.3 Confirm Chinese filename uploads render correctly after backend filename normalization
