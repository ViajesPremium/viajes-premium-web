"use client";

import { useEffect, useState } from "react";

export const ANIMATION_BUDGET_EVENT = "vp:animation-budget-change";

const MOBILE_QUERY = "(hover: none), (pointer: coarse), (max-width: 1024px)";
const PERFORMANCE_SAMPLE_MS = 1400;
const PERFORMANCE_CACHE_KEY = "vp:mobile-performance-budget:v3";
const LOW_FPS_THRESHOLD = 45;
const LONG_FRAME_MS = 42;
const LONG_FRAME_RATIO_THRESHOLD = 0.28;

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: {
    saveData?: boolean;
  };
};

type AnimationBudgetReason =
  | "reduced-motion"
  | "ios"
  | "desktop"
  | "performance"
  | "cached";

type AnimationBudgetEventDetail = {
  animationsEnabled: boolean;
  lowEndMobile: boolean;
  reason: AnimationBudgetReason;
  fps?: number;
  longFrameRatio?: number;
};

function getNavigatorHints() {
  const nav = navigator as NavigatorWithHints;

  return {
    deviceMemory:
      typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined,
    hardwareConcurrency:
      typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : undefined,
    saveData: nav.connection?.saveData === true,
  };
}

function hasLowEndDeviceHints() {
  const { deviceMemory, hardwareConcurrency } = getNavigatorHints();

  if (typeof deviceMemory === "number") return deviceMemory <= 4;
  if (typeof hardwareConcurrency === "number") return hardwareConcurrency <= 4;

  return false;
}

export function isTouchLikeDevice() {
  return (
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1024px)").matches
  );
}

export function isLikelyIOSDevice(
  nav: NavigatorWithHints = navigator as NavigatorWithHints,
) {
  const ua = nav.userAgent || "";
  const platform = nav.platform || "";
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOSDesktopUA =
    platform === "MacIntel" &&
    typeof nav.maxTouchPoints === "number" &&
    nav.maxTouchPoints > 1;

  return isIOSDevice || isIPadOSDesktopUA;
}

function dispatchAnimationBudgetChange(detail: AnimationBudgetEventDetail) {
  window.dispatchEvent(
    new CustomEvent<AnimationBudgetEventDetail>(ANIMATION_BUDGET_EVENT, {
      detail,
    }),
  );
}

export function setAnimationBudgetState(
  animationsEnabled: boolean,
  lowEndMobile: boolean,
  reason: AnimationBudgetReason,
  metrics?: Pick<AnimationBudgetEventDetail, "fps" | "longFrameRatio">,
) {
  window.__animationsEnabled = animationsEnabled;
  window.__lowEndMobile = lowEndMobile;
  document.documentElement.dataset.animationsEnabled = animationsEnabled
    ? "true"
    : "false";
  document.documentElement.dataset.lowEndMobile = lowEndMobile
    ? "true"
    : "false";

  dispatchAnimationBudgetChange({
    animationsEnabled,
    lowEndMobile,
    reason,
    ...metrics,
  });
}

export function isLowEndMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (!isTouchLikeDevice()) return false;
  if (isLikelyIOSDevice()) return false;

  return window.__lowEndMobile === true;
}

export function areAnimationsEnabledForDevice(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  if (isLikelyIOSDevice()) return true;

  if (typeof window.__animationsEnabled === "boolean") {
    return window.__animationsEnabled;
  }

  if (isTouchLikeDevice() && hasLowEndDeviceHints()) {
    return false;
  }

  return true;
}

function readCachedPerformanceBudget(): {
  lowEndMobile: boolean;
  createdAt: number;
  fps?: number;
  longFrameRatio?: number;
} | null {
  try {
    const raw = window.sessionStorage.getItem(PERFORMANCE_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      lowEndMobile?: boolean;
      createdAt?: number;
      fps?: number;
      longFrameRatio?: number;
    };

    if (typeof parsed.lowEndMobile !== "boolean") return null;
    if (
      typeof parsed.createdAt !== "number" ||
      Date.now() - parsed.createdAt > 1000 * 60 * 30
    ) {
      window.sessionStorage.removeItem(PERFORMANCE_CACHE_KEY);
      return null;
    }

    return {
      lowEndMobile: parsed.lowEndMobile,
      createdAt: parsed.createdAt,
      fps: parsed.fps,
      longFrameRatio: parsed.longFrameRatio,
    };
  } catch {
    return null;
  }
}

function writeCachedPerformanceBudget(metrics: {
  lowEndMobile: boolean;
  fps: number;
  longFrameRatio: number;
}) {
  try {
    window.sessionStorage.setItem(
      PERFORMANCE_CACHE_KEY,
      JSON.stringify({ ...metrics, createdAt: Date.now() }),
    );
  } catch {
    // Session storage can be unavailable in private or restricted contexts.
  }
}

function waitForIdleStart(callback: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 1800 });
    return () => window.cancelIdleCallback?.(id);
  }

  const timeoutId = window.setTimeout(callback, 500);
  return () => window.clearTimeout(timeoutId);
}

export function startMobilePerformanceEvaluation() {
  if (typeof window === "undefined") return () => {};

  const mobileMq = window.matchMedia(MOBILE_QUERY);
  const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let cancelled = false;
  let stopIdleWait: (() => void) | null = null;
  let rafId: number | null = null;

  const cancelFrame = () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const applyStaticDecision = () => {
    cancelFrame();
    stopIdleWait?.();
    stopIdleWait = null;

    if (reducedMotionMq.matches) {
      setAnimationBudgetState(false, false, "reduced-motion");
      return true;
    }

    if (!mobileMq.matches) {
      setAnimationBudgetState(true, false, "desktop");
      return true;
    }

    if (isLikelyIOSDevice()) {
      try {
        window.sessionStorage.removeItem(PERFORMANCE_CACHE_KEY);
      } catch {
        // Ignore restricted storage contexts.
      }
      setAnimationBudgetState(true, false, "ios");
      return true;
    }

    return false;
  };

  const applyDeviceHintDecision = () => {
    const { saveData } = getNavigatorHints();
    const lowEndMobile = saveData || hasLowEndDeviceHints();

    if (!lowEndMobile) return false;

    writeCachedPerformanceBudget({
      lowEndMobile: true,
      fps: 0,
      longFrameRatio: 1,
    });
    setAnimationBudgetState(false, true, "performance", {
      fps: 0,
      longFrameRatio: 1,
    });

    return true;
  };

  const measure = () => {
    if (cancelled || applyStaticDecision()) return;
    if (applyDeviceHintDecision()) return;

    const cached = readCachedPerformanceBudget();
    if (cached) {
      setAnimationBudgetState(!cached.lowEndMobile, cached.lowEndMobile, "cached", {
        fps: cached.fps,
        longFrameRatio: cached.longFrameRatio,
      });
      return;
    }

    const frameDurations: number[] = [];
    let firstFrameAt = 0;
    let previousFrameAt = 0;

    const sampleFrame = (now: number) => {
      if (cancelled || applyStaticDecision()) return;

      if (firstFrameAt === 0) {
        firstFrameAt = now;
        previousFrameAt = now;
        rafId = window.requestAnimationFrame(sampleFrame);
        return;
      }

      frameDurations.push(now - previousFrameAt);
      previousFrameAt = now;

      if (now - firstFrameAt < PERFORMANCE_SAMPLE_MS) {
        rafId = window.requestAnimationFrame(sampleFrame);
        return;
      }

      rafId = null;

      const elapsedSeconds = Math.max((now - firstFrameAt) / 1000, 0.001);
      const fps = frameDurations.length / elapsedSeconds;
      const longFrameCount = frameDurations.filter(
        (duration) => duration > LONG_FRAME_MS,
      ).length;
      const longFrameRatio = longFrameCount / Math.max(frameDurations.length, 1);
      const { saveData } = getNavigatorHints();
      const lowEndMobile =
        saveData ||
        fps < LOW_FPS_THRESHOLD ||
        longFrameRatio > LONG_FRAME_RATIO_THRESHOLD;

      writeCachedPerformanceBudget({ lowEndMobile, fps, longFrameRatio });
      setAnimationBudgetState(!lowEndMobile, lowEndMobile, "performance", {
        fps,
        longFrameRatio,
      });
    };

    rafId = window.requestAnimationFrame(sampleFrame);
  };

  const scheduleMeasure = () => {
    if (applyStaticDecision()) return;
    if (applyDeviceHintDecision()) return;
    stopIdleWait = waitForIdleStart(measure);
  };

  scheduleMeasure();
  mobileMq.addEventListener("change", scheduleMeasure);
  reducedMotionMq.addEventListener("change", scheduleMeasure);

  return () => {
    cancelled = true;
    stopIdleWait?.();
    cancelFrame();
    mobileMq.removeEventListener("change", scheduleMeasure);
    reducedMotionMq.removeEventListener("change", scheduleMeasure);
  };
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
