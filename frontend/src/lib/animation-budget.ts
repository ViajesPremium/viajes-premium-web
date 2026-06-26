"use client";

import { useEffect, useState } from "react";

const LOW_END_RAM_THRESHOLD_GB = 4;
export const ANIMATION_BUDGET_EVENT = "vp:animation-budget-change";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: {
    saveData?: boolean;
  };
};

function isTouchLikeDevice() {
  return (
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1024px)").matches
  );
}

function isLikelyIOSSafari(nav: NavigatorWithHints) {
  const ua = nav.userAgent || "";
  const platform = nav.platform || "";
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOSDesktopUA =
    platform === "MacIntel" && typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 1;
  return isIOSDevice || isIPadOSDesktopUA;
}

export function isLowEndMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (!isTouchLikeDevice()) return false;

  const nav = navigator as NavigatorWithHints;
  const saveDataEnabled = nav.connection?.saveData === true;

  // Respeta explícitamente Data Saver.
  if (saveDataEnabled) return true;

  // Si el navegador sí expone RAM (normalmente Chromium), usamos tu regla real de 4 GB.
  if (typeof nav.deviceMemory === "number") {
    return nav.deviceMemory <= LOW_END_RAM_THRESHOLD_GB;
  }

  // En iOS Safari deviceMemory no existe y hardwareConcurrency no es fiable para
  // clasificar gama alta/baja, así que dejamos la decisión al medidor de FPS.
  if (isLikelyIOSSafari(nav)) return false;

  // Fallback mínimo para otros navegadores sin deviceMemory.
  const lowCoreCount =
    typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2;
  return lowCoreCount;
}

export function areAnimationsEnabledForDevice(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  if (typeof window.__animationsEnabled === "boolean") {
    return window.__animationsEnabled;
  }

  return !isLowEndMobileDevice();
}

export function useAnimationsEnabled() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return areAnimationsEnabledForDevice();
  });

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMq = window.matchMedia("(hover: none), (pointer: coarse)");
    const widthMq = window.matchMedia("(max-width: 1024px)");
    const onBudgetChange = () => {
      setEnabled(areAnimationsEnabledForDevice());
    };

    const recompute = () => {
      setEnabled(areAnimationsEnabledForDevice());
    };

    recompute();
    motionMq.addEventListener("change", recompute);
    pointerMq.addEventListener("change", recompute);
    widthMq.addEventListener("change", recompute);
    window.addEventListener(ANIMATION_BUDGET_EVENT, onBudgetChange);

    return () => {
      motionMq.removeEventListener("change", recompute);
      pointerMq.removeEventListener("change", recompute);
      widthMq.removeEventListener("change", recompute);
      window.removeEventListener(ANIMATION_BUDGET_EVENT, onBudgetChange);
    };
  }, []);

  return enabled;
}
