import type { LandingBenefits } from "./../types";

export const EUROPE_BENEFITS: LandingBenefits = {
  srHeading: "Highlights de Europa Premium",
  badgeText: "¿Por qué Europa PREMIUM?",
  kickerTop: "Trabajamos con marcas",
  kickerBottom: "cuidadosamente seleccionadas.",
  line1: {
    lead: "Viaja por",
    bracket: {
      label: "Londres",
      imageSrc: "/media/landings/europa/benefits/hover/hover-londres.webp",
      imageAlt: "Recorrido en Londres",
      textTone: "ot",
    },
    tail: "con calma",
  },
  line2: {
    text: "Mientras",
    highlightWord: "Italia",
    bracket: {
      label: "ITALIA",
      imageSrc: "/media/landings/europa/benefits/hover/hover-italia.webp",
      imageAlt: "Paisaje italiano",
      textTone: "epochal",
    },
    tail: "revelan su",
  },
  line3: {
    lead: "Esencia y",
    bracket: {
      label: "París",
      imageSrc: "/media/landings/europa/benefits/hover/hover-paris.webp",
      imageAlt: "Vista de París",
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
      id: "kyoto-privado",
      title: "Londres",
      imageSrc:
        "/media/landings/europa/benefits/valor/carrusel-recorridos.webp",
      href: "#second-form",
    },
    {
      id: "tokyo-nocturno",
      title: "París",
      imageSrc:
        "/media/landings/europa/benefits/valor/carrusel-acompanamiento.webp",
      href: "#second-form",
    },
    {
      id: "sabores-omakase",
      title: "Roma",
      imageSrc: "/media/landings/europa/benefits/valor/carrusel-respaldo.webp",
      href: "#second-form",
    },
    {
      id: "onsen-premium",
      title: "Venecia",
      imageSrc: "/media/landings/europa/benefits/valor/carrusel-estancias.webp",
      href: "#second-form",
    },
    {
      id: "paisajes-iconicos",
      title: "Barcelona",
      imageSrc: "/media/landings/europa/benefits/valor/carrusel-expertos.webp",
      href: "#second-form",
    },
    {
      id: "experiencia-ryokan",
      title: "Ámsterdam",
      imageSrc:
        "/media/landings/europa/benefits/valor/carrusel-tranquilidad.webp",
      href: "#second-form",
    },
  ],
  ctaPrimary: { label: "Solicita tu cotización", target: "#second-form" },
};
