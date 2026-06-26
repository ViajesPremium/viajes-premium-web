"use client";

type ScrollOffsetConfig = {
  viewportHeightMultiplier: number;
  desktopOnly?: boolean;
};

type ScrollToSectionOptions = {
  duration?: number;
  updateHash?: boolean;
  defer?: boolean;
  /** Skip animation and jump instantly to the target. */
  immediate?: boolean;
};

const SECTION_ALIAS_MAP: Record<string, string> = {
  "#form": "#second-form",
  "#testimonios": "#testimonials",
  "#contacto": "#second-form",
  "#cta-form": "#second-form",
  "#itinerario": "#itinerarios",
};

const ITINERARIES_PASSTHROUGH_TARGETS = new Set([
  "#second-form",
  "#itinerarios",
  "#inicio",
]);

const REVEAL_SCROLL_OFFSETS: Record<string, ScrollOffsetConfig> = {
  "#itinerarios": { viewportHeightMultiplier: 1, desktopOnly: true },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

let scrollToken = 0;

function normalizeSectionHash(hash: string): string {
  return SECTION_ALIAS_MAP[hash] ?? hash;
}

function isItinerariesMounted(): boolean {
  const section = document.querySelector("#itinerarios");
  if (!section) return true;
  const first = section.firstElementChild as HTMLElement | null;
  if (!first) return false;
  return first.getAttribute("aria-hidden") !== "true";
}

// Returns true when `element` appears after #itinerarios in the document.
// Any such element will be shifted down once GSAP creates the pin spacers,
// so we must wait for initialization before calculating its scroll target.
function isAfterItineraries(element: HTMLElement): boolean {
  const itineraries = document.querySelector("#itinerarios");
  if (!itineraries) return false;
  // DOCUMENT_POSITION_PRECEDING (2): itineraries comes before element → element is after it
  return !!(element.compareDocumentPosition(itineraries) & Node.DOCUMENT_POSITION_PRECEDING);
}

// Polls the target's absolute scroll position every 50 ms and fires onReady
// once it has been stable (< 2px change) for 200 ms straight.
// This covers GSAP pin-spacer creation, video-metadata height changes, and
// any other deferred layout shifts — without needing to enumerate them.
function waitForStablePosition(getY: () => number, onReady: () => void): void {
  const MAX_MS = 3000;
  const STABLE_MS = 200;
  const POLL_MS = 50;
  const start = Date.now();
  let lastY = NaN;
  let stableFor = 0;

  const poll = () => {
    const y = getY();
    if (!isNaN(lastY) && Math.abs(y - lastY) < 2) {
      stableFor += POLL_MS;
      if (stableFor >= STABLE_MS) { onReady(); return; }
    } else {
      stableFor = 0;
    }
    lastY = y;
    if (Date.now() - start > MAX_MS) { onReady(); return; }
    setTimeout(poll, POLL_MS);
  };

  poll();
}

const refreshScrollSystems = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__lenis?.resize();
      void import("gsap/ScrollTrigger")
        .then(({ ScrollTrigger }) => ScrollTrigger.refresh())
        .catch(() => {});
    });
  });
};

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

