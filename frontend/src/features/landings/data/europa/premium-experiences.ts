import type { LandingPremiumExperiences } from "./../types";

export const EUROPA_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Nosotros Europa Premium",
  badgeText: "Nosotros",
  titleText: "Más de 21 años diseñando experiencias PREMIUM",
  titleHighlightWords: ["21", "PREMIUM", "años"],
  cards: [
    {
      image: "/media/landings/europa/premium-experiences/itinerario-gala.avif",
      text: "De París a Roma",
      experiences: "12 días · Paris · Venecia · Florencia · Roma",
    },
    {
      image: "/media/landings/europa/premium-experiences/itinerario-maravillas.avif",
      text: "Europa Cosmopolita",
      experiences:
        "14 días · España · Francia · Bélgica · Países Bajos",
    },
    {
      image: "/media/landings/europa/premium-experiences/itinerario-reserva.avif",
      text: "Iconos de Europa",
      experiences:
        "16 días · Francia · Inglaterra · Países Bajos · Italia",
    },
  ],
  cardButtonLabel: "Descubrir",
  cardButtonTarget: "#itinerarios",
};
