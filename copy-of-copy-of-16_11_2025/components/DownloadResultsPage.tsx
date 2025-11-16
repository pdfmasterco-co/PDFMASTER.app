import React, { useState } from 'react';
import { Page, FullTool } from '../types';
import { ChevronRightIcon, DownloadIcon, CheckIcon, LockIcon, RefreshIcon, ShareIcon } from './icons';
import { allToolsData } from '../data/tools';
import { useRewards } from '../contexts/RewardsContext';
import { useAuth } from '../contexts/AuthContext';
import { uploadPdfToStorage } from '../services/firebase';

interface NextActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const NextActionCard: React.FC<NextActionCardProps> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    title={title}
    className="bg-[#252535] p-4 rounded-lg text-left h-full w-full transition-all duration-200 hover:border-[#FF4D4D] border border-transparent hover:-translate-y-1"
  >
    <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
    <h4 className="font-semibold text-white mt-2">{title}</h4>
    <p className="text-sm text-[#A0A0C0] mt-1">{description}</p>
  </button>
);


interface DownloadResultsPageProps {
  originalFile: File;
  convertedFileInfo: { name: string; size: number };
  tool: FullTool;
  insight: string;
  onNavigate: (page: Page) => void;
  onToolSelect: (tool: FullTool) => void;
  onReset: () => void;
}

const DownloadResultsPage: React.FC<DownloadResultsPageProps> = ({
  originalFile,
  convertedFileInfo,
  tool,
  insight,
  onNavigate,
  onToolSelect,
  onReset,
}) => {
    const { addPoints } = useRewards();
    const { currentUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const getNextActions = () => {
    const reverseConversionMap: { [key: string]: string } = {
      'pdf-to-word': 'word-to-pdf',
      'pdf-to-jpg': 'jpg-to-pdf',
      'pdf-to-excel': 'excel-to-pdf',
      'pdf-to-powerpoint': 'powerpoint-to-pdf',
      'word-to-pdf': 'pdf-to-word',
      'jpg-to-pdf': 'pdf-to-jpg',
    };

    const nextActions = [
      {
        icon: '📝',
        title: 'Edit Document',
        description: 'Make changes to a PDF',
        slug: 'edit-pdf',
      },
      {
        icon: '🔁',
        title: 'Convert Back',
        description: tool.slug.includes('to-pdf') ? 'PDF to Word' : 'Back to PDF',
        slug: reverseConversionMap[tool.slug] || 'convert-pdf',
      },
      {
        icon: '🖨️',
        title: 'Print Ready',
        description: 'Optimize for printing',
        slug: 'fix-optimize-pdf',
      },
      {
        icon: '📤',
        title: 'Share Securely',
        description: 'Add password protection',
        slug: 'protect-pdf',
      }
    ];

    return nextActions.map(action => ({
      ...action,
      tool: allToolsData.find(t => t.slug === action.slug)
    })).filter(action => action.tool);
  };

  const nextActions = getNextActions();

  const handleDownload = () => {
    const blob = new Blob([originalFile], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFileInfo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSaveToAccount = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
        const blob = new Blob([originalFile], { type: 'application/pdf' });
        await uploadPdfToStorage(currentUser, blob, convertedFileInfo.name);
        setSaveStatus('success');
    } catch (error) {
        console.error("Failed to save file:", error);
        setSaveStatus('error');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto py-10 px-5 animate-fade-in">
      <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
        <ChevronRightIcon className="w-4 h-4 mx-1" />
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('all-tools'); }} className="hover:text-[#FF6B6B] transition-colors">Tools</a>
        <ChevronRightIcon className="w-4 h-4 mx-1" />
        <span className="text-white font-medium">{tool.name}</span>
      </nav>

      <header className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white">
          PDF Successfully Processed!
        </h1>
        <p className="text-base text-[#A0A0C0] mt-4">
          Your file is ready. Download or continue working.
        </p>
      </header>

      <section className="bg-[#1A1A2E] rounded-xl p-6 text-center border border-[#2D2D4A]">
        <span className="text-5xl" role="img" aria-label="Document icon">📄</span>
        <h2 className="text-lg font-bold text-white mt-4">{convertedFileInfo.name}</h2>
        <p className="text-sm text-[#A0A0C0] mt-1">
          From {originalFile.name} &bull; {(convertedFileInfo.size / 1024).toFixed(0)} KB
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDownload}
              title={`Download ${convertedFileInfo.name}`}
              className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-3 px-6 rounded-lg w-full sm:w-auto text-base flex items-center justify-center transition-transform hover:scale-105"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download
            </button>
            {currentUser && (
                <button
                    onClick={handleSaveToAccount}
                    disabled={isSaving || saveStatus === 'success'}
                    className="bg-[#2D2D4A] text-white font-semibold py-3 px-6 rounded-lg w-full sm:w-auto text-base flex items-center justify-center transition-colors hover:bg-[#3c3c5a] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : 'Save to My PDFs')}
                </button>
            )}
            <button
              onClick={() => addPoints(5, 'Share Result')}
              title="Share and earn 5 points"
              className="bg-[#2D2D4A] text-white font-semibold py-3 px-6 rounded-lg w-full sm:w-auto text-base flex items-center justify-center transition-colors hover:bg-[#3c3c5a]"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              Share & Earn 5pts
            </button>
        </div>
        {saveStatus === 'error' && <p className="text-xs text-red-400 mt-2">Failed to save. Please try again.</p>}
      </section>

      {insight && (
        <div className="flex items-center justify-center mt-4 text-base text-white">
          <CheckIcon className="w-5 h-5 mr-2 text-green-400" />
          <span>{insight.replace(/✅/g, '').trim()}</span>
        </div>
      )}

      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">What’s next?</h3>
            <button
                onClick={onReset}
                title="Start over with a new file"
                className="flex items-center text-sm text-[#A0A0C0] hover:text-white transition-colors"
            >
                <RefreshIcon className="w-4 h-4 mr-1.5" />
                Process Another File
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {nextActions.map((action, index) => (
             action.tool && <NextActionCard
              key={index}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onClick={() => onToolSelect(action.tool!)}
            />
          ))}
        </div>
      </section>
      
      <div className="text-center mt-8">
        <p className="text-sm text-[#A0A0C0] flex items-center justify-center" title="Secure Processing">
          <LockIcon className="w-4 h-4 mr-2 text-[#FF4D4D]" />
          Your file was processed securely and deleted after conversion.
        </p>
      </div>
    </div>
  );
};

export default DownloadResultsPage;