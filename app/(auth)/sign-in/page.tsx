import { SignInTemplate } from "@/modules/auth";
import { getAuthCallbackPath } from "../redirect-path";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { next } = await searchParams;
  const callbackPath = getAuthCallbackPath(typeof next === "string" ? next : null);

  return <SignInTemplate callbackPath={callbackPath} />;
}
