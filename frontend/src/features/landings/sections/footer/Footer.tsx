"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import type { LandingFooter, LandingTheme } from "@/features/landings/data/types";
import { SocialIcon } from "@/components/ui/social-icon/SocialIcon";
import TextPressure from "@/features/shared/components/ui/text-animations/TextPressure";
import styles from "./Footer.module.css";

gsap.registerPlugin(ScrollTrigger);

const pressureFont = "/media/shared/fonts/nohemi-font-family/Nohemi-VF.woff2";

type FooterProps =
  | {
      landing: LandingTheme;
      config?: never;
    }
  | {
      landing?: never;
      config: LandingFooter;
    };

export default function Footer(props: FooterProps) {
  const config = props.config ?? props.landing.footer;
  const animationsEnabled = useAnimationsEnabled();
  const footerRef = useRef<HTMLElement>(null);
  const logoBandRef = useRef<HTMLDivElement>(null);
  const pressureWordRef = useRef<HTMLDivElement>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const logoWord = config.logoWord ?? "VIAJES";
  const isMainBrandFooter = logoWord.trim().toUpperCase() === "VIAJES";
  const logoColor = isMainBrandFooter
    ? "#ffffff"
    : (config.logoWordColor ?? "var(--primary)");
  const logoRegisteredMarkColor = isMainBrandFooter
    ? "#ffffff"
    : (config.logoWordColor ?? "var(--primary)");
  const logoBandStyle = {
    "--footer-logo-line-color": logoColor,
    "--footer-logo-registered-color": logoRegisteredMarkColor,
  } as CSSProperties;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobileViewport(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      const disableForDevice =
        !animationsEnabled && window.matchMedia("(max-width: 1024px)").matches;
      if (disableForDevice) return;

      const footerEl = footerRef.current;
      const logoBand = logoBandRef.current;
      const pressureWord = pressureWordRef.current;
      if (!footerEl || !logoBand) return;

      const viajesWord = logoBand.querySelector<HTMLElement>(
        `.${styles.logoViajesWord}`,
      );
      if (!viajesWord) return;

      let hasRevealed = false;
      const reveal = () => {
        if (hasRevealed) return;
        hasRevealed = true;

        gsap.fromTo(
          viajesWord,
          { y: 8, autoAlpha: 0.001, filter: "blur(1px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.72,
            ease: "power2.out",
            overwrite: "auto",
          },
        );

        if (pressureWord) {
          gsap.fromTo(
            pressureWord,
            {
              y: 14,
              autoAlpha: 0.001,
              scale: 0.994,
              filter: "blur(2px)",
              transformOrigin: "50% 100%",
            },
            {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.88,
              ease: "power2.out",
              delay: 0.16,
              overwrite: "auto",
            },
          );
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: footerEl,
        start: "top 82%",
        end: "bottom 20%",
        onEnter: reveal,
        onEnterBack: reveal,
      });

      if (trigger.isActive || trigger.progress > 0) {
        reveal();
      }
    },
    { scope: footerRef, dependencies: [animationsEnabled] },
  );

  const mapQuery = useMemo(
    () => encodeURIComponent(config.address),
    [config.address],
  );
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const googleMapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const handleSectionNav = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();
      scrollToSection(href, { duration: 1.15, updateHash: true, defer: true });
    },
    [],
  );

  const handleBackToTop = useCallback(() => {
    scrollToSection("#inicio", { duration: 1.5, updateHash: false });
  }, []);

  return (
    <footer ref={footerRef} className={styles.footer}>
      <h2 className="srOnly">{config.srHeading}</h2>

      <div className={styles.topSection}>
        <div className={styles.topLeft}>
          <div className={styles.textCols}>
            <div className={styles.navSection}>
              <span className={styles.sectionLabel}>PÁGINAS</span>
              <nav className={styles.navLinks}>
                {config.pageLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={styles.navLink}
                    title={item.label}
                    onClick={(event) => handleSectionNav(event, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className={styles.navSection}>
              <span className={styles.sectionLabel}>SÍGUENOS</span>
              <nav className={styles.socialNav} aria-label="Redes sociales">
                {config.socialLinks.map((item) => {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className={styles.socialIconLink}
                      aria-label={item.label}
                      title={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon platform={item.label} size={24} />
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className={styles.navSection}>
              <span className={styles.sectionLabel}>CONTACTO</span>
              <nav className={styles.navLinks}>
                <a
                  href={`mailto:${config.contactEmail}`}
                  className={styles.navLink}
                  title={`Enviar correo a ${config.contactEmail}`}
                >
                  {config.contactEmail}
                </a>
                <a
                  href={`tel:${config.contactPhoneLink}`}
                  className={styles.navLink}
                  title={`Llamar al ${config.contactPhoneDisplay}`}
                >
                  {config.contactPhoneDisplay}
                </a>
              </nav>
            </div>

            <div className={`${styles.navSection} ${styles.backToTopSection}`}>
              <button
                type="button"
                onClick={handleBackToTop}
                className={styles.backToTopIcon}
                aria-label={config.backToTopLabel || "Volver al inicio"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.mapCard}>
            <p className={styles.mapAddress}>{config.address}</p>
            <div className={styles.mapFrameWrap}>
              <iframe
                title={config.mapEmbedTitle}
                src={googleMapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={googleMapsOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapButton}
              title="Abrir ubicación en Google Maps"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </div>

      <div
        ref={logoBandRef}
        className={styles.logoBand}
        style={logoBandStyle}
        aria-hidden="true"
      >
        <div className={styles.logoBandTop}>
          <div className={styles.logoTopRow}>
            <div className={styles.logoViajesWord} style={{ color: logoColor }}>
              {logoWord}
            </div>
            <div className={styles.logoTopLine} />
          </div>
        </div>

        <div ref={pressureWordRef} className={styles.logoPremiumPressure}>
          <TextPressure
            text="PREMIUM"
            className={styles.logoPressureText}
            fontFamily="Nohemi"
            fontUrl={pressureFont}
            fontWeight={700}
            fontStyle="normal"
            fontSize="var(--footer-premium-font-size)"
            flex={false}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            weightFrom={700}
            weightTo={400}
            scaleFrom={1}
            scaleTo={1}
            minFontSize={40}
            animate={animationsEnabled && !isMobileViewport}
            textColor={logoColor}
          />
          <span className={styles.logoRegisteredMark} aria-hidden="true">
            &reg;
          </span>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copy}>{config.copyrightText}</p>
        <div className={styles.legalLinks}>
          {config.legalLinks.map((legalLink) => (
            <a
              key={legalLink.label}
              href={legalLink.href}
              title={legalLink.label}
            >
              {legalLink.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
