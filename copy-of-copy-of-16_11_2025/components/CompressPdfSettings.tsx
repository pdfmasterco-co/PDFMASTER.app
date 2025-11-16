import React, { useState } from 'react';
import RadioGroup from './RadioGroup';
import ToggleSwitch from './ToggleSwitch';

const CompressPdfSettings: React.FC = () => {
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [showEstimate, setShowEstimate] = useState(true);
  
  const compressionOptions = [
    { 
      value: 'low', 
      label: 'Low Compression',
      description: 'Faster processing, larger file size, best quality.'
    },
    { 
      value: 'medium', 
      label: 'Medium Compression (Recommended)',
      description: 'A good balance between file size and quality.'
    },
    { 
      value: 'high', 
      label: 'High Compression',
      description: 'Smallest file size, good quality.'
    },
  ];

  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Options</h3>
      <div className="divide-y divide-[#2D2D4A]">
        <RadioGroup 
          label="Compression Level"
          name="compression-level"
          options={compressionOptions}
          selectedValue={compressionLevel}
          onChange={setCompressionLevel}
        />
        <ToggleSwitch 
          label="Show before/after size estimate" 
          enabled={showEstimate} 
          onChange={setShowEstimate} 
        />
      </div>
    </div>
  );
};

export default CompressPdfSettings;