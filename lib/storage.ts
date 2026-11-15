import { hydrateScenario } from "./scenario";
import type { Scenario } from "./types";

const CURRENT = "marginlab.current.v1";
const SAVED = "marginlab.saved.v1";

export interface SavedScenario {
  id: string;
  savedAt: string;
  scenario: Scenario;
}

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const loadCurrent = (): Scenario | null => {
  const raw = read(CURRENT);
  return raw ? hydrateScenario(raw) : null;
};
export const saveCurrent = (s: Scenario) => write(CURRENT, s);

export function loadSaved(): SavedScenario[] {
  const raw = read(SAVED);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is { id: string; savedAt: string; scenario: unknown } => !!x && typeof x.id === "string")
    .map((x) => ({ id: x.id, savedAt: String(x.savedAt), scenario: hydrateScenario(x.scenario) }));
}
export const writeSaved = (list: SavedScenario[]) => write(SAVED, list);
