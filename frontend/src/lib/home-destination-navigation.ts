"use client";

import { destinationCardsData } from "@/features/home/data/destinations.data";

type ScrollToDestinationOptions = {
  duration?: number;
  updateHash?: boolean;
  defer?: boolean;
};

const DESTINATIONS_SECTION_ID = "destinations";

const HOME_DESTINATION_LABELS: Record<string, string> = {
  "/japon-premium": "Japón",
  "/europa-premium": "Europa",
  "/corea-premium": "Corea",
  "/canada-premium": "Canadá",
  "/peru-premium": "Perú",
  "/chiapas-premium": "Chiapas",
  "/barrancas-premium": "Barrancas",
  "/yucatan-premium": "Yucatán",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

let scrollToken = 0;

function refreshScrollSystems() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__lenis?.resize();
      void import("gsap/ScrollTrigger")
        .then(({ ScrollTrigger }) => ScrollTrigger.refresh())
        .catch(() => {});
    });
  });
}

function animateNativeScrollTo(
  toY: number,
  durationSeconds: number,
  token: number,
  onComplete: () => void,
) {
  const fromY = window.scrollY;
  const delta = toY - fromY;
  if (Math.abs(delta) < 1) {
    window.scrollTo({ top: toY, behavior: "auto" });
    onComplete();
    return;
  }

  const durationMs = Math.max(durationSeconds * 1000, 120);
  const startAt = performance.now();

  const step = (now: number) => {
    if (token !== scrollToken) return;

    const elapsed = now - startAt;
    const t = clamp(elapsed / durationMs, 0, 1);
    const eased = easeOutQuint(t);
    const nextY = fromY + delta * eased;

    window.scrollTo({ top: nextY, behavior: "auto" });

    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }

    window.scrollTo({ top: toY, behavior: "auto" });
    onComplete();
  };

  requestAnimationFrame(step);
}

function scrollToY(targetY: number, durationSeconds: number) {
  const currentToken = ++scrollToken;
  const lenis = window.__lenis;

  if (lenis) {
    lenis.start();
    lenis.scrollTo(targetY, {
      duration: durationSeconds,
      easing: easeOutQuint,
      force: true,
      lock: true,
      onComplete: () => {
        refreshScrollSystems();
      },
    });
    return;
  }

  // Use the same RAF-driven animation on both desktop and mobile.
  // The native `window.scrollTo({ behavior: "smooth" })` returns
  // immediately, so `refreshScrollSystems()` would run
  // `ScrollTrigger.refresh()` while the browser is still animating the
  // scroll, which can interrupt the animation and leave the page near its
  // original position. Animating with RAF lets us call
  // `refreshScrollSystems()` only after the scroll finishes.
  animateNativeScrollTo(targetY, durationSeconds, currentToken, () => {
    refreshScrollSystems();
  });
}

export function getDestinationAnchorId(route: string): string {
  return `destino-${route.replace(/^\//, "")}`;
}

export function getHomeDestinationMenuItems() {
  return destinationCardsData.map((card) => ({
    label: HOME_DESTINATION_LABELS[card.route] ?? card.label,
    ariaLabel: `Ir a ${HOME_DESTINATION_LABELS[card.route] ?? card.label}`,
    link: `#${getDestinationAnchorId(card.route)}`,
    destinationRoute: card.route,
  }));
}

export function scrollToHomeDestination(
  route: string,
  options: ScrollToDestinationOptions = {},
): boolean {
  if (typeof window === "undefined") return false;

  const index = destinationCardsData.findIndex((card) => card.route === route);
  if (index < 0) return false;

  const section = document.getElementById(DESTINATIONS_SECTION_ID);
  if (!section) return false;

  const pinSection =
    section.querySelector<HTMLElement>('[data-destination-pin="true"]') ??
    section;

  const duration = options.duration ?? 1.1;
  const updateHash = options.updateHash ?? true;
  const defer = options.defer ?? true;
  const isStaticLayout =
    pinSection.getAttribute("data-static-layout") === "true" ||
    pinSection.classList.contains("containerStatic");
  const stepCount = Math.max(destinationCardsData.length - 1, 1);

  const performScroll = () => {
    const card = pinSection.querySelector<HTMLElement>(
      `[data-route="${route}"]`,
    );
    const sectionTop = pinSection.getBoundingClientRect().top + window.scrollY;

    let targetY = sectionTop;
    if (isStaticLayout && card) {
      targetY = card.getBoundingClientRect().top + window.scrollY;
    } else {
      const triggerStart = Number(pinSection.dataset.scrollStart ?? Number.NaN);
      const triggerEnd = Number(pinSection.dataset.scrollEnd ?? Number.NaN);
      const hasTriggerBounds =
        Number.isFinite(triggerStart) &&
        Number.isFinite(triggerEnd) &&
        triggerEnd > triggerStart;

      if (hasTriggerBounds) {
        targetY =
          triggerStart + (index / stepCount) * (triggerEnd - triggerStart);
      } else {
        const datasetScrollDistance = Number(
          pinSection.dataset.scrollDistance ?? 0,
        );
        const embedded = pinSection.dataset.embedded === "true";
        const viewportHeight = Math.max(
          pinSection.clientHeight,
          window.innerHeight,
        );
        const fallbackDistanceFactor = window.matchMedia("(max-width: 900px)")
          .matches
          ? embedded
            ? 1.28
            : 1.42
          : embedded
            ? 1.68
            : 1.9;
        const scrollDistance =
          datasetScrollDistance ||
          viewportHeight * stepCount * fallbackDistanceFactor;
        targetY = sectionTop + (index / stepCount) * scrollDistance;
      }
    }

    scrollToY(targetY, duration);

    if (updateHash) {
      window.history.replaceState(null, "", `#${getDestinationAnchorId(route)}`);
    }
  };

  if (defer) {
    requestAnimationFrame(() => {
      requestAnimationFrame(performScroll);
    });
  } else {
    performScroll();
  }

  return true;
}
