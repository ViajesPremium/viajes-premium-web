"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SmothScrollProviderProps = {
  children: ReactNode;
};

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export default function SmothScrollProvider({
  children,
}: SmothScrollProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.35,
      easing: easeOutQuart,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.25,
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
