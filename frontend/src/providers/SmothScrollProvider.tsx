"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ANIMATION_BUDGET_EVENT,
  areAnimationsEnabledForDevice,
} from "@/lib/animation-budget";

type SmothScrollProviderProps = {
  children: ReactNode;
};

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const LENIS_CLASSES = [
  "lenis",
  "lenis-smooth",
  "lenis-stopped",
  "lenis-scrolling",
] as const;

const restoreNativeScroll = () => {
  const root = document.documentElement;
  const body = document.body;

  for (const className of LENIS_CLASSES) {
    root.classList.remove(className);
    body.classList.remove(className);
  }

  root.style.removeProperty("overflow");
  root.style.removeProperty("height");
  root.style.removeProperty("scroll-behavior");
  body.style.removeProperty("overflow");
  body.style.removeProperty("height");
  body.style.removeProperty("scroll-behavior");
};

function shouldUseSyncTouch() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export default function SmothScrollProvider({
  children,
}: SmothScrollProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis: Lenis | null = null;
    let tickLenis: ((time: number) => void) | null = null;
    let updateScrollTrigger: (() => void) | null = null;
    let teardownLenis: (() => void) | null = null;
    let animationsEnabled = areAnimationsEnabledForDevice();

    let lastLayoutWidth = window.innerWidth;
    let lastLayoutHeight = window.innerHeight;

    const isEditableElementFocused = () => {
      const activeElement = document.activeElement;

      if (!(activeElement instanceof HTMLElement)) return false;

      const tagName = activeElement.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        activeElement.isContentEditable
      );
    };

    const isKeyboardResize = () => {
      if (!window.__chatAssistantOpen || !isEditableElementFocused()) {
        return false;
      }

      const widthDelta = Math.abs(window.innerWidth - lastLayoutWidth);
      const heightDelta = Math.abs(window.innerHeight - lastLayoutHeight);

      return widthDelta < 8 && heightDelta > 80;
    };

    const refreshScrollSystems = () => {
      if (isKeyboardResize()) return;

      lastLayoutWidth = window.innerWidth;
      lastLayoutHeight = window.innerHeight;

      if (!animationsEnabled) {
        restoreNativeScroll();
        return;
      }

      lenis?.resize();
      ScrollTrigger.refresh();
    };

    const setupLenis = () => {
      if (lenis) return;

      const syncTouch = shouldUseSyncTouch();

      lenis = new Lenis({
        duration: 1.35,
        easing: easeOutQuart,
        smoothWheel: true,
        wheelMultiplier: 0.82,
        touchMultiplier: 1.25,
        syncTouch,
        syncTouchLerp: syncTouch ? 0.09 : undefined,
        autoRaf: false,
      });

      window.__lenis = lenis;

      updateScrollTrigger = () => {
        ScrollTrigger.update();
      };
      tickLenis = (time: number) => {
        lenis?.raf(time * 1000);
      };

      lenis.on("scroll", updateScrollTrigger);
      gsap.ticker.add(tickLenis);

      teardownLenis = () => {
        if (!lenis) return;
        lenis.off("scroll", updateScrollTrigger!);
        gsap.ticker.remove(tickLenis!);
        lenis.destroy();
        if (window.__lenis === lenis) {
          delete window.__lenis;
        }
        lenis = null;
        tickLenis = null;
        updateScrollTrigger = null;
        restoreNativeScroll();
      };
    };

    const applyForViewport = () => {
      teardownLenis?.();
      teardownLenis = null;

      animationsEnabled = areAnimationsEnabledForDevice();

      if (animationsEnabled) {
        setupLenis();
      } else {
        restoreNativeScroll();
      }
    };

    gsap.ticker.lagSmoothing(0);
    applyForViewport();

    const handleAnimationBudgetChange = () => {
      applyForViewport();
      refreshScrollSystems();
    };
    window.addEventListener(ANIMATION_BUDGET_EVENT, handleAnimationBudgetChange);

    const refreshFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (animationsEnabled) {
          refreshScrollSystems();
        } else {
          restoreNativeScroll();
        }
      });
    });

    window.addEventListener("resize", refreshScrollSystems);

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener("resize", refreshScrollSystems);
      window.removeEventListener(
        ANIMATION_BUDGET_EVENT,
        handleAnimationBudgetChange,
      );
      teardownLenis?.();
    };
  }, []);

  return <>{children}</>;
}
