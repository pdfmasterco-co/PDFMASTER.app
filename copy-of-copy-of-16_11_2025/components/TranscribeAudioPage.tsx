import React, { useState, useRef } from 'react';
import type { Page } from '../types';
import { ChevronRightIcon, MicrophoneIcon, ClipboardIcon, RefreshIcon, InfoIcon, SparklesIcon, ListBulletIcon, TagIcon } from './icons';
import { transcribeAudio, analyzeTranscription } from '../services/geminiService';
import { allToolsData } from '../data/tools';


interface TranscribeAudioPageProps {
  onNavigate: (page: Page) => void;
}

const TranscribeAudioPage: React.FC<TranscribeAudioPageProps> = ({ onNavigate }) => {
  const tool = allToolsData.find(t => t.slug === 'transcribe-audio')!;
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'finished' | 'error'>('idle');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisType, setAnalysisType] = useState<'summary' | 'actions' | 'topics' | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


  const handleStartRecording = async () => {
    if (status === 'recording') return;
    handleReset();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setStatus('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          const result = await transcribeAudio(audioBlob);
          setTranscription(result);
          setStatus('finished');
        } catch (apiError: any) {
          setError(apiError.message || 'Failed to transcribe audio.');
          setStatus('error');
        }
      };

      mediaRecorderRef.current.start();
      setStatus('recording');

    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else {
        setError('Could not access microphone. Please check your browser permissions and try again.');
      }
      setStatus('error');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleReset = () => {
    setStatus('idle');
    setTranscription('');
    setError('');
    setCopySuccess('');
    setIsAnalyzing(false);
    setAnalysisResult('');
    setAnalysisType(null);
  };

  const handleAnalysis = async (type: 'summary' | 'actions' | 'topics') => {
    if (!transcription || isAnalyzing) return;
    
    setAnalysisType(type);
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    let prompt = '';
    switch(type) {
        case 'summary':
            prompt = 'Provide a concise, one-paragraph summary of the following text:';
            break;
        case 'actions':
            prompt = 'Extract all action items from the following text and list them as bullet points. If no action items are found, state "No action items identified."';
            break;
        case 'topics':
            prompt = 'Identify and list the main topics discussed in the following text as a comma-separated list.';
            break;
    }
    
    try {
        const result = await analyzeTranscription(transcription, prompt);
        setAnalysisResult(result);
    } catch (err: any) {
        setAnalysisResult(`Error: ${err.message || 'Failed to analyze text.'}`);
    } finally {
        setIsAnalyzing(false);
    }
};

  const renderContent = () => {
    switch(status) {
      case 'idle':
        return (
          <div className="text-center">
            <p className="text-[#A0A0C0] mb-8">Click the button below to start recording audio from your microphone.</p>
            <button
              onClick={handleStartRecording}
              title="Start recording"
              className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-bold py-4 px-10 rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105 flex items-center mx-auto"
            >
              <MicrophoneIcon className="w-6 h-6 mr-3" />
              Start Recording
            </button>
          </div>
        );
      case 'recording':
        return (
          <div className="text-center">
             <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                <MicrophoneIcon className="w-10 h-10 text-white" />
             </div>
             <p className="text-white text-lg font-semibold mb-6">Recording...</p>
             <button
              onClick={handleStopRecording}
              title="Stop recording"
              className="bg-white text-[#FF4D4D] font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              Stop Recording
            </button>
          </div>
        );
      case 'processing':
        return (
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#FF6B6B] mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-white">Transcribing with AI...</h3>
                <p className="text-[#A0A0C0] mt-2">Please wait, this may take a moment.</p>
            </div>
        );
      case 'finished':
      case 'error':
        return (
            <div className="animate-fade-in w-full">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-4 text-center">
                        <p className="font-semibold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-white mb-3">Your Transcription:</h3>
                        <textarea
                            readOnly
                            value={transcription}
                            className="w-full h-48 bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-3 text-white placeholder:text-[#A0A0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all resize-none"
                            placeholder="Transcription result will appear here..."
                        />
                        <div className="flex items-center justify-end mt-3 gap-3">
                            <span className="text-sm text-green-400 transition-opacity duration-300">{copySuccess}</span>
                            <button onClick={handleCopy} title="Copy transcription to clipboard" className="flex items-center text-[#A0A0C0] hover:text-white transition-colors text-sm font-medium">
                                <ClipboardIcon className="w-5 h-5 mr-1.5" />
                                Copy Text
                            </button>
                        </div>
                         {transcription && (
                            <div className="mt-6 pt-6 border-t border-[#2D2D4A]">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2 text-[#FF6B6B]" />
                                    AI Analysis
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <button onClick={() => handleAnalysis('summary')} disabled={isAnalyzing} title="Generate a summary" className="flex items-center bg-[#2D2D4A] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#4a4a6a] transition-colors disabled:opacity-50"> <SparklesIcon className="w-4 h-4 mr-2"/> Summarize</button>
                                    <button onClick={() => handleAnalysis('actions')} disabled={isAnalyzing} title="Extract action items" className="flex items-center bg-[#2D2D4A] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#4a4a6a] transition-colors disabled:opacity-50"> <ListBulletIcon className="w-4 h-4 mr-2"/> Action Items</button>
                                    <button onClick={() => handleAnalysis('topics')} disabled={isAnalyzing} title="Identify main topics" className="flex items-center bg-[#2D2D4A] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#4a4a6a] transition-colors disabled:opacity-50"> <TagIcon className="w-4 h-4 mr-2"/> Extract Topics</button>
                                </div>

                                {(isAnalyzing || analysisResult) && (
                                    <div className="bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-3 min-h-[6rem]">
                                        {isAnalyzing ? (
                                             <div className="flex items-center justify-center h-full">
                                                <div className="flex items-center space-x-1 text-[#A0A0C0]">
                                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
                                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
                                                    <span className="ml-2 text-sm">Analyzing...</span>
                                                </div>
                                             </div>
                                        ) : (
                                            <p className="text-white whitespace-pre-wrap text-sm">{analysisResult}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                 <div className="mt-8 text-center">
                    <button onClick={handleReset} title="Start a new transcription" className="flex items-center mx-auto text-white bg-[#2D2D4A] hover:bg-[#4a4a6a] transition-colors font-semibold py-2.5 px-6 rounded-lg">
                        <RefreshIcon className="w-5 h-5 mr-2" />
                        Transcribe Another
                    </button>
                </div>
            </div>
        );
    }
  }

  return (
    <main className="flex-grow">
      <div className="max-w-[800px] mx-auto px-5 py-10">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('all-tools'); }} className="hover:text-[#FF6B6B] transition-colors">Tools</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">{tool.name}</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {tool.pageTitle || tool.name}
          </h1>
          <p className="text-base sm:text-lg text-[#A0A0C0] max-w-3xl mx-auto mt-4">
            {tool.pageDescription || tool.description}
          </p>
        </div>

        <div className="bg-[#1A1A2E] p-8 rounded-xl border border-[#2D2D4A] min-h-[20rem] flex items-center justify-center">
          {renderContent()}
        </div>
        
        <div className="flex items-center mt-6 text-xs text-[#A0A0C0] bg-[#1A1A2E]/50 border border-[#2D2D4A] rounded-lg p-3" title="Important Information">
            <InfoIcon className="w-8 h-8 mr-3 flex-shrink-0" />
            <span>Your audio is processed securely and is not stored on our servers. For best results, speak clearly and minimize background noise.</span>
        </div>

      </div>
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.4s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
};

export default TranscribeAudioPage;