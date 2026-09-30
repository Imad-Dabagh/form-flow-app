export interface CurrentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  coverPhoto: string;
  phone: string;
  shortDescription: string;
  onboardingCompletedAt: string | null;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
}

export interface UpdateCurrentProfileInput {
  firstName: string;
  lastName: string;
  profilePic?: string;
  coverPhoto?: string;
  phone?: string;
  shortDescription?: string;
}
