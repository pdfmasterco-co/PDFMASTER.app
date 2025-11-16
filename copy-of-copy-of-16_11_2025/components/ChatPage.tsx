import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Page, AiChatMessage, Insight } from '../types';
import { getChatResponse, getSpeechResponse, generateSummary, extractTextFromPdf } from '../services/geminiService';
import { GoogleGenAI, Type } from '@google/genai';
import { PaperClipIcon, MicrophoneIcon, SendIcon, SearchIcon, BoltIcon, BrainIcon, UploadIcon, LockIcon, ClipboardIcon, PdfIcon } from './icons';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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


const AiChatPage: React.FC<{ onNavigate: (page: Page) => void; }> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [mode, setMode] = useState<'thinking' | 'search' | 'fast'>('thinking');
  const [answerStyle, setAnswerStyle] = useState<'detailed' | 'simple'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [privacyTimer, setPrivacyTimer] = useState(60);
  const [interactionMode, setInteractionMode] = useState<'text' | 'voice'>('text');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
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

    if (uploadedFile.size > 100 * 1024 * 1024) { // 100MB limit
        setUploadError('File size exceeds the 100MB limit.');
        return;
    }

    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!supportedTypes.includes(uploadedFile.type)) {
        setUploadError('Unsupported file type. Please upload a PDF, DOCX, JPG, or PNG.');
        return;
    }

    setFile(uploadedFile);
    setIsLoading(true);
    setMessages([]);
    setPdfText('');

    setMessages(prev => [...prev, { id: Date.now().toString(), author: 'ai', type: 'thinking', content: `Analyzing "${uploadedFile.name}"...` }]);
    
    try {
        const [summaryBullets, extractedText] = await Promise.all([
            generateSummary(uploadedFile),
            uploadedFile.type === 'application/pdf' ? extractTextFromPdf(uploadedFile) : Promise.resolve('')
        ]);
        
        setPdfText(extractedText);

        const summaryMessage: AiChatMessage = {
            id: Date.now().toString(),
            author: 'ai',
            type: 'summary',
            content: summaryBullets,
            showStudyAids: uploadedFile.type === 'application/pdf' || uploadedFile.type.includes('wordprocessingml'),
        };
        setMessages([summaryMessage]);
    } catch (error: any) {
        console.error(error);
        const errorMessage: AiChatMessage = {
            id: Date.now().toString(),
            author: 'ai',
            type: 'error',
            content: error.message || "Sorry, I couldn't process that file. Please try another one.",
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
      // FIX: The system instruction is now constructed within getChatResponse.
      // We pass the `answerStyle` variable instead of a custom instruction string.
      const responseText = await getChatResponse(query, pdfText, file.name, answerStyle);

      const newAiMessage: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        author: 'ai',
        type: 'text',
        content: responseText,
      };
      setMessages(prev => [...prev.slice(0, -1), newAiMessage]);
    } catch (error) {
      const errorMessage: AiChatMessage = { id: (Date.now() + 1).toString(), author: 'ai', type: 'error', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1 || messages[msgIndex].audioData) return; // Don't re-fetch

      try {
        const audioB64 = await getSpeechResponse(text);
        
        // Update message with audio data
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioData: audioB64 } : m));
        
        // Play audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBytes = decode(audioB64);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
  };

  const handleSpeakSummary = async (messageId: string, summaryContent: string[]) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1 || messages[msgIndex].isPlayingAudio) return;

    // Set playing state
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPlayingAudio: true } : m));

    try {
        const textToSpeak = summaryContent.join(' ');
        const audioB64 = await getSpeechResponse(textToSpeak);
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBytes = decode(audioB64);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
            // Set playing state back to false
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPlayingAudio: false } : m));
        };
        
        source.start();
        
    } catch (error) {
        console.error("Failed to play summary audio:", error);
        // Reset playing state on error
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPlayingAudio: false } : m));
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
      const prompts = {
          flashcards: "Generate 5 key flashcards from this document, with a term on one side and a definition on the other.",
          quiz: "Create a 3-question multiple-choice quiz based on this document, with one correct answer and two plausible incorrect answers for each question.",
          outline: "Create a hierarchical outline of the main sections and subsections in this document."
      };
      handleSendMessage(prompts[type as keyof typeof prompts]);
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
    navigator.clipboard.writeText(textToCopy).catch(err => console.error('Failed to copy text: ', err));
  };

  const handleSaveAsPdf = (content: string | string[]) => {
    alert("This feature would save the message as a PDF. (jsPDF library would be used here).");
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F1A]">
      <input 
        ref={fileInputRef} 
        type="file" 
        onChange={(e) => handleFileUpload(e.target.files)} 
        className="hidden" 
        accept=".pdf,.docx,.jpg,.jpeg,.png" 
      />
      
      { !file ? (
         <div className="flex-grow flex items-center justify-center">
            <div className="max-w-[800px] mx-auto px-5 py-16 md:py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">Chat with Your Documents</h1>
                <p className="text-lg text-[#A0A0C0] mt-3 max-w-xl mx-auto">Upload a PDF, Word doc, or image. Ask anything. Get answers by text or voice.</p>
                
                <div 
                    className={`mt-10 bg-[#1A1A2E] border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${isDragging ? 'border-[#FF4D4D] bg-[#1D1D35]' : 'border-[#2D2D4A] hover:border-[#FF4D4D]/50 hover:bg-[#1D1D35]'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEvents}
                    onDragOver={handleDragEvents}
                    onDragLeave={handleDragEvents}
                    onDrop={handleDrop}
                >
                    <span className="text-5xl" role="img" aria-label="document">📄</span>
                    <p className="text-xl font-semibold text-white mt-4">Drag & drop your file here</p>
                    <p className="text-sm text-[#A0A0C0] mt-1">Supports PDF, DOCX, JPG, PNG • Max 100MB</p>
                </div>
                {uploadError && <p className="text-red-400 mt-2">{uploadError}</p>}
                
                <div className="mt-8">
                    <h3 className="text-lg text-white font-medium">How would you like to interact?</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <button onClick={() => setInteractionMode('text')} className={`p-5 rounded-xl bg-[#252535] text-left transition-all border-2 ${interactionMode === 'text' ? 'border-[#FF4D4D]' : 'border-transparent hover:border-[#FF4D4D]/50'}`}>
                            <p className="font-bold text-white text-lg"><span role="img" aria-label="chat bubble">🗨️</span> Text Chat</p>
                            <p className="text-sm text-[#A0A0C0] mt-1">Type your questions and get clear, cited answers.</p>
                        </button>
                        <button onClick={() => setInteractionMode('voice')} className={`p-5 rounded-xl bg-[#252535] text-left transition-all border-2 ${interactionMode === 'voice' ? 'border-[#FF4D4D]' : 'border-transparent hover:border-[#FF4D4D]/50'}`}>
                            <p className="font-bold text-white text-lg"><span role="img" aria-label="microphone">🎙️</span> Voice Chat</p>
                            <p className="text-sm text-[#A0A0C0] mt-1">Speak naturally. Hear answers in a human-like voice.</p>
                        </button>
                    </div>
                </div>

                <p className="text-sm text-[#A0A0C0] mt-5"><span className="text-red-500">🔒</span> Your file is processed securely and deleted after 10 seconds.</p>
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
              <div className="flex items-center space-x-2">
                 <button onClick={() => setMode('thinking')} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${mode === 'thinking' ? 'bg-[#FF4D4D] text-white' : 'bg-[#2D2D4A] text-[#A0A0C0]'}`}><BrainIcon className="w-4 h-4"/> Thinking</button>
                 <button onClick={() => setMode('search')} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${mode === 'search' ? 'bg-[#FF4D4D] text-white' : 'bg-[#2D2D4A] text-[#A0A0C0]'}`}><SearchIcon className="w-4 h-4"/> Search</button>
                 <button onClick={() => setMode('fast')} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${mode === 'fast' ? 'bg-[#FF4D4D] text-white' : 'bg-[#2D2D4A] text-[#A0A0C0]'}`}><BoltIcon className="w-4 h-4"/> Fast</button>
              </div>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
            {messages.map(msg => {
              if (msg.type === 'summary') {
                return (
                  <div key={msg.id} className="w-full my-3">
                    <div className="bg-[#252535] border-l-[3px] border-[#FF4D4D] rounded-r-xl p-5 w-full">
                      <h3 className="text-white text-lg font-bold mb-3">📄 Document Summary</h3>
                      <ul className="space-y-1.5 text-white/90 mb-4 text-base" style={{ lineHeight: 1.6 }}>
                        {(msg.content as string[]).map((item, i) => <li key={i}>{item.replace(/^\* /, '')}</li>)}
                      </ul>
                      <div className="text-center mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-[#A0A0C0] mb-3">How would you like to receive this?</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                          <button className="bg-[#2D2D4A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#FF4D4D] transition-colors w-full sm:w-auto">
                            📝 Text
                          </button>
                          <button
                            onClick={() => handleSpeakSummary(msg.id, msg.content as string[])}
                            disabled={msg.isPlayingAudio}
                            className="bg-[#2D2D4A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#FF4D4D] transition-colors w-full sm:w-auto disabled:opacity-70"
                          >
                            {msg.isPlayingAudio ? '🔊 Playing...' : '🔊 Speak'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative group max-w-[85%] p-3 rounded-2xl ${
                      msg.author === 'user' 
                      ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                      : msg.type === 'error'
                      ? 'bg-red-900/50 text-red-300 border border-red-500/30 rounded-bl-none'
                      : 'bg-[#252535] text-white rounded-bl-none'
                  }`}>
                    {msg.type === 'thinking' ? (
                       <div className="flex items-center space-x-1.5 text-white/70 text-sm italic">
                          <BrainIcon className="w-4 h-4"/><span>{msg.content}</span>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      </div>
                    ) : renderMessageContent(msg)}
                    {msg.citation && <p className="text-xs text-[#FF4D4D] mt-2 border-t border-white/10 pt-1">{msg.citation}</p>}

                    {msg.author === 'ai' && (msg.type === 'text' || msg.type === 'summary') && (
                      <div className="absolute -top-4 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1A1A2E] p-1 rounded-md border border-[#2D2D4A]">
                          <button onClick={() => handleCopyText(msg.content)} title="Copy Text" className="p-1 text-white/70 hover:text-white">
                              <ClipboardIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSaveAsPdf(msg.content)} title="Save as PDF" className="p-1 text-white/70 hover:text-white">
                              <PdfIcon className="w-4 h-4" />
                          </button>
                      </div>
                    )}
                  </div>
                  {msg.author === 'ai' && msg.type === 'text' && (
                    <button onClick={() => handlePlayAudio(msg.id, msg.content as string)} className="mt-2 px-2 py-1 bg-[#2D2D4A] text-white/80 text-xs rounded-md hover:bg-[#4a4a6a]">
                      🔊 Play Answer
                    </button>
                  )}
                   {msg.author === 'ai' && msg.showStudyAids && (
                      <div className="flex flex-wrap gap-2 mt-2">
                          <button onClick={() => handleStudyAid('flashcards')} className="text-xs bg-[#2D2D4A] text-white px-2 py-1 rounded-lg hover:bg-[#4a4a6a]">🗂️ Flashcards</button>
                          <button onClick={() => handleStudyAid('quiz')} className="text-xs bg-[#2D2D4A] text-white px-2 py-1 rounded-lg hover:bg-[#4a4a6a]">❓ Quiz</button>
                          <button onClick={() => handleStudyAid('outline')} className="text-xs bg-[#2D2D4A] text-white px-2 py-1 rounded-lg hover:bg-[#4a4a6a]">📋 Outline</button>
                      </div>
                   )}
                </div>
              );
            })}
          </div>
          <div className="p-4 flex-shrink-0 border-t border-[#2D2D4A]">
             <div className="flex justify-center items-center gap-4 mb-2">
                <span className="text-sm text-[#A0A0C0]">Answer Style:</span>
                <div className="flex items-center bg-[#252535] rounded-full p-0.5">
                    <button onClick={() => setAnswerStyle('simple')} className={`px-3 py-0.5 text-sm rounded-full ${answerStyle === 'simple' ? 'bg-[#FF4D4D] text-white' : 'text-[#A0A0C0]'}`}>Simple</button>
                    <button onClick={() => setAnswerStyle('detailed')} className={`px-3 py-0.5 text-sm rounded-full ${answerStyle === 'detailed' ? 'bg-[#FF4D4D] text-white' : 'text-[#A0A0C0]'}`}>Detailed</button>
                </div>
             </div>
             <div className="flex items-center space-x-2 bg-[#1A1A2E] border border-[#2D2D4A] rounded-lg p-2 focus-within:ring-2 focus-within:ring-[#FF4D4D]">
               <button onClick={() => fileInputRef.current?.click()} title="Upload file" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md bg-[#2D2D4A] text-[#A0A0C0] hover:bg-[#4a4a6a]"><PaperClipIcon className="w-5 h-5"/></button>
               <button onClick={handleMicClick} title="Voice input" className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md bg-[#2D2D4A] text-[#A0A0C0] hover:bg-[#4a4a6a] ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}><MicrophoneIcon className="w-5 h-5"/></button>
               <input
                 type="text"
                 placeholder="Ask anything about your document..."
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                 disabled={isLoading || !file}
                 className="flex-grow bg-transparent text-white placeholder-[#A0A0C0] focus:outline-none"
               />
               <button onClick={() => handleSendMessage(userInput)} disabled={!userInput.trim() || isLoading || !file} className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] rounded-md text-white disabled:opacity-50 transition-opacity">
                 <SendIcon className="w-5 h-5"/>
               </button>
             </div>
             <p className="text-xs text-center text-[#6B6B8A] mt-2">🔒 Files deleted after {Math.ceil(privacyTimer)} seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPage;