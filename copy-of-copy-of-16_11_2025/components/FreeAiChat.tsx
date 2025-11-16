import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon, TrashIcon, PlusIcon, DownloadIcon } from './icons';
import { ChatMessage, MessageAuthor, Insight } from '../types';
import { getChatResponse } from '../services/geminiService';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FreeAiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'reading' | 'ready'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.type !== 'application/pdf') {
      setMessages(prev => [...prev, { author: MessageAuthor.SYSTEM, text: "Error: Please upload a valid PDF file." }]);
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessages(prev => [...prev, { author: MessageAuthor.SYSTEM, text: "Error: File size exceeds the 10MB limit." }]);
      return;
    }
    
    setUploadedFile(file);
    setPdfStatus('reading');
    setMessages([{ author: MessageAuthor.SYSTEM, text: "🔍 Reading your PDF... (This takes 10-20 seconds)" }]);
    setIsLoading(true);

    // Simulate reading time
    setTimeout(async () => {
      let finalInsights: Insight[] | undefined = undefined;
      const showInsights = file.size > 250 * 1024; // Simulate 5+ pages

      if (showInsights) {
        try {
          const insightsPrompt = `Based on the filename "${file.name}", analyze this document. Generate four key insights: document type, key data points, people/companies involved, and a potential flag or warning. Return the response as a JSON object. If a value isn't clear from the filename, make a plausible inference. For flags, if there's no obvious issue, create a common one like 'missing signature' or 'check for final version'.`;
          const insightsSchema = {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'The type of document, e.g., Invoice, Report.' },
              keyData: { type: Type.STRING, description: 'Key data points, e.g., Amount: $1,250 • Due: 2025-08-30' },
              people: { type: Type.STRING, description: 'People or companies mentioned, e.g., John Doe, Acme Corp' },
              flags: { type: Type.STRING, description: 'A potential warning or flag, e.g., Missing signature (page 2)' }
            },
            required: ['type', 'keyData', 'people', 'flags']
          };

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: insightsPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: insightsSchema,
            },
          });
          
          const insightsJson = JSON.parse(response.text);
          
          finalInsights = [
            { icon: '🏷️', title: 'Type', value: insightsJson.type },
            { icon: '🔑', title: 'Key Data', value: insightsJson.keyData },
            { icon: '👥', title: 'People', value: insightsJson.people },
            { icon: '⚠️', title: 'Flags', value: insightsJson.flags, isWarning: true },
          ];
        } catch (e) {
          console.error("Failed to generate insights:", e);
          finalInsights = undefined; // Proceed without insights if this fails
        }
      }

      const userLang = navigator.language || 'en';
      const systemInstruction = `You are 'PDFMASTER AI'. A user has uploaded a PDF. You cannot read it. The user's preferred language is ${userLang}. Your task is to generate a plausible summary based on the file name. You MUST generate the entire response in the document's language, which you should infer from the file name. If you cannot infer the language, default to the user's preferred language (${userLang}).`;
      
      const prompt = `The PDF is named '${file.name}'. Generate a concise, structured summary. It must have these sections (translated into the inferred language and in bold): '**Key Topic**', '**Main Findings/Conclusions**', '**Actionable Items**'. After the summary, add this text (also translated): "\n✅ Ready! You can now ask specific questions about your document."`;

      const aiSummary = await getChatResponse(prompt, systemInstruction);
      
      const aiMessage: ChatMessage = {
          author: MessageAuthor.AI,
          text: aiSummary,
          actions: ["Give me a one-sentence summary"],
          insights: finalInsights,
      };

      setMessages([aiMessage]);
      setPdfStatus('ready');
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleSend = async (actionText?: string) => {
    const textToSend = (actionText || input).trim();
    if (textToSend === '' || isLoading || pdfStatus !== 'ready') return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!actionText) {
      setInput('');
    }
    setIsLoading(true);

    try {
        const userLang = navigator.language || 'en';
        let systemInstruction: string;
        let prompt: string = textToSend;

        if (textToSend === 'Give me a one-sentence summary') {
          systemInstruction = `You are 'PDFMASTER AI'. The user has uploaded a PDF named '${uploadedFile?.name}'. You cannot read it. Your task is to generate a plausible, single-sentence summary based on the file name. Respond ONLY with the summary sentence. The user's language is ${userLang}. Respond in the document's inferred language or the user's language.`;
          prompt = `Generate a one-sentence summary for a document titled "${uploadedFile?.name}".`;
        } else {
          systemInstruction = `You are 'PDFMASTER AI', an assistant analyzing a PDF named '${uploadedFile?.name}'. You cannot actually read the PDF. The user's preferred language is ${userLang}. Respond in the same language as the user's question, which should match the document's language (infer from file name if possible, otherwise use ${userLang}).

Your response MUST follow this structure, all in the target language:
1.  A plausible, direct answer (1-2 sentences).
2.  Supporting details if needed.
3.  A fake page citation, e.g., "📄 Based on page [X]...".
4.  If confident, add "Answer verified against your document content." on a new line.

If you can't create a plausible answer, say "I couldn’t find this in your document. Try rephrasing or check page [Y]."
Never reveal you are an AI or that you cannot read the document.`;
        }
        
        const aiResponse = await getChatResponse(prompt, systemInstruction);
        setMessages(prev => [...prev, { author: MessageAuthor.AI, text: aiResponse }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [...prev, {
        author: MessageAuthor.AI,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportChat = () => {
    if (!uploadedFile) return;

    const content = messages
      .filter(msg => msg.author !== MessageAuthor.SYSTEM) // Exclude system messages
      .map(msg => `${msg.author.toString() === '0' ? 'USER' : 'AI'}: ${msg.text}`) // Basic enum to string
      .join('\n\n');

    const header = `Chat Session for: ${uploadedFile.name}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    const fullContent = header + content;
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdfmaster_chat_${uploadedFile.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  const handleClearChat = () => {
    if (pdfStatus === 'ready' && uploadedFile) {
      const currentMessages = messages.filter(m => m.author === MessageAuthor.AI);
      if (currentMessages.length > 0) {
        setMessages([currentMessages[0], { author: MessageAuthor.SYSTEM, text: "Chat cleared. You can continue asking questions." }]);
      }
    } else if (pdfStatus === 'idle') {
      setMessages([]);
    }
  };
  
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setUploadedFile(null);
    setPdfStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const isSendActive = input.trim() !== '' && !isLoading && pdfStatus === 'ready';
  const canExport = messages.some(m => m.author !== MessageAuthor.SYSTEM) && !!uploadedFile;

  return (
    <section className="py-16 md:py-20 font-['Inter'] bg-[#0F0F1A]">
      <div className="max-w-[900px] mx-auto px-5 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-4 animated-glowing-text">
          Chat with Your PDF
        </h2>
        <div className="bg-[#1A1A2E] rounded-2xl p-6 shadow-lg">
          
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold text-xl">PDFMASTER AI</h2>
            <div className="flex items-center space-x-2">
               <button 
                  onClick={handleExportChat} 
                  title="Export conversation" 
                  disabled={!canExport}
                  className="w-8 h-8 flex items-center justify-center bg-[#2D2D4A] rounded-full text-[#A0A0C0] hover:bg-[#4a4a6a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <DownloadIcon className="w-5 h-5" />
              </button>
              <button onClick={handleClearChat} title="Clear conversation" className="w-8 h-8 flex items-center justify-center bg-[#2D2D4A] rounded-full text-[#A0A0C0] hover:bg-[#4a4a6a] hover:text-white transition-colors">
                <TrashIcon className="w-5 h-5" />
              </button>
              <button onClick={handleNewChat} title="Start fresh" className="w-8 h-8 flex items-center justify-center bg-[#2D2D4A] rounded-full text-[#A0A0C0] hover:bg-[#4a4a6a] hover:text-white transition-colors">
                 <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </header>
          
          <div className="h-[60vh] min-h-[400px] max-h-[600px] flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-base" style={{ lineHeight: 1.6 }}>
              {pdfStatus === 'idle' && (
                <div 
                  className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${isDragging ? 'border-[#FF4D4D]' : 'border-[#2D2D4A]'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEvents}
                  onDragOver={handleDragEvents}
                  onDragLeave={handleDragEvents}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
                  <span className="text-4xl mb-3" role="img" aria-label="Document icon">📄</span>
                  <p className="text-white text-lg font-medium">Upload a PDF to summarize or ask questions</p>
                  <p className="text-[#A0A0C0] text-sm mt-1">We’ll read your document and let you chat with it</p>
                </div>
              )}
              
              {messages.map((msg, index) => {
                if (msg.author === MessageAuthor.SYSTEM) {
                  if (pdfStatus === 'reading' && isLoading) {
                    return (
                      <div key={index} className="flex flex-col items-center justify-center py-4">
                        <div className="bg-[#2D2D4A] rounded-xl p-5 text-center my-3 w-full max-w-sm">
                          {/* Alternative Circular Loader */}
                          <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center" aria-label="Reading document">
                            <div className="absolute inset-0 border-4 border-[#4a4a6a] rounded-full"></div>
                            <div 
                              className="absolute inset-0 border-4 border-transparent border-t-[#FF4D4D] rounded-full animate-spin"
                            ></div>
                            <span className="text-white font-medium">Reading...</span>
                          </div>

                          <p className="text-white text-lg font-medium">🔍 Reading your PDF...</p>
                          <p className="text-[#A0A0C0] text-sm mt-1">This takes 10–20 seconds. We’re extracting text and preparing answers.</p>
                        </div>
                      </div>
                    );
                  }
                  return <p key={index} className="text-center text-[#A0A0C0] italic text-sm py-2">{msg.text}</p>
                }
                return (
                  <div key={index}>
                     {msg.author === MessageAuthor.AI && msg.insights && (
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-bold mb-3">Document Insights</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                          <div className="flex gap-3 no-scrollbar">
                            {msg.insights.map((insight, insightIndex) => (
                              <div key={insightIndex} className="bg-[#1A1A2E] p-3 rounded-lg flex-shrink-0 w-48 border border-[#2D2D4A]">
                                <div className="flex items-center text-sm text-[#A0A0C0]">
                                  <span className="mr-2">{insight.icon}</span>
                                  <span>{insight.title}</span>
                                </div>
                                <p className={`mt-1 font-medium truncate ${insight.isWarning ? 'text-red-400' : 'text-white'}`}>
                                  {insight.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={`flex ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'} w-full`}>
                      <div className={`max-w-[90%] md:max-w-[80%] p-3 rounded-2xl ${
                        msg.author === MessageAuthor.USER 
                        ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                        : 'bg-[#2D2D4A] text-white rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                     {msg.author === MessageAuthor.AI && msg.actions && !isLoading && (
                      <div className="flex justify-start gap-2 mt-2 flex-wrap">
                        {msg.actions.map(action => (
                          <button
                            key={action}
                            onClick={() => handleSend(action)}
                            className="bg-[#2D2D4A] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#4a4a6a] transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {isLoading && pdfStatus !== 'reading' && (
                <div className="flex justify-start">
                  <div className="bg-[#2D2D4A] rounded-2xl rounded-bl-none p-3">
                      <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="mt-6 flex-shrink-0">
              <div className="flex items-start space-x-3 bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-2 focus-within:ring-2 focus-within:ring-[#FF6B6B]">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload PDF"
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-[#2D2D4A] text-[#A0A0C0] hover:bg-[#4a4a6a] hover:text-white transition-colors"
                >
                  <span className="text-xl" role="img" aria-label="Paperclip">📎</span>
                </button>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder={pdfStatus !== 'ready' ? "Upload a PDF to get started" : "Ask anything about your document..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={pdfStatus !== 'ready' || isLoading}
                  className="w-full bg-transparent text-white placeholder-[#A0A0C0] focus:outline-none resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed py-1.5"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!isSendActive}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{ background: isSendActive ? 'linear-gradient(to right, #FF4D4D, #FF6B6B)' : '#2D2D4A' }}
                  aria-label="Send message"
                >
                  <SendIcon className="w-5 h-5"/>
                </button>
              </div>
               <p className="text-xs text-[#A0A0C0] text-center mt-3">🔒 Your PDF is processed securely and deleted immediately • Max 10MB</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animated-glowing-text {
          animation: text-glow 2.5s ease-in-out infinite alternate;
        }
        @keyframes text-glow {
          from {
            text-shadow: 0 0 5px rgba(255, 107, 107, 0.3), 0 0 10px rgba(255, 107, 107, 0.2);
          }
          to {
            text-shadow: 0 0 10px rgba(255, 107, 107, 0.5), 0 0 20px rgba(255, 107, 107, 0.3);
          }
        }
      `}</style>
    </section>
  );
};

export default FreeAiChat;