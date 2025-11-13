export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
  };
  defaultCategory: string;
  updatedAt: string;
}

export const defaultPreferences: Omit<UserPreferences, 'userId'> = {
  theme: 'light',
  currency: 'USD',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    weeklyReport: true
  },
  defaultCategory: 'Other',
  updatedAt: new Date().toISOString()
};