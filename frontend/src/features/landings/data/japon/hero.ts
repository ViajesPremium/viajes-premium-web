import type { LandingHero } from "./../types";

export const JAPAN_PREMIUM_HERO: LandingHero = {
    seoHeading: "Japón Premium",
    title: {
        wordOne: "Viaja a",
        wordTwo: "Japón",
        wordThree: "desde",
        wordFour: "México",
    },
    description:
        "Eleva tu vida conociendo Japón con profundidad y acompañamiento desde el primer contacto hasta tu regreso. Atención en español, planeación personalizada y soporte de inicio a fin.",
    ctaPrimary: {
        label: "Solicita tu cotización",
        target: "#second-form",
    },
    heroOverlay: {
        baseImage: "/media/landings/japon/hero/geisha.avif",
        overlayImage: "/media/landings/japon/hero/samurai.avif",
        baseAlt: "Composición principal de Japón Premium",
        overlayAlt: "Capa visual de Japón Premium",
        showCircle: true,
    },
};
