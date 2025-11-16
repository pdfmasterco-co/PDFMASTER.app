import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

interface FaqAccordionProps {
  title: string;
  children: React.ReactNode;
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#2D2D4A] last:border-b-0 md:[&:nth-child(3)]:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left text-white"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold">{title}</span>
        <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-base text-[#A0A0C0] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqAccordion;