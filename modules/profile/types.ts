export interface CurrentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  onboardingCompletedAt: string | null;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
}
