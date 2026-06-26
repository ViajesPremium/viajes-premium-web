"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import GradientText from "@/components/ui/gradient-text/GradientText";
import styles from "./Itineraries.module.css";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { scrollToSection } from "@/lib/scroll-to-section";
import { downloadFiles } from "@/lib/download-files";
import { Button } from "@/components/ui/button/Button";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import { useStackedCardScrollAnimation } from "@/features/shared/hooks/useStackedCardScrollAnimation";
import type { LandingTheme } from "@/features/landings/data/types";

type ItinerariesProps = {
  landing: LandingTheme;
};

function normalizeHex(hex: string) {
  const value = hex.trim();
  if (!value.startsWith("#")) return null;
  const raw = value.slice(1);
  if (raw.length === 3) {
    return raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase();
  }
  if (raw.length === 6) return raw.toLowerCase();
  return null;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function mixHexColors(base: string, mix: string, amount: number) {
  const baseRgb = hexToRgb(base);
  const mixRgb = hexToRgb(mix);
  if (!baseRgb || !mixRgb) return base;

  const blend = (start: number, target: number) =>
    start * (1 - amount) + target * amount;

  return rgbToHex(
    blend(baseRgb.r, mixRgb.r),
    blend(baseRgb.g, mixRgb.g),
    blend(baseRgb.b, mixRgb.b),
  );
}

function buildItineraryPalettes(secondary: string) {
  const solidPrimary = normalizeHex(secondary) ? secondary : "#1f2937";
  return [
    {
      background: mixHexColors(solidPrimary, "#000000", 0.18),
      accent: mixHexColors(solidPrimary, "#ffffff", 0.18),
    },
    {
      background: mixHexColors(solidPrimary, "#000000", 0.3),
      accent: mixHexColors(solidPrimary, "#ffffff", 0.24),
    },
    {
      background: mixHexColors(solidPrimary, "#000000", 0.42),
      accent: mixHexColors(solidPrimary, "#ffffff", 0.3),
    },
  ] as const;
}

export default function Itinerary({ landing }: ItinerariesProps) {
  const { triggerTransition } = usePageTransition();
  const { palette, itineraries } = landing;

  const items = itineraries.items;
  const palettes = useMemo(
    () => buildItineraryPalettes(palette.secondary),
    [palette.secondary],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");

    const syncViewport = () => {
      setIsMobile(mediaQuery.matches);
      setViewportReady(true);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const disableAnimationsForDevice = !viewportReady || !animationsEnabled;

  const handleDownloadPdf = useCallback(
    (index: number) => {
      const activeItem = items[index];
      if (!activeItem?.pdfHref) return;
      downloadFiles([
        {
          href: activeItem.pdfHref,
          fileName:
            activeItem.pdfFileName ??
            `${activeItem.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        },
      ]);
    },
    [items],
  );

  const handleGoToForm = useCallback(() => {
    const target = itineraries.primaryCta.target;
    if (target.startsWith("#")) {
      scrollToSection(target, { duration: 1.15 });
      return;
    }
    triggerTransition(target);
  }, [itineraries.primaryCta.target, triggerTransition]);

  useStackedCardScrollAnimation({
    scopeRef: sectionRef,
    cardSelector: `.${styles.slide}`,
    enabled: !disableAnimationsForDevice,
    isMobile,
    embedded: false,
    anticipatePin: 0,
    refreshPriority: 2,
    refreshOnPageAssets: true,
    snap: false,
    releaseBuffer: isMobile ? 0.22 : 0.18,
    fastScrollEnd: false,
  });

  const sectionClassName = disableAnimationsForDevice
    ? `${styles.section} ${styles.sectionStatic}`
    : styles.section;

  return (
    <section className={sectionClassName} ref={sectionRef}>
      <h2 className="srOnly">{itineraries.srHeading}</h2>

      <div className={styles.stack}>
        {items.map((item, i) => {
          const indexLabel = `${String(i + 1).padStart(2, "0")}`;
          const palette = palettes[i % palettes.length];
          const contentStyle = {
            "--itinerary-background": palette.background,
            "--itinerary-accent": palette.accent,
          } as CSSProperties;

          return (
            <div key={item.id} className={styles.slide}>
              <div className={styles.content} style={contentStyle}>
                {/* TOP */}
                <div className={styles.copyColumn}>
                  <div className={styles.top}>
                    <div className={styles.topLeft}>
                      <GradientText
                        as="span"
                        className={styles.title}
                        allowWrap
                      >
                        {item.title}
                      </GradientText>
                      <span className={styles.eyebrow}>{item.day}</span>
                    </div>
                    <p className={styles.indexNumMobile} aria-hidden="true">
                      {indexLabel}
                    </p>
                  </div>

                  <div className={styles.bottomLeft}>
                    <p className={styles.description}>{item.description}</p>
                    <p className={styles.idealText}>{item.ideal}</p>
                    <p className={styles.price}>{item.price}</p>
                    <div className={styles.buttons}>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadPdf(i)}
                      >
                        {itineraries.secondaryCtaLabel}
                      </Button>
                      <div className={styles.primaryCtaGold}>
                        <Button onClick={handleGoToForm}>
                          {itineraries.primaryCta.label}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.bottomRight}>
                  <span className={styles.tag}>Itinerario Premium</span>
                  <p className={styles.indexNum}>{indexLabel}</p>
                  <div className={styles.imageContainer}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className={styles.image}
                      loading={i === 0 ? "eager" : "lazy"}
                      priority={i === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden list for SEO and accessibility */}
      <div
        className="srOnly"
        aria-label="Lista completa de itinerarios y precios"
      >
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.day}. {item.title}. {item.price}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
