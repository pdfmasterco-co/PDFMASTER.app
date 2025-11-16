import React from 'react';
import FaqAccordion from './FaqAccordion';

const faqData = [
  {
    question: "Are PDFMaster.co tools really free?",
    answer: "Yes! All basic PDF tools are 100% free with no hidden fees. We offer Pro plans for advanced features like batch processing and AI analysis."
  },
  {
    question: "Do I need to sign up to use the tools?",
    answer: "No registration required for basic tools. Just upload your file and go. Sign up only if you want to save files or use AI features."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All files are encrypted in transit and deleted from our servers within 10 seconds of processing. We never store or share your documents."
  },
  {
    question: "What file types do you support?",
    answer: "PDF, DOCX, XLSX, PPTX, JPG, PNG, and MP3. For best results, keep files under 10MB (100MB for Pro users)."
  },
  {
    question: "Why is my converted file different from the original?",
    answer: "Complex layouts (e.g., textbooks, scanned PDFs) may lose some formatting. Use 'PDF to Word (Preserve Layout)' for better results, or try our AI Chat to extract clean text."
  },
  {
    question: "How does the AI Chat work?",
    answer: "Upload a PDF, and our Gemini-powered AI reads it to answer questions, summarize content, or generate study aids. All processing happens securely in Google Cloud."
  },
];

const Faq: React.FC = () => {
  return (
    <section className="bg-[#0F0F1A] py-16 md:py-20">
      <div className="max-w-[1000px] mx-auto px-5 md:px-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-lg text-[#A0A0C0] mt-4 max-w-2xl mx-auto">
            Find answers to common questions about using our tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {faqData.map((item, index) => (
            <FaqAccordion key={index} title={item.question}>
              <p>{item.answer}</p>
            </FaqAccordion>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;