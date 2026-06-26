import type { LandingPremiumExperiences } from "./types";

export const JAPAN_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Experiencias premium de Japon Premium",
  badgeText: "Experiencias premium",
  titleText:
    "Diseñamos viajes con profundidad, ritmo y acompañamiento real.",
  titleHighlightWords: ["profundidad", "acompañamiento"],
  cards: [
    {
      text: "Japón privado",
      experiences:
        "Rutas de autor, traslados y tiempos pensados para vivir el destino sin fricción.",
      image: "/media/landings/japon/hero/geisha.avif",
    },
    {
      text: "Cultura y ceremonia",
      experiences:
        "Templos, gastronomía, compras y rituales seleccionados con precisión.",
      image: "/media/landings/japon/hero/samurai.avif",
    },
    {
      text: "Diseño a medida",
      experiences:
        "Cada itinerario se adapta al nivel de exclusividad y al ritmo del viajero.",
      image: "/media/landings/japon/hero/geisha.avif",
    },
  ],
  cardButtonLabel: "Ver itinerario",
  cardButtonTarget: "#itinerario",
};

export const KOREA_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Experiencias premium de Corea Premium",
  badgeText: "Experiencias premium",
  titleText:
    "Conectamos cultura contemporánea, exclusividad y soporte en español.",
  titleHighlightWords: ["cultura", "soporte"],
  cards: [
    {
      text: "Corea privada",
      experiences:
        "Recorridos seleccionados, transportes eficientes y tiempos bien resueltos.",
      image: "/media/landings/corea/hero/coreana.avif",
    },
    {
      text: "Gastronomía y diseño",
      experiences:
        "Experiencias urbanas, hoteles y reservas pensadas para un viaje premium.",
      image: "/media/landings/corea/hero/coreano.avif",
    },
    {
      text: "Ritmo a medida",
      experiences:
        "Cada día se ajusta al tipo de viaje, al descanso y al nivel de detalle.",
      image: "/media/landings/corea/hero/coreana.avif",
    },
  ],
  cardButtonLabel: "Ver propuesta",
  cardButtonTarget: "#itinerario",
};

export const EUROPA_PREMIUM_EXPERIENCES: LandingPremiumExperiences = {
  srHeading: "Experiencias premium de Europa Premium",
  badgeText: "Experiencias premium",
  titleText:
    "Creamos rutas con hoteles, ciudades icónicas y una narrativa visual cuidada.",
  titleHighlightWords: ["hoteles", "narrativa"],
  cards: [
    {
      text: "Europa privada",
      experiences:
        "Ciudades, traslados y paradas seleccionadas para que el viaje fluya sin ruido.",
      image: "/media/landings/europa/hero/diosa.avif",
    },
    {
      text: "Estancias premium",
      experiences:
        "Hoteles y ubicaciones elegidos por equilibrio, confort y carácter.",
      image: "/media/landings/europa/hero/espartano.avif",
    },
    {
      text: "Ruta a medida",
      experiences:
        "Cada circuito se ajusta al tipo de viajero, temporada y estilo de viaje.",
      image: "/media/landings/europa/hero/diosa.avif",
    },
  ],
  cardButtonLabel: "Descubrir ruta",
  cardButtonTarget: "#itinerario",
};
