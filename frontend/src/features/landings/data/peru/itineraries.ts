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
      day: "8 días · Cultura andina · Machu Picchu · Paisajes sagrados",
      title: "Montaña de Colores",
      description:
        "Un recorrido diseñado para descubrir Perú entre ciudades históricas, cultura andina y paisajes icónicos como Machu Picchu y la Montaña de Colores.",
      ideal:
        "Ideal para viajeros que buscan conocer la esencia de Perú por primera vez.",
      image: "/media/landings/peru/itineraries/izquierda/dunas-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/tesoros-de-corea-corea-premium.pdf",
    },
    {
      id: 2,
      day: "9 días · Desierto peruano · Misterios ancestrales · Aventura",
      title: "Dunas Dakar",
      description:
        "Una experiencia que combina desiertos, culturas ancestrales, recorridos escénicos y algunos de los paisajes más sorprendentes de Perú.",
      ideal: "Ideal para Viajeros que buscan aventura, naturaleza y experiencias diferentes en Perú.",
      image: "/media/landings/peru/itineraries/izquierda/montana-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/rutas-imperiales-corea-premium.pdf",
    },
    {
      id: 3,
      day: "11 días  · Andes · Titicaca · Paisajes extremos ·  Uyuni",
      title: "Sky Fall",
      description:
        "Un recorrido por Perú y Bolivia que conecta cultura andina, paisajes extraordinarios y experiencias únicas como el Salar de Uyuni y Lago Titicaca.",
      ideal:
        "Ideal para viajeros que buscan una experiencia más profunda y visualmente inolvidable.",
      image: "/media/landings/peru/itineraries/izquierda/skyfall-peru-premium.webp",
      price: "Precio bajo solicitud",
      pdfHref: "/media/landings/peru/pdfs/joyas-de-asia-corea-premium.pdf",
    },
  ],
};
