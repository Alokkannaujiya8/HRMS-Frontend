const DEFAULT_FILE_BASE_URL = 'https://localhost:7147';

export function buildFileUrl(filePath: string | null | undefined, baseUrl: string = DEFAULT_FILE_BASE_URL): string {
  if (!filePath || !filePath.trim()) {
    return '';
  }

  const raw = filePath.trim();
  if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) {
    return raw;
  }

  let normalized = raw.replace(/\\/g, '/');
  const lower = normalized.toLowerCase();

  const uploadsIndex = lower.indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    normalized = normalized.slice(uploadsIndex);
  } else {
    const uploadsRootIndex = lower.indexOf('uploads/');
    if (uploadsRootIndex >= 0) {
      normalized = `/${normalized.slice(uploadsRootIndex)}`;
    }
  }

  const wwwrootIndex = normalized.toLowerCase().indexOf('wwwroot/');
  if (wwwrootIndex >= 0) {
    normalized = normalized.slice(wwwrootIndex + 'wwwroot'.length);
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return `${baseUrl.replace(/\/+$/, '')}${normalized}`;
}
