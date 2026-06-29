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
      imageSrc: "/media/landings/japon/benefits/phrase/osaka.avif",
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
      imageSrc: "/media/landings/japon/benefits/phrase/kioto.avif",
      imageAlt: "Escena tradicional de Kioto",
      textTone: "epochal",
    },
    tail: "REVELA SU",
  },
  line3: {
    lead: "ESENCIA Y",
    bracket: {
      label: "Tokio",
      imageSrc: "/media/landings/japon/benefits/phrase/tokio.avif",
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
      imageSrc: "/media/landings/japon/benefits/cards/tokio.avif",
      href: "#second-form",
    },
    {
      id: "tokyo-nocturno",
      title: "Osaka",
      imageSrc: "/media/landings/japon/benefits/cards/osaka.avif",
      href: "#second-form",
    },
    {
      id: "sabores-omakase",
      title: "Kioto",
      imageSrc: "/media/landings/japon/benefits/cards/kioto.avif",
      href: "#second-form",
    },
    {
      id: "hiroshima",
      title: "Hiroshima",
      imageSrc: "/media/landings/japon/benefits/cards/hiroshima.avif",
      href: "#second-form",
    },
    {
      id: "kanazawa",
      title: "Kanazawa",
      imageSrc: "/media/landings/japon/benefits/cards/kanazawa.avif",
      href: "#second-form",
    },
    {
      id: "experiencia-ryokan",
      title: "Shirakawago",
      imageSrc: "/media/landings/japon/benefits/cards/shirakawago.avif",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
