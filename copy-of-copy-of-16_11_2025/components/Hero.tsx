import React from 'react';
import { SearchIcon } from './icons';
import { Page } from '../types';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ searchQuery, onSearchChange, onNavigate }) => {
  return (
    <>
      <section className="text-center pt-24 md:pt-28 animate-fade-in-up-hero">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#A0A0C0] max-w-3xl mx-auto mb-10">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
          </p>

          <div className="relative max-w-lg mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-[#A0A0C0]" />
            </div>
            <input
              type="text"
              placeholder="Search for a tool (e.g. 'compress')"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1A1A2E] border border-[#2D2D4A] rounded-lg py-2.5 md:py-3 pr-4 pl-11
                         text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2
                         focus:ring-[#FF6B6B] transition-all"
            />
          </div>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate('all-tools'); }}
            className="inline-block bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-medium py-2.5 px-6 md:py-3 md:px-8 rounded-lg
                       shadow-lg shadow-[rgba(255,77,77,0.1)] hover:shadow-lg hover:shadow-red-500/20
                       transition-all duration-300 ease-in-out transform hover:scale-103 hover:brightness-95 animate-gentle-pulse"
          >
            Get Started – It's Free!
          </a>

          <p className="text-sm text-[#A0A0C0] mt-5">
            No credit card required • No ads • Instant access
          </p>
        </div>
      </section>
      <style>{`
        .animate-fade-in-up-hero {
          animation: fadeInUpHero 0.7s ease-out forwards;
        }
        @keyframes fadeInUpHero {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 4s infinite ease-in-out;
        }
        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </>
  );
};

export default Hero;