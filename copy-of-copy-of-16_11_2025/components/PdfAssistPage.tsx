import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Page, AiChatMessage, SmartSummaryData } from '../types';
import { extractTextWithOcr, getChatResponse, generateStructuredSummary } from '../services/geminiService';
import { CloseIcon } from './icons';

// Add declaration for jsPDF from the CDN script
declare const jspdf: any;

const InsightItem = ({ icon, label, value, valueColor = 'text-white' }: { icon: string, label: string, value: string, valueColor?: string }) => (
    <div className="bg-[#1A1A2E]/50 p-3 rounded-lg">
        <label className="text-sm text-[#A0A0C0] flex items-center">{icon} {label}</label>
        <p className={`text-base font-medium mt-1 ${valueColor}`}>{value}</p>
    </div>
);

const SmartSummaryCard: React.FC<{ summary: SmartSummaryData }> = ({ summary }) => (
    <div className="max-w-[800px] mx-auto p-5 bg-[#252535] border-l-[3px] border-[#FF4D4D] rounded-r-xl text-left animate-fade-in mb-6">
        <h3 className="text-white text-lg font-bold mb-1">🔍 AI Document Insights</h3>
        <p className="text-[#A0A0C0] text-sm mb-4">Here's a quick analysis of your document.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InsightItem icon="📄" label="Type" value={summary.documentType} />
            <InsightItem 
                icon="📅" 
                label="Key Dates" 
                value={summary.keyDates} 
                valueColor={summary.keyDates === 'N/A' ? 'text-[#A0A0C0]' : 'text-white'} 
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
    </div>
);

