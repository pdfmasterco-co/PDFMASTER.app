import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import AllTools from './components/AllTools';
import ToolPage from './components/ToolPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import ThankYouPage from './components/ThankYouPage';
import PricingPage from './components/PricingPage';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import ScanToPdfPage from './components/ScanToPdfPage';
import TranscribeAudioPage from './components/TranscribeAudioPage';
import PdfAssistPage from './components/PdfAssistPage';
import ChatWidget from './components/ChatWidget';
import MyPdfsPage from './components/MyPdfsPage';
import { FullTool, Page } from './types';
import { RewardsProvider, useRewards } from './contexts/RewardsContext';
import { AuthProvider } from './contexts/AuthContext';

const ToastManager: React.FC = () => {
  const { lastAction } = useRewards();
  if (!lastAction) return null;

  const message = `✅ +${lastAction.points} points! Total: ${lastAction.total}/100`;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#4D4DFF] text-white py-2 px-5 rounded-lg shadow-lg z-[3000] animate-toast-in-out">
      {message}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RewardsProvider>
        <AppInternal />
      </RewardsProvider>
    </AuthProvider>
  );
}

function AppInternal() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedTool, setSelectedTool] = useState<FullTool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pageOptions, setPageOptions] = useState<{ autoUpload?: boolean }>({});
  
  const navigate = (page: Page, options: { autoUpload?: boolean } = {}) => {
    if (page === 'home') {
      if (currentPage === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedTool(null);
        setCurrentPage('home');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
      }
      setPageOptions({});
      return;
    }

    setPageOptions(options);
    setSelectedTool(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleToolSelect = (tool: FullTool) => {
    if (tool.slug === 'scan-to-pdf') {
      setCurrentPage('scan-to-pdf');
    } else if (tool.slug === 'transcribe-audio') {
      setCurrentPage('transcribe-audio' as Page);
    } else if (tool.slug === 'pdf-assist') {
      setCurrentPage('pdf-assist');
    }
    else {
      setSelectedTool(tool);
    }
    window.scrollTo(0, 0);
  };
  
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate('my-pdfs');
  };

  const pagesWithoutFooter: Page[] = ['pdf-assist', 'scan-to-pdf', 'transcribe-audio', 'my-pdfs'];

  const renderContent = () => {
    if (selectedTool) {
      return <ToolPage tool={selectedTool} onNavigate={navigate} onToolSelect={handleToolSelect} />;
    }
    
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToolSelect={handleToolSelect}
            onNavigate={navigate}
          />
        );
      case 'all-tools':
        return <AllTools onToolSelect={handleToolSelect} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'thank-you':
        return <ThankYouPage onNavigate={navigate} />;
      case 'pricing':
        return <PricingPage onNavigate={navigate} />;
      case 'scan-to-pdf':
        return <ScanToPdfPage onNavigate={navigate} />;
      case 'transcribe-audio':
        return <TranscribeAudioPage onNavigate={navigate} />;
      case 'pdf-assist':
        return <PdfAssistPage onNavigate={navigate} autoUpload={pageOptions.autoUpload} />;
      case 'my-pdfs':
        return <MyPdfsPage onNavigate={navigate} onLoginClick={() => setIsAuthModalOpen(true)} />;
      default:
        return <Home searchQuery={searchQuery} onSearchChange={setSearchQuery} onToolSelect={handleToolSelect} onNavigate={navigate} />;
    }
  };

  return (
    <div className="bg-[#0F0F1A] text-white min-h-full flex">
      <div className="flex-grow flex flex-col w-full">
        <Header 
          onLoginClick={() => setIsAuthModalOpen(true)} 
          onNavigate={navigate}
        />
        
        <div className={`${currentPage !== 'home' ? 'pt-16 md:pt-20' : ''} flex-grow flex flex-col`}>
          {renderContent()}
        </div>
        
        {!pagesWithoutFooter.includes(currentPage) && <Footer />}
              
        <AuthModal 
          show={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={handleAuthSuccess} 
        />
        <ChatWidget isHidden={pagesWithoutFooter.includes(currentPage)} />
        <ToastManager />
      </div>

       <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        .animate-toast-in-out {
          animation: toast-in-out 3s forwards ease-in-out;
        }
        @keyframes toast-in-out {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          10%, 90% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
        }
       `}</style>
    </div>
  );
}

export default App;