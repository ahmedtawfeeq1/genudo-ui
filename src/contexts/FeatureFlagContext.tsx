
import React, { createContext, useContext, ReactNode } from 'react';
import { featureFlags, FeatureFlagKeys } from '@/lib/featureFlags';

type FeatureFlags = typeof featureFlags;

const FeatureFlagContext = createContext<FeatureFlags | undefined>(undefined);

export const FlagsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFlag = (key: FeatureFlagKeys): boolean => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFlag must be used within a FlagsProvider');
  }
  return context[key];
};

export const useFlags = (): FeatureFlags => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFlags must be used within a FlagsProvider');
    }
    return context;
}
