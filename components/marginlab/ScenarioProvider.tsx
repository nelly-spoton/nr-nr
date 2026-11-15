"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeScenario, type ScenarioResult } from "@/lib/calc";
import { exampleScenario } from "@/lib/scenario";
import { loadCurrent, loadSaved, saveCurrent, writeSaved, type SavedScenario } from "@/lib/storage";
import { validateScenario } from "@/lib/validate";
import type { Issue, Scenario } from "@/lib/types";

interface Ctx {
  scenario: Scenario;
  result: ScenarioResult;
  issues: Issue[];
  update: (patch: Partial<Scenario> | ((s: Scenario) => Scenario)) => void;
  reset: () => void;
  saved: SavedScenario[];
  saveNamed: () => void;
  loadSavedScenario: (id: string) => void;
  deleteSaved: (id: string) => void;
}

const ScenarioContext = createContext<Ctx | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario>(exampleScenario);
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch). Data never leaves the browser.
  useEffect(() => {
    const cur = loadCurrent();
    if (cur) setScenario(cur);
    setSaved(loadSaved());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCurrent(scenario);
  }, [scenario, ready]);

  const update = useCallback<Ctx["update"]>((patch) => {
    setScenario((s) => (typeof patch === "function" ? patch(s) : { ...s, ...patch }));
  }, []);

  const reset = useCallback(() => setScenario(exampleScenario()), []);

  const saveNamed = useCallback(() => {
    const entry: SavedScenario = {
      id: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      scenario: { ...scenario, scenarioName: scenario.scenarioName.trim() || "Untitled scenario" },
    };
    setSaved((prev) => {
      const next = [entry, ...prev].slice(0, 25);
      writeSaved(next);
      return next;
    });
  }, [scenario]);

  const loadSavedScenario = useCallback(
    (id: string) => {
      const hit = saved.find((x) => x.id === id);
      if (hit) setScenario(hit.scenario);
    },
    [saved],
  );

  const deleteSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeSaved(next);
      return next;
    });
  }, []);

  const result = useMemo(() => computeScenario(scenario), [scenario]);
  const issues = useMemo(() => validateScenario(scenario), [scenario]);

  const value = useMemo<Ctx>(
    () => ({ scenario, result, issues, update, reset, saved, saveNamed, loadSavedScenario, deleteSaved }),
    [scenario, result, issues, update, reset, saved, saveNamed, loadSavedScenario, deleteSaved],
  );
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario(): Ctx {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used inside ScenarioProvider");
  return ctx;
}
