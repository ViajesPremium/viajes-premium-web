import type { LandingTestimonials } from "./../types";

export const JAPAN_TESTIMONIALS: LandingTestimonials = {
  srHeading: "Testimonios de viajeros",
  badgeText: "La voz del viajero premium",
  title: "Viajeros que vivieron Japón con otra claridad.",
  cta: { label: "Solicita tu cotización", target: "#second-form" },
  items: [
    {
      id: 1,
      quote:
        "Un viaje muy bonito con excelente mezcla de ciudades y pueblos. El ryokan de Hakone fue memorable.",
      name: "Familia Verduzco",
      location: "Ciudad de México",
      avatar: "/media/landings/japon/testimonios/familia-verduzco.webp",
    },
    {
      id: 2,
      quote:
        "Todo perfecto: hoteles, transporte y guías. Fue una experiencia única.",
      name: "Carolina Grijalva",
      location: "Guadalajara",
      avatar: "/media/landings/japon/testimonios/carolina-grijalva.webp",
    },
    {
      id: 3,
      quote: "Todo estuvo pensado con muchísimo detalle y claridad.",
      name: "Lilia Gordillo",
      location: "Monterrey",
      avatar: "/media/landings/japon/testimonios/lilia-gordillo.webp",
    },
  ],
};
