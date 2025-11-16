import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, SendIcon } from './icons';
import { getChatResponse, getSpeechResponse } from '../services/geminiService';

interface Message {
  author: 'user' | 'ai';
  text: string;
}

// Audio decoding helpers
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


const HomepageChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { author: 'ai', text: "👋 Hi! I'm PDFMaster AI. Ask me anything — about PDFs, documents, or general knowledge!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'processing'>('idle');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMessage: Message = { author: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(query);
      const aiMessage: Message = { author: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = { author: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setMicStatus('idle');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setMicStatus('listening');
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      setMicStatus('idle');
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let errorMessageText = 'An unknown error occurred during speech recognition.';
      if (event.error === 'network') {
          errorMessageText = 'Speech recognition failed due to a network error. Please check your internet connection.';
      } else if (event.error === 'no-speech') {
          errorMessageText = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
          errorMessageText = 'Could not start audio capture. Please ensure your microphone is working correctly.';
      } else if (event.error === 'not-allowed') {
          errorMessageText = 'Microphone access was denied. Please allow microphone access in your browser settings.';
      }
      const errorMessage: Message = { author: 'ai', text: errorMessageText };
      setMessages(prev => [...prev, errorMessage]);
      setIsRecording(false);
      setMicStatus('idle');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMicStatus('processing');
      setInput(transcript);
      handleSend(transcript);
    };

    recognitionRef.current.start();
  };

  const handlePlayAudio = async (text: string) => {
    try {
      const audioB64 = await getSpeechResponse(text);
      if (!audioB64) {
        throw new Error("API returned empty audio data.");
      }
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBytes = decode(audioB64);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Failed to play audio:", error);
      alert("Sorry, I was unable to generate audio for this response.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };
  
  const micButtonLabel = micStatus === 'listening' ? "Listening..." : "Speak your question";
  
  return (
    <div className="max-w-[800px] mx-auto px-5 md:px-0">
      <div className="bg-[#1A1A2E] rounded-2xl p-6 shadow-lg border border-[#2D2D4A]">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-white text-xl font-bold">Ask PDFMaster AI Anything</h2>
          <p className="text-[#A0A0C0] text-sm mt-1">Type or speak your question. Get answers by text or voice.</p>
        </div>

        {/* Chat Area */}
        <div className="bg-[#0F0F1A] rounded-lg p-3 max-h-[150px] md:max-h-52 overflow-y-auto mb-4 border border-[#2D2D4A]">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl ${
                    msg.author === 'user' 
                    ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                    : 'bg-[#252535] text-white rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
                {msg.author === 'ai' && !isLoading && (
                   <div className="flex items-center justify-start mt-2 gap-3">
                     <button className="text-xs text-white bg-[#2D2D4A] px-2 py-1 rounded-md">📝 Text</button>
                     <button onClick={() => handlePlayAudio(msg.text)} className="text-xs text-white bg-[#2D2D4A] px-2 py-1 rounded-md hover:bg-[#4a4a6a]">🔊 Speak Answer</button>
                   </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#252535] rounded-xl rounded-bl-none p-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMicClick}
            title={micButtonLabel}
            className={`relative w-12 h-12 md:w-9 md:h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-[#2D2D4A] text-white hover:bg-[#4a4a6a] transition-colors ${isRecording ? 'mic-active' : ''}`}
          >
            <MicrophoneIcon className="w-6 md:w-5 h-6 md:h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={micStatus === 'listening' ? "Listening..." : "Type or speak your question..."}
            className="w-full bg-[#252535] border border-[#2D2D4A] rounded-xl py-2 px-4 text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] rounded-full text-white disabled:opacity-50 transition-opacity"
          >
            <SendIcon className="w-5 h-5 -rotate-12" />
          </button>
        </form>

        {/* Trust Notice */}
        <p className="text-xs text-[#A0A0C0] text-center mt-3">🔒 Voice & text processed securely via Google Gemini. Auto-deleted after 10s.</p>
      </div>
      <style>{`
        .mic-active::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid #FF4D4D;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HomepageChatWidget;