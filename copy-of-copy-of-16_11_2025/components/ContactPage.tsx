import React, { useState } from 'react';
import { ChevronRightIcon, EmailIcon, ClockIcon, BookOpenIcon, TwitterIcon } from './icons';
import { Page } from '../types';

interface ContactPageProps {
  onNavigate: (page: Page) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    agree: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required.';
    if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters.';
    if (!formData.agree) newErrors.agree = 'You must agree to the privacy policy.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        onNavigate('thank-you');
      }, 1000);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <main className="flex-grow">
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        <nav className="flex items-center text-sm text-[#A0A0C0] mb-8">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
          <ChevronRightIcon className="w-4 h-4 mx-1" />
          <span className="text-white font-medium">Contact</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white">Get in Touch</h1>
          <p className="text-lg text-[#A0A0C0] mt-4 max-w-2xl mx-auto">
            Have questions, feedback, or need help? We’d love to hear from you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-[#1A1A2E] p-6 rounded-xl border border-[#2D2D4A]">
            <form onSubmit={handleSubmit} noValidate>
              {/* Honeypot field for spam protection */}
              <input type="text" name="honeypot" style={{ display: 'none' }} />

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-[#A0A0C0] mb-1">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full bg-[#0F0F1A] border ${errors.name ? 'border-[#FF4D4D]' : 'border-[#2D2D4A]'} rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]`} />
                {errors.name && <p className="text-xs text-[#FF4D4D] mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-[#A0A0C0] mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full bg-[#0F0F1A] border ${errors.email ? 'border-[#FF4D4D]' : 'border-[#2D2D4A]'} rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]`} />
                {errors.email && <p className="text-xs text-[#FF4D4D] mt-1">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-[#A0A0C0] mb-1">Subject</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-[#0F0F1A] border border-[#2D2D4A] rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]">
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Billing</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-[#A0A0C0] mb-1">Message</label>
                <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className={`w-full bg-[#0F0F1A] border ${errors.message ? 'border-[#FF4D4D]' : 'border-[#2D2D4A]'} rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]`}></textarea>
                {errors.message && <p className="text-xs text-[#FF4D4D] mt-1">{errors.message}</p>}
              </div>
              
              <div className="mb-6">
                <div className="flex items-start">
                  <input id="agree" name="agree" type="checkbox" checked={formData.agree} onChange={handleChange} required className={`h-4 w-4 mt-0.5 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF4D4D] bg-[#2D2D4A] border-[#2D2D4A]`} />
                  <label htmlFor="agree" className="ml-2 text-sm text-[#A0A0C0]">
                    I agree to the <a href="#" className="text-[#FF6B6B] hover:underline">Privacy Policy</a>.
                  </label>
                </div>
                {errors.agree && <p className="text-xs text-[#FF4D4D] mt-1">{errors.agree}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white font-semibold py-2.5 rounded-lg hover:scale-103 hover:brightness-95 transition-transform disabled:opacity-50 disabled:cursor-wait"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              <p className="text-xs text-[#6B6B8A] text-center mt-3">This site is protected by reCAPTCHA.</p>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <EmailIcon className="w-6 h-6 text-[#FF6B6B] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Support Email</h4>
                  <a href="mailto:support@pdfmaster.co" className="text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">support@pdfmaster.co</a>
                </div>
              </div>
              <div className="flex items-start">
                <ClockIcon className="w-6 h-6 text-[#FF6B6B] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Hours</h4>
                  <p className="text-[#A0A0C0]">Mon–Fri, 9AM–5PM UTC</p>
                </div>
              </div>
               <div className="flex items-start">
                <BookOpenIcon className="w-6 h-6 text-[#FF6B6B] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Help Center</h4>
                  <a href="#" className="text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">Visit our FAQ</a>
                </div>
              </div>
              <div className="flex items-start">
                <TwitterIcon className="w-6 h-6 text-[#FF6B6B] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Twitter</h4>
                  <a href="https://twitter.com/PDFMaster_co" target="_blank" rel="noopener noreferrer" className="text-[#A0A0C0] hover:text-[#FF6B6B] transition-colors">@PDFMaster_co</a>
                </div>
              </div>
            </div>
             <div className="mt-6 pt-6 border-t border-[#2D2D4A]">
                <p className="text-sm text-[#A0A0C0]">For security reasons, we do not accept file attachments via email.</p>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default ContactPage;