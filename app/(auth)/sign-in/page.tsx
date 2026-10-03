import { SignInTemplate } from "@/modules/auth";
import { getAuthCallbackPath } from "../redirect-path";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { next } = await searchParams;
  const callbackPath = getAuthCallbackPath(typeof next === "string" ? next : null);

  const formSubmission = /^\/orgs\/[a-z0-9]+(?:-[a-z0-9]+)*\/submit\/[a-f\d]{24}$/i.test(callbackPath);

  return <SignInTemplate callbackPath={callbackPath} formSubmission={formSubmission} />;
}
