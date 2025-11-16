import React from 'react';
import { ChevronRightIcon } from './icons';
import Pricing from './Pricing';
import FaqAccordion from './FaqAccordion';
import { Page } from '../types';

interface PricingPageProps {
  onNavigate: (page: Page) => void;
}

const faqData = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, including Visa, Mastercard, and American Express, processed securely through Stripe. We do not store any of your card information."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your Pro or Business subscription at any time from your account dashboard. You will retain access to premium features until the end of your current billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day money-back guarantee on all new subscriptions. If you're not satisfied with our service, please contact our support team within 7 days of your purchase for a full refund."
    },
    {
      question: "What happens if I exceed my limits on the Free plan?",
      answer: "If you reach the daily limit of 5 PDF tasks on the Free plan, you will need to wait until the next day for your limit to reset. To get unlimited tasks, you can upgrade to our Pro plan at any time."
    }
];

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  return (
    <main className="flex-grow">
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">Pricing</span>
        </nav>
        
        <Pricing />

        <section className="py-16 md:py-20">
           <div className="max-w-[800px] mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
                <p className="text-base text-[#A0A0C0] mt-3">
                  Have questions? We've got answers.
                </p>
              </div>
              <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D4A]">
                {faqData.map((item, index) => (
                  <FaqAccordion key={index} title={item.question}>
                    <p>{item.answer}</p>
                  </FaqAccordion>
                ))}
              </div>
           </div>
        </section>

      </div>
    </main>
  );
};

export default PricingPage;