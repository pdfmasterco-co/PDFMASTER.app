import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Page, ChatMessage, MessageAuthor } from '../types';
import { detectPdfTool, processFileWithPdfCo } from '../services/geminiService';
import { UploadIcon, SendIcon, TrashIcon } from './icons';
import { useRewards } from '../contexts/RewardsContext';

type ToolRequestState = {
  tool: string;
  args: any;
  needsFiles: number;
} | null;

const AiPdfDashboard: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { author: MessageAuthor.AI, text: "Hello! I'm your smart PDF assistant. Tell me what you'd like to do (e.g., 'merge two PDFs', 'compress my file', or 'add a password')." }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [toolRequest, setToolRequest] = useState<ToolRequestState>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addPoints } = useRewards();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // When files are uploaded and they meet the requirement, process them.
        if (toolRequest && uploadedFiles.length >= toolRequest.needsFiles) {
            handleProcessFiles();
        }
    }, [uploadedFiles, toolRequest]);

    const handleSendMessage = async () => {
        if (!input.trim() || isProcessing) return;
        const userInput = input.trim();
        setInput('');

        setMessages(prev => [...prev, { author: MessageAuthor.USER, text: userInput }]);
        setIsProcessing(true);

        const detectedTool = await detectPdfTool(userInput);

        if (detectedTool) {
            setToolRequest(detectedTool);
            setUploadedFiles([]); // Clear previous files for the new request
            setMessages(prev => [...prev, { author: MessageAuthor.AI, text: detectedTool.message }]);
            // The UI will now show the upload button
        } else {
            setMessages(prev => [...prev, { author: MessageAuthor.AI, text: "Sorry, I'm not sure how to help with that. Please try rephrasing, for example: 'I want to merge two PDFs'." }]);
        }
        setIsProcessing(false);
    };
    
    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles && toolRequest) {
            const newFiles = Array.from(selectedFiles);
            setUploadedFiles(prev => [...prev, ...newFiles]);
            const remaining = toolRequest.needsFiles - (uploadedFiles.length + newFiles.length);
            if (remaining > 0) {
                 setMessages(prev => [...prev, { author: MessageAuthor.SYSTEM, text: `Got it. Please upload ${remaining} more file(s).` }]);
            }
        }
    };

    const handleProcessFiles = async () => {
        if (!toolRequest) return;
        
        setIsProcessing(true);
        setMessages(prev => [...prev, { author: MessageAuthor.SYSTEM, text: `Processing ${uploadedFiles.length} file(s) with the ${toolRequest.tool} tool... This may take a moment.` }]);

        try {
            const resultUrl = await processFileWithPdfCo(toolRequest.tool, uploadedFiles, toolRequest.args);
            const successMessage = `✅ Success! Your file is ready. <a href="${resultUrl}" target="_blank" rel="noopener noreferrer" class="font-bold text-[#FF6B6B] underline">Click here to download</a>.`;
            setMessages(prev => [...prev, { author: MessageAuthor.AI, text: successMessage }]);
            addPoints(15, `PDF.co ${toolRequest.tool}`);
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { author: MessageAuthor.AI, text: `Sorry, an error occurred: ${error.message}` }]);
        } finally {
            setIsProcessing(false);
            setToolRequest(null);
            setUploadedFiles([]);
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

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (toolRequest) {
            e.type === 'dragenter' || e.type === 'dragover' ? setIsDragging(true) : setIsDragging(false);
        }
    };

    return (
        <main className="flex-grow flex flex-col bg-[#0F0F1A] p-4 md:p-6 lg:p-8 animate-fade-in">
            <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
            <div className="max-w-3xl mx-auto w-full h-full flex flex-col bg-[#1A1A2E] rounded-xl border border-[#2D2D4A]">
                <header className="flex-shrink-0 p-4 border-b border-[#2D2D4A] text-center">
                    <h1 className="text-xl font-bold text-white">Smart PDF Assistant</h1>
                </header>

                <div className="flex-grow p-4 space-y-4 overflow-y-auto" ref={messagesEndRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.author === MessageAuthor.SYSTEM ? 'justify-center' : (msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start')} w-full`}>
                             {msg.author === MessageAuthor.SYSTEM ? (
                                <p className="text-xs text-center text-[#A0A0C0] italic">{msg.text}</p>
                             ) : (
                                <div className={`max-w-[90%] md:max-w-[80%] p-3 rounded-2xl ${
                                  msg.author === MessageAuthor.USER 
                                  ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                                  : 'bg-[#2D2D4A] text-white rounded-bl-none'
                                }`}>
                                  <p className="whitespace-pre-wrap text-base" dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                                </div>
                             )}
                        </div>
                    ))}
                    {isProcessing && (
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
                </div>
                
                {toolRequest && (
                     <div 
                        className="flex-shrink-0 p-4 border-t border-[#2D2D4A]"
                        onDrop={handleDrop} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents}
                     >
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center ${ isDragging ? 'border-[#FF4D4D] bg-[#FF4D4D]/10' : 'border-[#2D2D4A]' }`}
                        >
                            <UploadIcon className="w-8 h-8 mx-auto text-[#A0A0C0] mb-2" />
                            <p className="font-semibold text-white">
                                {uploadedFiles.length > 0 ? `Uploaded ${uploadedFiles.length} file(s). Add more or drop here.` : 'Click or drop files here'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex-shrink-0 p-4 border-t border-[#2D2D4A]">
                    <div className="flex items-center bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-[#FF6B6B]">
                       <input
                         type="text"
                         placeholder="What would you like to do?"
                         value={input}
                         onChange={e => setInput(e.target.value)}
                         onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                         disabled={isProcessing || !!toolRequest}
                         className="w-full bg-transparent text-white placeholder-[#A0A0C0] focus:outline-none p-2"
                       />
                       <button onClick={handleSendMessage} disabled={!input.trim() || isProcessing || !!toolRequest} className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] rounded-md text-white disabled:opacity-50 transition-opacity">
                         <SendIcon className="w-5 h-5"/>
                       </button>
                    </div>
                </div>
            </div>
             <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
};

export default AiPdfDashboard;
