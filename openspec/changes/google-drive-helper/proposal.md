## Why

目前 `drive-helper` 只有 OpenSpec 骨架，還沒有任何實際功能。這次需要建立一個可用的網頁工具，讓使用者能設定 Google Drive 連線資訊，並把本機照片上傳到指定的 Google Drive 資料夾，作為後續相片整理與展示流程的基礎。

## What Changes

- 建立 `drive-helper` 的前後端應用骨架，提供可在瀏覽器操作的管理頁面。
- 新增 Google Drive 設定流程，包含 Google API 憑證輸入、儲存、連線檢查與目標資料夾設定。
- 新增照片上傳流程，支援選取多張圖片、顯示上傳進度、將檔案送到後端並寫入 Google Drive。
- 新增上傳結果與錯誤回饋，讓使用者能確認成功項目與失敗原因。

## Capabilities

### New Capabilities
- `google-drive-settings`: 管理 Google Drive API 憑證、Drive 目標資料夾與連線狀態。
- `photo-upload-to-drive`: 從網頁選取照片並上傳到指定的 Google Drive 資料夾。

### Modified Capabilities

## Impact

- 新增 `drive-helper` 專案的前端與後端程式碼。
- 新增 Google Drive 整合所需的相依套件與環境變數設定。
- 新增後端 API 以支援設定儲存、連線測試與照片上傳。
- 新增 OpenSpec 規格、設計與任務文件，作為後續實作與驗證依據。
