import type { LandingTestimonials } from "./../types";

export const EUROPE_TESTIMONIALS: LandingTestimonials = {
  srHeading: "Testimonios de viajeros",
  badgeText: "La voz del viajero premium",
  title: "Europa con organización, ritmo y detalle.",
  cta: { label: "Solicita tu cotización", target: "#second-form" },
  items: [
    {
      id: 1,
      quote:
        "Hospedaje de gran calidad y guías bien capacitados durante todo el recorrido.",
      name: "Virginia Cárdenas",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonials/virginia-cardenas.jpeg",
    },
    {
      id: 2,
      quote:
        "Todo el viaje fue excelente: hoteles, servicios, tours, guías y horarios.",
      name: "Dr. Abel Peña",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonials/dr-abiel-pena.jpeg",
    },
    {
      id: 3,
      quote:
        "Mi viaje fue la mejor experiencia siendo la primera vez en Europa.",
      name: "Tania Pérez",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonials/tania-perez.webp",
    },
  ],
};
