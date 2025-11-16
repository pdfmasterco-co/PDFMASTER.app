import React from 'react';
import type { FullTool, Page } from '../types';
import ToolCard from './ToolCard';
import { allToolsData } from '../data/tools';

const popularToolSlugs = [
  'pdf-assist',
  'scan-to-pdf',
  'watermark-pdf',
  'transcribe-audio',
  'sign-pdf',
  'convert-pdf',
];

const customToolData: { [key: string]: { icon: string; name: string; description: string } } = {
  'pdf-assist': {
    icon: '✨',
    name: "PDF Assist",
    description: "Upload any PDF. Ask anything. Get smart answers — no fluff.",
  },
  'scan-to-pdf': {
    icon: '📷',
    name: "Scan to PDF",
    description: "Capture documents with your camera and convert to clean PDFs.",
  },
  'watermark-pdf': {
    icon: '🏷️',
    name: "Watermark PDF",
    description: "Add text or image watermarks to protect your content.",
  },
  'transcribe-audio': {
    icon: '🎤',
    name: "Transcribe Audio",
    description: "Upload audio files and get accurate transcripts using AI.",
  },
  'sign-pdf': {
    icon: '✍️',
    name: "Sign PDF",
    description: "Create your electronic signature and sign documents instantly.",
  },
  'convert-pdf': {
    icon: '↔️',
    name: "Convert PDF",
    description: "Convert PDFs to Word, PowerPoint, Excel, JPG, and more.",
  },
};

const popularTools = popularToolSlugs.map(slug => {
    const originalTool = allToolsData.find(tool => tool.slug === slug)!;
    const customData = customToolData[slug];
    return {
        slug: originalTool.slug,
        name: customData.name,
        description: customData.description,
        icon: customData.icon
    };
});


interface ToolsGridProps {
  onToolSelect: (tool: FullTool) => void;
  onNavigate: (page: Page) => void;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ onToolSelect, onNavigate }) => {
  return (
    <section id="tools" className="pt-12 md:pt-16 px-5 md:px-10">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Most Popular PDF Tools</h2>
        <p className="text-base text-[#A0A0C0] mt-3 max-w-2xl mx-auto">
          30+ tools to convert, compress, edit, and analyze PDFs for free. Try it out today!
        </p>
      </div>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularTools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            onClick={() => onToolSelect(allToolsData.find(t => t.slug === tool.slug)!)}
          />
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          onClick={() => onNavigate('all-tools')}
          className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-medium py-3 px-6 rounded-lg
                     text-base
                     hover:scale-103 transition-transform duration-300"
        >
          See All 30+ Tools
        </button>
      </div>
    </section>
  );
};

export default ToolsGrid;