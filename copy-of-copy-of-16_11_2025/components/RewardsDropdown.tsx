import React from 'react';
import { useRewards } from '../contexts/RewardsContext';
import { Page } from '../types';

interface RewardsDropdownProps {
  onNavigate: (page: Page) => void;
  close: () => void;
}

const RewardsDropdown: React.FC<RewardsDropdownProps> = ({ onNavigate, close }) => {
    const { points, isPro } = useRewards();
    const progress = (points / 100) * 100;

    const handleNavigation = (page: Page) => {
      onNavigate(page);
      close();
    };

    return (
        <div className="absolute top-full right-0 mt-3 w-72 bg-[#1A1A2E] rounded-xl border border-[#2D2D4A] p-4 shadow-2xl animate-fade-in-fast z-20">
            <h3 className="text-white font-semibold">{isPro ? "Pro Unlocked!" : "Your Rewards"}</h3>
            <p className="text-sm text-[#A0A0C0] mb-3">
              {isPro ? "You've earned free Pro access!" : "Free Pro at 100 points"}
            </p>
            
            <div className="w-full bg-[#0F0F1A] rounded-full h-2.5 border border-[#2D2D4A] mb-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-green-500' : 'bg-[#FF4D4D]'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm text-white font-bold text-right mb-4">{points}/100</p>
            
            <h4 className="font-semibold text-white mb-2">How to earn points:</h4>
            <ul className="space-y-1 text-sm text-[#A0A0C0]">
                <li className="flex justify-between"><span>Use any tool</span> <span className="font-medium text-white">+10 pts</span></li>
                <li className="flex justify-between"><span>Analyze a document with AI</span> <span className="font-medium text-white">+20 pts</span></li>
                <li className="flex justify-between"><span>Share a result</span> <span className="font-medium text-white">+5 pts</span></li>
            </ul>

            <button
                onClick={() => handleNavigation('all-tools')}
                className="mt-4 w-full bg-[#2D2D4A] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#3c3c5a] transition-colors"
            >
                Start Using Tools
            </button>
        </div>
    );
};

export default RewardsDropdown;