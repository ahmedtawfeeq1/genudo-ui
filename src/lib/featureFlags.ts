
const env: any = (import.meta as any).env || {};
export const featureFlags = {
  activityAutomation: env.VITE_ACTIVITY_AUTOMATION === 'true',
  aiNlp:              env.VITE_AI_NLP === 'true',
  activityDashboard:  env.VITE_ACTIVITY_DASHBOARD === 'true',
};

export type FeatureFlagKeys = keyof typeof featureFlags;
export const seedDemoAgents = true;
export const seedDemoKnowledge = true;
