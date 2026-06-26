"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Button } from "@/components/ui/button/Button";
import type { FocusRailItem } from "@/components/ui/focus-rail/FocusRail";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { scrollToSection } from "@/lib/scroll-to-section";
import styles from "./FlickCardsSlider.module.css";

gsap.registerPlugin(Draggable);

type FlickCardsSliderProps = {
  items: FocusRailItem[];
  ctaLabel: string;
};

export default function FlickCardsSlider({ items, ctaLabel }: FlickCardsSliderProps) {
  const { triggerTransition } = usePageTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleCtaClick = (href: string) => {
    if (href.startsWith("#")) {
      scrollToSection(href, { duration: 1.15 });
      return;
    }
    triggerTransition(href);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const slider = root.querySelector<HTMLElement>("[data-flick-cards-init]");
    if (!slider) return;

    const list = slider.querySelector<HTMLElement>("[data-flick-cards-list]");
    if (!list) return;

    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-flick-cards-item]"));
    const total = cards.length;
    let activeIndex = 0;

    let sliderWidth = slider.offsetWidth;
    const threshold = 0.1;
    let compactMode = window.matchMedia("(max-width: 767px)").matches;
    let tabletMode = window.matchMedia("(max-width: 991px)").matches;

    const draggers: HTMLElement[] = [];
    cards.forEach((card) => {
      const existing = card.querySelector<HTMLElement>("[data-flick-cards-dragger]");
      if (existing) {
        draggers.push(existing);
        return;
      }
      const dragger = document.createElement("div");
      dragger.setAttribute("data-flick-cards-dragger", "");
      card.appendChild(dragger);
      draggers.push(dragger);
    });

    slider.setAttribute("data-flick-drag-status", "grab");

    function getConfig(i: number, currentIndex: number) {
      let diff = i - currentIndex;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;

      const compact = compactMode;
      const tablet = tabletMode && !compact;
      const layer2X = compact ? 14 : tablet ? 20 : 25;
      const layer3X = compact ? 24 : tablet ? 34 : 45;
      const hiddenX = compact ? 30 : tablet ? 42 : 55;
      const layer2Rot = compact ? 5 : tablet ? 7 : 10;
      const layer3Rot = compact ? 8 : tablet ? 11 : 15;
      const hiddenRot = compact ? 10 : tablet ? 14 : 20;
      const layer2Scale = compact ? 0.94 : tablet ? 0.92 : 0.9;
      const layer3Scale = compact ? 0.88 : tablet ? 0.84 : 0.8;
      const hiddenScale = compact ? 0.8 : tablet ? 0.72 : 0.6;

      switch (diff) {
        case 0:
          return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
        case 1:
          return { x: layer2X, y: compact ? 0.5 : 1, rot: layer2Rot, s: layer2Scale, o: 1, z: 4 };
        case -1:
          return { x: -layer2X, y: compact ? 0.5 : 1, rot: -layer2Rot, s: layer2Scale, o: 1, z: 4 };
        case 2:
          return { x: layer3X, y: compact ? 2 : 5, rot: layer3Rot, s: layer3Scale, o: 1, z: 3 };
        case -2:
          return { x: -layer3X, y: compact ? 2 : 5, rot: -layer3Rot, s: layer3Scale, o: 1, z: 3 };
        default: {
          const dir = diff > 0 ? 1 : -1;
          return { x: hiddenX * dir, y: compact ? 2 : 5, rot: hiddenRot * dir, s: hiddenScale, o: 0, z: 2 };
        }
      }
    }

    function renderCards(currentIndex: number) {
      cards.forEach((card, i) => {
        const cfg = getConfig(i, currentIndex);
        let status;

        if (cfg.x === 0) status = "active";
        else if (cfg.x === 25) status = "2-after";
        else if (cfg.x === -25) status = "2-before";
        else if (cfg.x === 45) status = "3-after";
        else if (cfg.x === -45) status = "3-before";
        else status = "hidden";

        card.setAttribute("data-flick-cards-item-status", status);
        card.style.zIndex = String(cfg.z);

        gsap.to(card, {
          duration: 0.6,
          ease: "elastic.out(1.2, 1)",
          xPercent: cfg.x,
          yPercent: cfg.y,
          rotation: cfg.rot,
          scale: cfg.s,
          opacity: cfg.o,
        });
      });
    }

    renderCards(activeIndex);

    const onResize = () => {
      sliderWidth = slider.offsetWidth;
      compactMode = window.matchMedia("(max-width: 767px)").matches;
      tabletMode = window.matchMedia("(max-width: 991px)").matches;
      renderCards(activeIndex);
    };
    window.addEventListener("resize", onResize);

    let pressClientX = 0;
    let pressClientY = 0;

    const instances = Draggable.create(draggers, {
      type: "x",
      edgeResistance: 0.8,
      bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
      inertia: false,

      onPress() {
        pressClientX = this.pointerEvent.clientX;
        pressClientY = this.pointerEvent.clientY;
        slider.setAttribute("data-flick-drag-status", "grabbing");
      },

      onDrag() {
        const rawProgress = this.x / sliderWidth;
        const progress = Math.min(1, Math.abs(rawProgress));
        const direction = rawProgress > 0 ? -1 : 1;
        const nextIndex = (activeIndex + direction + total) % total;

        cards.forEach((card, i) => {
          const from = getConfig(i, activeIndex);
          const to = getConfig(i, nextIndex);
          const mix = (prop: "x" | "y" | "rot" | "s" | "o") =>
            from[prop] + (to[prop] - from[prop]) * progress;

          gsap.set(card, {
            xPercent: mix("x"),
            yPercent: mix("y"),
            rotation: mix("rot"),
            scale: mix("s"),
            opacity: mix("o"),
          });
        });
      },

      onRelease() {
        slider.setAttribute("data-flick-drag-status", "grab");

        const releaseClientX = this.pointerEvent.clientX;
        const releaseClientY = this.pointerEvent.clientY;
        const dragDistance = Math.hypot(
          releaseClientX - pressClientX,
          releaseClientY - pressClientY,
        );

        const raw = this.x / sliderWidth;
        let shift = 0;
        if (raw > threshold) shift = -1;
        else if (raw < -threshold) shift = 1;

        if (shift !== 0) {
          activeIndex = (activeIndex + shift + total) % total;
          renderCards(activeIndex);
        }

        gsap.to(this.target, {
          x: 0,
          duration: 0.3,
          ease: "power1.out",
        });

        if (dragDistance < 4) {
          this.target.style.pointerEvents = "none";

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const el = document.elementFromPoint(releaseClientX, releaseClientY);
              if (el) {
                const evt = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                el.dispatchEvent(evt);
              }

              this.target.style.pointerEvents = "auto";
            });
          });
        }
      },
    });

    return () => {
      window.removeEventListener("resize", onResize);
      instances.forEach((instance) => instance.kill());
    };
  }, [items]);

  return (
    <div ref={rootRef}>
      <div data-flick-cards-init="" className={styles.group}>
        <div className={styles.relativeObject}>
          <div className={styles.relativeObjectBefore} />
        </div>
        <div data-flick-cards-collection="" className={styles.collection}>
          <div data-flick-cards-list="" className={styles.list}>
            {items.map((item) => (
              <div
                key={item.id}
                data-flick-cards-item-status=""
                data-flick-cards-item=""
                className={styles.item}
              >
                <div className={styles.card}>
                  <div className={styles.cardBefore} />
                  <div className={styles.cardMedia}>
                    <img
                      width={256}
                      loading="lazy"
                      alt={item.title}
                      title={item.title}
                      src={item.imageSrc}
                      className={styles.coverImage}
                    />
                    <div className={styles.cardBtnWrap}>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => handleCtaClick(item.href ?? "#form")}
                      >
                        {ctaLabel}
                      </Button>
                    </div>
                    <div className={styles.cardCopy}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
