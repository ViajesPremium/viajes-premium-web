"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "@/features/about-us/sections/about-us-timeline/about-us.module.css";
import { AboutUsHorizontalTimeline } from "@/features/about-us/sections/about-us-timeline/AboutUsHorizontalTimeline";
import Alianzas from "./Alianzas";

import AboutUsHero from "@/features/about-us/sections/about-us-hero/AboutUsHero";
import Founders from "@/features/about-us/sections/founders/Founders";
import Footer from "@/features/landings/sections/footer/Footer";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import { SITE_FOOTER } from "@/features/shared/data/site-footer";

export default function Nosotros() {
  const animationsEnabled = useAnimationsEnabled();
  const heroPinRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const disableForDevice =
        !animationsEnabled && window.matchMedia("(max-width: 1024px)").matches;
      if (disableForDevice) return;

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const heroPin = heroPinRef.current;
      if (!section || !heroPin) return;

      const isMobileViewport = window.matchMedia("(max-width: 959px)").matches;
      const heroCoverTrigger = isMobileViewport
        ? null
        : ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "top top",
          pin: heroPin,
          pinSpacing: false,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        });

      return () => {
        heroCoverTrigger?.kill();
      };
    },
    { scope: sectionRef, dependencies: [animationsEnabled] },
  );

  return (
    <main className={styles.page}>
      <div ref={heroPinRef} className={styles.heroPinned}>
        <AboutUsHero />
      </div>

      <section ref={sectionRef} className={styles.section}>
        <AboutUsHorizontalTimeline />
        <Alianzas />
        <Founders />
      </section>

      <Footer config={SITE_FOOTER} />
    </main>
  );
}
