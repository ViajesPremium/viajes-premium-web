export {};

declare global {
  interface LenisLike {
    on: (event: "scroll", callback: () => void) => (() => void) | void;
    off: (event: "scroll", callback: () => void) => void;
    scrollTo: (
      target: number | string | HTMLElement,
      options?: {
        duration?: number;
        easing?: (value: number) => number;
        immediate?: boolean;
        force?: boolean;
        lock?: boolean;
        onComplete?: () => void;
      },
    ) => void;
    resize: () => void;
    stop: () => void;
    start: () => void;
    destroy: () => void;
    isStopped?: boolean;
  }

  interface Window {
    __lenis?: LenisLike;
    __chatAssistantOpen?: boolean;
    __animationsEnabled?: boolean;
    __lowEndMobile?: boolean;
    __forceMountPremiumSections?: () => void;
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (
      action: "track" | "init",
      eventOrPixelId: string,
      parameters?: Record<string, unknown>,
    ) => void;
    _fbq?: Window["fbq"];
  }
}
