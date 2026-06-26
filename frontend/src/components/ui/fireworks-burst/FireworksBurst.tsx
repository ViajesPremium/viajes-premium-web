"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";

type FireworksBurstProps = {
  enabled?: boolean;
  className?: string;
  primaryColor?: string;
};

const FIREWORKS_OPTIONS = {
  opacity: 0.42,
  rocketsPoint: {
    min: 50,
    max: 50,
  },
  hue: {
    min: 0,
    max: 0,
  },
  mouse: {
    click: false,
    move: false,
  },
  particles: 22,
  acceleration: 1.02,
  friction: 0.97,
  gravity: 1.18,
  intensity: 18,
  traceLength: 2,
  traceSpeed: 6,
  explosion: 4,
  delay: {
    min: 420,
    max: 700,
  },
  brightness: {
    min: 55,
    max: 72,
  },
  decay: {
    min: 0.018,
    max: 0.028,
  },
};

function parseHexColorToHue(color: string): number | null {
  const normalized = color.trim().replace(/^#/, "");
  const hex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  return Math.round(hue * 60) % 360;
}

function getFireworksOptions(primaryColor?: string) {
  const hue = primaryColor ? parseHexColorToHue(primaryColor) : null;

  return {
    ...FIREWORKS_OPTIONS,
    hue: hue === null ? FIREWORKS_OPTIONS.hue : { min: hue, max: hue },
  };
}

export default function FireworksBurst({
  enabled = true,
  className,
  primaryColor,
}: FireworksBurstProps) {
  const ref = useRef<FireworksHandlers>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const fireworksOptions = useMemo(
    () => getFireworksOptions(primaryColor),
    [primaryColor],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isInView) return;

    const fireworks = ref.current;
    if (!fireworks) return;

    const timers: number[] = [];
    const schedule = (callback: () => void, delay: number) => {
      timers.push(window.setTimeout(callback, delay));
    };

    schedule(() => {
      fireworks.updateOptions({
        ...fireworksOptions,
        rocketsPoint: { min: 0, max: 0 },
      });
      fireworks.launch(2);
    }, 220);

    schedule(() => {
      fireworks.updateOptions({
        ...fireworksOptions,
        rocketsPoint: { min: 100, max: 100 },
      });
      fireworks.launch(2);
    }, 1120);

    schedule(() => {
      fireworks.stop();
      fireworks.clear();
    }, 4400);

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      fireworks.stop();
    };
  }, [enabled, fireworksOptions, isInView]);

  if (!enabled) {
    return null;
  }

  const fireworksStyle: CSSProperties = {
    inset: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    background: "transparent",
  };

  return (
    <div ref={containerRef} className={className} style={fireworksStyle}>
      {isInView ? (
        <Fireworks
          ref={ref}
          autostart={false}
          options={fireworksOptions}
          style={fireworksStyle}
        />
      ) : null}
    </div>
  );
}
