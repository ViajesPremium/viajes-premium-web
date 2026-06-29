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
        "Una introducción ideal a Corea del Sur entre ciudades vibrantes, historia milenaria y experiencias que revelan la esencia del país.",
      ideal:
        "Quienes desean descubrir Corea por primera vez en una experiencia equilibrada y cuidadosamente diseñada.",
      image: "/media/landings/corea/itineraries/tesoros-de-corea.avif",
    price: "Desde $5,705 USD base doble",
      pdfHref: "/media/landings/corea/pdfs/tesoros-de-corea-corea-premium.pdf",
    },
    {
      id: 2,
      day: "12 DÍAS · COREA · CHINA · HISTORIA · PATRIMONIO CULTURAL",
      title: "Rutas Imperiales",
      description:
        "Un recorrido por dos de las civilizaciones más influyentes de Asia entre ciudades históricas, cultura y tradición.",
      ideal: "Viajeros que buscan comprender la riqueza cultural de Asia en una experiencia amplia y enriquecedora.",
      image: "/media/landings/corea/itineraries/rutas-imperiales.avif",
    price: "Desde $5,564 USD base doble",
      pdfHref: "/media/landings/corea/pdfs/rutas-imperiales-corea-premium.pdf",
    },
    {
      id: 3,
      day: "12 DÍAS · COREA · JAPÓN · TRADICION · MODERNIDAD",
      title: "Joyas de Asia",
      description:
        "Una experiencia que combina dos de los destinos más fascinantes de Asia entre cultura, innovación y paisajes inolvidables.",
      ideal:
        "Viajeros que desean descubrir Corea y Japón en un mismo recorrido cuidadosamente diseñado.",
      image: "/media/landings/corea/itineraries/joyas-de-asia.avif",
    price: "Desde $12,848 USD base doble",
      pdfHref: "/media/landings/corea/pdfs/joyas-de-asia-corea-premium.pdf",
    },
  ],
};
