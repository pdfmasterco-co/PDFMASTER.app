import React from 'react';
import { UploadIcon, WrenchIcon, DownloadIcon } from './icons';

const steps = [
  {
    icon: UploadIcon,
    title: 'Step 1: Upload Your File',
    description: 'Simply drag and drop your PDF file or select it from your device to get started.'
  },
  {
    icon: WrenchIcon,
    title: 'Step 2: Choose Your Tool',
    description: 'Select from our wide range of PDF tools to compress, convert, sign, or edit your document.'
  },
  {
    icon: DownloadIcon,
    title: 'Step 3: Download Your File',
    description: 'Your processed file will be ready for download in just a few seconds, completely free.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="pt-12 md:pt-16 pb-16 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          <p className="text-base text-[#A0A0C0] mt-3 max-w-2xl mx-auto">
            Get your documents done in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="bg-[#1A1A2E] p-5 md:p-6 rounded-xl border border-[#2D2D4A] text-center
                           transition-all duration-250 ease-in-out
                           hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,77,77,0.15)]
                           step-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex justify-center mb-5" title={step.title}>
                  <div className="bg-gradient-to-br from-[#FF4D4D] to-[#FF6B6B] p-4 rounded-full">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-base text-[#A0A0C0] leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .step-card {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;