import type { LandingPremiumExperiences } from "./../types";

export const CANADA_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Nosotros Canad? Premium",
  badgeText: "Nosotros",
  titleText: "Más de 21 años diseñando experiencias PREMIUM.",
  titleHighlightWords: ["21", "PREMIUM", "años"],
  cards: [
    {
      image: "/media/landings/canada/premium-experiences/itinerario-original.webp",
      text: "Canadá Original",
      experiences:
        "8 días · Toronto · Niagara · Quebec · Montreal",
    },
    {
      image: "/media/landings/canada/premium-experiences/itinerario-rocosa.webp",
      text: "Rocosas y Vancouver",
      experiences:
        "8 días · Calgary · Banff · Lake Louise · Vancouver",
    },
    {
      image: "/media/landings/canada/premium-experiences/itinerario-invierno.webp",
      text: "Sueños de invierno",
      experiences: "7 días · Norte de Canadá · Paisajes nevados · Auroras boreales",
    },
  ],
  cardButtonLabel: "Descubrir",
  cardButtonTarget: "#itinerarios",
};
