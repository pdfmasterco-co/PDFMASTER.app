import React from 'react';
import type { Template } from '../data/templates';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const Icon = template.icon;
  return (
    <div
      className="group bg-[#1A1A2E] p-5 rounded-xl border border-[#2D2D4A]
                 h-full flex flex-col text-center
                 transition-all duration-250 ease-in-out
                 hover:scale-102 hover:-translate-y-1 hover:border-[#FF6B6B]/50 hover:shadow-[0_6px_20px_rgba(255,77,77,0.15)]"
    >
      <div className="flex-grow flex flex-col items-center">
        <div title={`${template.title} template`} className="w-24 h-32 bg-[#0F0F1A] border border-[#2D2D4A] rounded-md flex items-center justify-center mb-4 transition-colors group-hover:border-[#FF6B6B]/30">
          <Icon className="w-10 h-10 text-[#A0A0C0] group-hover:text-[#FF6B6B] transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-white">{template.title}</h3>
        <p className="text-sm text-[#A0A0C0] mt-1 flex-grow">{template.description}</p>
      </div>
      <button
        onClick={() => onSelect(template)}
        className="mt-4 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-medium py-2 px-5 rounded-lg
                   w-full
                   hover:scale-103 hover:brightness-95 hover:shadow-md hover:shadow-red-500/20
                   transition-all duration-300 ease-in-out"
      >
        Use Template
      </button>
    </div>
  );
};

export default TemplateCard;