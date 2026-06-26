"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import type { GoogleRatingData } from "@/lib/google-reviews";
import { GOOGLE_RATING_FALLBACK } from "@/lib/google-reviews";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import Badge from "@/components/ui/badge/Badge";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import styles from "./HomeTestimonials.module.css";
import { Button } from "@/components/ui/button/Button";
import { HOME_TESTIMONIALS } from "@/features/home/data/home-testimonials.data";
function GoogleBadge({ data }: { data: GoogleRatingData }) {
  const fullStars = Math.floor(data.rating);
  const hasHalf = data.rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={styles.googleBadge}>
      <svg
        className={styles.googleLogo}
        viewBox="0 0 24 24"
        aria-label="Google"
        role="img"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>

      <div className={styles.googleInfo}>
        <div
          className={styles.stars}
          aria-label={`${data.rating} de 5 estrellas`}
        >
          {Array.from({ length: fullStars }).map((_, i) => (
            <StarIcon key={`f-${i}`} type="full" />
          ))}
          {hasHalf && <StarIcon type="half" />}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <StarIcon key={`e-${i}`} type="empty" />
          ))}
          <span className={styles.ratingNum}>{data.rating.toFixed(1)}</span>
        </div>

        <p className={styles.googleLabel}>
          Basado en{" "}
          <span className={styles.googleCount}>
            {data.totalRatings.toLocaleString("es-MX")}
          </span>{" "}
          reseñas de Google
        </p>
        <p className={styles.googleMore}>Ver más</p>
      </div>
    </div>
  );
}

