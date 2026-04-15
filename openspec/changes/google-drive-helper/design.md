## Context

`drive-helper` 目前只有 OpenSpec 初始骨架，沒有前端、後端或資料儲存層。這次要直接建立一個可運作的 Web 工具，讓使用者在同一個管理頁中設定 Google Drive 存取資訊、確認目標資料夾，並把照片上傳到該資料夾。

這個需求同時涉及前端互動、後端 API、敏感設定儲存與對外 API 整合，因此需要先定義一個簡潔但完整的設計。整體要優先滿足單機部署、設定可維護、錯誤可追蹤，以及未來可延伸到更多檔案管理能力。

## Goals / Non-Goals

**Goals:**
- 提供單頁式管理介面，讓使用者可輸入 Google Drive 需要的設定值。
- 透過後端代理與 Google Drive API 溝通，避免在瀏覽器暴露敏感憑證。
- 支援多張照片上傳、進度顯示、成功與失敗結果回饋。
- 將設定持久化到本機檔案，讓服務重啟後可保留。

**Non-Goals:**
- 不實作完整 Google OAuth 使用者登入流程。
- 不做雲端資料夾瀏覽器或 Google Drive 檔案列表管理介面。
- 不支援影片、文件或非圖片檔案上傳。
- 不實作多使用者權限與帳號系統。

## Decisions

### 1. 採用單一 Node.js + Express 後端搭配輕量 React 前端
使用者需求是快速建立一個可操作的管理頁，不需要過度拆分服務。使用 Express 提供 API、React 提供單頁介面，可以用最少的結構完成可維護的應用。

替代方案：
- 純後端渲染頁面：更簡單，但上傳進度與表單狀態體驗較差。
- 前後端 monorepo + TypeScript：可行，但對目前空專案來說初始化成本較高。

### 2. 使用 Google Service Account JSON 作為首版整合方式
為了避免完整 OAuth redirect flow、refresh token 管理與使用者登入流程，首版採用 service account 憑證。使用者只需要把 service account JSON 與目標資料夾 ID 設定到系統，並在 Google Drive 端把該資料夾分享給 service account，即可上傳。

替代方案：
- OAuth 2.0 client flow：較適合終端使用者登入自己的帳號，但需要 callback、token refresh 與更多 UI 流程。
- API key：無法完成 Drive 檔案上傳，不符合需求。

### 3. 設定檔以本機 JSON 檔持久化，敏感內容由後端保存
此工具預期先在私有 homelab 環境部署，本機 JSON 設定檔比引入資料庫更小、更直接。後端負責讀寫設定，前端只取得必要狀態，不直接讀取原始 service account 內容。

替代方案：
- SQLite：未來若有更多資料模型可考慮，但目前只有單一設定物件，屬於過度設計。
- 全部放 `.env`：不適合由網頁更新，且 JSON 憑證也不便管理。

### 4. 檔案上傳分成兩段：先收本機 multipart，再串 Google Drive API
瀏覽器將圖片送到本服務後端，後端驗證 MIME type、檔名與大小，再直接串流或以暫存檔方式送到 Google Drive。這讓驗證、錯誤回報與後續擴充更集中。

替代方案：
- 瀏覽器直傳 Google Drive：會暴露更多整合細節，且 service account 不適合直接放前端。

## Risks / Trade-offs

- [Service account 設定較技術向] → 在 UI 明確說明需分享資料夾給 service account 電子郵件。
- [設定檔包含敏感憑證] → 設定檔只保存在後端資料夾、加入 `.gitignore`、API 不回傳完整 JSON。
- [大檔或多檔上傳可能耗時] → 先限制圖片檔與單檔大小，並提供逐檔結果與錯誤訊息。
- [Google API 配額或權限問題] → 提供連線測試 API，先驗證資料夾是否可寫入再進行正式上傳。

## Migration Plan

1. 初始化專案前後端骨架與開發指令。
2. 建立設定檔儲存層與 Google Drive service。
3. 建立設定 API、連線測試 API、圖片上傳 API。
4. 建立前端管理頁，整合設定表單與上傳介面。
5. 以 build 或基本執行測試驗證本機可運作。

若需回滾，只要移除本次新增的服務與本機設定檔即可，因為首版不涉及既有資料庫 schema 變更。

## Open Questions

- 首版是否需要在 UI 顯示已上傳檔案清單，目前先不納入。
- 是否要支援建立新資料夾，目前先只支援輸入既有 Google Drive folder ID。
- 未來若要接 `digital-photo-frame`，可再增加同步或匯入流程，但這次先聚焦上傳 helper 本身。
