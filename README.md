# drive-helper

簡易 Google Drive 上傳輔助工具 — 在瀏覽器設定 Google API 憑證 + 目標資料夾，把本機照片批次上傳到指定 Drive 資料夾。後續供相片整理 / 展示流程使用。

## 一句話描述

Web 介面的 Google Drive 上傳器，支援多張照片選取、上傳進度顯示、成功失敗回饋。

## 技術棧

- **後端**：Node.js + Express + `googleapis` SDK + `multer`（上傳）
- **前端**：React 18 + Vite
- **設定持久化**：JSON 檔（`/app/data/settings.json`）
- **部署**：Docker Compose（image：`kevin950805/drive-helper-{frontend,backend}`，platform `linux/arm64`）
- **OpenSpec**：`google-drive-helper` change 內含兩個 capability：`google-drive-settings` + `photo-upload-to-drive`

## 主要功能

| 功能 | 說明 |
|---|---|
| Google API 憑證設定 | 在前端輸入 OAuth credentials，後端寫入 `settings.json` |
| 連線檢查 | 驗證憑證 + 目標資料夾可存取 |
| 多張照片選取 | 前端 file picker，支援多檔 |
| 上傳進度 | 串流回前端，顯示成功 / 失敗檔案 |
| 大小限制 | `MAX_FILE_SIZE_MB`（預設 20MB） |

## 架構

```
drive-helper/
├── backend/      Express + googleapis + multer
│   └── src/server.js
├── frontend/     React + Vite，build 後由 nginx 靜態服務
│   └── src/
├── data/         settings.json 持久化目錄（mount 進 backend container）
└── docker-compose.yml
```

## 開發

```bash
npm install
npm run dev    # concurrently: backend (port 3211) + frontend Vite
```

## 部署

```bash
docker compose up -d
# 對外：
#   frontend → port 9321 (FRONTEND_PORT)
#   backend  → 內網 3211
```

### 環境變數

| 變數 | 預設 | 說明 |
|---|---|---|
| `FRONTEND_PORT` | `9321` | 對外 frontend port |
| `APP_URL` | `http://localhost:9321` | 給後端寫入 OAuth callback |
| `MAX_FILE_SIZE_MB` | `20` | 單檔大小上限 |
| `SETTINGS_FILE` | `/app/data/settings.json` | 設定檔 path（容器內） |

## URL

- Repo：<https://github.com/kevinsisi/drive-helper>
- Image：`kevin950805/drive-helper-frontend`、`kevin950805/drive-helper-backend`

## 規格

詳見 [`openspec/changes/google-drive-helper/`](openspec/changes/google-drive-helper/)（proposal、design、specs、tasks）。
