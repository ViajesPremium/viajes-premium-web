import type { LandingPremiumExperiences } from "./../types";

export const JAPAN_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Snapshot de Japón Premium",
  badgeText: "Nosotros",
  titleText: "Más de 21 años diseñando experiencias PREMIUM.",
  titleHighlightWords: ["21", "PREMIUM", "años"],
  cards: [
    {
      image: "/media/landings/japon/nosotros/itinerario-alma.avif",
      text: "Alma de Japón",
      experiences:
        "14 Días · Espiritualidad · Tradición · Bienestar · Cultura",
    },
    {
      image: "/media/landings/japon/nosotros/itinerario-pop.avif",
      text: "Japón Pop",
      experiences:
        "14 Días · Anime · Parques Temáticos · Tecnología · Cultura Pop",
    },
    {
      image: "/media/landings/japon/nosotros/itinerario-shogun-large.avif",
      text: "El Camino del Shogun",
      experiences: "15 Días · Samuráis · Geishas · Sumo · Alpes Japoneses",
    },
  ],
  cardButtonLabel: "Descubrir Itinerarios",
  cardButtonTarget: "#itinerarios",
};
