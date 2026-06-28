import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const EUROPE_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Europa Premium",
  badgeText: "Itinerarios",
  title: "Europa con ciudades icónicas y tiempos bien pensados.",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "12 DÍAS · PARÍS · VENECIA · FLORENCIA · ROMA",
      title: "De París a Roma",
      description:
        "La Europa más icónica entre ciudades históricas, paisajes escénicos y experiencias representativas.",
      ideal:
        "Para descubrir Europa por primera vez en una experiencia clásica.",
      image: "/media/landings/europa/itinerarios/izquierda/scroll-gala-izquierda.avif",
      price: "Desde $5,286 USD base doble",
      pdfHref: "/media/landings/europa/pdf/de-paris-a-roma-europa-premium.pdf",
    },
    {
      id: 2,
      day: "14 DÍAS · ESPAÑA · FRANCIA · BÉLGICA · PAÍSES BAJOS",
      title: "Europa Cosmopolita",
      description:
        "Ciudades históricas, arquitectura emblemática y paisajes urbanos de Europa occidental.",
      ideal:
        "Viajeros que buscan cultura, historia y ciudades llenas de identidad.",
      image: "/media/landings/europa/itinerarios/izquierda/scroll-maravillas-izquierda.avif",
      price: "Desde $5,094 USD base doble",
      pdfHref: "/media/landings/europa/pdf/europa-cosmopolita-europa-premium.pdf",
    },
    {
      id: 3,
      day: "16 DÍAS · FRANCIA · INGLATERRA · PAÍSES BAJOS · ITALIA",
      title: "Íconos de Europa",
      description:
        "Capitales históricas, pueblos escénicos y experiencias que representan la grandeza del continente.",
      ideal:
        "Para conocer las ciudades más icónicas de Europa con una ruta amplia.",
      image: "/media/landings/europa/itinerarios/izquierda/scroll-reserva-izquierda.avif",
      price: "Desde $6,319 USD base doble",
      pdfHref: "/media/landings/europa/pdf/iconos-de-europa-europa-premium.pdf",
    },
  ],
};