const PdfAssistPage: React.FC<{ onNavigate: (page: Page); autoUpload?: boolean }> = ({ onNavigate, autoUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [pdfText, setPdfText] = useState('');
    const [smartSummary, setSmartSummary] = useState<SmartSummaryData | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasTriggeredUpload = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (autoUpload && fileInputRef.current && !hasTriggeredUpload.current) {
            hasTriggeredUpload.current = true;
            fileInputRef.current.click();
        }
    }, [autoUpload]);

    const handleFileUpload = useCallback(async (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        const uploadedFile = selectedFiles[0];
        
        const supportedTypes = ['application/pdf'];
        if (!supportedTypes.includes(uploadedFile.type)) {
            setError('Unsupported file type. Please upload a PDF.');
            return;
        }
        if (uploadedFile.size > 20 * 1024 * 1024) { // 20MB limit
            setError('File size exceeds the 20MB limit for analysis.');
            return;
        }

        setFile(uploadedFile);
        setError(null);
        setIsLoading(true);
        setMessages([]);
        setSmartSummary(null);

        try {
            const text = await extractTextWithOcr(uploadedFile);
            setPdfText(text);

            if (text.trim().length < 100) {
                setError("❌ Couldn’t analyze this file. It appears to be scanned with no text or is empty. Try a text-based PDF.");
                setIsLoading(false);
                setFile(null); // Reset file state
                return;
            }

            const summary = await generateStructuredSummary(text, uploadedFile.name);
            setSmartSummary(summary);
            
            setMessages([{
                id: Date.now().toString(),
                author: 'ai',
                type: 'text',
                content: "✅ Analysis complete. You can now ask me anything about your document."
            }]);
        } catch (e) {
            console.error(e);
            setError("❌ Couldn’t analyze this file. It may be corrupted or password-protected.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSendMessage = async (query: string) => {
        const textToSend = query.trim();
        if (!textToSend || isLoading || !file) return;

        const newUserMessage: AiChatMessage = { id: Date.now().toString(), author: 'user', type: 'text', content: textToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), author: 'ai', type: 'thinking', content: 'Thinking...' }]);

        try {
            const responseText = await getChatResponse(textToSend, pdfText, file.name);
            const aiMessage: AiChatMessage = { id: (Date.now() + 2).toString(), author: 'ai', type: 'text', content: responseText };
            setMessages(prev => [...prev.slice(0, -1), aiMessage]);
        } catch (e) {
            const errorMessage: AiChatMessage = { id: (Date.now() + 2).toString(), author: 'ai', type: 'error', content: "❌ I'm sorry, I couldn't generate a response. Please try again." };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartFeatureClick = (type: 'summarize' | 'extract' | 'questions' | 'translate') => {
        const prompts = {
            summarize: "Summarize this document in three paragraphs.",
            extract: "Extract the key points from this document as a bulleted list.",
            questions: "Generate three insightful questions based on the content of this document.",
            translate: "Translate a summary of this document into Spanish."
        };
        handleSendMessage(prompts[type]);
    };

    const handleExport = () => {
        if (!file || messages.length === 0) return;
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
        let y = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`PDF Assist Summary — ${file.name}`, margin, y);
        y += 15;

        messages.forEach(msg => {
            if (msg.type === 'thinking') return;
            doc.setFont("helvetica", msg.author === 'user' ? "bold" : "normal");
            doc.setFontSize(11);
            doc.setTextColor(msg.author === 'user' ? '#4D4DFF' : '#000000');
            
            const prefix = msg.author === 'user' ? "You: " : "AI: ";
            const textLines = doc.splitTextToSize(prefix + msg.content, usableWidth);
            
            if (y + (textLines.length * 7) > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(textLines, margin, y);
            y += textLines.length * 7 + 5;
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor('#A0A0C0');
            doc.text(`Generated by PDFMaster.co`, margin, doc.internal.pageSize.getHeight() - 10);
        }

        doc.save(`PDF_Assist_Summary_${file.name}.pdf`);
    };

    const handleReset = () => {
        setFile(null);
        setMessages([]);
        setUserInput('');
        setError(null);
        setPdfText('');
        setSmartSummary(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.type === 'dragenter' || e.type === 'dragover' ? setIsDragging(true) : setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files);
        }
    };
    
    const renderCitation = (text: string) => {
        const parts = text.split(/(📄\s*Page\s*\d+:.*)/g);
        return parts.map((part, index) => {
            if (part.match(/📄\s*Page\s*\d+:.*/)) {
                return <span key={index} className="block mt-2 text-[#FF4D4D] font-medium text-sm">{part}</span>;
            }
            return part;
        });
    };

    return (
        <main className="bg-[#0F0F1A] flex-grow font-['Inter']">
            <input ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" accept=".pdf" />
            <div className="max-w-[900px] mx-auto px-5 md:px-10 py-10 md:py-16">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-white">PDF Assist</h1>
                    <p className="text-lg text-[#A0A0C0] mt-3">Upload any PDF. Ask anything. Get smart answers — no fluff.</p>
                </header>

                {!file && (
                    <div
                        className={`bg-[#1A1A2E] border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-[#FF4D4D] bg-[#1D1D35]' : 'border-[#2D2D4A]'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents}
                    >
                        <p className="text-5xl mb-4" role="img" aria-label="document">📄</p>
                        <p className="text-xl font-bold text-white">Drag & drop your PDF here</p>
                        <p className="text-sm text-[#A0A0C0] mt-1">or click to browse</p>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                )}
                
                {file && (
                    <>
                        <div className="bg-[#1A1A2E] rounded-xl p-4 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-2xl" role="img" aria-label="document">📄</span>
                                <div>
                                    <p className="text-white font-medium truncate">{file.name}</p>
                                    <p className="text-sm text-[#A0A0C0]">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={handleReset} className="text-white text-2xl hover:text-[#FF4D4D] flex-shrink-0 ml-4"><CloseIcon className="w-6 h-6"/></button>
                        </div>
                        
                        <div ref={messagesEndRef} className="space-y-4">
                             {isLoading && messages.length === 0 && (
                                <div className="text-center p-6 bg-[#1A1A2E] rounded-xl">
                                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[#FF6B6B] mx-auto"></div>
                                    <p className="mt-4 text-[#A0A0C0]">Analyzing your document...</p>
                                </div>
                            )}
                            {smartSummary && <SmartSummaryCard summary={smartSummary} />}

                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-2xl ${
                                        msg.author === 'user' 
                                        ? 'bg-[#4D4DFF] text-white rounded-br-none' 
                                        : msg.type === 'error'
                                        ? 'bg-[#252535] border border-red-500/30 text-red-300 rounded-bl-none'
                                        : 'bg-[#252535] text-white rounded-bl-none'
                                    }`}>
                                        {msg.type === 'thinking' ? (
                                            <div className="flex items-center space-x-1.5 text-white/70 text-sm italic">
                                                <span>Thinking</span>
                                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{renderCitation(msg.content as string)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="relative">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Ask anything about your document..."
                                    className="w-full h-12 bg-[#252535] rounded-xl border-none text-white placeholder:text-[#A0A0C0] pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D]"
                                    disabled={isLoading}
                                />
                                <button type="submit" className="absolute right-1 top-1 w-10 h-10 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] rounded-full flex items-center justify-center transition-transform hover:scale-105" disabled={isLoading || !userInput.trim()}>
                                    <span className="text-white text-xl">➡️</span>
                                </button>
                            </form>
                            <div className="flex justify-center flex-wrap gap-2 mt-4">
                                <button onClick={() => handleSmartFeatureClick('summarize')} className="bg-[#2D2D4A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#FF4D4D]" disabled={isLoading}>📝 Summarize</button>
                                <button onClick={() => handleSmartFeatureClick('extract')} className="bg-[#2D2D4A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#FF4D4D]" disabled={isLoading}>🗂️ Extract Key Points</button>
                                <button onClick={() => handleSmartFeatureClick('questions')} className="bg-[#2D2D4A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#FF4D4D]" disabled={isLoading}>❓ Generate Questions</button>
                                <button onClick={() => handleSmartFeatureClick('translate')} className="bg-[#2D2D4A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#FF4D4D]" disabled={isLoading}>🌐 Translate</button>
                            </div>
                        </div>
                    </>
                )}
                {messages.length > 0 && !isLoading && (
                     <div className="text-center mt-10">
                        <button onClick={handleExport} className="bg-transparent border border-[#2D2D4A] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:border-[#FF4D4D] hover:text-[#FF4D4D] transition-colors">
                            📥 Export Chat as PDF
                        </button>
                    </div>
                )}
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

export default PdfAssistPage;
