export interface CurrentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  isEmailVerified: boolean;
  platformRoles: string[];
}
