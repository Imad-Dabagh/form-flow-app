export interface CurrentProfile {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  profilePic: string;
  isEmailVerified: boolean;
  platformRoles: string[];
  onboardingRequired: boolean;
}
