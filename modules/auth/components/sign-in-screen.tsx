"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Separator } from "@/modules/shared/components/ui/separator";
import API from "@/router";
import { getAuthCallbackPath } from "../redirect-path";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.3 3.1-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.2 13.8a6 6 0 0 1 0-3.6V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.6 0 3 .5 4.1 1.6l3.1-3A10 10 0 0 0 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9Z"
      />
    </svg>
  );
}

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackPath = getAuthCallbackPath(searchParams.get("next"));
  const getCallbackURL = () =>
    new URL(callbackPath, window.location.origin).toString();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "password" | "google" | "magic" | null
  >(null);

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMagicLinkSent(false);
    setPendingAction("password");
    const callbackURL = getCallbackURL();

    const { error: signInError } = await API.auth.signIn.email({
      email,
      password,
      callbackURL,
    });

    setPendingAction(null);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(callbackPath);
  }

  async function signInWithGoogle() {
    setError(null);
    setMagicLinkSent(false);
    setPendingAction("google");
    const callbackURL = getCallbackURL();

    const { error: signInError } = await API.auth.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (signInError) {
      setError(signInError.message);
      setPendingAction(null);
    }
  }

  async function requestMagicLink() {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setError(null);
    setMagicLinkSent(false);
    setPendingAction("magic");
    const callbackURL = getCallbackURL();

    const { error: magicLinkError } = await API.auth.sendMagicLink({
      email,
      callbackURL,
    });

    setPendingAction(null);

    if (magicLinkError) {
      setError(magicLinkError.message);
      return;
    }

    setMagicLinkSent(true);
  }

  const isPending = pendingAction !== null;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
      <section className="w-full max-w-sm">
        <div className="mb-10">
            <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <span className="grid size-9 place-items-center rounded-xl bg-[#102a43] text-base font-black text-cyan-200">
                F
              </span>
              Form Flow
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-cyan-700">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">
              Sign in to your workspace
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use your password, continue with Google, or receive a secure
              sign-in link.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              disabled={isPending}
              onClick={signInWithGoogle}
              size="lg"
              type="button"
              variant="outline"
            >
              {pendingAction === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleMark />
              )}
              Continue with Google
            </Button>
          </div>

          <div className="my-7 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-5" onSubmit={signInWithPassword}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="current-password"
                id="password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button className="w-full" disabled={isPending} size="lg" type="submit">
              {pendingAction === "password" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Sign in with password
            </Button>
          </form>

          <div className="mt-6 rounded-xl border bg-muted/30 p-4">
            {magicLinkSent ? (
              <p className="flex gap-3 text-sm leading-6 text-foreground">
                <Mail className="mt-0.5 size-4 shrink-0 text-cyan-700" />
                Check your inbox for a secure sign-in link. It expires in five
                minutes.
              </p>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm leading-5 text-muted-foreground">
                  Prefer not to use a password?
                </p>
                <Button
                  disabled={isPending}
                  onClick={requestMagicLink}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {pendingAction === "magic" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  Email me a link
                </Button>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}
