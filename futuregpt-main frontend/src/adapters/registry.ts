import type { IngestedProblem, TestCase } from '../types';

export interface SiteAdapter {
  id: string;
  match: (url: string) => boolean;
  parse: (docHtml: string, url: string) => IngestedProblem | null;
}

function extractText(el: Element | null): string {
  return (el?.textContent || '').trim();
}

export const adapters: SiteAdapter[] = [
  {
    id: 'leetcode',
    match: (url) => /leetcode\.com\/problems\//.test(url),
    parse: (html, url) => {
      const container = document.createElement('div');
      container.innerHTML = html;
      const title = extractText(container.querySelector('h1, h2'));
      const desc = extractText(container.querySelector('[data-key="description"], .content__u3I1'));
      if (!title) return null;
      return { source: 'leetcode', url, title, description: desc };
    }
  },
  {
    id: 'codeforces',
    match: (url) => /codeforces\.com\/problemset\//.test(url) || /contest\/.+\/problem\//.test(url),
    parse: (html, url) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      const title = extractText(d.querySelector('.problem-statement .title'));
      const desc = extractText(d.querySelector('.problem-statement'));
      if (!title) return null;
      return { source: 'codeforces', url, title, description: desc };
    }
  },
  {
    id: 'gfg',
    match: (url) => /geeksforgeeks\.org\//.test(url),
    parse: (html, url) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      const title = extractText(d.querySelector('h1'));
      const desc = extractText(d.querySelector('article'));
      if (!title) return null;
      return { source: 'geeksforgeeks', url, title, description: desc };
    }
  }
];

export function parseWithFallback(docHtml: string, url: string): IngestedProblem | null {
  for (const a of adapters) {
    if (a.match(url)) {
      try {
        const p = a.parse(docHtml, url);
        if (p) return p;
      } catch {}
    }
  }
  // Generic fallback
  const d = document.createElement('div');
  d.innerHTML = docHtml;
  const title = extractText(d.querySelector('h1, h2, h3')) || 'Untitled Problem';
  const paras = Array.from(d.querySelectorAll('p')).slice(0, 15).map(p => extractText(p)).join('\n');
  const description = paras || extractText(d.body || d);
  return { source: 'generic', url, title, description };
}


