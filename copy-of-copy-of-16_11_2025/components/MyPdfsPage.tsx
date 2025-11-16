import React, { useState, useEffect } from 'react';
import { Page, StoredPdf } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUserPdfs, deletePdf, resendVerificationEmail } from '../services/firebase';
import { ChevronRightIcon, PdfIcon, DownloadIcon, TrashIcon, EmailIcon, CheckIcon } from './icons';

interface MyPdfsPageProps {
  onNavigate: (page: Page) => void;
  onLoginClick: () => void;
}

const VerificationBanner: React.FC = () => {
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setResendMessage('');
        try {
            await resendVerificationEmail();
            setResendMessage('A new verification email has been sent!');
        } catch (error) {
            console.error("Error resending verification email:", error);
            setResendMessage('Failed to send email. Please try again soon.');
        } finally {
            setIsResending(false);
            setTimeout(() => setResendMessage(''), 5000);
        }
    };

    return (
        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-r-lg mb-6" role="alert">
            <div className="flex">
                <div className="py-1"><EmailIcon className="h-6 w-6 text-yellow-400 mr-4"/></div>
                <div>
                    <p className="font-bold">Verify Your Email Address</p>
                    <p className="text-sm">Please check your inbox for a verification link to secure your account.</p>
                    {!resendMessage && (
                        <button onClick={handleResendEmail} disabled={isResending} className="mt-2 text-sm font-semibold underline hover:text-white disabled:opacity-50">
                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    )}
                    {resendMessage && (
                         <p className="text-sm mt-3 flex items-center">
                            <CheckIcon className="w-4 h-4 mr-1.5" />
                            {resendMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyPdfsPage: React.FC<MyPdfsPageProps> = ({ onNavigate, onLoginClick }) => {
  const { currentUser } = useAuth();
  const [pdfs, setPdfs] = useState<StoredPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getUserPdfs(currentUser.uid)
        .then(userPdfs => {
          setPdfs(userPdfs);
          setError('');
        })
        .catch(err => {
          console.error("Error fetching PDFs:", err);
          setError('Failed to load your documents. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const handleDelete = async (pdf: StoredPdf) => {
    if (!currentUser || !window.confirm(`Are you sure you want to delete "${pdf.name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await deletePdf(currentUser.uid, pdf.id, pdf.storagePath);
        setPdfs(prevPdfs => prevPdfs.filter(p => p.id !== pdf.id));
    } catch (err) {
        console.error("Error deleting PDF:", err);
        alert('Failed to delete the document. Please try again.');
    }
  };


  if (!currentUser) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center px-5">
        <h1 className="text-3xl font-bold text-white">Access Your Saved Files</h1>
        <p className="text-[#A0A0C0] mt-2 max-w-md">Please log in to view, download, and manage your saved documents.</p>
        <button
          onClick={onLoginClick}
          className="mt-6 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-3 px-8 rounded-lg transition-transform hover:scale-105"
        >
          Login / Sign Up
        </button>
      </div>
    );
  }
  
  const isEmailPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');
  const needsVerification = isEmailPasswordUser && !currentUser.emailVerified;
  

  return (
    <main className="flex-grow">
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">My PDFs</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">My Saved Documents</h1>
          <p className="text-base text-[#A0A0C0] mt-2">Here are all the files you've saved to your account.</p>
        </header>

        {needsVerification && <VerificationBanner />}

        {loading ? (
            <div className="text-center p-10">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[#FF6B6B] mx-auto"></div>
                <p className="mt-4 text-[#A0A0C0]">Loading your documents...</p>
            </div>
        ) : error ? (
            <div className="text-center p-10 bg-[#1A1A2E] rounded-xl border border-red-500/30">
                <p className="text-red-400">{error}</p>
            </div>
        ) : pdfs.length === 0 ? (
             <div className="text-center p-10 bg-[#1A1A2E] rounded-xl border border-[#2D2D4A]">
                <h2 className="text-xl font-semibold text-white">No Documents Yet</h2>
                <p className="text-[#A0A0C0] mt-2">After processing a file, click "Save to My PDFs" to see it here.</p>
                <button
                    onClick={() => onNavigate('all-tools')}
                    className="mt-6 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-2.5 px-6 rounded-lg transition-transform hover:scale-105"
                >
                    Explore Tools
                </button>
            </div>
        ) : (
            <div className="space-y-3">
                {pdfs.map(pdf => (
                    <div key={pdf.id} className="flex items-center bg-[#1A1A2E] p-3 rounded-lg border border-[#2D2D4A] transition-all hover:border-[#FF6B6B]/50">
                        <PdfIcon className="w-8 h-8 text-[#FF6B6B] mr-4 flex-shrink-0" />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-medium truncate text-white">{pdf.name}</p>
                            <p className="text-xs text-[#A0A0C0]">
                                {new Date(pdf.createdAt.seconds * 1000).toLocaleDateString()} &bull; {(pdf.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-4 space-x-2">
                             <a href={pdf.url} target="_blank" rel="noopener noreferrer" title="Download" className="p-2 text-[#A0A0C0] bg-[#2D2D4A] rounded-md hover:bg-[#3c3c5a] hover:text-white transition-colors">
                                <DownloadIcon className="w-5 h-5" />
                            </a>
                            <button onClick={() => handleDelete(pdf)} title="Delete" className="p-2 text-[#A0A0C0] bg-[#2D2D4A] rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </main>
  );
};

export default MyPdfsPage;