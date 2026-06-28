import type { LandingBenefits } from "./../types";

export const JAPAN_BENEFITS: LandingBenefits = {
  srHeading: "Highlights de Japón Premium",
  badgeText: "¿Por qué Japón Premium?",
  kickerTop: "Trabajamos con marcas",
  kickerBottom: "Cuidadosamente seleccionadas.",
  line1: {
    lead: "VIAJA POR",
    bracket: {
      label: "Osaka",
      imageSrc: "/media/landings/japon/porque/hover/frase-osaka.webp",
      imageAlt: "Vista urbana de Osaka",
      textTone: "ot",
    },
    tail: "CON CALMA",
  },
  line2: {
    text: "MIENTRAS",
    highlightWord: "",
    bracket: {
      label: "Kioto",
      imageSrc: "/media/landings/japon/porque/hover/frase-kioto.webp",
      imageAlt: "Escena tradicional de Kioto",
      textTone: "epochal",
    },
    tail: "REVELA SU",
  },
  line3: {
    lead: "ESENCIA Y",
    bracket: {
      label: "Tokio",
      imageSrc: "/media/landings/japon/porque/hover/frase-tokio.webp",
      imageAlt: "Paisaje icónico de Tokio",
      textTone: "ot",
    },
    tail: "REDEFINE TU",
  },
  line4: {
    text: "FORMA DE VIAJAR",
    highlightWord: "VIAJAR",
  },
  focusRailItems: [
    {
      id: "kyoto-privado",
      title: "Tokio",
      imageSrc: "/media/landings/japon/porque/valor/tokio.avif",
      href: "#second-form",
    },
    {
      id: "tokyo-nocturno",
      title: "Osaka",
      imageSrc: "/media/landings/japon/porque/valor/osaka.avif",
      href: "#second-form",
    },
    {
      id: "sabores-omakase",
      title: "Kioto",
      imageSrc: "/media/landings/japon/porque/valor/kioto.avif",
      href: "#second-form",
    },
    {
      id: "hiroshima",
      title: "Hiroshima",
      imageSrc: "/media/landings/japon/porque/valor/hiroshima.avif",
      href: "#second-form",
    },
    {
      id: "kanazawa",
      title: "Kanazawa",
      imageSrc: "/media/landings/japon/porque/valor/kanazawa.avif",
      href: "#second-form",
    },
    {
      id: "experiencia-ryokan",
      title: "Shirakawago",
      imageSrc: "/media/landings/japon/porque/valor/shirakawago.avif",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
