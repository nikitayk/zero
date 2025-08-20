import React from 'react';

interface Props {
  mode: 'local' | 'ephemeral' | 'encrypted';
}

export function PrivacyBadges({ mode }: Props) {
  const label = mode === 'local' ? 'Local-Only' : mode === 'ephemeral' ? 'Ephemeral' : 'Encrypted';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] rounded-full border ${mode === 'encrypted' ? 'border-green-500 text-green-300' : 'border-[#2E2E2E] text-[#B3B3B3]'}`}>
      {label}
    </span>
  );
}


