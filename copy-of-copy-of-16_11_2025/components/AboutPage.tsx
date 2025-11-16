import React from 'react';
import { ChevronRightIcon, LockIcon, DollarSignSlashIcon, CheckIcon } from './icons';
import { Page } from '../types';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const teamMembers = [
    { name: 'Alex', role: 'Founder' },
    { name: 'Taylor', role: 'Lead Engineer' },
    { name: 'Jordan', role: 'Product Designer' },
  ];

  const values = [
    {
      icon: LockIcon,
      title: 'Privacy First',
      description: 'Your files are never stored. Everything is processed in-browser or deleted from our servers after 1 hour.',
    },
    {
      icon: DollarSignSlashIcon,
      title: '100% Free',
      description: 'Our core tools will always be free. No hidden fees. No forced upgrades. No watermarks.',
    },
    {
      icon: CheckIcon,
      title: 'Open & Honest',
      description: 'We believe in simplicity and transparency. We’ll never sell your data or trick you with intrusive ads.',
    },
  ];

  return (
    <main className="flex-grow">
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        {/* Breadcrumb & Header */}
        <div className="text-center mb-16">
          <nav className="flex items-center justify-center text-sm text-[#A0A0C0] mb-8">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#FF6B6B] transition-colors">Home</a>
            <ChevronRightIcon className="w-4 h-4 mx-1" />
            <span className="text-white font-medium">About</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-white">About PDFMASTER.CO</h1>
          <p className="text-lg text-[#A0A0C0] mt-4 max-w-3xl mx-auto">
            We’re on a mission to make PDFs simple, free, and accessible for everyone.
          </p>
        </div>

        {/* Mission Section */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Why We Built PDFMaster</h2>
            <p className="text-base text-[#A0A0C0] leading-relaxed text-center">
              In 2023, our founders struggled with clunky, expensive PDF tools that required downloads, registrations, or left ugly watermarks on finished work. Frustrated, we decided to build the solution we wished existed.
              <br /><br />
              The result is PDFMASTER.CO — a 100% free, no-signup, web-based toolkit that just works. Today, millions of students, professionals, and businesses trust us to handle their PDF needs securely and instantly, right from their browser.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Meet the Team</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#1A1A2E] border-2 border-[#2D2D4A] mx-auto mb-3"></div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-[#A0A0C0]">{member.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-base text-[#A0A0C0] mt-8 max-w-lg mx-auto">
            We’re a small, remote team passionate about privacy and building simple, powerful tools for everyone.
          </p>
        </section>
        
        {/* Values Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-[#1A1A2E] p-6 rounded-xl border border-[#2D2D4A] text-center">
                  <Icon className="w-8 h-8 text-[#FF6B6B] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-[#A0A0C0]">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B]">
        <div className="max-w-[1000px] mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to simplify your PDF workflow?</h2>
          <button
            onClick={() => onNavigate('all-tools')}
            className="mt-6 bg-white text-[#FF4D4D] font-bold py-3 px-8 rounded-lg
                       shadow-lg hover:shadow-2xl hover:bg-gray-100
                       transition-all duration-300 ease-in-out transform hover:scale-103"
          >
            Try All Tools Free
          </button>
        </div>
      </section>

    </main>
  );
};

export default AboutPage;