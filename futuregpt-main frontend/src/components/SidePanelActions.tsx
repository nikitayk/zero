import React from 'react';
import { parseWithFallback } from '../adapters/registry';
import type { IngestedProblem } from '../types';
import { getSession } from '../utils/storage';

interface Props {
  onIngest: (p: IngestedProblem) => void;
}

export function SidePanelActions({ onIngest }: Props) {
  const [ingesting, setIngesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAnalyzePage = async () => {
    setIngesting(true); setError(null);
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) throw new Error('No active tab');
      const resp = await chrome.tabs.sendMessage(tabId, { type: 'ZT_GET_PAGE' });
      if (!resp?.success) throw new Error('Content script failed');
      // Per-site toggles: check if site is enabled (default true)
      const url = resp.url || '';
      const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
      const key = `zt_site_enable_${host}`;
      const enabled = await getSession<boolean>(key);
      if (enabled === false) {
        throw new Error(`Ingestion disabled for ${host} in Settings`);
      }
      const parsed = parseWithFallback(resp.html, resp.url);
      if (parsed) onIngest(parsed);
    } catch (e: any) {
      setError(e?.message || 'Failed to ingest');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleAnalyzePage} className="px-2 py-1 text-xs border rounded">
        Analyze Page (Local)
      </button>
      {ingesting && <span className="text-xs">Analyzing…</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}


