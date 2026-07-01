"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import GradientText from "@/components/ui/gradient-text/GradientText";
import { Button } from "@/components/ui/button/Button";
import {
  destinationCardsData,
  type DestinationDataCard,
} from "@/features/home/data/destinations.data";
import styles from "./Destinations.module.css";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import { getDestinationAnchorId } from "@/lib/home-destination-navigation";
import { useStackedCardScrollAnimation } from "@/features/shared/hooks/useStackedCardScrollAnimation";

const DEFAULT_DESTINATION_AVATAR_LEFT =
  "/media/landings/japon/faqs/samurai.avif";
const DEFAULT_DESTINATION_AVATAR_RIGHT =
  "/media/landings/japon/faqs/geisha.avif";

const DESTINATION_FAQ_AVATARS: Record<string, { left: string; right: string }> =
  {
    "/barrancas-premium": {
      left: "/media/shared/avatars/faqbarrancas-2.avif",
      right: "/media/shared/avatars/faqbarrancas-1.avif",
    },
    "/corea-premium": {
      left: "/media/shared/avatars/faqcorea-2.avif",
      right: "/media/shared/avatars/faqcorea-1.avif",
    },
    "/canada-premium": {
      left: "/media/shared/avatars/faqcanada-2.avif",
      right: "/media/shared/avatars/faqcanada-1.avif",
    },
    "/chiapas-premium": {
      left: "/media/shared/avatars/faqchiapas-2.avif",
      right: "/media/shared/avatars/faqchiapas-1.avif",
    },
    "/europa-premium": {
      left: "/media/shared/avatars/faqeuropa-2.avif",
      right: "/media/shared/avatars/faqeuropa-1.avif",
    },
    "/peru-premium": {
      left: "/media/shared/avatars/faqperu-2.avif",
      right: "/media/shared/avatars/faqperu-1.avif",
    },
    "/yucatan-premium": {
      left: "/media/shared/avatars/faqyucatan-2.avif",
      right: "/media/shared/avatars/faqyucatan-1.avif",
    },
  };

function shouldRenderCardMedia(
  index: number,
  activeIndex: number,
  total: number,
) {
  if (index === activeIndex) return true;
  if (index === activeIndex + 1) return true;
  if (index === activeIndex - 1) return true;
  if (activeIndex === 0 && index === total - 1) return true;
  if (activeIndex === total - 1 && index === 0) return true;
  return false;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Destinations({
  embedded = false,
  id,
  className,
}: {
  embedded?: boolean;
  id?: string;
  className?: string;
}) {
  const { triggerTransition } = usePageTransition();
  const animationsEnabled = useAnimationsEnabled();
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
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
  const useCssStickyPins = viewportReady && isMobile;
  const useGsapPins = !disableAnimationsForDevice && !useCssStickyPins;

  useStackedCardScrollAnimation({
    scopeRef: pinRef,
    triggerRef: sectionRef,
    cardSelector: `.${styles.card}`,
    dimLayerSelector: `.${styles.previousCardDim}`,
    leftCharacterSelector: `.${styles.sideCharacterLeft}`,
    rightCharacterSelector: `.${styles.sideCharacterRight}`,
    enabled: useGsapPins,
    isMobile,
    embedded,
    onActiveIndexChange: setActiveIndex,
  });

  return (
    <section
      ref={sectionRef}
      id={id}
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-label="Destinations Story"
    >
      <div
        ref={pinRef}
        className={
          useCssStickyPins
            ? `${styles.container} ${styles.containerMobileSticky}`
            : disableAnimationsForDevice
            ? `${styles.container} ${styles.containerStatic}`
            : styles.container
        }
        data-destination-pin="true"
        data-embedded={embedded ? "true" : "false"}
        data-static-layout={disableAnimationsForDevice ? "true" : "false"}
        data-mobile-sticky={useCssStickyPins ? "true" : "false"}
      >
        <div className={styles.stack}>
          {destinationCardsData.map((card: DestinationDataCard, index) => {
            const renderHeavyMedia =
              !disableAnimationsForDevice &&
              shouldRenderCardMedia(
                index,
                activeIndex,
                destinationCardsData.length,
              );
            return (
              <div
                key={card.route}
                className={styles.cardSlot}
                style={
                  {
                    "--card-primary": card.primaryColor,
                    "--card-secondary": card.secondaryColor,
                    "--card-avatar-left": `url("${DESTINATION_FAQ_AVATARS[card.route]?.left ?? DEFAULT_DESTINATION_AVATAR_LEFT}")`,
                    "--card-avatar-right": `url("${DESTINATION_FAQ_AVATARS[card.route]?.right ?? DEFAULT_DESTINATION_AVATAR_RIGHT}")`,
                    "--card-index": index + 1,
                  } as CSSProperties
                }
              >
                <article
                  id={getDestinationAnchorId(card.route)}
                  data-route={card.route}
                  className={styles.card}
                >
                  <div className={styles.previousCardDim} aria-hidden="true" />
                  <div
                    className={styles.cardBackgroundOverlay}
                    aria-hidden="true"
                  />

                  <div className={styles.sideCharacters} aria-hidden="true">
                    <div className={styles.sideCharacterLeft} />
                    <div className={styles.sideCharacterRight} />
                  </div>

                  {renderHeavyMedia && !isMobile ? (
                    <div className={styles.editorialImages} aria-hidden="true">
                      {card.galleryImages
                        .slice(0, 4)
                        .map((image, imageIndex) => (
                          <figure
                            key={`${card.route}-photo-${imageIndex}`}
                            className={`${styles.editorialFrame} ${styles[`editorialFrame${imageIndex + 1}`]}`}
                          >
                            <Image
                              src={image}
                              alt={`${card.label} - galería ${imageIndex + 1}`}
                              title={`${card.label} - galería ${imageIndex + 1}`}
                              fill
                              sizes="(max-width: 900px) 55vw, 30vw"
                              quality={70}
                              className={styles.editorialImage}
                              loading={
                                index === 0 && imageIndex === 0
                                  ? "eager"
                                  : "lazy"
                              }
                              priority={index === 0 && imageIndex === 0}
                            />
                          </figure>
                        ))}
                    </div>
                  ) : null}

                  <Image
                    src={card.logoSrc}
                    alt={`${card.label} Premium logo`}
                    className={styles.brandLogo}
                    aria-hidden="true"
                    width={320}
                    height={120}
                    sizes="(max-width: 900px) 60vw, 18vw"
                  />
                  <div className={styles.cardCopy}>
                    <h2 className={styles.title}>{card.label}</h2>
                    <GradientText as="span" className={styles.premiumText}>
                      PREMIUM
                    </GradientText>
                    <Button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        triggerTransition(card.route);
                      }}
                    >
                      Ver Destino
                    </Button>
                    <p className={styles.description}>{card.description}</p>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
