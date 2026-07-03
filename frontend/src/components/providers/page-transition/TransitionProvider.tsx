"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { landingList } from "@/features/landings/data";
import {
  ANIMATION_BUDGET_EVENT,
  areAnimationsEnabledForDevice,
} from "@/lib/animation-budget";
import styles from "./transition-provider.module.css";

const PRINCIPAL_LOGO = "/media/shared/logos/principal-logo.svg";
const BRAND_PRIMARY_COLOR = "#002744";
const LANDING_LOGOS: Record<string, string> = {
  "japon-premium": "/media/shared/logos/japon/japon-premium-blanco.svg",
  "corea-premium": "/media/shared/logos/corea/corea-premium-blanco.svg",
  "canada-premium": "/media/shared/logos/canada/canada-premium-blanco.svg",
  "europa-premium": "/media/shared/logos/europa/europa-premium-blanco.svg",
  "barrancas-premium":
    "/media/shared/logos/barrancas/barrancas-premium-blanco.svg",
};

type TransitionVisualOptions = {
  logoSrc?: string;
};

type TransitionContextValue = {
  triggerTransition: (href: string, visual?: TransitionVisualOptions) => void;
};

const TransitionContext = createContext<TransitionContextValue>({
  triggerTransition: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function comparableRoute(url: URL): string {
  return `${normalizePathname(url.pathname)}${url.search}`;
}

function routeWithHash(url: URL): string {
  return `${normalizePathname(url.pathname)}${url.search}${url.hash}`;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForHeroReadiness(maxWaitMs = 420) {
  const start = performance.now();
  const minHoldMs = 120;

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

  const heroCandidates = [
    "main [class*='hero']",
    "main [aria-label*='Hero']",
    "main section:first-of-type",
  ];

  const heroEl = heroCandidates
    .map((selector) => document.querySelector(selector))
    .find(Boolean);

  if (heroEl) {
    const heroImg = heroEl.querySelector("img");
    if (heroImg && !heroImg.complete) {
      await Promise.race([
        new Promise<void>((resolve) => {
          const done = () => resolve();
          heroImg.addEventListener("load", done, { once: true });
          heroImg.addEventListener("error", done, { once: true });
        }),
        wait(maxWaitMs),
      ]);
    } else {
      await wait(22);
    }
  } else {
    await wait(Math.min(maxWaitMs, 240));
  }

  const elapsed = performance.now() - start;
  if (elapsed < minHoldMs) {
    await wait(minHoldMs - elapsed);
  }
}

function isPremiumLandingPath(path: string | null) {
  if (!path) return false;
  return landingList.some((landing) => {
    const routePath = `/${landing.slug}`;
    return path === routePath || path.startsWith(`${routePath}/`);
  });
}

function resolveTransitionLogo(targetPath: string): string {
  const targetPathname = normalizePathname(
    targetPath.split(/[?#]/, 1)[0] ?? "/",
  );
  const matchedLanding = landingList.find((landing) => {
    const routePath = `/${landing.slug}`;
    return (
      targetPathname === routePath || targetPathname.startsWith(`${routePath}/`)
    );
  });

  if (!matchedLanding) return PRINCIPAL_LOGO;
  return LANDING_LOGOS[matchedLanding.slug] ?? PRINCIPAL_LOGO;
}

function resolveTransitionColor(targetPath: string): string {
  const targetPathname = normalizePathname(
    targetPath.split(/[?#]/, 1)[0] ?? "/",
  );
  const matchedLanding = landingList.find((landing) => {
    const routePath = `/${landing.slug}`;
    return (
      targetPathname === routePath || targetPathname.startsWith(`${routePath}/`)
    );
  });

  return matchedLanding?.palette.primary ?? BRAND_PRIMARY_COLOR;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const transitionInFlightRef = useRef(false);
  const animationsEnabledRef = useRef(true);
  const isFirstMount = useRef(true);
  const pendingTransition = useRef(false);
  const transitionFailSafeTimerRef = useRef<number | null>(null);
  const transitionTargetRef = useRef<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const clearTransitionFailSafe = useCallback(() => {
    if (transitionFailSafeTimerRef.current !== null) {
      window.clearTimeout(transitionFailSafeTimerRef.current);
      transitionFailSafeTimerRef.current = null;
    }
  }, []);

  const resetTransitionState = useCallback(() => {
    clearTransitionFailSafe();
    pendingTransition.current = false;
    transitionInFlightRef.current = false;
    transitionTargetRef.current = null;

    if (overlayRef.current) overlayRef.current.style.pointerEvents = "none";
  }, [clearTransitionFailSafe]);

  useLayoutEffect(() => {
    animationsEnabledRef.current = areAnimationsEnabledForDevice();
    gsap.set([layer1Ref.current, layer2Ref.current], { yPercent: 100 });
    if (logoImageRef.current) {
      gsap.set(logoImageRef.current, { opacity: 0, scale: 0.96 });
    }
  }, []);

  useEffect(() => {
    const syncAnimationBudget = () => {
      animationsEnabledRef.current = areAnimationsEnabledForDevice();
    };

    window.addEventListener(ANIMATION_BUDGET_EVENT, syncAnimationBudget);

    return () => {
      window.removeEventListener(ANIMATION_BUDGET_EVENT, syncAnimationBudget);
    };
  }, []);

  useLayoutEffect(() => {
    if (isFirstMount.current) return;
    if (normalizePathname(pathname) !== "/") return;
    if (!pendingTransition.current) return;

    pendingTransition.current = false;
    clearTransitionFailSafe();
    gsap.set([layer1Ref.current, layer2Ref.current], { yPercent: 100 });
    if (overlayRef.current) overlayRef.current.style.pointerEvents = "none";
    if (logoImageRef.current) {
      logoImageRef.current.removeAttribute("src");
      gsap.set(logoImageRef.current, { opacity: 0, scale: 0.96 });
    }
    resetTransitionState();
  }, [pathname, clearTransitionFailSafe, resetTransitionState]);

  useEffect(() => {
    let cancelled = false;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!animationsEnabledRef.current) {
      transitionInFlightRef.current = false;
      return;
    }
    if (!pendingTransition.current) return;
    pendingTransition.current = false;
    clearTransitionFailSafe();

    const runExit = async () => {
      const isPremiumTarget = isPremiumLandingPath(pathname);
      if (isPremiumTarget) {
        await wait(140);
      } else {
        await waitForHeroReadiness();
      }
      if (cancelled) return;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([layer1Ref.current, layer2Ref.current], { yPercent: 100 });
          if (overlayRef.current)
            overlayRef.current.style.pointerEvents = "none";
          if (logoImageRef.current) {
            logoImageRef.current.removeAttribute("src");
            gsap.set(logoImageRef.current, { opacity: 0, scale: 0.96 });
          }
          resetTransitionState();
        },
      });

      tl.to(logoImageRef.current, {
        opacity: 0,
        scale: 0.96,
        duration: 0.18,
        ease: "power1.in",
      });

      tl.to(
        [layer2Ref.current, layer1Ref.current],
        {
          yPercent: -100,
          duration: 0.55,
          stagger: 0.07,
          ease: "power4.inOut",
        },
        "-=0.1",
      );
    };

    void runExit();

    return () => {
      cancelled = true;
    };
  }, [clearTransitionFailSafe, pathname, resetTransitionState]);

  const triggerTransition = useCallback(
    async (href: string, visual?: TransitionVisualOptions) => {
      const normalizedTarget = href.trim();
      if (!normalizedTarget) return;

      if (normalizedTarget.startsWith("#")) {
        router.push(normalizedTarget);
        return;
      }

      let targetUrl: URL | null = null;
      if (typeof window !== "undefined") {
        try {
          targetUrl = new URL(normalizedTarget, window.location.href);
          const currentUrl = new URL(window.location.href);

          if (targetUrl.origin !== currentUrl.origin) {
            window.location.assign(targetUrl.toString());
            return;
          }

          const currentComparable = comparableRoute(currentUrl);
          const targetComparable = comparableRoute(targetUrl);
          if (currentComparable === targetComparable) {
            const currentHash = currentUrl.hash || "";
            const nextHash = targetUrl.hash || "";
            if (nextHash && nextHash !== currentHash) {
              router.push(routeWithHash(targetUrl));
            }
            return;
          }
        } catch {
          return;
        }
      }

      const targetPath = targetUrl
        ? routeWithHash(targetUrl)
        : normalizedTarget;
      const targetPathname = targetUrl
        ? normalizePathname(targetUrl.pathname)
        : normalizePathname(targetPath.split(/[?#]/, 1)[0] ?? "/");

      if (targetPathname === "/") {
        resetTransitionState();
        router.push(targetPath);
        return;
      }

      if (!animationsEnabledRef.current || !areAnimationsEnabledForDevice()) {
        router.push(targetPath);
        return;
      }
      if (transitionInFlightRef.current) return;
      if (!layer1Ref.current || !layer2Ref.current || !logoImageRef.current) {
        router.push(targetPath);
        return;
      }

      transitionInFlightRef.current = true;
      transitionTargetRef.current = targetPath;
      router.prefetch(targetPath);

      clearTransitionFailSafe();
      transitionFailSafeTimerRef.current = window.setTimeout(() => {
        resetTransitionState();
      }, 4500);

      const selectedLogo = visual?.logoSrc ?? resolveTransitionLogo(targetPath);
      logoImageRef.current.src = selectedLogo;
      logoImageRef.current.style.display = "block";
      layer1Ref.current.style.backgroundColor =
        resolveTransitionColor(targetPath);
      pendingTransition.current = true;
      if (overlayRef.current) overlayRef.current.style.pointerEvents = "all";

      const tl = gsap.timeline({
        onComplete: () => {
          router.push(targetPath);
        },
      });

      tl.set(logoImageRef.current, { opacity: 0, scale: 0.96 });
      tl.fromTo(
        [layer1Ref.current, layer2Ref.current],
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power4.inOut",
        },
      );
      tl.to(
        logoImageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.28,
          ease: "power2.out",
        },
        "-=0.2",
      );
    },
    [clearTransitionFailSafe, resetTransitionState, router],
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (transitionInFlightRef.current) return;

      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      if (anchor.hasAttribute("download")) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("data-no-transition")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const currentUrl = new URL(window.location.href);
      const currentPath = comparableRoute(currentUrl);
      const nextPath = comparableRoute(url);
      if (nextPath === currentPath) return;

      const targetPath = routeWithHash(url);
      if (!targetPath || transitionTargetRef.current === targetPath) return;

      e.preventDefault();
      triggerTransition(targetPath, {
        logoSrc: resolveTransitionLogo(targetPath),
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, triggerTransition]);

  useEffect(
    () => () => {
      clearTransitionFailSafe();
    },
    [clearTransitionFailSafe],
  );

  return (
    <TransitionContext.Provider value={{ triggerTransition }}>
      <div ref={overlayRef} aria-hidden="true" className={styles.overlay}>
        <div ref={layer1Ref} className={styles.layerPrimary} />
        <div ref={layer2Ref} className={styles.layerVisual}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoImageRef}
            alt="Logo Viajes Premium"
            title="Logo Viajes Premium"
            className={styles.logoImage}
          />
        </div>
      </div>
      {children}
    </TransitionContext.Provider>
  );
}

export default TransitionProvider;
