/**
 * Run where spoton.com and vendor sites are reachable:  npm run verify:sources
 * Reports (does not edit) whether each case-study page loads and contains the expected metric
 * figures, and whether solution links respond. A human then confirms the exact wording and
 * updates `verification` / `wordingStatus` in config/caseStudies.ts.
 */
import { CASE_STUDIES } from "../config/caseStudies";
import { SOLUTIONS } from "../config/solutions";
import { pageSupportsMetric } from "../lib/verify";

async function get(url: string) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "marginlab-verify/1.0" } });
    return { status: res.status, text: res.ok ? await res.text() : "" };
  } catch (e) {
    return { status: 0, text: "", error: String((e as Error).message) };
  }
}

async function main() {
  let bad = 0;
  console.log("== Case studies");
  for (const c of CASE_STUDIES) {
    const r = await get(c.sourceUrl);
    const chk = r.status === 200 ? pageSupportsMetric(r.text, c) : null;
    const ok = r.status === 200 && chk?.ok;
    if (!ok) bad++;
    console.log(`${ok ? "OK  " : "FAIL"} ${c.id} [${r.status || "no response"}] ${chk && !chk.ok ? "missing: " + chk.missing.join(", ") : ""}`);
  }
  console.log("== Solution links");
  for (const s of SOLUTIONS) {
    const r = await get(s.link.url);
    if (r.status !== 200) bad++;
    console.log(`${r.status === 200 ? "OK  " : "FAIL"} ${s.id} [${r.status || "no response"}] ${s.link.status}`);
  }
  console.log(bad ? `\n${bad} item(s) need attention.` : "\nAll sources responded and contain the expected figures. Now confirm wording by hand.");
  process.exit(bad ? 1 : 0);
}
void main();
