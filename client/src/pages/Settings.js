import React, { useState, useEffect, useCallback } from 'react';
import {
  getSettings,
  updateSettings,
  updateSettingsCategory,
  resetSettings,
  exportSettings,
  importSettings
} from '../services/api';

const DEFAULT_SETTINGS = {
  sources: {
    mangabakaUrl: 'https://api.mangabaka.org',
    mangadexUrl: 'https://api.mangadex.org',
    additionalSources: [],
    sourcePriority: ['mangabaka', 'mangadex'],
    proxyType: 'none',
    proxyHost: '',
    proxyPort: '',
    proxyUsername: '',
    proxyPassword: '',
    timeoutMs: 30000
  },
  downloads: {
    defaultFormat: 'cbz',
    concurrentDownloads: 3,
    concurrentConnections: 4,
    downloadDirectory: '',
    autoDownloadNew: false,
    deleteAfterRead: false,
    imageQuality: 'original'
  },
  reader: {
    readingDirection: 'rtl',
    pageFitMode: 'fit-width',
    backgroundColor: 'black',
    customBackgroundColor: '#000000',
    showPageNumbers: true,
    preloadPages: 3,
    doublePageSpreads: 'auto'
  },
  library: {
    autoUpdateInterval: 'daily',
    notificationPreference: 'browser',
    metadataLanguage: 'english',
    defaultContentFilter: 'hide-adult',
    importDirectories: [],
    exportFormat: 'json'
  },
  ui: {
    theme: 'dark',
    language: 'en',
    itemsPerPage: 'normal',
    coverSize: 'medium',
    showNsfwCovers: 'blur'
  },
  advanced: {
    debugMode: false,
    apiKeys: {}
  }
};

const CATEGORIES = [
  { key: 'sources', label: 'Sources', icon: '🔗' },
  { key: 'downloads', label: 'Downloads', icon: '⬇️' },
  { key: 'reader', label: 'Reader', icon: '📖' },
  { key: 'library', label: 'Library', icon: '📚' },
  { key: 'ui', label: 'UI', icon: '🎨' },
  { key: 'advanced', label: 'Advanced', icon: '⚙️' }
];

