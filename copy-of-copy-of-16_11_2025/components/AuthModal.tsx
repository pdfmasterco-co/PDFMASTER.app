import React, { useState, useEffect } from 'react';
import { CloseIcon, GoogleIcon, EyeIcon, EyeOffIcon } from './icons';
import { signInWithGoogle, signUpWithEmail, logInWithEmail } from '../services/firebase';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthTab = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset form state when modal becomes visible to avoid stale data
      setActiveTab('login');
      setShowPassword(false);
      setName('');
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
    }
  }, [show]);

  if (!show) {
    return null;
  }
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (activeTab === 'signup') {
        if (!name) throw new Error("Name is required.");
        await signUpWithEmail(name, email, password);
      } else {
        await logInWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[2000] animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#1A1A2E] w-full max-w-md rounded-2xl border border-[#2D2D4A] p-6 sm:p-8 text-white relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} title="Close modal" className="absolute top-4 right-4 text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex justify-center mb-6 border-b border-[#2D2D4A]">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-6 py-3 text-lg font-semibold transition-colors ${
              activeTab === 'login' ? 'text-white border-b-2 border-[#FF6B6B]' : 'text-[#A0A0C0]'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-6 py-3 text-lg font-semibold transition-colors ${
              activeTab === 'signup' ? 'text-white border-b-2 border-[#FF6B6B]' : 'text-[#A0A0C0]'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailPasswordSubmit}>
            {activeTab === 'signup' && (
                 <input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg py-2.5 px-4 mb-4 text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all"/>
            )}
            <input id="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg py-2.5 px-4 mb-4 text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all"/>
             <div className="relative mb-4">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg py-2.5 pr-10 pl-4 text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-2.5 rounded-lg
                           hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (activeTab === 'login' ? 'Login' : 'Create Account')}
              </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[#2D2D4A]"></div>
          <span className="flex-shrink mx-4 text-[#A0A0C0] text-sm">OR</span>
          <div className="flex-grow border-t border-[#2D2D4A]"></div>
        </div>

        <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            title="Continue with Google" 
            className="w-full flex items-center justify-center bg-white text-black font-semibold py-2.5 rounded-lg
                       hover:bg-gray-100 transition-all duration-300 transform hover:scale-103 disabled:opacity-50"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Continue with Google
        </button>

      </div>
      <style>{`
        .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;