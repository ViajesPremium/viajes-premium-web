import type { LandingItineraries } from "../types";

const SECOND_FORM_TARGET = "#second-form";

export const PERU_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Per? Premium",
  badgeText: "Itinerarios",
  title: "Per? entre historia, ciudad y cultura contemporánea.",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "8 DÍAS · SEÚL · BUSAN · GYEONGJU · CULTURA COREANA",
      title: "Tesoros de Per?",
      description:
        "Una introducción ideal a Per? entre ciudades vibrantes, historia milenaria y cultura.",
      ideal:
        "Para descubrir Per? por primera vez en una experiencia equilibrada.",
      image: "/media/landings/peru/itineraries/izquierda/dunas-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/tesoros-de-corea-corea-premium.pdf",
    },
    {
      id: 2,
      day: "12 DÍAS · COREA · CHINA · HISTORIA · PATRIMONIO CULTURAL",
      title: "Rutas Imperiales",
      description:
        "Un recorrido por dos civilizaciones influyentes de Asia entre ciudades históricas y tradición.",
      ideal: "Viajeros que buscan comprender la riqueza cultural de Asia.",
      image: "/media/landings/peru/itineraries/izquierda/montana-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/rutas-imperiales-corea-premium.pdf",
    },
    {
      id: 3,
      day: "13 DÍAS · COREA · JAPÓN · TRADICIÓN · MODERNIDAD",
      title: "Imperios del Pacífico",
      description:
        "Per? y Japón en un mismo recorrido entre innovación, cultura y paisajes inolvidables.",
      ideal:
        "Viajeros que desean combinar dos destinos fascinantes de Asia.",
      image: "/media/landings/peru/itineraries/izquierda/skyfall-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/joyas-de-asia-corea-premium.pdf",
    },
  ],
};
