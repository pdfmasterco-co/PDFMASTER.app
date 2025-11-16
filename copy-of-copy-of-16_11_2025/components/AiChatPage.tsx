import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Page, AiChatMessage, SmartSummaryData } from '../types';
import { getChatResponse, getSpeechResponse, generateSummary, extractTextFromPdf, generateStructuredSummary } from '../services/geminiService';
import { PaperClipIcon, MicrophoneIcon, SendIcon, LockIcon, ClipboardIcon, PdfIcon, BrainIcon, SparklesIcon } from './icons';

// Add declaration for jsPDF from the CDN script
declare const jspdf: any;

// Helper functions for audio playback
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const InsightItem = ({ icon, label, value, valueColor = 'text-white' }: { icon: string, label: string, value: string, valueColor?: string }) => (
    <div className="bg-[#1A1A2E]/50 p-3 rounded-lg">
        <label className="text-sm text-[#A0A0C0] flex items-center">{icon} {label}</label>
        <p className={`text-base font-medium mt-1 ${valueColor}`}>{value}</p>
    </div>
);

const SmartSummaryCard: React.FC<{ summary: SmartSummaryData }> = ({ summary }) => (
    <div className="max-w-[800px] mx-auto p-5 bg-[#252535] border-l-[3px] border-[#FF4D4D] rounded-r-xl text-left animate-fade-in">
        <h3 className="text-white text-lg font-bold mb-1">🔍 AI Document Insights</h3>
        <p className="text-[#A0A0C0] text-sm mb-4">Here's a quick analysis of your document.</p>
        
        {summary.isScanned ? (
            <p className="text-white">🤖 This appears to be a scanned document. For a full analysis, please use an OCR tool to extract the text, or ask general questions based on the filename.</p>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <InsightItem icon="📄" label="Type" value={summary.documentType} />
                    <InsightItem 
                        icon="📅" 
                        label="Key Dates" 
                        value={summary.keyDates} 
                        valueColor={summary.keyDates === 'No dates detected' ? 'text-[#A0A0C0]' : 'text-white'} 
                    />
                    <InsightItem icon="💰" label="Numbers & Amounts" value={summary.numbersAndAmounts} />
                    <InsightItem icon="👥" label="People & Orgs" value={summary.peopleAndOrgs} />
                    <div className="bg-[#1A1A2E]/50 p-3 rounded-lg col-span-1 md:col-span-2">
                        <label className="text-sm text-[#A0A0C0] flex items-center">⚠️ Flags</label>
                        <p className="text-base text-[#FF4D4D] font-medium mt-1">{summary.flags}</p>
                    </div>
                </div>
                <div className="bg-[#1A1A2E]/50 p-3 rounded-lg">
                    <label className="text-sm text-[#A0A0C0] flex items-center">📝 Summary</label>
                    <p className="text-white mt-1">{summary.summaryText}</p>
                </div>
            </>
        )}
    </div>
);


