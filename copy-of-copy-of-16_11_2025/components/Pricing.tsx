import React from 'react';
import { CheckIcon } from './icons';
import { useRewards } from '../contexts/RewardsContext';

const plansData = [
  {
    title: 'Free',
    price: '$0',
    frequency: '/ month',
    features: [
      { text: '5 PDF tasks per day', included: true },
      { text: 'Access to 10 basic tools', included: true },
      { text: 'Standard processing speed', included: true },
      { text: 'Community support', included: true },
    ],
    buttonText: 'Current Plan',
    buttonStyle: 'bg-[#2D2D4A] text-[#A0A0C0] cursor-not-allowed',
    popular: false,
  },
  {
    title: 'Pro',
    price: '$9',
    frequency: '/ month',
    features: [
      { text: 'Unlimited PDF tasks', included: true },
      { text: 'Access to all 30+ tools', included: true },
      { text: 'AI-powered features', included: true },
      { text: 'Faster processing speeds', included: true },
      { text: 'Priority email support', included: true },
      { text: 'No ads', included: true },
    ],
    buttonText: 'Upgrade to Pro',
    buttonStyle: 'bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white hover:scale-103 hover:brightness-95 hover:shadow-lg hover:shadow-red-500/20',
    popular: true,
  },
  {
    title: 'Business',
    price: '$19',
    frequency: '/ user / month',
    features: [
      { text: 'All features from Pro', included: true },
      { text: 'Team management', included: true },
      { text: 'Centralized billing', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-[#2D2D4A] text-white hover:bg-[#3c3c5a] hover:scale-103',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const { isPro } = useRewards();

  const plans = plansData.map(plan => {
      if (plan.title === 'Pro' && isPro) {
          return {
              ...plan,
              buttonText: 'Unlocked with Rewards',
              buttonStyle: 'bg-[#2D2D4A] text-green-400 font-bold cursor-not-allowed border border-green-500/50',
              popular: true,
          };
      }
      return plan;
  });


  return (
    <section id="pricing" className="py-16 md:py-20 bg-[#0F0F1A]">
      <div className="max-w-[1000px] mx-auto px-5 md:px-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Pricing Plans</h2>
          <p className="text-base text-[#A0A0C0] mt-3 max-w-2xl mx-auto">
            Choose the plan that's right for you and unlock the full power of PDFMASTER.CO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={`relative bg-[#1A1A2E] p-5 md:p-6 rounded-xl border ${
                plan.popular ? 'border-2 border-[#FF4D4D] shadow-2xl shadow-red-500/10' : 'border-[#2D2D4A]'
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-grow">
                <h3 className="text-2xl font-semibold text-white text-center mb-2">{plan.title}</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-base text-[#A0A0C0]">{plan.frequency}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  className={`w-full py-3 px-5 rounded-lg font-semibold transition-all duration-300 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
