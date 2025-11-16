import React from 'react';
import { CheckIcon, FriendlyRobotIcon } from './icons';
import { Page } from '../types';

interface ThankYouPageProps {
  onNavigate: (page: Page) => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-5 py-10">
      <div className="max-w-md w-full">
        <div className="relative mb-6">
          <FriendlyRobotIcon className="w-24 h-24 text-[#A0A0C0] mx-auto" />
          <div className="absolute top-0 right-1/2 -mr-12 bg-green-500/20 p-2 rounded-full ring-4 ring-[#0F0F1A]">
            <CheckIcon className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white">Message Sent!</h1>
        <p className="text-lg text-[#A0A0C0] mt-4">
          We’ve received your message and will get back to you within 24 hours.
        </p>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-3 px-8 rounded-lg
                     shadow-lg shadow-[rgba(255,77,77,0.1)] hover:shadow-lg hover:shadow-red-500/20
                     transition-all duration-300 ease-in-out transform hover:scale-103 hover:brightness-95"
        >
          Back to Homepage
        </button>
      </div>
    </main>
  );
};

export default ThankYouPage;