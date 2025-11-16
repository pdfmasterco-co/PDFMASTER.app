import React from 'react';
import { CloseIcon, WarningIcon } from './icons';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onClose, onConfirm, title, message, confirmText = 'Confirm' }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[2000] animate-fade-in" onClick={onClose}>
      <div
        className="bg-[#1A1A2E] w-full max-w-md rounded-2xl border border-[#2D2D4A] p-6 sm:p-8 text-white relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} title="Close" className="absolute top-4 right-4 text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex items-start">
          <div title="Warning" className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
            <WarningIcon className="h-6 w-6 text-red-400" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-xl font-semibold leading-6 text-white">{title}</h3>
            <div className="mt-2">
              <p className="text-base text-[#A0A0C0]">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse sm:gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:scale-103 hover:brightness-95 transition-transform sm:w-auto"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md bg-[#2D2D4A] px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-[#4a4a6a] hover:scale-103 transition-all sm:mt-0 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
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
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;