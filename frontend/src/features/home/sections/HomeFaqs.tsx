"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import FireworksBurst from "@/components/ui/fireworks-burst/FireworksBurst";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import styles from "./HomeFaqs.module.css";
import accordionStyles from "@/components/ui/accordion/Accordion.module.css";

type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

const HOME_FAQS = {
  srHeading: "Preguntas frecuentes sobre Viajes PREMIUM",
  accordionAriaLabel: "Preguntas frecuentes",
  badgeText: "Preguntas frecuentes",
  title: "Todo lo que necesitas saber",
  subtitle:
    "Resolvemos las dudas más comunes sobre destinos y experiencias de Viajes PREMIUM. Si no encuentras lo que buscas, escríbenos directamente.",
  contactLabel: "¿Otra pregunta?",
  contactEmail: "reservaciones@viajespremium.com.mx",
  items: [
    {
      id: "1",
      question: "¿Cuál es el mejor destino para viajar desde México?",
      answer:
        "El mejor destino depende del tipo de experiencia que buscas. Japón, Europa, Canadá, Perú y Barrancas del Cobre son opciones ideales para viajeros que buscan cultura, naturaleza, gastronomía y recorridos bien diseñados.",
    },
    {
      id: "2",
      question: "¿Qué destinos ofrece Viajes PREMIUM?",
      answer:
        "Viajes PREMIUM diseña experiencias en Japón, Europa, Canadá, Perú, Barrancas del Cobre y otros destinos seleccionados para viajeros que buscan una experiencia en Clase PREMIUM.",
    },
    {
      id: "3",
      question: "¿Cómo elegir el destino ideal para mi próximo viaje?",
      answer:
        "Para elegir el destino ideal conviene considerar temporada, duración, intereses, ritmo de viaje y nivel de inversión. Un proyecto bien diseñado ayuda a tomar mejores decisiones desde el inicio.",
    },
    {
      id: "4",
      question: "¿Qué incluye normalmente un viaje internacional?",
      answer:
        "Un viaje internacional puede incluir alojamiento, traslados, recorridos seleccionados, experiencias especiales y acompañamiento antes y durante el viaje. Todo depende del destino y del tipo de experiencia.",
    },
    {
      id: "5",
      question: "¿Es mejor viajar con una agencia especializada?",
      answer:
        "Sí, una agencia especializada ayuda a reducir errores, organizar mejor los tiempos y seleccionar experiencias más adecuadas para cada destino. Esto permite viajar con mayor claridad y tranquilidad.",
    },
    {
      id: "6",
      question:
        "¿Qué destinos son recomendables para un primer gran viaje internacional?",
      answer:
        "Europa, Japón y Canadá suelen ser destinos ideales para un primer gran viaje internacional por su riqueza cultural, infraestructura turística y variedad de experiencias.",
    },
    {
      id: "7",
      question: "¿Qué destinos son ideales para viajar en pareja?",
      answer:
        "Japón, Europa, Perú y Canadá son destinos muy recomendables para parejas por su combinación de paisajes, gastronomía, cultura y experiencias memorables.",
    },
    {
      id: "8",
      question: "¿Qué destinos son recomendables para viajar en familia?",
      answer:
        "Canadá, Europa, Japón y Barrancas del Cobre son buenas opciones para familias, ya que ofrecen recorridos organizados, experiencias variadas y destinos con gran atractivo para distintas edades.",
    },
    {
      id: "9",
      question: "¿Cómo viajar sin preocuparme por la logística?",
      answer:
        "La clave está en contar con un proyecto de viaje bien estructurado. En Viajes PREMIUM cuidamos traslados, tiempos, alojamiento y experiencias para que el viajero se enfoque en disfrutar.",
    },
    {
      id: "10",
      question: "¿Por qué elegir Viajes PREMIUM?",
      answer:
        "Porque diseñamos experiencias en Clase PREMIUM con atención personalizada, curaduría de destinos y acompañamiento real antes y durante el viaje.",
    },
  ] as HomeFaqItem[],
};

