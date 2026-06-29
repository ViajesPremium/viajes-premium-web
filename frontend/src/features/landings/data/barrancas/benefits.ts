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
      imageSrc: "/media/landings/barrancas/benefits/hover/chihuahua-premium.avif",
      imageAlt: "Chihuahua Premium",
      textTone: "epochal",
    },
    tail: "revelan su",
  },
  line3: {
    lead: "Esencia y el",
    bracket: {
      label: "Chepe",
      imageSrc: "/media/landings/barrancas/benefits/hover/chepe-express-premium.avif",
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
      title: "Barrancas del Cobre",
      imageSrc: "/media/landings/barrancas/benefits/valor/recorridos-disenados.webp",
      href: "#second-form",
    },
    {
      id: "chepe-express",
      title: "Chepe Express",
      imageSrc: "/media/landings/barrancas/benefits/valor/acompanamiento-premium.webp",
      href: "#second-form",
    },
    {
      id: "chihuahua",
      title: "Chihuahua",
      imageSrc: "/media/landings/barrancas/benefits/valor/respaldo-24-7.webp",
      href: "#second-form",
    },
    {
      id: "creel-divisadero",
      title: "Creel y Divisadero",
      imageSrc: "/media/landings/barrancas/benefits/valor/estancias-a-la-altura.webp",
      href: "#second-form",
    },
    {
      id: "miradores",
      title: "Miradores",
      imageSrc: "/media/landings/barrancas/benefits/valor/expertos-que-hablan.webp",
      href: "#second-form",
    },
    {
      id: "sierra-tarahumara",
      title: "Sierra Tarahumara",
      imageSrc: "/media/landings/barrancas/benefits/valor/tranquilidad-de-inicio-a-fin.webp",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
