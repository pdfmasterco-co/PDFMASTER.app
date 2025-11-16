import React from 'react';
import { ChevronRightIcon } from './icons';
import { Page } from '../types';
import { Template, templatesData } from '../data/templates';
import TemplateCard from './TemplateCard';

interface TemplatesPageProps {
  onNavigate: (page: Page) => void;
  onTemplateSelect: (template: Template) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onNavigate, onTemplateSelect }) => {
  return (
    <main className="flex-grow">
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">Templates</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Free PDF Templates</h1>
          <p className="text-base md:text-lg text-[#A0A0C0] mt-4 max-w-3xl mx-auto">
            Jumpstart your work with our collection of free, professionally designed templates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templatesData.map((template) => (
            <TemplateCard key={template.slug} template={template} onSelect={onTemplateSelect} />
          ))}
        </div>

        <footer className="text-center mt-16 py-8 border-t border-[#2D2D4A]">
          <h3 className="text-xl font-semibold text-white">Have an idea for a template?</h3>
          <p className="text-[#A0A0C0] mt-2">
            Create your own template and share it with the PDFMaster community.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default TemplatesPage;