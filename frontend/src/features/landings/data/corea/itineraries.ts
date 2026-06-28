import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const KOREA_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Corea Premium",
  badgeText: "Itinerarios",
  title: "Corea entre historia, ciudad y cultura contemporánea.",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "8 DÍAS · SEÚL · BUSAN · GYEONGJU · CULTURA COREANA",
      title: "Tesoros de Corea",
      description:
        "Una introducción ideal a Corea del Sur entre ciudades vibrantes, historia milenaria y cultura.",
      ideal:
        "Para descubrir Corea por primera vez en una experiencia equilibrada.",
      image: "/media/shared/home/destinos/corea/corea-premium-1.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/corea/pdf/tesoros-de-corea-corea-premium.pdf",
    },
    {
      id: 2,
      day: "12 DÍAS · COREA · CHINA · HISTORIA · PATRIMONIO CULTURAL",
      title: "Rutas Imperiales",
      description:
        "Un recorrido por dos civilizaciones influyentes de Asia entre ciudades históricas y tradición.",
      ideal: "Viajeros que buscan comprender la riqueza cultural de Asia.",
      image: "/media/shared/home/destinos/corea/corea-premium-3.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/corea/pdf/rutas-imperiales-corea-premium.pdf",
    },
    {
      id: 3,
      day: "13 DÍAS · COREA · JAPÓN · TRADICIÓN · MODERNIDAD",
      title: "Imperios del Pacífico",
      description:
        "Corea y Japón en un mismo recorrido entre innovación, cultura y paisajes inolvidables.",
      ideal:
        "Viajeros que desean combinar dos destinos fascinantes de Asia.",
      image: "/media/shared/blog/blog-corea-2.png",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/corea/pdf/joyas-de-asia-corea-premium.pdf",
    },
  ],
};