function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [saveMessage, setSaveMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newImportDir, setNewImportDir] = useState('');
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyValue, setNewApiKeyValue] = useState('');
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      const loaded = { ...DEFAULT_SETTINGS, ...res.data.settings };
      // Deep merge each category
      for (const cat of Object.keys(DEFAULT_SETTINGS)) {
        if (loaded[cat]) {
          loaded[cat] = { ...DEFAULT_SETTINGS[cat], ...loaded[cat] };
        }
      }
      setSettings(loaded);
      setOriginalSettings(JSON.parse(JSON.stringify(loaded)));
    } catch (err) {
      console.error('Failed to load settings:', err);
      setSaveMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const validate = useCallback(() => {
    const newErrors = {};
    const s = settings.sources;
    if (s.mangabakaUrl && !isValidUrl(s.mangabakaUrl)) newErrors.mangabakaUrl = 'Invalid URL';
    if (s.mangadexUrl && !isValidUrl(s.mangadexUrl)) newErrors.mangadexUrl = 'Invalid URL';
    if (s.proxyPort && (isNaN(s.proxyPort) || s.proxyPort < 1 || s.proxyPort > 65535)) {
      newErrors.proxyPort = 'Port must be 1-65535';
    }
    if (s.timeoutMs && (isNaN(s.timeoutMs) || s.timeoutMs < 1000 || s.timeoutMs > 300000)) {
      newErrors.timeoutMs = 'Timeout must be 1000-300000ms';
    }
    const d = settings.downloads;
    if (d.concurrentDownloads && (d.concurrentDownloads < 1 || d.concurrentDownloads > 10)) {
      newErrors.concurrentDownloads = 'Must be 1-10';
    }
    if (d.concurrentConnections && (d.concurrentConnections < 1 || d.concurrentConnections > 8)) {
      newErrors.concurrentConnections = 'Must be 1-8';
    }
    const r = settings.reader;
    if (r.preloadPages && (r.preloadPages < 1 || r.preloadPages > 10)) {
      newErrors.preloadPages = 'Must be 1-10';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [settings]);

  const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!validate()) {
      showMessage('Please fix validation errors before saving', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateSettings(settings);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      showMessage('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showMessage('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (category) => {
    if (!validate()) {
      showMessage('Please fix validation errors before saving', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateSettingsCategory(category, settings[category]);
      setOriginalSettings(prev => ({ ...prev, [category]: { ...settings[category] } }));
      showMessage(`${CATEGORIES.find(c => c.key === category)?.label} settings saved`);
    } catch (err) {
      console.error('Failed to save settings:', err);
      showMessage('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (category) => {
    if (!window.confirm(`Reset ${category ? CATEGORIES.find(c => c.key === category)?.label : 'all'} settings to defaults?`)) return;
    try {
      const res = await resetSettings(category);
      if (category) {
        setSettings(prev => ({ ...prev, [category]: res.data[category] }));
        setOriginalSettings(prev => ({ ...prev, [category]: res.data[category] }));
      } else {
        setSettings(res.data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(res.data.settings)));
      }
      showMessage('Settings reset to defaults');
    } catch (err) {
      console.error('Failed to reset settings:', err);
      showMessage('Failed to reset settings', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportSettings();
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mangarr-settings.json';
      a.click();
      window.URL.revokeObjectURL(url);
      showMessage('Settings exported');
    } catch (err) {
      console.error('Export failed:', err);
      showMessage('Export failed', 'error');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      const importedSettings = data.settings || data;
      await importSettings(importedSettings);
      await loadSettings();
      setImportFile(null);
      showMessage('Settings imported successfully');
    } catch (err) {
      console.error('Import failed:', err);
      showMessage('Import failed: ' + err.message, 'error');
    }
  };

  const hasChanges = useCallback(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  const addSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    if (!isValidUrl(newSourceUrl)) {
      setErrors(prev => ({ ...prev, newSourceUrl: 'Invalid URL' }));
      return;
    }
    const newSource = { name: newSourceName.trim(), url: newSourceUrl.trim() };
    setSettings(prev => ({
      ...prev,
      sources: {
        ...prev.sources,
        additionalSources: [...prev.sources.additionalSources, newSource]
      }
    }));
    setNewSourceName('');
    setNewSourceUrl('');
    setErrors(prev => { const e = { ...prev }; delete e.newSourceUrl; return e; });
  };

  const removeSource = (index) => {
    setSettings(prev => ({
      ...prev,
      sources: {
        ...prev.sources,
        additionalSources: prev.sources.additionalSources.filter((_, i) => i !== index)
      }
    }));
  };

  const addImportDir = () => {
    if (!newImportDir.trim()) return;
    setSettings(prev => ({
      ...prev,
      library: {
        ...prev.library,
        importDirectories: [...prev.library.importDirectories, newImportDir.trim()]
      }
    }));
    setNewImportDir('');
  };

  const removeImportDir = (index) => {
    setSettings(prev => ({
      ...prev,
      library: {
        ...prev.library,
        importDirectories: prev.library.importDirectories.filter((_, i) => i !== index)
      }
    }));
  };

  const addApiKey = () => {
    if (!newApiKeyName.trim() || !newApiKeyValue.trim()) return;
    setSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        apiKeys: { ...prev.advanced.apiKeys, [newApiKeyName.trim()]: newApiKeyValue.trim() }
      }
    }));
    setNewApiKeyName('');
    setNewApiKeyValue('');
  };

  const removeApiKey = (key) => {
    setSettings(prev => {
      const keys = { ...prev.advanced.apiKeys };
      delete keys[key];
      return { ...prev, advanced: { ...prev.advanced, apiKeys: keys } };
    });
  };

  if (loading) {
    return <div className="empty-state"><p>Loading settings...</p></div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header settings-header">
        <div>
          <h2>Settings</h2>
          <p>Configure Mangarr to your preferences</p>
        </div>
        <div className="settings-actions">
          <button className="btn-secondary" onClick={handleExport} title="Export settings">
            📤 Export
          </button>
          <label className="btn-secondary" title="Import settings">
            📥 Import
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => setImportFile(e.target.files[0])}
            />
          </label>
          {importFile && (
            <button className="btn-primary" onClick={handleImport}>
              Confirm Import
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !hasChanges()}
          >
            {saving ? 'Saving...' : '💾 Save All'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`settings-tab ${activeTab === cat.key ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.key)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span className="tab-label">{cat.label}</span>
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {activeTab === 'sources' && (
            <SettingsSection
              title="Source Configuration"
              onReset={() => handleReset('sources')}
              onSave={() => handleSaveCategory('sources')}
              hasChanges={JSON.stringify(settings.sources) !== JSON.stringify(originalSettings.sources)}
            >
              <FormGroup label="Mangabaka API URL">
                <input
                  type="url"
                  value={settings.sources.mangabakaUrl}
                  onChange={(e) => handleChange('sources', 'mangabakaUrl', e.target.value)}
                  className={errors.mangabakaUrl ? 'error' : ''}
                />
                {errors.mangabakaUrl && <span className="error-text">{errors.mangabakaUrl}</span>}
              </FormGroup>

              <FormGroup label="MangaDex API URL">
                <input
                  type="url"
                  value={settings.sources.mangadexUrl}
                  onChange={(e) => handleChange('sources', 'mangadexUrl', e.target.value)}
                  className={errors.mangadexUrl ? 'error' : ''}
                />
                {errors.mangadexUrl && <span className="error-text">{errors.mangadexUrl}</span>}
              </FormGroup>

              <FormGroup label="Request Timeout (ms)">
                <input
                  type="number"
                  min="1000"
                  max="300000"
                  step="1000"
                  value={settings.sources.timeoutMs}
                  onChange={(e) => handleChange('sources', 'timeoutMs', parseInt(e.target.value) || 30000)}
                  className={errors.timeoutMs ? 'error' : ''}
                />
                {errors.timeoutMs && <span className="error-text">{errors.timeoutMs}</span>}
              </FormGroup>

              <FormGroup label="Proxy Type">
                <select
                  value={settings.sources.proxyType}
                  onChange={(e) => handleChange('sources', 'proxyType', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="http">HTTP</option>
                  <option value="socks4">SOCKS4</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </FormGroup>

              {settings.sources.proxyType !== 'none' && (
                <>
                  <FormGroup label="Proxy Host">
                    <input
                      type="text"
                      value={settings.sources.proxyHost}
                      onChange={(e) => handleChange('sources', 'proxyHost', e.target.value)}
                      placeholder="proxy.example.com"
                    />
                  </FormGroup>
                  <FormGroup label="Proxy Port">
                    <input
                      type="number"
                      min="1"
                      max="65535"
                      value={settings.sources.proxyPort}
                      onChange={(e) => handleChange('sources', 'proxyPort', e.target.value)}
                      className={errors.proxyPort ? 'error' : ''}
                      placeholder="8080"
                    />
                    {errors.proxyPort && <span className="error-text">{errors.proxyPort}</span>}
                  </FormGroup>
                  <FormGroup label="Proxy Username (optional)">
                    <input
                      type="text"
                      value={settings.sources.proxyUsername}
                      onChange={(e) => handleChange('sources', 'proxyUsername', e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup label="Proxy Password (optional)">
                    <input
                      type="password"
                      value={settings.sources.proxyPassword}
                      onChange={(e) => handleChange('sources', 'proxyPassword', e.target.value)}
                    />
                  </FormGroup>
                </>
              )}

              <FormGroup label="Additional Sources">
                <div className="list-input">
                  <input
                    type="text"
                    placeholder="Source name"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSource()}
                  />
                  <input
                    type="url"
                    placeholder="https://api.example.com"
                    value={newSourceUrl}
                    onChange={(e) => { setNewSourceUrl(e.target.value); setErrors(prev => { const e2 = { ...prev }; delete e2.newSourceUrl; return e2; }); }}
                    className={errors.newSourceUrl ? 'error' : ''}
                    onKeyPress={(e) => e.key === 'Enter' && addSource()}
                  />
                  <button className="btn-add-item" onClick={addSource}>+ Add</button>
                </div>
                {errors.newSourceUrl && <span className="error-text">{errors.newSourceUrl}</span>}
                <div className="item-list">
                  {settings.sources.additionalSources.map((src, i) => (
                    <div key={i} className="list-item">
                      <span><strong>{src.name}</strong> — {src.url}</span>
                      <button className="btn-remove-item" onClick={() => removeSource(i)}>×</button>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </SettingsSection>
          )}

          {activeTab === 'downloads' && (
            <SettingsSection
              title="Download Settings"
              onReset={() => handleReset('downloads')}
              onSave={() => handleSaveCategory('downloads')}
              hasChanges={JSON.stringify(settings.downloads) !== JSON.stringify(originalSettings.downloads)}
            >
              <FormGroup label="Default Download Format">
                <select
                  value={settings.downloads.defaultFormat}
                  onChange={(e) => handleChange('downloads', 'defaultFormat', e.target.value)}
                >
                  <option value="cbz">CBZ</option>
                  <option value="zip">ZIP</option>
                  <option value="pdf">PDF</option>
                  <option value="epub">EPUB</option>
                </select>
              </FormGroup>

              <FormGroup label="Concurrent Downloads">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.downloads.concurrentDownloads}
                  onChange={(e) => handleChange('downloads', 'concurrentDownloads', parseInt(e.target.value) || 1)}
                  className={errors.concurrentDownloads ? 'error' : ''}
                />
                {errors.concurrentDownloads && <span className="error-text">{errors.concurrentDownloads}</span>}
              </FormGroup>

              <FormGroup label="Connections per Download">
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={settings.downloads.concurrentConnections}
                  onChange={(e) => handleChange('downloads', 'concurrentConnections', parseInt(e.target.value) || 1)}
                  className={errors.concurrentConnections ? 'error' : ''}
                />
                {errors.concurrentConnections && <span className="error-text">{errors.concurrentConnections}</span>}
              </FormGroup>

              <FormGroup label="Download Directory">
                <input
                  type="text"
                  value={settings.downloads.downloadDirectory}
                  onChange={(e) => handleChange('downloads', 'downloadDirectory', e.target.value)}
                  placeholder="/path/to/downloads"
                />
              </FormGroup>

              <FormGroup label="Image Quality">
                <select
                  value={settings.downloads.imageQuality}
                  onChange={(e) => handleChange('downloads', 'imageQuality', e.target.value)}
                >
                  <option value="original">Original</option>
                  <option value="compressed">Compressed</option>
                  <option value="webp">WebP</option>
                </select>
              </FormGroup>

              <FormGroup label="">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.downloads.autoDownloadNew}
                    onChange={(e) => handleChange('downloads', 'autoDownloadNew', e.target.checked)}
                  />
                  Auto-download new chapters
                </label>
              </FormGroup>

              <FormGroup label="">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.downloads.deleteAfterRead}
                    onChange={(e) => handleChange('downloads', 'deleteAfterRead', e.target.checked)}
                  />
                  Delete downloads after reading
                </label>
              </FormGroup>
            </SettingsSection>
          )}

          {activeTab === 'reader' && (
            <SettingsSection
              title="Reader Settings"
              onReset={() => handleReset('reader')}
              onSave={() => handleSaveCategory('reader')}
              hasChanges={JSON.stringify(settings.reader) !== JSON.stringify(originalSettings.reader)}
            >
              <FormGroup label="Reading Direction">
                <select
                  value={settings.reader.readingDirection}
                  onChange={(e) => handleChange('reader', 'readingDirection', e.target.value)}
                >
                  <option value="rtl">Right to Left (Manga)</option>
                  <option value="ltr">Left to Right (Comics)</option>
                  <option value="vertical">Vertical (Webtoon)</option>
                </select>
              </FormGroup>

              <FormGroup label="Page Fit Mode">
                <select
                  value={settings.reader.pageFitMode}
                  onChange={(e) => handleChange('reader', 'pageFitMode', e.target.value)}
                >
                  <option value="fit-width">Fit Width</option>
                  <option value="fit-height">Fit Height</option>
                  <option value="fit-screen">Fit Screen</option>
                  <option value="original">Original Size</option>
                </select>
              </FormGroup>

              <FormGroup label="Background Color">
                <select
                  value={settings.reader.backgroundColor}
                  onChange={(e) => handleChange('reader', 'backgroundColor', e.target.value)}
                >
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="gray">Gray</option>
                  <option value="custom">Custom</option>
                </select>
              </FormGroup>

              {settings.reader.backgroundColor === 'custom' && (
                <FormGroup label="Custom Background Color">
                  <input
                    type="color"
                    value={settings.reader.customBackgroundColor}
                    onChange={(e) => handleChange('reader', 'customBackgroundColor', e.target.value)}
                  />
                </FormGroup>
              )}

              <FormGroup label="Preload Pages">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.reader.preloadPages}
                  onChange={(e) => handleChange('reader', 'preloadPages', parseInt(e.target.value) || 1)}
                  className={errors.preloadPages ? 'error' : ''}
                />
                {errors.preloadPages && <span className="error-text">{errors.preloadPages}</span>}
              </FormGroup>

              <FormGroup label="Double-Page Spreads">
                <select
                  value={settings.reader.doublePageSpreads}
                  onChange={(e) => handleChange('reader', 'doublePageSpreads', e.target.value)}
                >
                  <option value="auto">Auto-detect</option>
                  <option value="always">Always</option>
                  <option value="never">Never</option>
                </select>
              </FormGroup>

              <FormGroup label="">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.reader.showPageNumbers}
                    onChange={(e) => handleChange('reader', 'showPageNumbers', e.target.checked)}
                  />
                  Show page numbers
                </label>
              </FormGroup>
            </SettingsSection>
          )}

          {activeTab === 'library' && (
            <SettingsSection
              title="Library Settings"
              onReset={() => handleReset('library')}
              onSave={() => handleSaveCategory('library')}
              hasChanges={JSON.stringify(settings.library) !== JSON.stringify(originalSettings.library)}
            >
              <FormGroup label="Auto-Update Interval">
                <select
                  value={settings.library.autoUpdateInterval}
                  onChange={(e) => handleChange('library', 'autoUpdateInterval', e.target.value)}
                >
                  <option value="manual">Manual Only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </FormGroup>

              <FormGroup label="Notification Preference">
                <select
                  value={settings.library.notificationPreference}
                  onChange={(e) => handleChange('library', 'notificationPreference', e.target.value)}
                >
                  <option value="browser">Browser</option>
                  <option value="email">Email</option>
                  <option value="none">None</option>
                </select>
              </FormGroup>

              <FormGroup label="Metadata Language">
                <select
                  value={settings.library.metadataLanguage}
                  onChange={(e) => handleChange('library', 'metadataLanguage', e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="japanese">Japanese</option>
                  <option value="romaji">Romaji</option>
                  <option value="auto">Auto</option>
                </select>
              </FormGroup>

              <FormGroup label="Default Content Filter">
                <select
                  value={settings.library.defaultContentFilter}
                  onChange={(e) => handleChange('library', 'defaultContentFilter', e.target.value)}
                >
                  <option value="hide-adult">Hide Adult Content</option>
                  <option value="show-all">Show All</option>
                </select>
              </FormGroup>

              <FormGroup label="Export Format">
                <select
                  value={settings.library.exportFormat}
                  onChange={(e) => handleChange('library', 'exportFormat', e.target.value)}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="opds">OPDS</option>
                </select>
              </FormGroup>

              <FormGroup label="Import Directories">
                <div className="list-input">
                  <input
                    type="text"
                    placeholder="/path/to/manga"
                    value={newImportDir}
                    onChange={(e) => setNewImportDir(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addImportDir()}
                  />
                  <button className="btn-add-item" onClick={addImportDir}>+ Add</button>
                </div>
                <div className="item-list">
                  {settings.library.importDirectories.map((dir, i) => (
                    <div key={i} className="list-item">
                      <span>{dir}</span>
                      <button className="btn-remove-item" onClick={() => removeImportDir(i)}>×</button>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </SettingsSection>
          )}

          {activeTab === 'ui' && (
            <SettingsSection
              title="UI Settings"
              onReset={() => handleReset('ui')}
              onSave={() => handleSaveCategory('ui')}
              hasChanges={JSON.stringify(settings.ui) !== JSON.stringify(originalSettings.ui)}
            >
              <FormGroup label="Theme">
                <select
                  value={settings.ui.theme}
                  onChange={(e) => handleChange('ui', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </FormGroup>

              <FormGroup label="Language">
                <select
                  value={settings.ui.language}
                  onChange={(e) => handleChange('ui', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </FormGroup>

              <FormGroup label="Items Per Page">
                <select
                  value={settings.ui.itemsPerPage}
                  onChange={(e) => handleChange('ui', 'itemsPerPage', e.target.value)}
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </select>
              </FormGroup>

              <FormGroup label="Cover Size">
                <select
                  value={settings.ui.coverSize}
                  onChange={(e) => handleChange('ui', 'coverSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </FormGroup>

              <FormGroup label="NSFW Cover Display">
                <select
                  value={settings.ui.showNsfwCovers}
                  onChange={(e) => handleChange('ui', 'showNsfwCovers', e.target.value)}
                >
                  <option value="blur">Blur</option>
                  <option value="hide">Hide</option>
                  <option value="show">Show</option>
                </select>
              </FormGroup>
            </SettingsSection>
          )}

          {activeTab === 'advanced' && (
            <SettingsSection
              title="Advanced Settings"
              onReset={() => handleReset('advanced')}
              onSave={() => handleSaveCategory('advanced')}
              hasChanges={JSON.stringify(settings.advanced) !== JSON.stringify(originalSettings.advanced)}
            >
              <FormGroup label="">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.advanced.debugMode}
                    onChange={(e) => handleChange('advanced', 'debugMode', e.target.checked)}
                  />
                  Enable debug mode (verbose logging)
                </label>
              </FormGroup>

              <FormGroup label="API Keys">
                <div className="list-input">
                  <input
                    type="text"
                    placeholder="Service name"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addApiKey()}
                  />
                  <input
                    type="password"
                    placeholder="API key"
                    value={newApiKeyValue}
                    onChange={(e) => setNewApiKeyValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addApiKey()}
                  />
                  <button className="btn-add-item" onClick={addApiKey}>+ Add</button>
                </div>
                <div className="item-list">
                  {Object.entries(settings.advanced.apiKeys).map(([name, value]) => (
                    <div key={name} className="list-item">
                      <span><strong>{name}</strong> — {'•'.repeat(Math.min(value.length, 20))}</span>
                      <button className="btn-remove-item" onClick={() => removeApiKey(name)}>×</button>
                    </div>
                  ))}
                </div>
              </FormGroup>

              <div className="danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <FormGroup label="">
                  <button className="btn-danger" onClick={() => {
                    if (window.confirm('Clear all cached images and metadata? This cannot be undone.')) {
                      showMessage('Cache cleared (placeholder)', 'success');
                    }
                  }}>
                    Clear Cache
                  </button>
                </FormGroup>
                <FormGroup label="">
                  <button className="btn-danger" onClick={() => {
                    if (window.confirm('RESET ALL SETTINGS TO DEFAULTS? This cannot be undone.')) {
                      handleReset();
                    }
                  }}>
                    Reset All Settings
                  </button>
                </FormGroup>
                <FormGroup label="">
                  <button className="btn-danger" onClick={() => {
                    if (window.confirm('FACTORY RESET? This will clear ALL data including your library. This cannot be undone.')) {
                      showMessage('Factory reset initiated (placeholder)', 'success');
                    }
                  }}>
                    Factory Reset
                  </button>
                </FormGroup>
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, children, onReset, onSave, hasChanges }) {
  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>{title}</h3>
        <div className="section-actions">
          <button className="btn-text" onClick={onReset}>Reset to Defaults</button>
          <button className="btn-primary btn-sm" onClick={onSave} disabled={!hasChanges}>
            Save
          </button>
        </div>
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export default Settings;
