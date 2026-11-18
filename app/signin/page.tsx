import { SignInButton } from "@/components/marginlab/SignInButton";
import { ALLOWED_DOMAIN, authConfigured } from "@/lib/authRules";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = authConfigured(process.env);
  return (
    <div className="mx-auto mt-10 max-w-md rounded-card border border-rule bg-surface p-6 shadow-card sm:mt-20">
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">M</span>
        <h1 className="text-xl font-semibold tracking-tight">MarginLab</h1>
      </div>
      <p className="mt-3 text-sm text-muted">
        A SpotOn training tool for practicing restaurant profit conversations. Sign in with your @{ALLOWED_DOMAIN} Google account.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-ctl border border-rule bg-surface-2 p-3 text-sm">
          That account can&apos;t be used. Sign in with your @{ALLOWED_DOMAIN} Google account.
        </p>
      )}
      {configured ? (
        <SignInButton />
      ) : (
        <p role="alert" className="mt-4 rounded-ctl border border-rule bg-surface-2 p-3 text-sm">
          Sign-in isn&apos;t set up for this site yet, so it stays closed. Ask the owner to finish the Google sign-in settings.
        </p>
      )}
    </div>
  );
}
