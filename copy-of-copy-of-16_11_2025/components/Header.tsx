import React, { useState, useEffect } from 'react';
import { MenuIcon, CloseIcon, ChevronDownIcon, UploadIcon } from './icons';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/firebase';

interface HeaderProps {
  onLoginClick: () => void;
  onNavigate: (page: Page, options?: { autoUpload?: boolean }) => void;
}

const NavLink: React.FC<{ href?: string; onClick?: () => void; children: React.ReactNode, className?: string; }> = ({ href, onClick, children, className }) => (
  <a
    href={href || '#'}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
    className={`relative text-white font-medium transition-colors duration-300 hover:text-[#FF6B6B] 
               after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 
               after:bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] after:transition-all after:duration-300 
               hover:after:w-full ${className}`}
  >
    {children}
  </a>
);

const UserDropdown: React.FC<{ onNavigate: (page: Page) => void; closeMenu: () => void; }> = ({ onNavigate, closeMenu }) => {
    const { currentUser } = useAuth();
    
    const handleLogout = async () => {
        closeMenu();
        await logout();
        onNavigate('home');
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-60 bg-[#1A1A2E] rounded-lg border border-[#2D2D4A] p-3 shadow-2xl animate-fade-in-fast z-10">
            <div className="p-2 border-b border-[#2D2D4A] mb-2">
                <p className="font-semibold text-white truncate">{currentUser?.displayName || 'User'}</p>
                <p className="text-sm text-[#A0A0C0] truncate">{currentUser?.email}</p>
            </div>
            <ul className="space-y-1">
                <li onClick={() => { onNavigate('my-pdfs'); closeMenu(); }} className="p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer text-white">Profile</li>
                <li onClick={() => { onNavigate('my-pdfs'); closeMenu(); }} className="p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer text-white">Dashboard</li>
                <li onClick={handleLogout} className="p-2 rounded-md hover:bg-[#2D2D4A] cursor-pointer text-white">Logout</li>
            </ul>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onLoginClick, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownVisible, setUserDropdownVisible] = useState(false);
  const { currentUser } = useAuth();
  let userTimeoutId: number;


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const closeMobileMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
    onNavigate('home');
  };
  
  const handleUserMouseEnter = () => {
    clearTimeout(userTimeoutId);
    setUserDropdownVisible(true);
  };
  const handleUserMouseLeave = () => {
    userTimeoutId = window.setTimeout(() => setUserDropdownVisible(false), 200);
  };


  const navLinks = (
    <>
      <NavLink onClick={() => { onNavigate('pdf-assist'); closeMobileMenu(); }}>PDF Assist</NavLink>
      <NavLink onClick={() => { onNavigate('all-tools'); closeMobileMenu(); }}>All Tools</NavLink>
      <NavLink onClick={() => { onNavigate('pricing'); closeMobileMenu(); }}>Pricing</NavLink>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-[#2D2D4A] ${
          isScrolled ? 'shadow-lg shadow-black/20' : ''
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-xl sm:text-2xl font-bold text-white tracking-wider">
              PDFMASTER<span className="text-[#FF6B6B]">.CO</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => onNavigate('pdf-assist', { autoUpload: true })}
                className="flex items-center gap-2 bg-[#2D2D4A] text-white font-semibold py-2 px-5 rounded-md text-base hover:bg-[#3c3c5a] transition-colors"
                title="Upload a document to chat with AI"
              >
                <UploadIcon className="w-5 h-5" />
                Upload
              </button>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center">
                  {!currentUser ? (
                    <button
                        onClick={onLoginClick}
                        className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-2 px-5 rounded-md text-base
                                   hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20
                                   transition-all duration-300 ease-in-out"
                    >
                        Sign In
                    </button>
                  ) : (
                    <div 
                        className="relative"
                        onMouseEnter={handleUserMouseEnter}
                        onMouseLeave={handleUserMouseLeave}
                    >
                        <button className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-2 px-5 rounded-md text-base flex items-center gap-2
                                          hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20
                                          transition-all duration-300 ease-in-out">
                            My Account
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownVisible ? 'rotate-180' : ''}`} />
                        </button>
                        {isUserDropdownVisible && <UserDropdown onNavigate={onNavigate} closeMenu={() => setUserDropdownVisible(false)}/>}
                    </div>
                  )}
              </div>


              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="text-white p-2"
                  aria-label="Open menu"
                  title="Open menu"
                >
                  <MenuIcon className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[1001] bg-black/50 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      >
        <div
          className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#0F0F1A] border-l border-[#2D2D4A] shadow-2xl p-6
                      transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={closeMobileMenu}
              className="text-[#A0A0C0] p-2 hover:text-white"
              aria-label="Close menu"
              title="Close menu"
            >
              <CloseIcon className="w-7 h-7" />
            </button>
          </div>
          <nav className="flex flex-col space-y-6 text-lg">
            {navLinks}
            {currentUser && (
                <NavLink onClick={() => { onNavigate('my-pdfs'); closeMobileMenu(); }}>My Account</NavLink>
            )}
          </nav>
          <div className="mt-10 pt-6 border-t border-[#2D2D4A]">
             <button
                  onClick={() => { onNavigate('pdf-assist', { autoUpload: true }); closeMobileMenu(); }}
                  className="bg-[#2D2D4A] text-white font-semibold py-3 px-5 rounded-lg w-full text-center text-base mb-4 flex items-center justify-center gap-2 hover:bg-[#3c3c5a] transition-colors"
                  title="Upload a document to chat with AI"
              >
                  <UploadIcon className="w-5 h-5" />
                  Upload PDF
              </button>
             <button
                onClick={() => { currentUser ? handleLogout() : onLoginClick(); closeMobileMenu(); }}
                className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-3 px-5 rounded-lg w-full text-center text-base
                           hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20
                           transition-all duration-300 ease-in-out"
              >
                {currentUser ? 'Logout' : 'Sign In'}
              </button>
          </div>
        </div>
      </div>
      <style>{`
          .animate-fade-in-fast {
              animation: fadeInFast 0.2s ease-out forwards;
          }
          @keyframes fadeInFast {
              from { opacity: 0; transform: translateY(-5px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
          }
      `}</style>
    </>
  );
};

export default Header;