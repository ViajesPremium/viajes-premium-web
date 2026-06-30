import type { LandingHero } from "../types";

export const PERU_PREMIUM_HERO: LandingHero = {
    seoHeading: "Perú Premium",
    title: {
        wordOne: "Viaja a",
        wordTwo: "Perú",
        wordThree: "desde",
        wordFour: "México",
    },
    description:
        "Eleva tu vida conociendo Perú con profundidad: desde Machu Picchu hasta la Amazonía, con comodidad y acompañamiento real desde el primer contacto hasta tu regreso.",
    ctaPrimary: {
        label: "Solicita tu cotización",
        target: "#second-form",
    },
    heroOverlay: {
        baseImage: "/media/landings/peru/hero/mujer.webp",
        overlayImage: "/media/landings/peru/hero/hombre.webp",
        baseAlt: "Composición principal de Perú Premium",
        overlayAlt: "Capa visual de Perú Premium",
    },
};