const AiChatPage: React.FC<{ onNavigate: (page: Page) => void; autoUpload?: boolean; }> = ({ onNavigate, autoUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [privacyTimer, setPrivacyTimer] = useState(60);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [answerStyle, setAnswerStyle] = useState<'detailed' | 'simple'>('detailed');
  const [smartSummary, setSmartSummary] = useState<SmartSummaryData | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasTriggeredUpload = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(''), 2000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (autoUpload && fileInputRef.current && !hasTriggeredUpload.current) {
        hasTriggeredUpload.current = true;
        fileInputRef.current.click();
    }
  }, [autoUpload]);
  
  // Privacy Timer
  useEffect(() => {
    if (file) {
      setPrivacyTimer(60);
      const interval = setInterval(() => {
        setPrivacyTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setFile(null);
            setMessages([]);
            setSmartSummary(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [file]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const uploadedFile = files[0];
    setUploadError(null);

    if (uploadedFile.size > 20 * 1024 * 1024) { // 20MB limit for analysis
        setUploadError('⚠️ File is too large for analysis. Please use a smaller PDF (< 20MB).');
        return;
    }

    if (uploadedFile.type !== 'application/pdf') {
        setUploadError('Unsupported file type. Please upload a PDF.');
        return;
    }

    setFile(uploadedFile);
    setIsLoading(true);
    setMessages([]);
    setPdfText('');
    setSmartSummary(null);

    setMessages(prev => [...prev, { id: Date.now().toString(), author: 'ai', type: 'thinking', content: `🤖 Analyzing your document...` }]);
    
    try {
        const extractedText = await extractTextFromPdf(uploadedFile);
        setPdfText(extractedText);

        if (extractedText.trim().length < 150) { // Heuristic for scanned/image-only PDF
            setSmartSummary({
                isScanned: true, documentType: 'Scanned Document', keyDates: 'N/A',
                numbersAndAmounts: 'N/A', peopleAndOrgs: 'N/A', flags: 'Text needs to be extracted via OCR.',
                summaryText: 'This appears to be a scanned or image-only document. I cannot read its content without OCR.'
            });
            setMessages([{ id: Date.now().toString(), author: 'ai', type: 'text', content: "🔍 This appears to be an image-only PDF. I can't extract text."}]);
        } else {
            const structuredSummary = await generateStructuredSummary(extractedText, uploadedFile.name);
            setSmartSummary({ ...structuredSummary, isScanned: false });
            setMessages([]); // Clear "Analyzing..." message
        }
    } catch (error: any) {
        console.error(error);
        const errorMessage: AiChatMessage = {
            id: Date.now().toString(),
            author: 'ai',
            type: 'error',
            content: "❌ I'm unable to analyze this document. It may be password-protected or in an unsupported format.",
        };
        setMessages([errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isLoading || !file) return;

    const newUserMessage: AiChatMessage = { id: Date.now().toString(), author: 'user', type: 'text', content: query };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const thinkingMessage: AiChatMessage = { id: (Date.now() + 1).toString(), author: 'ai', type: 'thinking', content: 'Thinking...' };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const responseText = await getChatResponse(query, pdfText, file.name, answerStyle);

      let responseContent = responseText;
      let citationText: string | undefined = undefined;

      // Regex to find either a page citation or a general response marker
      const citationRegex = /\n(📄\s*Page\s*\d+:.*|💬\s*This is a general response.*)/i;
      const match = responseText.match(citationRegex);
      
      if (match) {
          citationText = match[1].trim();
          responseContent = responseText.replace(citationRegex, '').trim();
      }

      const newAiMessage: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        author: 'ai',
        type: 'text',
        content: responseContent,
        citation: citationText,
        showStudyAids: true,
      };
      setMessages(prev => [...prev.slice(0, -1), newAiMessage]);
    } catch (error) {
      const errorMessage: AiChatMessage = { id: (Date.now() + 1).toString(), author: 'ai', type: 'error', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        let errorMessageText = 'An unknown error occurred during speech recognition.';
        if (event.error === 'network') {
          errorMessageText = 'Speech recognition failed due to a network error. Please check your internet connection and try again.';
        } else if (event.error === 'no-speech') {
          errorMessageText = 'No speech was detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          errorMessageText = 'Could not start audio capture. Please ensure your microphone is working correctly.';
        } else if (event.error === 'not-allowed') {
          errorMessageText = 'Microphone access was denied. Please allow microphone access in your browser settings.';
        }

        const errorMessage: AiChatMessage = {
          id: Date.now().toString(),
          author: 'ai',
          type: 'error',
          content: errorMessageText,
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsRecording(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        handleSendMessage(transcript);
      };
      recognitionRef.current.start();
    }
  };
  
  const handleStudyAid = (type: string) => {
      const prompts: { [key: string]: string } = {
          flashcards: "Create 5 key flashcards from this document, with a term on one side and a definition on the other. Format each as 'Term: [Term]\\nDefinition: [Definition]'",
          quiz: "Create a 3-question multiple-choice quiz based on this document, with one correct answer and two plausible incorrect answers for each question. Clearly indicate the correct answer.",
          outline: "Create a hierarchical outline of the main sections and subsections in this document.",
          'key-terms': "Extract and define the top 5 most important key terms or jargon from this document."
      };
      const prompt = prompts[type];
      if (prompt) {
          setMessages(prev => [...prev, { id: Date.now().toString(), author: 'ai', type: 'thinking', content: `⏳ Processing ${type}...` }]);
          handleSendMessage(prompt);
      }
  };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.type === 'dragenter' || e.type === 'dragover' ? setIsDragging(true) : setIsDragging(false);
    };


  const renderMessageContent = (msg: AiChatMessage) => {
    return <p className="whitespace-pre-wrap">{msg.content as string}</p>;
  }

  const handleCopyText = (content: string | string[]) => {
    const textToCopy = Array.isArray(content) ? content.join('\n') : content;
    navigator.clipboard.writeText(textToCopy)
      .then(() => setToastMessage('✅ Copied to Notes!'))
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const handleSaveAsPdf = (message: AiChatMessage) => {
    if (!file) return;
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
  
    doc.setFontSize(16);
    doc.text(`AI Analysis: ${file.name}`, margin, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 28);
    
    let y = 40;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    const content = Array.isArray(message.content) ? message.content.join('\n') : message.content;
    const textLines = doc.splitTextToSize(content, usableWidth);
    doc.text(textLines, margin, y);
    y += textLines.length * 7;
    
    if (message.citation) {
      y += 5;
      doc.setTextColor(255, 77, 77); // Red
      const citationLines = doc.splitTextToSize(message.citation, usableWidth);
      doc.text(citationLines, margin, y);
    }
  
    doc.save(`PDFMaster_AI_Response.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F1A] relative">
      <input 
        ref={fileInputRef} 
        type="file" 
        onChange={(e) => handleFileUpload(e.target.files)} 
        className="hidden" 
        accept=".pdf" 
      />
      
      {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#252535] text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
              {toastMessage}
          </div>
      )}

      { !file ? (
         <div className="flex-grow flex items-center justify-center">
            <div className="max-w-[800px] mx-auto px-5 py-16 md:py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">Chat with Your Documents</h1>
                <p className="text-lg text-[#A0A0C0] mt-3 max-w-xl mx-auto">Upload a PDF. Ask anything. Get answers with citations.</p>
                
                <div 
                    className={`mt-10 bg-[#1A1A2E] border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${isDragging ? 'border-[#FF4D4D] bg-[#1D1D35]' : 'border-[#2D2D4A] hover:border-[#FF4D4D]/50 hover:bg-[#1D1D35]'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEvents}
                    onDragOver={handleDragEvents}
                    onDragLeave={handleDragEvents}
                    onDrop={handleDrop}
                >
                    <span className="text-5xl" role="img" aria-label="document">📄</span>
                    <p className="text-xl font-semibold text-white mt-4">Drag & drop your PDF here</p>
                    <p className="text-sm text-[#A0A0C0] mt-1">Supports PDF • Max 20MB</p>
                </div>
                {uploadError && <p className="text-red-400 mt-2">{uploadError}</p>}

                <p className="text-sm text-[#A0A0C0] mt-5"><span className="text-red-500">🔒</span> Your file is processed securely and deleted after 60 seconds.</p>
            </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col min-h-0">
          <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-[#2D2D4A]">
              <div>
                <p className="text-sm text-white font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">{file.name}</p>
                <p className="text-xs text-red-400">
                    <LockIcon className="w-3 h-3 inline-block mr-1"/>
                    File expires in: 00:{privacyTimer.toString().padStart(2, '0')}
                </p>
              </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
            {smartSummary && <SmartSummaryCard summary={smartSummary} />}
            {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative group max-w-[85%] p-3 rounded-2xl ${
                      msg.author === 'user' 
                      ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                      : msg.type === 'error'
                      ? 'bg-[#252535] border border-red-500/30 text-red-300 rounded-bl-none'
                      : 'bg-[#252535] text-white rounded-bl-none'
                  }`}>
                    {msg.type === 'thinking' ? (
                       <div className="flex items-center space-x-1.5 text-white/70 text-sm italic">
                          <span>{msg.content}</span>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      </div>
                    ) : renderMessageContent(msg)}
                    
                    {msg.author === 'ai' && msg.type === 'text' && !isLoading && (
                      <div className="absolute -top-3 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1A1A2E] p-1 rounded-md border border-[#2D2D4A]">
                          <button onClick={() => handleCopyText(msg.content)} title="Copy to Notes" className="p-1.5 text-white/70 hover:text-white">
                              <ClipboardIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSaveAsPdf(msg)} title="Save as PDF" className="p-1.5 text-white/70 hover:text-white">
                              <PdfIcon className="w-4 h-4" />
                          </button>
                      </div>
                    )}
                  </div>
                  {msg.citation && <p className="text-xs text-[#FF4D4D] mt-2 max-w-[85%] cursor-pointer hover:underline">{msg.citation}</p>}
                   
                   {msg.author === 'ai' && msg.showStudyAids && !isLoading && smartSummary && !smartSummary.isScanned && (
                      <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => handleStudyAid('flashcards')} className="text-xs bg-[#2D2D4A] text-white px-3 py-1.5 rounded-full hover:bg-[#4a4a6a] transition-all">🗂️ Generate Flashcards</button>
                          <button onClick={() => handleStudyAid('quiz')} className="text-xs bg-[#2D2D4A] text-white px-3 py-1.5 rounded-full hover:bg-[#4a4a6a] transition-all">❓ Create Quiz</button>
                          <button onClick={() => handleStudyAid('outline')} className="text-xs bg-[#2D2D4A] text-white px-3 py-1.5 rounded-full hover:bg-[#4a4a6a] transition-all">📋 Outline</button>
                          <button onClick={() => handleStudyAid('key-terms')} className="text-xs bg-[#2D2D4A] text-white px-3 py-1.5 rounded-full hover:bg-[#4a4a6a] transition-all">🔍 Extract Key Terms</button>
                      </div>
                   )}
                </div>
              ))}
          </div>
          <div className="p-4 flex-shrink-0 border-t border-[#2D2D4A] bg-[#1A1A2E]">
             <div className="flex justify-center items-center gap-4 mb-3">
                <span className="text-sm text-[#A0A0C0]">Answer Style:</span>
                <div className="flex items-center bg-[#252535] rounded-full p-0.5">
                    <button onClick={() => setAnswerStyle('simple')} className={`px-4 py-1 text-sm rounded-full transition-colors ${answerStyle === 'simple' ? 'bg-[#FF4D4D] text-white' : 'text-[#A0A0C0]'}`}>Simple</button>
                    <button onClick={() => setAnswerStyle('detailed')} className={`px-4 py-1 text-sm rounded-full transition-colors ${answerStyle === 'detailed' ? 'bg-[#FF4D4D] text-white' : 'text-[#A0A0C0]'}`}>Detailed</button>
                </div>
             </div>
             <div className="flex items-center space-x-2 bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-2 focus-within:ring-2 focus-within:ring-[#FF4D4D]">
               <button onClick={() => fileInputRef.current?.click()} title="Upload new file" className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-md bg-[#2D2D4A] text-[#A0A0C0] hover:bg-[#4a4a6a]"><PaperClipIcon className="w-5 h-5"/></button>
               <button onClick={handleMicClick} title="Voice input" className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-md bg-[#2D2D4A] text-[#A0A0C0] hover:bg-[#4a4a6a] ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}><MicrophoneIcon className="w-5 h-5"/></button>
               <input
                 type="text"
                 placeholder={smartSummary?.isScanned ? "Analysis is limited for scanned PDFs" : "Ask anything about your document..."}
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                 disabled={isLoading || !file || smartSummary?.isScanned}
                 className="flex-grow bg-transparent text-white placeholder-[#A0A0C0] focus:outline-none disabled:opacity-60"
               />
               <button onClick={() => handleSendMessage(userInput)} disabled={!userInput.trim() || isLoading || !file} className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] rounded-md text-white disabled:opacity-50 transition-opacity">
                 <SendIcon className="w-5 h-5"/>
               </button>
             </div>
             <p className="text-xs text-center text-[#6B6B8A] mt-2">PDFMaster AI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPage;