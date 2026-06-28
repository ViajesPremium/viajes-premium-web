import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const BARRANCAS_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Barrancas Premium",
  badgeText: "Itinerarios",
  title: "Itinerarios por Barancas del Cobre",
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
      image: "/media/landings/europa/itinerarios/izquierda/scroll-gala-izquierda.avif",
      price: "Desde _ MXN base doble",
      pdfHref: "/media/landings/barrancas/pdf/mayor-ranking-barrancas-premium.pdf",
    },
    {
      id: 2,
      day: "7 DÍAS · EL FUERTE · LEYENDAS · HISTORIA · BARRANCAS",
      title: "Las Leyendas del Fuerte",
      description:
        "Un viaje con alma de relato por el norte de México: Barrancas del Cobre, El Fuerte, paisajes escénicos y experiencias culturales que conectan la historia, la naturaleza y el carácter de la Sierra Tarahumara.",
      ideal:
        "Ideal para viajeros que buscan una experiencia con más historia, identidad cultural y escenarios memorables, sin renunciar a la comodidad de una ruta en Clase PREMIUM.",
      image: "/media/landings/europa/itinerarios/izquierda/scroll-maravillas-izquierda.avif",
      price: "Desde _ MXN base doble",
      pdfHref: "/media/landings/barrancas/pdf/sabores-del-norte-barrancas-premium.pdf",
    },
    {
      id: 3,
      day: "8 DÍAS · GASTRONOMÍA · CULTURA MENONITA · CHEPE EXPRESS · BARRANCAS",
      title: "Sabores del Norte",
      description:
        "Una experiencia más profunda por Barrancas del Cobre, donde el paisaje también se vive a través de la cocina regional, los sabores del norte, la cultura menonita y los recorridos escénicos del Chepe Express.",
      ideal:
        "Ideal para viajeros que disfrutan comer bien, conocer tradiciones locales y vivir un destino desde sus paisajes, su cultura y sus sabores más auténticos.",
      image: "/media/landings/europa/itinerarios/izquierda/scroll-reserva-izquierda.avif",
      price: "Desde _ MXN base doble",
      pdfHref: "/media/landings/barrancas/pdf/leyendas-del-fuerte-barrancas-premium.pdf",
    },
  ],
};
