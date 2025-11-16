import React from 'react';
import type { FullTool } from '../types';

interface AllToolsCardProps {
  tool: FullTool;
  onClick: (tool: FullTool) => void;
}

const AllToolsCard: React.FC<AllToolsCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;
  return (
    <div
      onClick={() => onClick(tool)}
      title={tool.name}
      className="bg-[#1A1A2E] p-5 rounded-xl border border-[#2D2D4A] cursor-pointer
                 h-full flex flex-col items-center text-center
                 transition-all duration-250 ease-in-out
                 hover:scale-102 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,77,77,0.15)] hover:border-[#FF6B6B]/50"
    >
      <Icon className="w-6 h-6 text-white mb-3" />
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
        <p className="text-sm text-[#A0A0C0] mt-1">{tool.description}</p>
      </div>
      <div className="mt-auto pt-3">
        <p className="text-xs text-[#6B6B8A] italic">{tool.apiHint}</p>
      </div>
    </div>
  );
};

export default AllToolsCard;