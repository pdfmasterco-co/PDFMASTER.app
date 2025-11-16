import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';
import { getChatResponse } from '../services/geminiService';
import { ChatIcon, CloseIcon, SendIcon } from './icons';

interface ChatWidgetProps {
  isHidden?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isHidden = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: MessageAuthor.AI,
      text: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(input);
      const aiMessage: ChatMessage = { author: MessageAuthor.AI, text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        author: MessageAuthor.AI,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 md:bottom-10 md:right-10 z-40">
      {/* Chat Bubble Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
          className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white rounded-full p-4 shadow-lg
                     hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20 transform transition-all duration-200"
        >
          <ChatIcon className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-40px)] sm:w-96 h-[60vh] max-h-[700px] bg-[#1A1A2E] rounded-xl shadow-2xl flex flex-col border border-[#2D2D4A] animate-fade-in-up">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#2D2D4A] flex-shrink-0">
            <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} title="Close chat" className="text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                  msg.author === MessageAuthor.USER 
                  ? 'bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white' 
                  // FIX: Changed AI message background color for better contrast and branding consistency.
                  : 'bg-[#2D2D4A] text-white' 
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start mb-4">
                 <div className="bg-[#2D2D4A] text-[#A0A0C0] rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-[#A0A0C0] rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-[#A0A0C0] rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-[#A0A0C0] rounded-full animate-pulse delay-300"></div>
                    </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-[#2D2D4A] flex-shrink-0">
            <div className="flex items-center bg-[#0F0F1A] rounded-lg border border-[#2D2D4A] focus-within:border-[#FF6B6B] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full bg-transparent p-3 text-white placeholder-[#A0A0C0] focus:outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || input.trim() === ''} title="Send message" className="p-3 text-[#A0A0C0] disabled:opacity-50 hover:text-[#FF6B6B] transition-colors">
                <SendIcon className="w-6 h-6"/>
              </button>
            </div>
          </div>
        </div>
      )}
       <style>{`
          .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
          }
          @keyframes fadeInUp {
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

export default ChatWidget;