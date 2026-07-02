import type { LandingItineraries } from "./../types";

const SECOND_FORM_TARGET = "#second-form";

export const JAPAN_ITINERARIES: LandingItineraries = {
  srHeading: "Itinerarios de Japón Premium",
  badgeText: "Itinerarios",
  title: "Tres formas de vivir Japón con profundidad.",
  secondaryCtaLabel: "Descargar PDF",
  primaryCta: { label: "Quiero esta experiencia", target: SECOND_FORM_TARGET },
  items: [
    {
      id: 1,
      day: "14 DÍAS · ESPIRITUALIDAD · TRADICIÓN · BIENESTAR · CULTURA",
      title: "Alma de Japón",
      description:
        "Templos milenarios, rutas sagradas, ryokans, onsen y experiencias que transforman el viaje.",
      ideal:
        "Ideal para parejas, familias, lunas de miel y viajeros que buscan desconexión profunda.",
      image: "/media/landings/japon/itineraries/alma-de-japon.webp",
      price: "Desde $5,703 USD base doble",
      pdfHref:
        "/media/landings/japon/pdfs/Alma-De-Japón-Itinerario-Japón-PREMIUM.pdf",
      pdfFileName: "alma-de-japón-japón-premium.pdf",
    },
    {
      id: 2,
      day: "14 DÍAS · ANIME · PARQUES TEMÁTICOS · TECNOLOGÍA · CULTURA POP",
      title: "Japón Pop",
      description:
        "Anime, parques temáticos, tecnología, neón, tradición y cultura pop en una ruta vibrante.",
      ideal:
        "Ideal para familias, amigos, parejas jóvenes y fans del anime, manga y tecnología.",
      image: "/media/landings/japon/itineraries/japon-pop.webp",
      price: "Desde $6,478 USD base doble",
      pdfHref:
        "/media/landings/japon/pdfs/Japón-Pop-Itinerario-Japón-PREMIUM.pdf",
      pdfFileName: "japón-pop-japón-premium.pdf",
    },
    {
      id: 3,
      day: "15 DÍAS · SAMURÁIS · GEISHAS · SUMO · ALPES JAPONESES",
      title: "Ruta del Shogun",
      description:
        "Alpes Japoneses, templos zen, ryokans y santuarios para descubrir un Japón menos transitado.",
      ideal:
        "Ideal para viajeros con mirada cultural y quienes prefieren el Japón que pocos conocen.",
      image: "/media/landings/japon/itineraries/camino-del-shogun.webp",
      price: "Desde $5,938 USD base doble",
      pdfHref:
        "/media/landings/japon/pdfs/Ruta-Del-Shogun-Itinerario-Japón-PREMIUM.pdf",
      pdfFileName: "ruta-del-shogun-japón-premium.pdf",
    },
  ],
};
