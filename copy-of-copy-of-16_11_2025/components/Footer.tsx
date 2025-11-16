import React, { useState, useEffect, useRef } from 'react';
import { TwitterIcon, LinkedInIcon, GithubIcon, YouTubeIcon } from './icons';

const Footer: React.FC = () => {
  const socialLinks = [
    { name: 'X', icon: <span className="font-bold text-xl">𝕏</span>, href: '#' },
    { name: 'LinkedIn', icon: <LinkedInIcon className="w-6 h-6" />, href: '#' },
    { name: 'GitHub', icon: <GithubIcon className="w-6 h-6" />, href: '#' },
    { name: 'YouTube', icon: <YouTubeIcon className="w-6 h-6" />, href: '#' },
  ];

  const sections = [
    {
      title: 'Popular Tools',
      links: ['Merge PDF', 'Split PDF', 'Compress PDF', 'PDF to Word', 'AI Chat', 'Scan to PDF'],
    },
    {
      title: 'Company',
      links: ['About', 'Pricing', 'Blog', 'Careers', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Cookie Policy'],
    },
  ];
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageSelect = (language: typeof languages[0]) => {
      setSelectedLanguage(language);
      setIsDropdownOpen(false);
  };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);


  return (
    <footer className="bg-[#0A0A14] text-white">
      <div className="max-w-[1200px] mx-auto py-[40px] px-[20px] md:py-[60px] md:px-[40px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-2 inline-block md:inline">PDFMASTER.CO</h2>
            <p className="text-sm text-[#A0A0C0] mb-6 max-w-xs mx-auto md:mx-0">
              The all-in-one AI-powered PDF toolkit.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  title={`Follow us on ${link.name}`}
                  aria-label={link.name}
                  className="text-white hover:text-[#A0A0C0] transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2-4: Links */}
          {sections.map((section) => (
            <div key={section.title} className="md:col-span-1 flex flex-col items-center md:items-start">
              <h3 className="font-bold text-white mb-4 text-base">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white hover:text-[#A0A0C0] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              {section.title === 'Legal' && (
                <>
                  <div className="relative mt-6 w-full max-w-[150px] mx-auto md:mx-0" ref={dropdownRef}>
                    {isDropdownOpen && (
                      <div 
                        className="absolute bottom-full mb-2 w-full bg-[#1A1A2E] border border-[#2D2D4A] rounded-lg shadow-2xl z-10 py-2" 
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      >
                        <ul className="space-y-1">
                          {languages.map((language) => (
                            <li key={language.code} className="px-2">
                              <button
                                onClick={() => handleLanguageSelect(language)}
                                className={`w-full text-left px-3 h-8 flex items-center text-sm rounded-md transition-colors
                                            ${selectedLanguage.code === language.code ? 'text-white' : 'text-[#A0A0C0]'}
                                            hover:bg-[#2D2D4A] hover:text-[#FF4D4D]`}
                              >
                                <span className="w-6 text-left">{language.flag}</span>
                                <span className={`${selectedLanguage.code === language.code ? 'font-bold' : 'font-normal'}`}>
                                  {language.name}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => setIsDropdownOpen(prev => !prev)}
                      type="button"
                      className="w-full flex items-center justify-center text-sm font-medium text-white bg-transparent border border-[#2D2D4A] rounded-lg px-3 py-1.5
                                 transition-colors hover:bg-[#252535] hover:border-[#FF4D4D] cursor-pointer"
                    >
                      <span role="img" aria-label="Select Language" className="text-sm">🌐</span>
                      <span className="ml-2">{selectedLanguage.name}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#6B6B8A] mt-4">
                    🔒 ISO 27001 Certified • Files deleted in 10s
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-[30px] pt-[30px] border-t border-[#2D2D4A] text-center text-[13px] text-[#A0A0C0]">
          <p>© 2025 PDFMASTER.CO — All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;