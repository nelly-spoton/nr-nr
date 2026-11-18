"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Button() {
  const params = useSearchParams();
  const raw = params.get("callbackUrl") ?? "/";
  // Only same-site paths; anything else goes home.
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Sign in with Google
    </button>
  );
}

export function SignInButton() {
  return (
    <Suspense fallback={null}>
      <Button />
    </Suspense>
  );
}
