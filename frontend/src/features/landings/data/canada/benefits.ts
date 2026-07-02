import type { LandingBenefits } from "./../types";

export const CANADA_BENEFITS: LandingBenefits = {
  srHeading: "Highlights de Canadá Premium",
  badgeText: "¿Por qué Canadá PREMIUM?",
  kickerTop: "Trabajamos con marcas",
  kickerBottom: "Cuidadosamente seleccionadas.",
  line1: {
    lead: "Viaja por",
    bracket: {
      label: "Québec",
      imageSrc: "/media/landings/canada/benefits/hover/quebec.webp",
      imageAlt: "Vista de Seúl con luces y arquitectura urbana",
      textTone: "ot",
    },
    tail: "con calma",
  },
  line2: {
    text: "Mientras",
    highlightWord: "Toronto",
    bracket: {
      label: "Toronto",
      imageSrc: "/media/landings/canada/benefits/hover/toronto.webp",
      imageAlt: "Vista de Busan frente al mar",
      textTone: "epochal",
    },
    tail: "revela su",
  },
  line3: {
    lead: "Esencia y",
    bracket: {
      label: "Ottawa",
      imageSrc: "/media/landings/canada/benefits/hover/ottawa.webp",
      imageAlt: "Paisaje histórico de Gyeongju",
      textTone: "ot",
    },
    tail: "redefine tu",
  },
  line4: {
    text: "Forma de viajar",
    highlightWord: "viajar",
  },
  focusRailItems: [
    {
      id: "respaldo-24-7",
      title: "Banff",
      imageSrc: "/media/landings/canada/benefits/cards/banff.avif",
      href: "#second-form",
    },
    {
      id: "estancias-altura",
      title: "Toronto",
      imageSrc: "/media/landings/canada/benefits/cards/toronto.avif",
      href: "#second-form",
    },
    {
      id: "idioma",
      title: "Vancouver",
      imageSrc: "/media/landings/canada/benefits/cards/vancouver.avif",
      href: "#second-form",
    },
    {
      id: "tranquilidad",
      title: "Québec",
      imageSrc: "/media/landings/canada/benefits/cards/quebec.avif",
      href: "#second-form",
    },
    {
      id: "criterio",
      title: "Ottawa",
      imageSrc: "/media/landings/canada/benefits/cards/ottawa.avif",
      href: "#second-form",
    },
    {
      id: "acompanamiento",
      title: "Niagara",
      imageSrc: "/media/landings/canada/benefits/cards/niagara.avif",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
