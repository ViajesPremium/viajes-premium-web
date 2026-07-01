import type { LandingBenefits } from "./../types";

export const BARRANCAS_BENEFITS: LandingBenefits = {
  srHeading: "Highlights de Barrancas Premium",
  badgeText: "¿Por qué Barrancas PREMIUM?",
  kickerTop: "Trabajamos con marcas",
  kickerBottom: "cuidadosamente seleccionadas.",
  line1: {
    lead: "Viaja por",
    bracket: {
      label: "Barrancas",
      imageSrc:
        "/media/landings/barrancas/benefits/hover/barrancas-del-cobre-premium.avif",
      imageAlt: "Barrancas del Cobre",
      textTone: "ot",
    },
    tail: "con calma",
  },
  line2: {
    text: "Mientras",
    highlightWord: "Chihuahua",
    bracket: {
      label: "Chihuahua",
      imageSrc:
        "/media/landings/barrancas/benefits/hover/chihuahua-premium.avif",
      imageAlt: "Chihuahua Premium",
      textTone: "epochal",
    },
    tail: "revelan su",
  },
  line3: {
    lead: "Esencia y el",
    bracket: {
      label: "Chepe",
      imageSrc:
        "/media/landings/barrancas/benefits/hover/chepe-express-premium.avif",
      imageAlt: "Chepe Express",
      textTone: "ot",
    },
    tail: "redefine tu",
  },
  line4: {
    text: "forma de viajar",
    highlightWord: "viajar",
  },
  focusRailItems: [
    {
      id: "barrancas-del-cobre",
      title: "Cerocahui",
      imageSrc: "/media/landings/barrancas/benefits/cards/cerocahui.avif",
      href: "#second-form",
    },
    {
      id: "chepe-express",
      title: "Chepe Express",
      imageSrc: "/media/landings/barrancas/benefits/cards/chepe.avif",
      href: "#second-form",
    },
    {
      id: "chihuahua",
      title: "Chihuahua",
      imageSrc: "/media/landings/barrancas/benefits/cards/chihuahua.avif",
      href: "#second-form",
    },
    {
      id: "creel-divisadero",
      title: "Creel",
      imageSrc: "/media/landings/barrancas/benefits/cards/creel.avif",
      href: "#second-form",
    },
    {
      id: "miradores",
      title: "Divisadero",
      imageSrc: "/media/landings/barrancas/benefits/cards/divisadero.avif",
      href: "#second-form",
    },
    {
      id: "sierra-tarahumara",
      title: "El Fuerte",
      imageSrc: "/media/landings/barrancas/benefits/cards/fuerte.avif",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
