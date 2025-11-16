import React from 'react';
import Hero from './Hero';
import ToolsGrid from './ToolsGrid';
import HowItWorks from './HowItWorks';
import WhyChooseUs from './WhyChooseUs';
import Pricing from './Pricing';
import Faq from './Faq';
import { FullTool, Page } from '../types';

interface HomeProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToolSelect: (tool: FullTool) => void;
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ searchQuery, onSearchChange, onToolSelect, onNavigate }) => {
  return (
    <main className="flex-grow">
      <div className="px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <Hero searchQuery={searchQuery} onSearchChange={onSearchChange} onNavigate={onNavigate} />
        </div>
      </div>
      <ToolsGrid onToolSelect={onToolSelect} onNavigate={onNavigate} />
      <HowItWorks />
      <Pricing />
      <WhyChooseUs />
      <Faq />
    </main>
  );
};

export default Home;