import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-white text-base">{label}</span>
      <button
        type="button"
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B] focus:ring-offset-[#1A1A2E] ${
          enabled ? 'bg-[#FF6B6B]' : 'bg-[#2D2D4A]'
        }`}
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
