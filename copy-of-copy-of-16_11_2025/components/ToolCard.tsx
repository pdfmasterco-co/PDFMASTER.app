import React from 'react';

interface ToolCardProps {
  tool: {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
  };
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;
  return (
    <div
      onClick={onClick}
      title={tool.name}
      className="group bg-[#1A1A2E] p-5 rounded-xl border border-[#2D2D4A] cursor-pointer
                 h-full flex flex-col items-center text-center
                 transition-all duration-300 ease-in-out
                 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,77,77,0.15)]"
    >
      {typeof Icon === 'string' ? (
        <span className="text-3xl mb-4 text-white" role="img" aria-label={`${tool.name} icon`}>{Icon}</span>
      ) : (
         <Icon className="w-8 h-8 text-white mb-3 transition-colors duration-300 group-hover:text-[#FF4D4D]" />
      )}
     
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
        <p className="text-sm text-[#A0A0C0] mt-1">{tool.description}</p>
      </div>
    </div>
  );
};

export default ToolCard;