function StarIcon({ type }: { type: "full" | "half" | "empty" }) {
  if (type === "full") {
    return (
      <svg className={styles.star} viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "half") {
    return (
      <svg className={styles.star} viewBox="0 0 20 20" aria-hidden="true">
        <defs>
          <linearGradient id="half-grad">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="url(#half-grad)"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`${styles.star} ${styles.starEmpty}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

const AUTOPLAY_DELAY = 8000;
const GOOGLE_TESTIMONIALS_URL =
  "https://www.google.com/search?sca_esv=666bf1fb673a79dd&hl=es-MX&sxsrf=ANbL-n6xIi-oRtR634srTJog6CRJ4CS8mQ:1777421433052&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOf3EryPe9dAxRg2-zY1TQ1LGSjSYFIZeJicn2JgDc90NlZgK3iWieQ4ctRY-fSm7RNJVklJAErLgvmjZ05G0ZHeQcQhC3jL3o2DGMIoA66lUG5xgt1ZhQdRPugo1zfEsRhslNhA%3D&q=Viajes+PREMIUM%C2%AE+Turismo+Santa+Fe+Opiniones&sa=X&ved=2ahUKEwjMh4jp4pGUAxUXnSYFHb0eG7gQ0bkNegQIIRAI&biw=1912&bih=948&dpr=1";
export default function HomeTestimonials() {
  const animationsEnabled = useAnimationsEnabled();
  const { triggerTransition } = usePageTransition();
  const testimonials = HOME_TESTIMONIALS;

  const testimonialItems = testimonials.items;
  const testimonialCount = testimonialItems.length;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const handleGoToForm = useCallback(() => {
    const target = testimonials.cta.target;
    if (target.startsWith("#")) {
      scrollToSection(target, { duration: 1.15 });
      return;
    }
    triggerTransition(target);
  }, [testimonials.cta.target, triggerTransition]);

  const clearTimer = useCallback(() => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 768px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncFlags = () => {
      setIsMobileViewport(mobileMq.matches);
      setPrefersReducedMotion(motionMq.matches);
    };
    syncFlags();
    mobileMq.addEventListener("change", syncFlags);
    motionMq.addEventListener("change", syncFlags);
    return () => {
      mobileMq.removeEventListener("change", syncFlags);
      motionMq.removeEventListener("change", syncFlags);
    };
  }, []);

  useEffect(() => {
    if (testimonialCount === 0) return;
    const autoplayEnabled =
      !prefersReducedMotion && !isMobileViewport && isInView;
    clearTimer();
    if (!autoplayEnabled) return;

    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % testimonialCount);
    }, AUTOPLAY_DELAY);

    return clearTimer;
  }, [
    clearTimer,
    current,
    isInView,
    isMobileViewport,
    prefersReducedMotion,
    testimonialCount,
  ]);

  const prev = () => {
    if (testimonialCount === 0) return;
    setCurrent((c) => (c - 1 + testimonialCount) % testimonialCount);
  };

  const next = () => {
    if (testimonialCount === 0) return;
    setCurrent((c) => (c + 1) % testimonialCount);
  };
  const shouldAnimateCarousel =
    animationsEnabled && !isMobileViewport && !prefersReducedMotion;
  const pad = (n: number) => String(n).padStart(2, "0");
  const ratingData = testimonials.googleRating ?? GOOGLE_RATING_FALLBACK;

  if (testimonialCount === 0) {
    return (
      <section ref={sectionRef} className={styles.testimonials}>
        <h2 className="srOnly">{testimonials.srHeading}</h2>
        <Badge text={testimonials.badgeText} variant="dark" align="center" />
      </section>
    );
  }

  const safeCurrent = current % testimonialCount;
  const t = testimonialItems[safeCurrent];

  return (
    <section ref={sectionRef} className={styles.testimonials}>
      <h2 className="srOnly">{testimonials.srHeading}</h2>
      <Badge text={testimonials.badgeText} variant="dark" align="center" />
      <div className={styles.inner}>
        <div className={styles.photo}>
          <div className={styles.photoSquare}>
            {shouldAnimateCarousel ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeCurrent}
                  style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    title={t.name}
                    fill
                    className={styles.photoImg}
                    sizes="(max-width: 768px) 90px, (max-width: 1024px) 32vw, 25vw"
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <Image
                key={`photo-${safeCurrent}`}
                src={t.avatar}
                alt={t.name}
                title={t.name}
                fill
                className={styles.photoImg}
                sizes="(max-width: 768px) 90px, (max-width: 1024px) 32vw, 25vw"
              />
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.controlsBar}>
            <div className={styles.testimonialNumber}>
              <p className={styles.number}>
                {pad(safeCurrent + 1)}/{pad(testimonialCount)}
              </p>
            </div>

            <div className={styles.arrows}>
              <button
                className={styles.arrow}
                onClick={prev}
                aria-label="Anterior"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                className={styles.arrow}
                onClick={next}
                aria-label="Siguiente"
              >
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.testimonial}>
              <svg
                className={styles.quoteMark}
                viewBox="0 0 27 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="quoteGold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#BF953F" />
                    <stop offset="40%" stopColor="#FCF6BA" />
                    <stop offset="70%" stopColor="#B38728" />
                    <stop offset="100%" stopColor="#FCF6BA" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#quoteGold)"
                  d="M 27 20 H 15.286 V 11.2929 L 20.3288 0 H 24.9514 L 20.8541 10.4485 H 27 V 20 Z M 11.7665 20 H 0 V 11.2929 L 5.09533 0 H 9.7179 L 5.62062 10.4485 H 11.7665 V 20 Z"
                />
              </svg>

              {shouldAnimateCarousel ? (
                <BlurredStagger
                  key={safeCurrent}
                  text={t.quote}
                  isActive={true}
                  align="left"
                  className={styles.text}
                />
              ) : (
                <p className={styles.text}>{t.quote}</p>
              )}
            </div>

            <div className={styles.testimonialFooter}>
              {shouldAnimateCarousel ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`author-${safeCurrent}`}
                    className={styles.author}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className={styles.authorThumb}>
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        title={t.name}
                        fill
                        className={styles.authorThumbImg}
                        sizes="64px"
                      />
                    </div>
                    <div className={styles.authorCopy}>
                      <p className={styles.name}>{t.name}</p>
                      <p className={styles.location}>{t.location}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div
                  key={`author-static-${safeCurrent}`}
                  className={styles.author}
                >
                  <div className={styles.authorThumb}>
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      title={t.name}
                      fill
                      className={styles.authorThumbImg}
                      sizes="64px"
                    />
                  </div>
                  <div className={styles.authorCopy}>
                    <p className={styles.name}>{t.name}</p>
                    <p className={styles.location}>{t.location}</p>
                  </div>
                </div>
              )}

              <a
                href={GOOGLE_TESTIMONIALS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.googleBadgeLink}
                aria-label="Ver testimoniales en Google"
                title="Ver testimoniales en Google"
              >
                <GoogleBadge data={ratingData} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <Button variant="primary" onClick={handleGoToForm}>
          {testimonials.cta.label}
        </Button>
      </div>
    </section>
  );
}
