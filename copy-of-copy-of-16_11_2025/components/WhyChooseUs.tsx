import React from 'react';

const cardData = [
  {
    icon: '👥',
    title: 'People Trust Us',
    text: 'Over 1 billion users have used our service to simplify their work with digital documents.',
  },
  {
    icon: '⭐',
    title: 'Businesses Trust Us',
    text: 'Rated #1 on Capterra, G2, and TrustPilot for PDF tools.',
  },
  {
    icon: '🌐',
    title: 'Our Partners Trust Us',
    text: 'Integrated with Google Workspace, Dropbox, and Chrome — all free.',
  },
  {
    icon: '💬',
    title: '24/7 Customer Support',
    text: 'Get help anytime with our round-the-clock support team.',
  },
  {
    icon: '🔒',
    title: '256-Bit TLS Encryption',
    text: 'All files are protected with military-grade encryption in transit.',
  },
  {
    icon: '🛡️',
    title: 'Security Certified',
    text: 'ISO/IEC 27001 certified and GDPR/CCPA compliant.',
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-[#0F0F1A] py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose PDFMASTER.CO</h2>
          <p className="text-lg text-[#A0A0C0] mt-3 max-w-2xl mx-auto">
            Trusted by millions for fast, secure, and free PDF tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardData.map((card, index) => (
            <div
              key={index}
              title={card.title}
              className="bg-[#1A1A2E] p-6 rounded-xl border border-[#2D2D4A]
                         h-full flex flex-col items-center text-center
                         transition-all duration-250 ease-in-out
                         hover:scale-102 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,77,77,0.15)]"
            >
              <div className="text-3xl mb-4" role="img" aria-label={`${card.title} icon`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-[#A0A0C0] mt-2 flex-grow">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;