export function scrollToSection(
  hash: string,
  options: ScrollToSectionOptions = {},
): boolean {
  if (typeof window === "undefined" || !hash.startsWith("#")) {
    return false;
  }

  const normalizedHash = normalizeSectionHash(hash);
  const target = document.querySelector(normalizedHash) as HTMLElement | null;
  if (!target) {
    return false;
  }

  const offsetConfig = REVEAL_SCROLL_OFFSETS[normalizedHash];
  const duration = options.duration ?? 1.1;
  const immediate = options.immediate ?? false;
  const updateHash = options.updateHash ?? true;
  const defer = options.defer ?? true;
  const currentToken = ++scrollToken;

  // ── Early bypass flags ───────────────────────────────────────────────────────
  // Set IMMEDIATELY — before any RAF delay or waitForStablePosition — so they
  // are active during ScrollTrigger.refresh() (which temporarily scrolls the
  // page to recalculate pin positions) and during any touch-momentum scroll on
  // iOS that could carry the page into the itineraries zone in the ~2 frame
  // gap between the click and performScroll running.
  // Direction is derived from DOM order (accurate enough for the common cases:
  //   #form  → after  itineraries → direction 1  (scroll down from hero)
  //   #inicio → before itineraries → direction -1 (scroll up from footer)
  // performScroll() refines direction from real scroll positions and resets the
  // window to 2400 ms, which covers the actual scroll animation duration.
  const isItinerariesPassthroughTarget =
    ITINERARIES_PASSTHROUGH_TARGETS.has(normalizedHash);
  if (isItinerariesPassthroughTarget) {
    const ps = window as unknown as Record<string, unknown>;
    ps.__itinerariesBypassDirection = isAfterItineraries(target) ? 1 : -1;
    // 5 s covers: force-mount (React re-render) + waitForStablePosition (≤3 s)
    // + ScrollTrigger.refresh() + 2 RAF frames before performScroll runs.
    ps.__itinerariesBypassUntil = Date.now() + 5_000;
    // #inicio always scrolls to the very top — set the target now so the
    // onEnterBack fallback check in itineraries.tsx can use it even before
    // performScroll() calculates the real targetY.
    if (normalizedHash === "#inicio") {
      ps.__itinerariesScrollTarget = 0;
    }
  }

  const performScroll = () => {
    // Drop stale scroll jobs if user clicked another CTA quickly.
    if (currentToken !== scrollToken) {
      return;
    }

    // Calculate position here (at execution time) so that any layout changes
    // from lazy-mounted sections or GSAP pin spacers are accounted for.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const shouldApplyOffset =
      !!offsetConfig && (!offsetConfig.desktopOnly || isDesktop);
    const offsetPx = shouldApplyOffset
      ? window.innerHeight * offsetConfig.viewportHeightMultiplier
      : 0;
    const rawY = target.getBoundingClientRect().top + window.scrollY + offsetPx;
    const maxY = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    );
    const targetY = clamp(rawY, 0, maxY);

    if (isItinerariesPassthroughTarget) {
      const direction = targetY >= window.scrollY ? 1 : -1;
      const passthroughState = window as unknown as Record<string, unknown>;
      passthroughState.__itinerariesBypassDirection = direction;
      passthroughState.__itinerariesBypassUntil = Date.now() + 2400;
      passthroughState.__itinerariesScrollTarget = targetY;
      setTimeout(() => {
        const now = Date.now();
        const stillActiveUntil =
          typeof passthroughState.__itinerariesBypassUntil === "number"
            ? (passthroughState.__itinerariesBypassUntil as number)
            : 0;
        if (now >= stillActiveUntil) {
          delete passthroughState.__itinerariesBypassDirection;
          delete passthroughState.__itinerariesBypassUntil;
          delete passthroughState.__itinerariesScrollTarget;
        }
      }, 2600);
    }

    const lenis = window.__lenis;
    if (immediate) {
      if (lenis) {
        lenis.start();
        lenis.scrollTo(targetY, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: targetY, behavior: "auto" });
      }
      refreshScrollSystems();
    } else if (lenis) {
      // A few sections pause Lenis during interactive pins.
      // Force/start ensures CTA navigation always works.
      lenis.start();
      lenis.scrollTo(targetY, {
        duration,
        easing: easeOutQuint,
        force: true,
        lock: true,
        onComplete: () => {
          // Keep pin spacers + scroll limits in sync after long jumps.
          refreshScrollSystems();
        },
      });
    } else {
      // Use the same RAF-driven animation on both desktop and mobile.
      // The native `window.scrollTo({ behavior: "smooth" })` returns
      // immediately, so the `refreshScrollSystems()` call below would fire
      // `ScrollTrigger.refresh()` while the browser is still animating the
      // scroll, which can interrupt the animation and leave the page near
      // its original position. Animating with RAF lets us call
      // `refreshScrollSystems()` only after the scroll finishes — matching
      // the mobile path and keeping pin spacers in sync with the new offset.
      animateNativeScrollTo(targetY, duration, currentToken, () => {
        refreshScrollSystems();
      });
    }

    if (updateHash) {
      window.history.replaceState(null, "", normalizedHash);
    }
  };

  if (defer) {
    // On first load, deferred sections are placeholders and GSAP hasn't created
    // the #itinerarios pin spacer yet. Any target at or after #itinerarios will
    // have an incorrect position until the pin spacer exists, because it adds
    // several viewport-heights of scroll distance. Force-mount all sections and
    // poll until GSAP is ready before calculating the scroll target.
    const needsInit =
      !isItinerariesMounted() &&
      (normalizedHash === "#itinerarios" || isAfterItineraries(target));

    if (needsInit) {
      window.__forceMountPremiumSections?.();
      waitForStablePosition(
        () => target.getBoundingClientRect().top + window.scrollY,
        () => {
          // After layout stabilises, refresh GSAP ScrollTrigger so pin
          // boundaries are recalculated with the real section heights before
          // we start the Lenis animation. Without this, trigger positions
          // are stale (computed from placeholder heights), causing the
          // itineraries pin to fire at the wrong scroll offset.
          void import("gsap/ScrollTrigger")
            .then(({ ScrollTrigger }) => {
              ScrollTrigger.refresh();
              requestAnimationFrame(() => requestAnimationFrame(performScroll));
            })
            .catch(() => {
              requestAnimationFrame(() => requestAnimationFrame(performScroll));
            });
        },
      );
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(performScroll);
      });
    }
  } else {
    performScroll();
  }

  return true;
}
