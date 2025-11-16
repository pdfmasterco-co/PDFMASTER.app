import React, { useState, useCallback, useEffect } from 'react';
import type { FullTool, Page } from '../types';
import { UploadIcon, ChevronRightIcon, PdfIcon, CloseIcon, DownloadIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import DownloadResultsPage from './DownloadResultsPage';
import { useRewards } from '../contexts/RewardsContext';

type ProcessingStatus = 'idle' | 'processing' | 'complete';

interface ToolPageProps {
  tool: FullTool;
  onNavigate: (page: Page) => void;
  onToolSelect: (tool: FullTool) => void;
}

const ToolPage: React.FC<ToolPageProps> = ({ tool, onNavigate, onToolSelect }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [formattedSuccessMessage, setFormattedSuccessMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [convertedFileInfo, setConvertedFileInfo] = useState<{ name: string; size: number } | null>(null);
  const { addPoints } = useRewards();

  const minFiles = tool.minFiles || 1;
  const isButtonDisabled = files.length < minFiles;

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
      if (tool.acceptsMultipleFiles) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles.slice(0, 1));
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [tool.acceptsMultipleFiles]);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };
  
  const startProcessing = () => {
    setStatus('processing');
  };

  const handleProcess = () => {
    if (tool.acceptsMultipleFiles && files.length > 1) {
      setIsConfirmModalOpen(true);
    } else {
      startProcessing();
    }
  };

  const handleConfirmProcess = () => {
    setIsConfirmModalOpen(false);
    startProcessing();
  };
  
  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setFormattedSuccessMessage('');
    setConvertedFileInfo(null);
  };


  useEffect(() => {
    if (status === 'processing') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);

            addPoints(10, 'Tool Use');

            const originalTotalSize = files.reduce((sum, file) => sum + file.size, 0);
            const originalName = files.length > 1 ? `merged_document.pdf` : files[0].name;

            // Simulate file conversion
            let finalName = originalName.replace(/\.pdf$/i, `_${tool.slug}.pdf`);
            let finalSize = originalTotalSize * 0.7;

            if (tool.slug.includes('compress')) {
                finalSize = originalTotalSize * 0.23; // Simulate 77% reduction
                finalName = originalName.replace(/\.pdf$/i, '_compressed.pdf');
            } else if (tool.slug.includes('to-word')) {
                finalName = originalName.replace(/\.pdf$/i, '.docx');
            } else if (tool.slug.includes('to-jpg')) {
                finalName = originalName.replace(/\.pdf$/i, '.zip');
                finalSize = originalTotalSize * 1.5;
            }
            
            setConvertedFileInfo({ name: finalName, size: finalSize });

            if (tool.successMessage && tool.successMessage.includes('{')) {
                const originalSizeMB = (originalTotalSize / (1024 * 1024)).toFixed(1);
                const finalSizeMB = (finalSize / (1024 * 1024)).toFixed(1); 
                
                const formatted = tool.successMessage
                  .replace('{originalSize}', `${originalSizeMB}MB`)
                  .replace('{finalSize}', `${finalSizeMB}MB`);
                setFormattedSuccessMessage(formatted);
            } else {
                setFormattedSuccessMessage(tool.slug.includes('convert') ? '✅ Formatting preserved • Editable text' : (tool.successMessage || 'Processing Complete!'));
            }
            
            setStatus('complete');
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [status, files, tool.successMessage, tool.slug, addPoints]);


  const SettingsComponent = tool.settingsComponent;
  
  if (status === 'complete' && convertedFileInfo) {
    return (
        <DownloadResultsPage
          originalFile={files[0] || new File([], "document.pdf")}
          convertedFileInfo={convertedFileInfo}
          tool={tool}
          insight={formattedSuccessMessage}
          onNavigate={onNavigate}
          onToolSelect={onToolSelect}
          onReset={handleReset}
        />
    )
  }

  return (
    <>
      <main className="flex-grow">
        <div className="max-w-[800px] mx-auto px-5 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
            <ChevronRightIcon className="w-4 h-4 mx-1" />
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('all-tools'); }} className="hover:text-[#FF6B6B] transition-colors">Tools</a>
            <ChevronRightIcon className="w-4 h-4 mx-1" />
            <span className="text-white font-medium">{tool.name}</span>
          </nav>

          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {tool.pageTitle || tool.name}
            </h1>
            <p className="text-base sm:text-lg text-[#A0A0C0] max-w-3xl mx-auto mt-4">
              {tool.pageDescription || tool.description}
            </p>
          </div>

          {status === 'idle' && (
            <>
              {/* Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                title="Click or drag-and-drop files here"
                className={`relative group bg-[#1A1A2E] p-8 rounded-xl border-2 border-dashed border-[#2D2D4A] text-center
                            transition-all duration-300 ease-in-out cursor-pointer
                            ${isDragging ? 'border-[#FF6B6B] scale-105' : ''}`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept=".pdf"
                  multiple={tool.acceptsMultipleFiles}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                <div className="flex flex-col items-center justify-center">
                  <UploadIcon className="w-12 h-12 text-[#A0A0C0] group-hover:text-[#FF6B6B] transition-colors" />
                  <p className="mt-4 text-lg text-white font-semibold">Drag & drop files here</p>
                  <p className="text-[#A0A0C0]">or click to browse your device</p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white">Your Files ({files.length})</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center bg-[#1A1A2E] p-3 rounded-lg border border-[#2D2D4A]">
                      <PdfIcon className="w-8 h-8 text-[#FF6B6B] mr-3 flex-shrink-0" />
                      <div className="flex-grow overflow-hidden">
                        <p className="font-medium truncate text-white">{file.name}</p>
                        <p className="text-sm text-[#A0A0C0]">{Math.round(file.size / 1024)} KB</p>
                      </div>
                      <button onClick={() => removeFile(index)} title={`Remove ${file.name}`} className="ml-3 text-[#A0A0C0] hover:text-[#FF6B6B] p-1 rounded-full flex-shrink-0 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {SettingsComponent && files.length > 0 && (
                <div className="mt-8">
                  <SettingsComponent />
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleProcess}
                  disabled={isButtonDisabled}
                  className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-bold py-3 px-8 rounded-lg
                             shadow-lg shadow-[rgba(255,77,77,0.1)] hover:shadow-lg hover:shadow-red-500/20
                             transition-all duration-300 ease-in-out transform hover:scale-103 hover:brightness-95
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none disabled:brightness-100"
                >
                  {tool.actionButtonText || `Process File${tool.acceptsMultipleFiles ? 's' : ''}`}
                </button>
                {isButtonDisabled && files.length > 0 && (
                   <p className="text-sm text-[#A0A0C0] mt-3">
                     Please upload at least {minFiles} files to continue.
                   </p>
                )}
              </div>
            </>
          )}

          {status === 'processing' && (
             <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D4A] p-8 text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">Processing your files...</h3>
                <p className="text-[#A0A0C0] mb-6">Please wait a moment while we work our magic.</p>
                <div className="w-full bg-[#0F0F1A] rounded-full h-2.5 border border-[#2D2D4A]">
                  <div
                    className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] h-2.5 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white font-semibold mt-2">{progress}%</p>
             </div>
          )}

        </div>
      </main>
      <ConfirmationModal
        show={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmProcess}
        title={`Process ${files.length} files?`}
        message={`You are about to perform the "${tool.name}" action on ${files.length} files. This cannot be undone.`}
        confirmText={tool.actionButtonText || 'Process Files'}
      />
    </>
  );
};

export default ToolPage;
