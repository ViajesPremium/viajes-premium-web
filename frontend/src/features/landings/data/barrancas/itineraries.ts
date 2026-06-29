import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const BARRANCAS_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Barrancas Premium",
  badgeText: "Itinerarios",
  title: "Itinerarios por Barrancas del Cobre",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "5 DÍAS · CHEPE EXPRESS · MIRADORES · NATURALEZA · BARRANCAS",
      title: "El de Mayor Ranking",
      description:
        "Un recorrido ideal para vivir Barrancas del Cobre por primera vez: paisajes monumentales, miradores inolvidables, naturaleza imponente y la experiencia del Chepe Express en Clase PREMIUM.",
      ideal:
        "Ideal para parejas, familias y viajeros que buscan descubrir lo más icónico de Barrancas del Cobre en una experiencia cómoda, bien diseñada y memorable.",
      image: "/media/landings/barrancas/itineraries/izquierda/mayor-ranking-izquierda.png",
    price: "Desde $37,259 MXN base doble",
      pdfHref: "/media/landings/barrancas/pdfs/mayor-ranking-barrancas-premium.pdf",
    },
    {
      id: 2,
      day: "7 DÍAS · EL FUERTE · LEYENDAS · HISTORIA · BARRANCAS",
      title: "Las Leyendas del Fuerte",
      description:
        "Un viaje con alma de relato por el norte de México: Barrancas del Cobre, El Fuerte, paisajes escénicos y experiencias culturales que conectan la historia, la naturaleza y el car?cter de la Sierra Tarahumara.",
      ideal:
        "Ideal para viajeros que buscan una experiencia con más historia, identidad cultural y escenarios memorables, sin renunciar a la comodidad de una ruta en Clase PREMIUM.",
      image: "/media/landings/barrancas/itineraries/izquierda/leyendas-del-fuerte-izquierda.webp",
    price: "Desde $46,115 MXN base doble",
      pdfHref: "/media/landings/barrancas/pdfs/leyendas-del-fuerte-barrancas-premium.pdf",
    },
    {
      id: 3,
      day: "8 DÍAS · GASTRONOM?A · CULTURA MENONITA · CHEPE EXPRESS · BARRANCAS",
      title: "Sabores del Norte",
      description:
        "Una experiencia más profunda por Barrancas del Cobre, donde el paisaje también se vive a través de la cocina regional, los sabores del norte, la cultura menonita y los recorridos escénicos del Chepe Express.",
      ideal:
        "Ideal para viajeros que disfrutan comer bien, conocer tradiciones locales y vivir un destino desde sus paisajes, su cultura y sus sabores más auténticos.",
      image: "/media/landings/barrancas/itineraries/izquierda/sabores-del-norte-izquierda.webp",
    price: "Desde $48,710 MXN base doble",
      pdfHref: "/media/landings/barrancas/pdfs/sabores-del-norte-barrancas-premium.pdf",
    },
  ],
};
