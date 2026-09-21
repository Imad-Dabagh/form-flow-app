import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

const apiURL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured.");
}

export const authClient = createAuthClient({
  baseURL: `${apiURL}/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [magicLinkClient()],
  sessionOptions: {
    refetchInterval: 0,
    refetchOnWindowFocus: false,
    refetchWhenOffline: false,
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;

export function getInitialIdentityName(email: string): string {
  return email.trim().split("@", 1)[0] || "Form Flow user";
}

export function signUpWithEmail(input: {
  email: string;
  password: string;
  callbackURL?: string;
}) {
  return signUp.email({
    ...input,
    name: getInitialIdentityName(input.email),
  });
}

export function sendMagicLink(input: {
  email: string;
  callbackURL?: string;
}) {
  return signIn.magicLink({
    ...input,
    name: getInitialIdentityName(input.email),
  });
}
