"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

type UseStackedCardScrollAnimationOptions = {
  scopeRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  cardSelector: string;
  enabled: boolean;
  isMobile: boolean;
  embedded?: boolean;
  dimLayerSelector?: string;
  leftCharacterSelector?: string;
  rightCharacterSelector?: string;
  onActiveIndexChange?: (index: number) => void;
  anticipatePin?: number;
  refreshPriority?: number;
  refreshOnPageAssets?: boolean;
  snap?: boolean;
  releaseBuffer?: number;
  fastScrollEnd?: boolean;
};

function getDistanceFactor(isMobile: boolean, embedded: boolean) {
  if (isMobile) return embedded ? 1.28 : 1.42;
  return embedded ? 1.68 : 1.9;
}

export function useStackedCardScrollAnimation({
  scopeRef,
  triggerRef,
  cardSelector,
  enabled,
  isMobile,
  embedded = false,
  dimLayerSelector,
  leftCharacterSelector,
  rightCharacterSelector,
  onActiveIndexChange,
  anticipatePin = 0.35,
  refreshPriority = 1,
  refreshOnPageAssets = true,
  snap = true,
  releaseBuffer = 0,
  fastScrollEnd = false,
}: UseStackedCardScrollAnimationOptions) {
  useGSAP(
    () => {
      if (!enabled) return;

      gsap.registerPlugin(ScrollTrigger);

      const scope = scopeRef.current;
      if (!scope) return;
      const triggerElement = triggerRef?.current ?? scope;

      const cards = Array.from(scope.querySelectorAll<HTMLElement>(cardSelector));
      const dimLayers = dimLayerSelector
        ? Array.from(
            scope.querySelectorAll<HTMLElement>(dimLayerSelector),
          )
        : [];
      const leftCharacters = leftCharacterSelector
        ? cards.map((card) =>
            card.querySelector<HTMLElement>(leftCharacterSelector),
          )
        : [];
      const rightCharacters = rightCharacterSelector
        ? cards.map((card) =>
            card.querySelector<HTMLElement>(rightCharacterSelector),
          )
        : [];

      if (cards.length < 2) return;

      cards.forEach((card, index) => {
        card.style.zIndex = String(index + 1);
      });

      gsap.set(cards.slice(1), {
        yPercent: 100,
        scale: 0.92,
        transformOrigin: "50% 100%",
      });
      if (dimLayers.length > 0) {
        gsap.set(dimLayers, { opacity: 0 });
      }
      gsap.set(cards, { pointerEvents: "none" });
      gsap.set(cards[0], { pointerEvents: "auto" });
      if (leftCharacters.length > 0) {
        gsap.set(leftCharacters, { xPercent: -130 });
      }
      if (rightCharacters.length > 0) {
        gsap.set(rightCharacters, { xPercent: 130 });
      }
      if (leftCharacters[0] && rightCharacters[0]) {
        gsap.set([leftCharacters[0], rightCharacters[0]], { xPercent: 0 });
      }

      const timeline = gsap.timeline({ defaults: { ease: "none" } });

      for (let i = 1; i < cards.length; i += 1) {
        const start = i - 1;
        const previousLeft = leftCharacters[i - 1];
        const previousRight = rightCharacters[i - 1];
        const currentLeft = leftCharacters[i];
        const currentRight = rightCharacters[i];

        if (previousLeft) {
          timeline.to(
            previousLeft,
            {
              xPercent: -130,
              duration: 0.36,
              ease: "power2.inOut",
            },
            start + 0.02,
          );
        }
        if (previousRight) {
          timeline.to(
            previousRight,
            {
              xPercent: 130,
              duration: 0.36,
              ease: "power2.inOut",
            },
            start + 0.02,
          );
        }

        if (dimLayers[i - 1]) {
          timeline.to(
            dimLayers[i - 1],
            { opacity: isMobile ? 0.08 : 0.13, duration: 0.2 },
            start,
          );
          timeline.to(
            dimLayers[i - 1],
            { opacity: 0, duration: 0.8 },
            start + 0.2,
          );
        }

        timeline.to(cards[i], { yPercent: 0, scale: 1, duration: 1 }, start);

        if (currentLeft) {
          timeline.to(
            currentLeft,
            {
              xPercent: 0,
              duration: 0.42,
              ease: "power2.out",
            },
            start + 0.44,
          );
        }
        if (currentRight) {
          timeline.to(
            currentRight,
            {
              xPercent: 0,
              duration: 0.42,
              ease: "power2.out",
            },
            start + 0.44,
          );
        }
      }

      const stepCount = cards.length - 1;
      const distanceFactor = getDistanceFactor(isMobile, embedded);
      const releaseHoldDuration =
        releaseBuffer > 0 ? releaseBuffer / distanceFactor : 0;

      if (releaseHoldDuration > 0) {
        timeline.to(
          {},
          {
            duration: releaseHoldDuration,
          },
          stepCount,
        );
      }

      const viewportHeight = Math.max(scope.clientHeight, window.innerHeight);
      const scrollDistance =
        viewportHeight * stepCount * distanceFactor +
        viewportHeight * releaseBuffer;

      scope.dataset.scrollDistance = String(scrollDistance);
      scope.dataset.stepCount = String(stepCount);
      scope.dataset.embedded = embedded ? "true" : "false";

      const activeIndexRef = { current: 0 };
      const pendingAssetRefreshRef = { current: false };

      const trigger = ScrollTrigger.create({
        animation: timeline,
        trigger: triggerElement,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        scrub: 1.2,
        pin: scope,
        anticipatePin,
        fastScrollEnd,
        refreshPriority,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          if (dimLayers.length > 0) {
            gsap.set(dimLayers, { opacity: 0 });
          }
        },
        onRefresh: (self) => {
          scope.dataset.scrollStart = String(self.start);
          scope.dataset.scrollEnd = String(self.end);
        },
        snap: !snap || embedded
          ? undefined
          : {
              snapTo: 1 / stepCount,
              duration: { min: 0.12, max: 0.32 },
              delay: 0.08,
            },
        onUpdate: (self) => {
          const nextIndex = Math.round(self.progress * stepCount);

          cards.forEach((card, index) => {
            card.style.pointerEvents = index === nextIndex ? "auto" : "none";
          });

          if (nextIndex !== activeIndexRef.current) {
            activeIndexRef.current = nextIndex;
            onActiveIndexChange?.(nextIndex);
          }
        },
        onLeave: () => {
          if (!pendingAssetRefreshRef.current) return;
          pendingAssetRefreshRef.current = false;
          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
        onLeaveBack: () => {
          if (!pendingAssetRefreshRef.current) return;
          pendingAssetRefreshRef.current = false;
          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
      });

      scope.dataset.scrollStart = String(trigger.start);
      scope.dataset.scrollEnd = String(trigger.end);

      const cleanupCallbacks: Array<() => void> = [];
      let refreshFrame: number | null = null;
      let refreshTimer: number | null = null;

      const scheduleAssetRefresh = () => {
        if (!refreshOnPageAssets) return;
        if (trigger.isActive) {
          pendingAssetRefreshRef.current = true;
          return;
        }
        if (refreshFrame !== null || refreshTimer !== null) return;

        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = null;
          refreshTimer = window.setTimeout(() => {
            refreshTimer = null;
            if (trigger.isActive) {
              pendingAssetRefreshRef.current = true;
              return;
            }
            ScrollTrigger.refresh();
          }, 80);
        });
      };

      const fontsReady = document.fonts?.ready;
      if (fontsReady) {
        void fontsReady.then(scheduleAssetRefresh);
      }

      const onWindowLoad = () => scheduleAssetRefresh();
      window.addEventListener("load", onWindowLoad, { once: true });
      cleanupCallbacks.push(() =>
        window.removeEventListener("load", onWindowLoad),
      );

      const lateAssets = Array.from(
        document.querySelectorAll<HTMLImageElement | HTMLIFrameElement>(
          "img, iframe",
        ),
      );
      lateAssets.forEach((asset) => {
        if (asset instanceof HTMLImageElement && asset.complete) return;
        const onAssetSettled = () => scheduleAssetRefresh();
        asset.addEventListener("load", onAssetSettled, { once: true });
        asset.addEventListener("error", onAssetSettled, { once: true });
        cleanupCallbacks.push(() => {
          asset.removeEventListener("load", onAssetSettled);
          asset.removeEventListener("error", onAssetSettled);
        });
      });

      return () => {
        cleanupCallbacks.forEach((cleanup) => cleanup());
        if (refreshFrame !== null) {
          cancelAnimationFrame(refreshFrame);
        }
        if (refreshTimer !== null) {
          window.clearTimeout(refreshTimer);
        }
        trigger.kill();
        timeline.kill();
      };
    },
    {
      scope: scopeRef,
      dependencies: [
        enabled,
        triggerRef,
        embedded,
        isMobile,
        cardSelector,
        dimLayerSelector,
        leftCharacterSelector,
        rightCharacterSelector,
        anticipatePin,
        refreshPriority,
        refreshOnPageAssets,
        snap,
        releaseBuffer,
        fastScrollEnd,
      ],
    },
  );
}
