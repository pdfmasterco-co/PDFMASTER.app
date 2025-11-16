import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

const FixOptimizePdfSettings: React.FC = () => {
  const [compress, setCompress] = useState(true);
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [ocrText, setOcrText] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);

  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Options</h3>
      <div className="divide-y divide-[#2D2D4A]">
        <ToggleSwitch label="Compress file size" enabled={compress} onChange={setCompress} />
        <ToggleSwitch label="Add page numbers" enabled={addPageNumbers} onChange={setAddPageNumbers} />
        <div className="py-3">
            <ToggleSwitch label="OCR scanned text" enabled={ocrText} onChange={setOcrText} />
            <p className="text-xs text-[#A0A0C0] mt-1 ml-1">Auto-detects and makes scanned text selectable.</p>
        </div>
        <ToggleSwitch label="Remove hidden data (metadata)" enabled={removeMetadata} onChange={setRemoveMetadata} />
      </div>
    </div>
  );
};

export default FixOptimizePdfSettings;
