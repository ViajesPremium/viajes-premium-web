"use client";

import { useEffect, type ReactNode } from "react";
import { startMobilePerformanceEvaluation } from "@/lib/animation-budget";

type AnimationBudgetProviderProps = {
  children: ReactNode;
};

export default function AnimationBudgetProvider({
  children,
}: AnimationBudgetProviderProps) {
  useEffect(() => startMobilePerformanceEvaluation(), []);

  return <>{children}</>;
}
