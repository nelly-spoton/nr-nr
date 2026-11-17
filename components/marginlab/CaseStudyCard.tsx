import { ExternalLink } from "lucide-react";
import { metricQualifier, verificationLabel } from "@/config/caseStudies";
import type { CaseMatch } from "@/lib/matching";
import { Badge } from "./Cards";

const NOT_CAPTURED = "Not yet captured from the source";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** Customer proof card. Shows a published example; it never feeds the financial model. */
export function CaseStudyCard({ match, compact = false }: { match: CaseMatch; compact?: boolean }) {
  const c = match.study;
  const verified = c.verification.status === "verified";
  return (
    <article className="flex flex-col gap-3 rounded-card border border-rule bg-surface p-5 shadow-card">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{c.name}</h3>
          <Badge tone={verified ? "good" : c.verification.status === "requester_confirmed" ? "neutral" : "warn"}>{compact && !verified ? "Not independently checked" : verificationLabel(c)}</Badge>
        </div>
        <p className="text-sm text-muted">
          {c.conceptLabel}
          {c.locationText ? ` · ${c.locationText}` : ""}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {match.closestConcept && <Badge tone="brand">Closest concept</Badge>}
          {match.indirect && <Badge tone="neutral">Indirect evidence, not a cost saving</Badge>}
        </div>
      </header>
      {compact ? (
        <>
          <p className="text-xl font-semibold">{c.metric.wording}</p>
          <p className="text-sm text-muted">Why it may fit: {match.reasons.slice(0, 2).join(" · ")}</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-link">Details and limits</summary>
            <dl className="mt-2 grid gap-2 rounded-ctl bg-surface-2 p-3">
              <Field label="Challenge">{c.challenge ?? <em className="text-muted">{NOT_CAPTURED}</em>}</Field>
              <Field label="What changed">{c.improvement ?? <em className="text-muted">{NOT_CAPTURED}</em>}</Field>
              <Field label="Technology">{c.products.length ? c.products.map((p) => p.name).join(", ") : <em className="text-muted">{NOT_CAPTURED}</em>}</Field>
              <Field label="Keep in mind">
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
                  <li>{metricQualifier(c.metric)}</li>
                  {c.limitations.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </Field>
            </dl>
          </details>
        </>
      ) : (
      <dl className="grid gap-3">
        <Field label="Published result">
          <span className="text-xl font-semibold">{c.metric.wording}</span>
          {c.metric.wordingStatus === "as_provided" && (
            <span className="block text-xs text-muted">Wording as provided; exact source wording still to be confirmed.</span>
          )}
        </Field>
        <Field label="Business challenge">{c.challenge ?? <em className="text-muted">{NOT_CAPTURED}</em>}</Field>
        <Field label="What operationally changed">{c.improvement ?? <em className="text-muted">{NOT_CAPTURED}</em>}</Field>
        <Field label="Technology">
          {c.products.length ? c.products.map((p) => p.name).join(", ") : <em className="text-muted">{NOT_CAPTURED}</em>}
        </Field>
        <Field label="Why it may be relevant to this prospect">{match.reasons.join(" · ")}</Field>
        <Field label="Evidence limitations">
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
            <li>{metricQualifier(c.metric)}</li>
            {c.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Field>
      </dl>
      )}
      <a
        href={c.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-link underline"
      >
        Read the SpotOn success story <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}

export function CaseStudyGrid({ matches, compact = false }: { matches: CaseMatch[]; compact?: boolean }) {
  if (!matches.length)
    return (
      <p className="rounded-ctl border border-rule bg-surface-2 p-4 text-sm text-muted">
        No published example is relevant enough to show for this profile. MarginLab does not stretch a weak match.
      </p>
    );
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {matches.map((m) => (
        <CaseStudyCard key={m.study.id} match={m} compact={compact} />
      ))}
    </div>
  );
}
