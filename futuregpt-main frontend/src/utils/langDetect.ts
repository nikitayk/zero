export function detectLanguageFromFilename(name: string): string | undefined {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map: Record<string, string> = {
    'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'h': 'c', 'hpp': 'cpp', 'c': 'c',
    'py': 'python', 'java': 'java', 'js': 'javascript', 'ts': 'typescript',
    'cs': 'csharp', 'go': 'go', 'rs': 'rust', 'kt': 'kotlin', 'swift': 'swift'
  };
  return map[ext];
}

export function detectLanguageFromText(text: string): string | undefined {
  const t = text.slice(0, 5000);
  if (/#include\s+<.*>|std::|using\s+namespace\s+std/.test(t)) return 'cpp';
  if (/def\s+\w+\(|import\s+\w+|print\(/.test(t)) return 'python';
  if (/public\s+class\s+|System\.out\.println/.test(t)) return 'java';
  if (/(function|const|let|var)\s+\w+\s*=|console\.log\(/.test(t)) return 'javascript';
  if (/package\s+main|fmt\.Print/.test(t)) return 'go';
  if (/fn\s+\w+\(|let\s+mut\s+/.test(t)) return 'rust';
  return undefined;
}


