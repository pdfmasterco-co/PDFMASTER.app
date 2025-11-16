import React, { useState } from 'react';
import RadioGroup from './RadioGroup';

const PdfToJpgSettings: React.FC = () => {
  const [imageQuality, setImageQuality] = useState('medium');
  
  const qualityOptions = [
    { 
      value: 'low', 
      label: 'Standard Quality',
      description: 'Good quality, smallest file size.'
    },
    { 
      value: 'medium', 
      label: 'High Quality (Recommended)',
      description: 'Better quality, balanced file size.'
    },
    { 
      value: 'high', 
      label: 'Best Quality',
      description: 'Highest quality, largest file size.'
    },
  ];

  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Options</h3>
      <div className="divide-y divide-[#2D2D4A]">
        <RadioGroup 
          label="Image Quality"
          name="image-quality"
          options={qualityOptions}
          selectedValue={imageQuality}
          onChange={setImageQuality}
        />
      </div>
    </div>
  );
};

export default PdfToJpgSettings;