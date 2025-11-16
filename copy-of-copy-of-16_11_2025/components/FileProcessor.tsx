import React, { useState, useEffect } from 'react';
import { ProcessingState } from '../types';
import { PdfIcon, DownloadIcon, CloseIcon } from './icons';

interface FileProcessorProps {
  file: File;
  onClose: () => void;
}

const FileProcessor: React.FC<FileProcessorProps> = ({ file, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<ProcessingState>(ProcessingState.UPLOADING);

  useEffect(() => {
    let interval: number;

    const simulateProgress = () => {
      setProgress(0);
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    };

    if (state === ProcessingState.UPLOADING) {
      simulateProgress();
      setTimeout(() => setState(ProcessingState.PROCESSING), 2500);
    } else if (state === ProcessingState.PROCESSING) {
      simulateProgress();
      setTimeout(() => setState(ProcessingState.COMPLETE), 2500);
    }

    return () => {
      clearInterval(interval);
    };
  }, [state]);

  const getStatusText = () => {
    switch (state) {
      case ProcessingState.UPLOADING:
        return 'Uploading...';
      case ProcessingState.PROCESSING:
        return 'Processing with AI...';
      case ProcessingState.COMPLETE:
        return 'Processing Complete!';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] w-full max-w-lg rounded-xl border border-[#2D2D4A] p-5 md:p-6 text-white relative animate-fade-in">
        <button onClick={onClose} title="Cancel processing" className="absolute top-4 right-4 text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-semibold mb-6 text-center">Your File</h3>

        <div className="flex items-center bg-[#0F0F1A] p-4 rounded-lg border border-[#2D2D4A] mb-6">
          <PdfIcon className="w-10 h-10 text-[#FF6B6B] mr-4 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-[#A0A0C0]">{Math.round(file.size / 1024)} KB</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-[#A0A0C0]">{getStatusText()}</span>
            {state !== ProcessingState.COMPLETE && (
              <span className="text-sm font-medium">{progress}%</span>
            )}
          </div>
          <div className="w-full bg-[#0F0F1A] rounded-full h-2.5 border border-[#2D2D4A]">
            <div
              className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] h-2.5 rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {state === ProcessingState.COMPLETE && (
          <div className="mt-8 text-center animate-fade-in">
            <button
              title="Download your file"
              className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-medium py-3 px-6 rounded-lg 
                       flex items-center justify-center w-full md:w-auto md:mx-auto
                       hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20
                       transition-all duration-300 ease-in-out"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Your File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileProcessor;