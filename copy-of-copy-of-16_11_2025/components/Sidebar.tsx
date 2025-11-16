import React, { useState } from 'react';
import { Page } from '../types';

type AiPdfMode = 'chat' | 'summarize' | 'translate' | 'questions';

const AiPdfDropdown = ({ onNavigate, onModeSelect }: { onNavigate: (page: Page) => void; onModeSelect: (mode: AiPdfMode) => void; }) => {
    const handleItemClick = (mode: AiPdfMode) => {
        onModeSelect(mode);
        onNavigate('ai-pdf-dashboard');
    };

    return (
        <div className="absolute left-full top-0 ml-3 w-64 bg-[#1A1A2E] rounded-lg border border-[#2D2D4A] p-3 shadow-2xl animate-fade-in-fast">
            <ul className="space-y-1">
                <li onClick={() => handleItemClick('chat')} className="flex items-start p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer">
                    <span className="text-xl mr-3" role="img" aria-label="Chat">🗨️</span>
                    <div>
                        <p className="font-semibold text-white">Chat with PDF</p>
                        <p className="text-sm text-[#A0A0C0]">Ask questions about your document</p>
                    </div>
                </li>
                <li onClick={() => handleItemClick('summarize')} className="flex items-start p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer">
                    <span className="text-xl mr-3" role="img" aria-label="Summary">📋</span>
                    <div>
                        <p className="font-semibold text-white">Summarize</p>
                        <p className="text-sm text-[#A0A0C0]">Get key points in seconds</p>
                    </div>
                </li>
                <li onClick={() => handleItemClick('translate')} className="flex items-start p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer">
                    <span className="text-xl mr-3" role="img" aria-label="Translate">🌐</span>
                    <div>
                        <p className="font-semibold text-white">Translate</p>
                        <p className="text-sm text-[#A0A0C0]">Convert text to any language</p>
                    </div>
                </li>
                <li onClick={() => handleItemClick('questions')} className="flex items-start p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer">
                    <span className="text-xl mr-3" role="img" aria-label="Questions">❓</span>
                    <div>
                        <p className="font-semibold text-white">Generate Questions</p>
                        <p className="text-sm text-[#A0A0C0]">Create study questions from content</p>
                    </div>
                </li>
            </ul>
        </div>
    );
};

const Sidebar = ({ onNavigate, onModeSelect }: { onNavigate: (page: Page) => void; onModeSelect: (mode: AiPdfMode) => void; }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    let timeoutId: number;

    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      setDropdownVisible(true);
    };

    const handleMouseLeave = () => {
      timeoutId = window.setTimeout(() => {
        setDropdownVisible(false);
      }, 200);
    };

    return (
        <aside className="fixed top-0 left-0 h-full bg-[#1A1A2E] border-r border-[#2D2D4A] w-20 flex flex-col items-center py-5 z-[2000]">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-xl font-bold text-white tracking-wider mb-8">
              P<span className="text-[#FF6B6B]">.</span>
            </a>
             <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button 
                    className="flex flex-col items-center p-3 rounded-lg w-full text-center hover:bg-[#2D2D4A] transition-colors"
                    onClick={() => {
                        onModeSelect('chat');
                        onNavigate('ai-pdf-dashboard');
                    }}
                >
                    <span className="text-2xl mb-1" role="img" aria-label="Robot">🤖</span>
                    <span className="text-xs font-medium text-white">AI PDF</span>
                </button>
                {isDropdownVisible && <AiPdfDropdown onNavigate={onNavigate} onModeSelect={onModeSelect} />}
            </div>
             <style>{`
                .animate-fade-in-fast {
                    animation: fadeInFast 0.2s ease-out forwards;
                }
                @keyframes fadeInFast {
                    from { opacity: 0; transform: translateY(5px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
