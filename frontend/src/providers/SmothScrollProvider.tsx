"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLowEndMobileDevice } from "@/lib/animation-budget";

type SmothScrollProviderProps = {
  children: ReactNode;
};

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export default function SmothScrollProvider({
  children,
}: SmothScrollProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── Truco anti-colapso de la barra del navegador en móvil ──────────────────
    // Con `syncTouch`, Lenis cancela el gesto táctil nativo (preventDefault) y
    // mueve el scroll de `window` por código. Como el scroll deja de ser un
    // gesto nativo sobre el documento raíz, el navegador NO esconde su barra de
    // URL → `innerHeight` queda estable → desaparecen los reposicionamientos de
    // `100vh`/`svh` y los recálculos de ScrollTrigger.
    //
    // Es más pesado en CPU, así que lo desactivamos en gama baja y con
    // reduced-motion: ahí cae al scroll táctil nativo (la barra sí se esconderá,
    // pero priorizamos la fluidez).
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const enableSyncTouch = !prefersReducedMotion && !isLowEndMobileDevice();

    const lenis = new Lenis({
      duration: 1.35,
      easing: easeOutQuart,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.25,
      syncTouch: enableSyncTouch,
      // Lerp un pelín más alto que el default (0.075) para que el scroll táctil
      // por código siga al dedo con menos "arrastre".
      syncTouchLerp: 0.09,
      autoRaf: false,
    });

    window.__lenis = lenis;

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    const tickLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    const refreshScrollSystems = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);

    const refreshFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(refreshScrollSystems);
    });

    window.addEventListener("resize", refreshScrollSystems);

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener("resize", refreshScrollSystems);
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(tickLenis);
      lenis.destroy();

      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
