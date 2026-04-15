import { useEffect, useMemo, useState } from 'react';

const initialSettings = {
  oauthClientJson: '',
  folderId: '',
};

function formatDate(value) {
  if (!value) {
    return '尚未設定';
  }

  return new Date(value).toLocaleString('zh-TW');
}

function App() {
  const [settingsForm, setSettingsForm] = useState(initialSettings);
  const [settingsStatus, setSettingsStatus] = useState({
    configured: false,
    authMode: 'oauth',
    folderId: '',
    projectId: '',
    clientId: '',
    hasRefreshToken: false,
    updatedAt: null,
  });
  const [settingsMessage, setSettingsMessage] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadState, setUploadState] = useState({
    loading: false,
    progress: 0,
    error: '',
    results: [],
  });

  async function loadSettings() {
    const response = await fetch('/api/settings');
    const data = await response.json();
    setSettingsStatus(data);
    setSettingsForm((current) => ({ ...current, folderId: data.folderId || '' }));
  }

  useEffect(() => {
    loadSettings().catch((error) => {
      setSettingsMessage(error.message);
    });
  }, []);

  const selectedSummary = useMemo(() => {
    if (selectedFiles.length === 0) {
      return '尚未選擇圖片';
    }

    return `已選擇 ${selectedFiles.length} 張圖片`;
  }, [selectedFiles]);

  async function handleSaveSettings(event) {
    event.preventDefault();
    setSettingsMessage('');
    setTestMessage('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '設定儲存失敗');
      }

      setSettingsMessage(data.message);
      setSettingsStatus(data.settings);
      setSettingsForm((current) => ({ ...current, oauthClientJson: '' }));
    } catch (error) {
      setSettingsMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConnectGoogle() {
    setTestMessage('');

    try {
      const response = await fetch('/api/oauth/url');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '無法建立 Google 授權網址');
      }

      window.open(data.authorizationUrl, '_blank', 'noopener,noreferrer');
      setTestMessage('已開啟 Google 授權頁。完成授權後，回來按一次「測試連線」。');
    } catch (error) {
      setTestMessage(error.message);
    }
  }

  async function handleTestConnection() {
    setTestMessage('');
    setIsTesting(true);

    try {
      const response = await fetch('/api/settings/test', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '連線測試失敗');
      }

      setTestMessage(`${data.message}，資料夾：${data.folderName}`);
      await loadSettings();
    } catch (error) {
      setTestMessage(error.message);
    } finally {
      setIsTesting(false);
    }
  }

  function handleFileChange(event) {
    setSelectedFiles(Array.from(event.target.files || []));
    setUploadState({ loading: false, progress: 0, error: '', results: [] });
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      setUploadState({ loading: false, progress: 0, error: '請先選擇圖片', results: [] });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('photos', file);
    });

    setUploadState({ loading: true, progress: 0, error: '', results: [] });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    xhr.upload.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable) {
        return;
      }

      const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      setUploadState((current) => ({ ...current, progress }));
    };

    xhr.onload = () => {
      let data = {};

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadState({
          loading: false,
          progress: 100,
          error: '',
          results: data.results || [],
        });
        return;
      }

      setUploadState({
        loading: false,
        progress: 0,
        error: data.message || '上傳失敗',
        results: [],
      });
    };

    xhr.onerror = () => {
      setUploadState({
        loading: false,
        progress: 0,
        error: '無法連接到後端服務',
        results: [],
      });
    };

    xhr.send(formData);
  }

  return (
    <div className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Drive Helper</p>
        <h1>Google Drive 設定與照片上傳</h1>
        <p className="hero-copy">
          先儲存 OAuth client JSON 與資料夾 ID，完成 Google 授權後，再把照片上傳到指定的 Google Drive 資料夾。
        </p>
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Google Drive 設定</h2>
              <p>支援 OAuth client JSON 與目標資料夾 ID。</p>
            </div>
            <div className="action-row">
              <button type="button" className="secondary-button" onClick={handleConnectGoogle}>
                連接 Google
              </button>
              <button type="button" className="secondary-button" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? '測試中...' : '測試連線'}
              </button>
            </div>
          </div>

          <form className="stack" onSubmit={handleSaveSettings}>
            <label className="field">
              <span>Google Drive Folder ID</span>
              <input
                value={settingsForm.folderId}
                onChange={(event) => setSettingsForm((current) => ({ ...current, folderId: event.target.value }))}
                placeholder="例如 1AbCdEfGhIjKlMnOp"
              />
            </label>

            <label className="field">
              <span>OAuth Client JSON</span>
              <textarea
                rows="10"
                value={settingsForm.oauthClientJson}
                onChange={(event) => setSettingsForm((current) => ({ ...current, oauthClientJson: event.target.value }))}
                placeholder="把整份 OAuth client JSON 貼在這裡"
              />
            </label>

            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? '儲存中...' : '儲存設定'}
            </button>
          </form>

          {settingsMessage ? <p className="status-text">{settingsMessage}</p> : null}
          {testMessage ? <p className="status-text">{testMessage}</p> : null}

          <div className="status-card">
            <h3>目前設定</h3>
            <dl>
              <div>
                <dt>已設定</dt>
                <dd>{settingsStatus.configured ? '是' : '否'}</dd>
              </div>
              <div>
                <dt>專案 ID</dt>
                <dd>{settingsStatus.projectId || '尚未設定'}</dd>
              </div>
              <div>
                <dt>OAuth Client ID</dt>
                <dd>{settingsStatus.clientId || '尚未設定'}</dd>
              </div>
              <div>
                <dt>Folder ID</dt>
                <dd>{settingsStatus.folderId || '尚未設定'}</dd>
              </div>
              <div>
                <dt>已授權</dt>
                <dd>{settingsStatus.hasRefreshToken ? '是' : '否'}</dd>
              </div>
              <div>
                <dt>更新時間</dt>
                <dd>{formatDate(settingsStatus.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>照片上傳</h2>
              <p>只接受 JPG、PNG、WEBP、GIF。</p>
            </div>
            <span className="file-summary">{selectedSummary}</span>
          </div>

          <form className="stack" onSubmit={handleUpload}>
            <label className="upload-box">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFileChange} />
              <span>點擊選擇圖片或重新選取</span>
            </label>

            <button className="primary-button" type="submit" disabled={uploadState.loading}>
              {uploadState.loading ? `上傳中 ${uploadState.progress}%` : '開始上傳'}
            </button>
          </form>

          {uploadState.loading ? (
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${uploadState.progress}%` }} />
            </div>
          ) : null}

          {uploadState.error ? <p className="status-text error-text">{uploadState.error}</p> : null}

          <div className="results-list">
            {uploadState.results.map((result) => (
              <article key={`${result.name}-${result.driveFileId || result.error}`} className={result.success ? 'result-item success' : 'result-item error'}>
                <strong>{result.name}</strong>
                <p>{result.success ? `成功上傳，檔案 ID：${result.driveFileId}` : result.error}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
