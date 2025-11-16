import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selectedValue, onChange, name }) => {
  return (
    <fieldset className="py-3">
      <legend className="text-white text-base font-medium">{label}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-start p-3 rounded-md bg-[#0F0F1A] border border-transparent has-[:checked]:border-[#FF6B6B] has-[:checked]:bg-[#FF6B6B]/10 cursor-pointer transition-all">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#FF6B6B] bg-[#2D2D4A] border-[#A0A0C0] focus:ring-[#FF4D4D] focus:ring-offset-[#0F0F1A]"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-white">{option.label}</span>
              {option.description && (
                <p className="text-xs text-[#A0A0C0] mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;