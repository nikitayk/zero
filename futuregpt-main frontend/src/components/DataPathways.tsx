import React from 'react';
import { listKeys } from '../utils/storage';

export function DataPathways() {
  const [sessionKeys, setSessionKeys] = React.useState<string[]>([]);
  const [localKeys, setLocalKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      setSessionKeys(await listKeys('session'));
      setLocalKeys(await listKeys('local'));
    })();
  }, []);

  return (
    <div className="p-2 text-xs space-y-2 border-t border-[#2E2E2E]">
      <div className="font-semibold text-white">Data Pathways</div>
      <div>
        <div className="text-[#B3B3B3] mb-1">Session (Ephemeral)</div>
        <ul className="list-disc pl-5">
          {sessionKeys.map(k => <li key={k} className="text-[#B3B3B3]">{k}</li>)}
        </ul>
      </div>
      <div>
        <div className="text-[#B3B3B3] mb-1">Local (Encrypted if chosen)</div>
        <ul className="list-disc pl-5">
          {localKeys.map(k => <li key={k} className="text-[#B3B3B3]">{k}</li>)}
        </ul>
      </div>
    </div>
  );
}


