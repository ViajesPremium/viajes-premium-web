import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const CANADA_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Canadá Premium",
  badgeText: "Itinerarios",
  title: "Canadá entre historia, ciudad y cultura contemporánea.",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "8 DÍAS · TORONTO · NIGARA · QUEBEC · MONTREAL",
      title: "Canadá Original",
      description:
        "Un recorrido por el este de Canadá entre ciudades históricas, paisajes icónicos y algunas de las experiencias más representativas del país.",
      ideal:
        "Viajeros que desean descubrir Canadá por primera vez en una experiencia equilibrada y cuidadosamente diseñada.",
      image: "/media/landings/canada/itineraries/izquierda/scroll-original-izquierda.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/canada/pdfs/tesoros-de-corea-corea-premium.pdf",
    },
    {
      id: 2,
      day: "8 DÍAS · CALGARY · BANFF · LAKE · LOUISE · VANCOUVER",
      title: "Rocosas y Vancouver",
      description:
        "Un recorrido por el oeste de Canada, visitando  las Rocosas Canadienses entre lagos turquesa, montañas imponentes y lo más impresionante de Canadá.",
      ideal: "Viajeros que buscan paisajes naturales, rutas panorámicas y experiencias profundamente conectadas con la naturaleza canadiense.",
      image: "/media/landings/canada/itineraries/izquierda/scroll-rocosas-izquierda.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/canada/pdfs/rutas-imperiales-corea-premium.pdf",
    },
    {
      id: 3,
      day: "7 DÍAS · NORTE DE CANDÁ · PAISAJES NEVADOS · AURORAS BOREALES",
      title: "Sueños de invierno",
      description:
        "Una experiencia diseñada para descubrir el invierno canadiense entre paisajes nevados y la posibilidad de observar auroras boreales en el norte de Canadá.",
      ideal:
        "Viajeros que buscan vivir una experiencia invernal única y contemplar uno de los fenómenos naturales más impresionantes del mundo.",
      image: "/media/landings/canada/itineraries/izquierda/scroll-invierno-izquierda.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/canada/pdfs/joyas-de-asia-corea-premium.pdf",
    },
  ],
};