export default function HomeFaqs() {
  const animationsEnabled = useAnimationsEnabled();
  const sectionRef = useRef<HTMLElement | null>(null);
  const mobileFiguresRef = useRef<HTMLDivElement | null>(null);
  const faqItems = HOME_FAQS.items;
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string>(
    () => faqItems[0]?.id ?? "",
  );

  const sectionStyle = {
    "--faq-left-image": 'url("/media/shared/avatars/home-avatar-2.avif")',
    "--faq-right-image": 'url("/media/shared/avatars/home-avatar-1.avif")',
  } as CSSProperties;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!animationsEnabled) return;
    const section = sectionRef.current;
    if (!section) return;

    const clamp = (value: number, min = 0, max = 1) =>
      Math.min(max, Math.max(min, value));
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInCubic = (t: number) => t * t * t;

    const ENTRY_START_TOP_VH = 0.7;
    const ENTRY_END_TOP_VH = 0.3;
    const EXIT_START_BOTTOM_VH = 0.86;

    let rafId: number | null = null;

    const mobileFigures = mobileFiguresRef.current;

    const updateMotionProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const entryStartTop = viewportHeight * ENTRY_START_TOP_VH;
      const entryEndTop = viewportHeight * ENTRY_END_TOP_VH;
      const entryRange = Math.max(entryStartTop - entryEndTop, 1);

      const entryRaw = clamp((entryStartTop - rect.top) / entryRange);
      const entryProgress = easeOutCubic(entryRaw);
      const exitRaw = clamp(
        (viewportHeight * EXIT_START_BOTTOM_VH - rect.bottom) /
          (viewportHeight * EXIT_START_BOTTOM_VH),
      );
      const exitProgress = easeInCubic(exitRaw);
      const motionProgress = clamp(entryProgress * (1 - exitProgress));

      section.style.setProperty(
        "--faq-motion-progress",
        motionProgress.toFixed(4),
      );

      if (mobileFigures) {
        const fig = mobileFigures.getBoundingClientRect();
        const figEntryRaw = clamp(
          (viewportHeight - fig.top) / (viewportHeight * 0.6),
        );
        const figEntryProgress = easeOutCubic(figEntryRaw);
        const figExitRaw = clamp(
          (viewportHeight * 0.65 - fig.bottom) / (viewportHeight * 0.65),
        );
        const figExitProgress = easeInCubic(figExitRaw);
        const figuresProgress = clamp(figEntryProgress * (1 - figExitProgress));
        mobileFigures.style.setProperty(
          "--faq-figures-progress",
          figuresProgress.toFixed(4),
        );
      }
    };

    const requestUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateMotionProgress();
      });
    };

    let lenisUnsubscribe: (() => void) | null = null;
    const attachLenis = () => {
      const lenis = (
        window as unknown as {
          __lenis?: {
            on: (e: string, cb: () => void) => void;
            off: (e: string, cb: () => void) => void;
          };
        }
      ).__lenis;
      if (lenis) {
        lenis.on("scroll", requestUpdate);
        lenisUnsubscribe = () => lenis.off("scroll", requestUpdate);
      } else {
        window.addEventListener("scroll", requestUpdate, { passive: true });
        lenisUnsubscribe = () =>
          window.removeEventListener("scroll", requestUpdate);
      }
    };

    const rafSetup = window.requestAnimationFrame(attachLenis);
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(rafSetup);
      lenisUnsubscribe?.();
      window.removeEventListener("resize", requestUpdate);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [animationsEnabled]);

  return (
    <section ref={sectionRef} className={styles.section} style={sectionStyle}>
      <h2 className="srOnly">{HOME_FAQS.srHeading}</h2>
      <div className={styles.fireworksLayer} aria-hidden="true">
        <FireworksBurst enabled={animationsEnabled && !isMobileViewport} />
      </div>

      <div className={styles.sideLeft} aria-hidden="true">
        <div className={styles.sideImgFadeLeft} />
      </div>

      <div className={styles.center}>
        <div className={styles.header}>
          <h2 className={styles.title}>{HOME_FAQS.title}</h2>
          <BlurredStagger
            text={HOME_FAQS.subtitle}
            className={styles.subtitle}
          />
          <div className={styles.contactHint}>
            <p className={styles.contactLabel}>{HOME_FAQS.contactLabel}</p>
            <a
              href={`mailto:${HOME_FAQS.contactEmail}`}
              className={styles.contactLink}
              title={`Enviar correo a ${HOME_FAQS.contactEmail}`}
            >
              {HOME_FAQS.contactEmail}
            </a>
          </div>
        </div>

        <div className={styles.accordionWrap}>
          <div role="list" aria-label={HOME_FAQS.accordionAriaLabel}>
            {faqItems.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const triggerId = `home-faq-trigger-${faq.id}`;
              const contentId = `home-faq-content-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={accordionStyles.item}
                  role="listitem"
                >
                  <h3 className={accordionStyles.header}>
                    <button
                      id={triggerId}
                      type="button"
                      className={accordionStyles.trigger}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => setOpenFaqId(faq.id)}
                    >
                      {faq.question}
                      {animationsEnabled ? (
                        <motion.span
                          className={accordionStyles.chevron}
                          animate={{
                            rotate: isOpen ? 180 : 0,
                            opacity: isOpen ? 0.9 : 0.5,
                          }}
                          transition={{
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          aria-hidden="true"
                        >
                          <ChevronDown size={16} />
                        </motion.span>
                      ) : (
                        <span
                          className={accordionStyles.chevron}
                          aria-hidden="true"
                        >
                          <ChevronDown size={16} />
                        </span>
                      )}
                    </button>
                  </h3>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={accordionStyles.content}
                    data-state={isOpen ? "open" : "closed"}
                  >
                    <div className={accordionStyles.contentInner}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        ref={mobileFiguresRef}
        className={styles.mobileFigures}
        aria-hidden="true"
      >
        <div className={styles.mobileFigureLeft} />
        <div className={styles.mobileFigureRight} />
      </div>

      <div className={styles.sideRight} aria-hidden="true">
        <div className={styles.sideImgFade} />
      </div>
    </section>
  );
}
