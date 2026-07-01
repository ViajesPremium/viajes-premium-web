"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
} from "react";
import { useAnimationsEnabled } from "@/lib/animation-budget";

interface TextPressureProps {
    text?: string;
    fontFamily?: string;
    fontUrl?: string;
    width?: boolean;
    weight?: boolean;
    italic?: boolean;
    alpha?: boolean;
    flex?: boolean;
    stroke?: boolean;
    scale?: boolean;
    textColor?: string;
    strokeColor?: string;
    className?: string;
    minFontSize?: number;
    fontWeight?: number;
    fontStyle?: "normal" | "italic";
    fontSize?: number | string;
    weightFrom?: number;
    weightTo?: number;
    scaleFrom?: number;
    scaleTo?: number;
    animate?: boolean;
}

type Point = {
    x: number;
    y: number;
};

const dist = (a: Point, b: Point) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
};

const debounce = <Args extends unknown[]>(
    func: (...args: Args) => void,
    delay: number,
) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default function TextPressure({
    text = "Compressa",
    fontFamily = "Nohemi Pressure",
    fontUrl,
    width = true,
    weight = true,
    italic = true,
    alpha = false,
    flex = true,
    stroke = false,
    scale = false,
    textColor = "#000000",
    strokeColor = "#DB2F21",
    className = "",
    minFontSize = 24,
    fontWeight = 400,
    fontStyle = "normal",
    fontSize: fixedFontSize,
    weightFrom = 100,
    weightTo = 900,
    scaleFrom = 1,
    scaleTo = 1.22,
    animate = true,
}: TextPressureProps) {
    const animationsEnabled = useAnimationsEnabled();
    const effectiveAnimate = animate && animationsEnabled;
    const containerRef = useRef<HTMLSpanElement | null>(null);
    const titleRef = useRef<HTMLSpanElement | null>(null);
    const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

    const mouseRef = useRef<Point>({ x: 0, y: 0 });
    const cursorRef = useRef<Point>({ x: 0, y: 0 });

    const [fontSize, setFontSize] = useState(
        typeof fixedFontSize === "number"
            ? Math.max(fixedFontSize, minFontSize)
            : minFontSize,
    );
    const [scaleY, setScaleY] = useState(1);
    const [lineHeight, setLineHeight] = useState(1);

    const chars = useMemo(() => text.split(""), [text]);

    useEffect(() => {
        if (!effectiveAnimate) return;

        const handleMouseMove = (event: MouseEvent) => {
            cursorRef.current.x = event.clientX;
            cursorRef.current.y = event.clientY;
        };

        const handleTouchMove = (event: TouchEvent) => {
            const touch = event.touches[0];
            if (!touch) return;

            cursorRef.current.x = touch.clientX;
            cursorRef.current.y = touch.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        if (containerRef.current) {
            const { left, top, width: rectWidth, height } =
                containerRef.current.getBoundingClientRect();

            mouseRef.current.x = left + rectWidth / 2;
            mouseRef.current.y = top + height / 2;
            cursorRef.current.x = mouseRef.current.x;
            cursorRef.current.y = mouseRef.current.y;
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [effectiveAnimate]);

    const setSize = useCallback(() => {
        if (typeof fixedFontSize === "string") {
            setScaleY(1);
            setLineHeight(1);
            return;
        }

        if (!containerRef.current || !titleRef.current) return;

        const { width: containerWidth, height: containerHeight } =
            containerRef.current.getBoundingClientRect();

        const maxSafeSize = containerWidth / Math.max(chars.length * 0.5, 1);
        let nextFontSize = fixedFontSize ?? maxSafeSize;

        if (fixedFontSize) {
            nextFontSize = Math.min(fixedFontSize, maxSafeSize);
        }

        nextFontSize = Math.max(nextFontSize, minFontSize);

        setFontSize(nextFontSize);
        setScaleY(1);
        setLineHeight(1);

        requestAnimationFrame(() => {
            if (!titleRef.current) return;

            const textRect = titleRef.current.getBoundingClientRect();
            if (scale && textRect.height > 0) {
                const yRatio = containerHeight / textRect.height;
                setScaleY(yRatio);
                setLineHeight(yRatio);
            }
        });
    }, [chars.length, fixedFontSize, minFontSize, scale]);

    useLayoutEffect(() => {
        if (typeof fixedFontSize === "string") return;
        // Initial sizing on next frame avoids direct setState inside layout effect.
        const frameId = requestAnimationFrame(() => setSize());
        return () => cancelAnimationFrame(frameId);
    }, [fixedFontSize, setSize]);

    useEffect(() => {
        if (typeof fixedFontSize === "string") return;
        const debouncedSetSize = debounce(setSize, 100);
        window.addEventListener("resize", debouncedSetSize);
        return () => window.removeEventListener("resize", debouncedSetSize);
    }, [fixedFontSize, setSize]);

    useEffect(() => {
        if (!effectiveAnimate) {
            spansRef.current.forEach((span) => {
                if (!span) return;
                span.style.removeProperty("font-variation-settings");
                span.style.removeProperty("opacity");
                span.style.removeProperty("transform");
                span.style.removeProperty("transform-origin");
            });
            return;
        }

        let rafId: number;

        const tick = () => {
            mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
            mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

            if (titleRef.current) {
                const titleRect = titleRef.current.getBoundingClientRect();
                const maxDist = Math.max(titleRect.width / 2, 1);

                spansRef.current.forEach((span) => {
                    if (!span) return;

                    const rect = span.getBoundingClientRect();
                    const charCenter = {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                    };

                    const proximity = Math.max(0, 1 - dist(mouseRef.current, charCenter) / maxDist);
                    const wght = weight
                        ? Math.round(weightFrom + (weightTo - weightFrom) * proximity)
                        : fontWeight;
                    const wdth = width ? Math.round(5 + 195 * proximity) : 100;
                    const ital = italic ? proximity.toFixed(2) : "0";
                    const nextSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;

                    if (span.style.fontVariationSettings !== nextSettings) {
                        span.style.fontVariationSettings = nextSettings;
                    }

                    if (alpha) {
                        span.style.opacity = proximity.toFixed(2);
                    }

                    const charScale = scaleFrom + (scaleTo - scaleFrom) * proximity;
                    span.style.transform = `scale(${charScale.toFixed(3)})`;
                    span.style.transformOrigin = "bottom center";
                });
            }

            rafId = requestAnimationFrame(tick);
        };

        tick();

        return () => cancelAnimationFrame(rafId);
    }, [
        effectiveAnimate,
        alpha,
        fontWeight,
        italic,
        scaleFrom,
        scaleTo,
        weight,
        weightFrom,
        weightTo,
        width,
    ]);

    const styleElement = useMemo(() => {
        const fontFace = fontUrl
            ? `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('woff2');
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
        }
      `
            : "";

        return (
            <style>{`
        ${fontFace}

        .text-pressure-flex {
          display: flex;
          justify-content: space-between;
        }

        .text-pressure-stroke span {
          position: relative;
          color: ${textColor};
        }

        .text-pressure-stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>
        );
    }, [fontFamily, fontUrl, strokeColor, textColor]);

    const containerStyle: CSSProperties = {
        position: "relative",
        display: "block",
        width: "100%",
        height: "100%",
        background: "transparent",
    };

    const titleStyle: CSSProperties = {
        color: textColor,
        display: "block",
        fontFamily,
        fontSize: typeof fixedFontSize === "string" ? fixedFontSize : fontSize,
        fontStyle,
        fontWeight,
        lineHeight,
        margin: 0,
        textAlign: "center",
        transform: `scale(1, ${scaleY})`,
        transformOrigin: "center top",
        userSelect: "none",
        whiteSpace: "nowrap",
        width: "100%",
    };

    const titleClassName = [
        className,
        flex ? "text-pressure-flex" : "",
        stroke ? "text-pressure-stroke" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span ref={containerRef} style={containerStyle}>
            <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
                {text}
            </span>
            {styleElement}
            <span ref={titleRef} className={titleClassName} style={titleStyle} aria-hidden="true">
                {chars.map((char, index) => (
                    <span
                        key={`${char}-${index}`}
                        ref={(element) => {
                            spansRef.current[index] = element;
                        }}
                        data-char={char === " " ? "\u00A0" : char}
                        style={{
                            color: stroke ? undefined : textColor,
                            display: "inline-block",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </span>
        </span>
    );
}
