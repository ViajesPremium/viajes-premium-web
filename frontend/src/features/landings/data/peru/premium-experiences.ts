import type { LandingPremiumExperiences } from "../types";

export const PERU_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Nosotros Per? Premium",
  badgeText: "Nosotros",
  titleText: "Más de 21 años diseñando experiencias PREMIUM.",
  titleHighlightWords: ["21", "PREMIUM", "años"],
  cards: [
    {
      image: "/media/landings/peru/premium-experiences/itinerario-dunas-dakar.avif",
      text: "Tesoros de Per?",
      experiences:
        "8 días · Seúl · Busan · Gyeongju · Cultura coreana",
    },
    {
      image: "/media/landings/peru/premium-experiences/itinerario-montana-de-colores.avif",
      text: "Rutas Imperiales",
      experiences:
        "12 días · Per? · China · Historia · Patrimonio cultural",
    },
    {
      image: "/media/landings/peru/premium-experiences/itinerario-skyfall.avif",
      text: "Imperios del Pacífico",
      experiences: "13 días · Per? · Japón · Tradición · Modernidad",
    },
  ],
  cardButtonLabel: "Descubrir",
  cardButtonTarget: "#itinerarios",
};
