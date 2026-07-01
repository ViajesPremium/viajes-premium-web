"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Lenis solo se usa en escritorio. En móvil el scroll suave por código
// (incluso sin syncTouch) seguía provocando saltos de viewport por el
// repliegue/expansión de la barra de direcciones, así que ahí dejamos el
// scroll nativo del navegador. ScrollTrigger no necesita a Lenis para
// funcionar: por sí solo ya escucha el scroll nativo del documento.
const DESKTOP_QUERY = "(min-width: 769px)";

export default function SmothScrollProvider({
  children,
}: SmothScrollProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    let lenis: Lenis | null = null;
    let tickLenis: ((time: number) => void) | null = null;
    let updateScrollTrigger: (() => void) | null = null;
    let teardownLenis: (() => void) | null = null;

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

      if (!desktopQuery.matches) {
        restoreNativeScroll();
        return;
      }

      lenis?.resize();
      ScrollTrigger.refresh();
    };

    const setupLenis = () => {
      lenis = new Lenis({
        duration: 1.35,
        easing: easeOutQuart,
        smoothWheel: true,
        wheelMultiplier: 0.82,
        touchMultiplier: 1.25,
        syncTouch: false,
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

      if (desktopQuery.matches) {
        setupLenis();
      } else {
        restoreNativeScroll();
      }
    };

    // En el montaje inicial NO refrescamos ScrollTrigger de inmediato: el
    // layout (imágenes, fuentes) puede no estar listo todavía y un refresh
    // prematuro calcula mal el alto de las secciones con pin, dejando la
    // página sin poder hacer scroll. El primer refresh real llega más abajo,
    // tras el doble `requestAnimationFrame`.
    gsap.ticker.lagSmoothing(0);
    applyForViewport();

    const handleViewportChange = () => {
      applyForViewport();
      refreshScrollSystems();
    };
    desktopQuery.addEventListener("change", handleViewportChange);

    const refreshFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (desktopQuery.matches) {
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
      desktopQuery.removeEventListener("change", handleViewportChange);
      teardownLenis?.();
    };
  }, []);

  return <>{children}</>;
}
