import { SignInButton } from "@/components/marginlab/SignInButton";
import { ALLOWED_DOMAIN, authConfigured } from "@/lib/authRules";

export const dynamic = "force-dynamic";

/** Decorative rings: [left %, top %, size px, opacity]. Purely visual. */
const RINGS: Array<[number, number, number, number]> = [
  [6, 8, 28, 0.35], [14, 30, 18, 0.4], [3, 52, 34, 0.3], [9, 78, 56, 0.3], [24, 90, 80, 0.25],
  [30, 14, 36, 0.3], [78, 6, 90, 0.4], [86, 12, 80, 0.3], [94, 3, 40, 0.3], [91, 44, 64, 0.3],
  [84, 60, 26, 0.35], [88, 82, 44, 0.3], [70, 92, 70, 0.3], [50, 96, 56, 0.25], [64, 5, 14, 0.4],
];

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = authConfigured(process.env);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[image:var(--hero-gradient)] px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {RINGS.map(([l, t, s, o], i) => (
          <span
            key={i}
            className="absolute rounded-full border-white"
            style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, borderWidth: Math.max(4, Math.round(s / 5)), opacity: o }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-lg rounded-[2rem] bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(10,20,80,0.35)] ring-8 ring-white/10 sm:p-12">
        <span aria-hidden className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-[0_10px_30px_rgba(47,110,228,0.45)]">
          M
        </span>
        <h1 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          Practice profit conversations with
          <span className="block bg-gradient-to-r from-brand to-link bg-clip-text text-transparent">MarginLab</span>
        </h1>
        <p className="mt-3 text-sm text-muted">SpotOn training tool. Sign in with your @{ALLOWED_DOMAIN} Google account.</p>

        {error && (
          <p role="alert" className="mt-5 rounded-ctl border border-rule bg-surface-2 p-3 text-sm text-ink">
            That account can&apos;t be used. Sign in with your @{ALLOWED_DOMAIN} Google account.
          </p>
        )}
        {configured ? (
          <SignInButton />
        ) : (
          <p role="alert" className="mt-5 rounded-ctl border border-rule bg-surface-2 p-3 text-sm text-ink">
            Sign-in isn&apos;t set up for this site yet, so it stays closed. Ask the owner to finish the Google sign-in settings.
          </p>
        )}
      </div>
    </div>
  );
}
