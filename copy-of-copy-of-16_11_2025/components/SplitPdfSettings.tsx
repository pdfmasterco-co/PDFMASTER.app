import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import RadioGroup from './RadioGroup';
import { InfoIcon } from './icons';

const SplitPdfSettings: React.FC = () => {
  const [splitMode, setSplitMode] = useState<'every-page' | 'ranges'>('every-page');
  const [pageRanges, setPageRanges] = useState('');
  const [downloadAsZip, setDownloadAsZip] = useState(true);
  
  const splitOptions = [
    { value: 'every-page', label: 'Split every page into a separate PDF' },
    { value: 'ranges', label: 'Select page ranges to extract' },
  ];

  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Options</h3>
      <div className="divide-y divide-[#2D2D4A]">
        <RadioGroup 
          label="Split by"
          name="split-mode"
          options={splitOptions}
          selectedValue={splitMode}
          onChange={(value) => setSplitMode(value as 'every-page' | 'ranges')}
        />

        {splitMode === 'ranges' && (
          <div className="py-3 animate-fade-in">
             <label htmlFor="page-ranges" className="text-white text-base font-medium block mb-2">
               Page ranges
             </label>
             <div className="relative">
                <input
                  id="page-ranges"
                  type="text"
                  placeholder="e.g., 1-3, 5, 7-10"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  className="w-full bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg py-2.5 px-4
                            text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2
                            focus:ring-[#FF6B6B] transition-all"
                />
             </div>
             <div className="group flex items-center mt-2 text-xs text-[#A0A0C0]" title="Page range format example: 1-3, 5, 7-10">
                <InfoIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Enter single pages or ranges separated by commas.</span>
             </div>
          </div>
        )}

        <ToggleSwitch label="Download as ZIP" enabled={downloadAsZip} onChange={setDownloadAsZip} />
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplitPdfSettings;