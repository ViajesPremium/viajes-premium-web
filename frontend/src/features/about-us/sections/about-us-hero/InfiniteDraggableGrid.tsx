"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import styles from "./infinite-draggable-grid.module.css";

gsap.registerPlugin(Observer);

const GRID_IMAGES = [
  "/media/shared/home/destinos/japon/japon-premium-1.webp",
  "/media/shared/home/destinos/peru/peru-premium-1.webp",
  "/media/shared/home/destinos/europa/europa-premium-1.webp",
  "/media/shared/home/destinos/canada/canada-premium-1.webp",
  "/media/shared/home/destinos/corea/corea-premium-1.webp",
  "/media/shared/home/destinos/chiapas/chiapas-premium-1.webp",
  "/media/shared/home/destinos/yucatan/yucatan-premium-1.webp",
  "/media/shared/home/destinos/barrancas/barrancas-premium-1.webp",
];

export default function InfiniteDraggableGrid() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const collectionRef = useRef<HTMLDivElement | null>(null);
  const sourceListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const collection = collectionRef.current;
    const sourceList = sourceListRef.current;
    if (!wrapper || !collection || !sourceList) return;

    const originalItems = Array.from(
      sourceList.querySelectorAll(`.${styles.item}`)
    );
    if (!originalItems.length) return;

    if (!window.matchMedia("(pointer:fine)").matches) {
      wrapper.dataset.infiniteGridStatus = "idle";
      return;
    }

    let observer: Observer | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let tileWidth = 0;
    let tileHeight = 0;
    let currentX = 0;
    let currentY = 0;
    let xTo: ((value: number) => gsap.core.Tween) | null = null;
    let yTo: ((value: number) => gsap.core.Tween) | null = null;

    const setStatus = (status: string) => {
      wrapper.dataset.infiniteGridStatus = status;
    };

    const setGrid = () => {
      const lists = Array.from(collection.querySelectorAll(`.${styles.list}`));
      const firstList = lists[0] as HTMLDivElement | undefined;
      if (!firstList) return;

      const firstItem = firstList.querySelector(`.${styles.item}`);
      if (!firstItem) return;

      const listRect = firstList.getBoundingClientRect();
      const itemRect = firstItem.getBoundingClientRect();

      tileWidth = listRect.width;
      tileHeight = listRect.height;

      const itemHeight = itemRect.height;

      gsap.set(lists[0], { xPercent: 0, yPercent: 0 });
      gsap.set(lists[1], { xPercent: 100, yPercent: 0 });
      gsap.set(lists[2], { xPercent: 0, yPercent: 100 });
      gsap.set(lists[3], { xPercent: 100, yPercent: 100 });

      const wrapX = gsap.utils.wrap(-tileWidth, 0);
      const wrapY = gsap.utils.wrap(-tileHeight, 0);

      currentX = wrapX((wrapper.clientWidth - tileWidth) * 0.5);
      currentY = wrapY((wrapper.clientHeight - itemHeight) * 0.5);

      xTo = gsap.quickTo(collection, "x", {
        duration: 1.2,
        ease: "expo.out",
        modifiers: {
          x: gsap.utils.unitize(wrapX),
        },
      });

      yTo = gsap.quickTo(collection, "y", {
        duration: 1.2,
        ease: "expo.out",
        modifiers: {
          y: gsap.utils.unitize(wrapY),
        },
      });

      gsap.set(collection, {
        x: currentX,
        y: currentY,
      });

      setStatus("idle");

      observer = Observer.create({
        target: wrapper,
        type: "pointer",
        dragMinimum: 3,
        onPress: () => setStatus("dragging"),
        onRelease: () => setStatus("idle"),
        onStop: () => setStatus("idle"),
        onChangeX: (self) => {
          if (!xTo) return;
          const delta = gsap.utils.clamp(-80, 80, self.deltaX * 1.25);
          currentX += delta;
          xTo(currentX);
        },
        onChangeY: (self) => {
          if (!yTo) return;
          const delta = gsap.utils.clamp(-80, 80, self.deltaY * 1.25);
          currentY += delta;
          yTo(currentY);
        },
      });
    };

    const buildGrid = () => {
      observer?.kill();
      setStatus("loading");
      collection.innerHTML = "";

      const measureItem = originalItems[0].cloneNode(true) as HTMLDivElement;
      measureItem.style.position = "absolute";
      measureItem.style.visibility = "hidden";
      measureItem.style.pointerEvents = "none";
      wrapper.appendChild(measureItem);

      const itemRect = measureItem.getBoundingClientRect();
      const itemWidth = itemRect.width;
      const itemHeight = itemRect.height;
      measureItem.remove();

      if (!itemWidth || !itemHeight) return;

      const columns = Math.max(1, Math.ceil(wrapper.clientWidth / itemWidth) + 1);
      const rows = Math.max(1, Math.ceil(wrapper.clientHeight / itemHeight) + 1);
      const requiredItems = columns * rows;
      const wantedItems = Math.max(requiredItems, originalItems.length);
      const itemsPerList = Math.ceil(wantedItems / columns) * columns;
      const fragment = document.createDocumentFragment();

      for (let listIndex = 0; listIndex < 4; listIndex++) {
        const list = sourceList.cloneNode(false) as HTMLDivElement;
        list.style.setProperty("--grid-columns", String(columns));
        if (listIndex > 0) list.setAttribute("aria-hidden", "true");

        for (let itemIndex = 0; itemIndex < itemsPerList; itemIndex++) {
          const item = originalItems[itemIndex % originalItems.length].cloneNode(
            true
          ) as HTMLDivElement;
          if (listIndex > 0) item.setAttribute("aria-hidden", "true");
          list.appendChild(item);
        }

        fragment.appendChild(list);
      }

      collection.appendChild(fragment);
      requestAnimationFrame(setGrid);
    };

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildGrid();
      }, 200);
    };

    window.addEventListener("resize", onResize);
    buildGrid();

    return () => {
      observer?.kill();
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      data-infinite-grid-status="loading"
      className={styles.grid}
      aria-hidden="true"
    >
      <div ref={collectionRef} className={styles.collection}>
        <div ref={sourceListRef} className={styles.list}>
          {GRID_IMAGES.map((src) => (
            <div key={src} className={styles.item}>
              <div className={styles.card}>
                <img
                  src={src}
                  loading="lazy"
                  alt="Galería de Nosotros"
                  title="Galería de Nosotros"
                  className={styles.cardImg}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
