import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

const MergePdfSettings: React.FC = () => {
  const [keepOrder, setKeepOrder] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [compressOutput, setCompressOutput] = useState(false);

  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4 divide-y divide-[#2D2D4A]">
      <h3 className="text-lg font-semibold text-white mb-2">Options</h3>
      <ToggleSwitch label="Keep original page order" enabled={keepOrder} onChange={setKeepOrder} />
      <ToggleSwitch label="Remove duplicate pages" enabled={removeDuplicates} onChange={setRemoveDuplicates} />
      <ToggleSwitch label="Compress output" enabled={compressOutput} onChange={setCompressOutput} />
    </div>
  );
};

export default MergePdfSettings;
