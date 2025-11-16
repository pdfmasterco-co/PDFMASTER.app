import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { ChevronRightIcon, DownloadIcon, CameraIcon } from './icons';
import ToggleSwitch from './ToggleSwitch';

type ScanView = 'initial' | 'preview' | 'success';

const DesktopView: React.FC = () => (
  <div className="text-center py-10">
    <div className="max-w-md mx-auto bg-[#1A1A2E] p-8 rounded-xl border border-[#2D2D4A]">
      {/* Phone Mockup */}
      <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[400px] w-[200px] shadow-xl">
          <div className="w-[100px] h-[12px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
          <div className="h-[32px] w-[2px] bg-gray-800 absolute -left-[12px] top-[50px] rounded-l-lg"></div>
          <div className="h-[32px] w-[2px] bg-gray-800 absolute -left-[12px] top-[100px] rounded-l-lg"></div>
          <div className="h-[48px] w-[2px] bg-gray-800 absolute -right-[12px] top-[100px] rounded-r-lg"></div>
          <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#0F0F1A] flex flex-col items-center justify-center p-4">
              <CameraIcon className="w-16 h-16 text-[#FF6B6B]" title="Mobile camera view" />
              <p className="text-white text-sm font-semibold mt-4">Ready to Scan</p>
          </div>
      </div>
      <h2 className="text-2xl font-bold text-white mt-8">This Tool is Built for Mobile</h2>
      <p className="text-[#A0A0C0] mt-2">
        Open this page on your mobile phone to use your camera for scanning.
      </p>
    </div>
  </div>
);

const MobileView: React.FC = () => {
  const [view, setView] = useState<ScanView>('initial');
  const [enhanceLighting, setEnhanceLighting] = useState(true);
  const [autoCrop, setAutoCrop] = useState(true);

  const handleCapture = () => {
    // This is a simulation, so we just switch the view
    setView('preview');
  };
  
  const handleSave = () => {
    setView('success');
  };

  const resetScanner = () => {
    setView('initial');
  };

  const renderContent = () => {
    switch (view) {
      case 'initial':
        return (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-5">
            <div className="w-48 h-64 bg-[#0F0F1A] border-4 border-dashed border-[#2D2D4A] rounded-lg flex items-center justify-center mb-6" title="Scanner area">
               <CameraIcon className="w-20 h-20 text-[#A0A0C0]" />
            </div>
            <p className="text-lg font-semibold text-white mb-4">Tap below to start scanning</p>
             <p className="text-sm text-center text-[#A0A0C0] max-w-xs mb-8">
                Works in Chrome/Safari — no app install needed.
            </p>
            <button
              onClick={() => alert("In a real app, this would open the camera. We'll simulate a capture.")}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center ring-4 ring-white/20 transition-transform hover:scale-105"
              aria-label="Allow camera access and capture photo"
              title="Capture document"
            >
              <div className="w-14 h-14 bg-white rounded-full border-2 border-black" onClick={handleCapture}></div>
            </button>
          </div>
        );

      case 'preview':
        return (
          <div className="flex-grow flex flex-col p-5 animate-fade-in">
            <h2 className="text-xl font-semibold text-white text-center mb-4">Preview & Adjust</h2>
            <div className="flex-grow bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-white">[ Simulated Scanned Document Preview ]</p>
            </div>
            <div className="bg-[#1A1A2E] border border-[#2D2D4A] rounded-xl p-4 divide-y divide-[#2D2D4A] mb-4">
              <ToggleSwitch label="Auto-crop and straighten" enabled={autoCrop} onChange={setAutoCrop} />
              <ToggleSwitch label="Enhance lighting" enabled={enhanceLighting} onChange={setEnhanceLighting} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetScanner}
                className="w-full py-3 px-5 rounded-lg font-semibold bg-[#2D2D4A] text-white hover:bg-[#3c3c5a] transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-3 rounded-lg hover:scale-103 hover:brightness-95 transition-transform"
              >
                Save as PDF
              </button>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-5 animate-fade-in">
             <h3 className="text-2xl font-semibold text-white mb-2">✅ Scan complete!</h3>
             <p className="text-[#A0A0C0] mb-6">Your file is ready to be downloaded.</p>
             <button
               className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-medium py-3 px-6 rounded-lg 
                          flex items-center justify-center w-full max-w-xs
                          hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20
                          transition-all duration-300 ease-in-out"
             >
               <DownloadIcon className="w-5 h-5 mr-2" />
               Download PDF
             </button>
             <button onClick={resetScanner} className="mt-4 text-[#A0A0C0] hover:text-white">
                Scan Another Document
             </button>
          </div>
        );
    }
  };

  return <div className="h-full flex flex-col">{renderContent()}</div>;
};

const ScanToPdfPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <main className="flex-grow flex flex-col">
      <div className="max-w-[800px] mx-auto px-5 py-10 w-full flex-grow flex flex-col">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8 flex-shrink-0">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('all-tools'); }} className="hover:text-[#FF6B6B] transition-colors">Tools</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">Scan to PDF</span>
        </nav>

        <div className="text-center mb-10 flex-shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Scan Documents with Your Camera
          </h1>
          <p className="text-base sm:text-lg text-[#A0A0C0] max-w-3xl mx-auto mt-4">
            Use your mobile camera to instantly scan documents into a high-quality PDF.
          </p>
        </div>

        <div className="flex-grow">
          {isMobile ? <MobileView /> : <DesktopView />}
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
};

export default ScanToPdfPage;