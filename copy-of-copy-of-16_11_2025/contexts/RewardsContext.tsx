import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface RewardsContextType {
  points: number;
  isPro: boolean;
  addPoints: (amount: number, action: string) => void;
  lastAction: { action: string; points: number; total: number } | null;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(45); // Start at 45 as per example
  const [isPro, setIsPro] = useState(false);
  const [lastAction, setLastAction] = useState<{ action: string; points: number; total: number } | null>(null);

  useEffect(() => {
    if (points >= 100 && !isPro) {
      setIsPro(true);
    }
  }, [points, isPro]);

  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 3000); // 3-second toast
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const addPoints = (amount: number, action: string) => {
    setPoints(prevPoints => {
      const newTotal = Math.min(100, prevPoints + amount);
      if (newTotal > prevPoints) { // Only show toast if points actually increased
          setLastAction({ action, points: amount, total: newTotal });
      }
      return newTotal;
    });
  };

  const value = { points, isPro, addPoints, lastAction };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = (): RewardsContextType => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};
