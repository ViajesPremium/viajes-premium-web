import type { LandingTestimonials } from "../types";

export const PERU_TESTIMONIALS: LandingTestimonials = {
  srHeading: "Testimonios Per? Premium",
  badgeText: "La voz del viajero premium",
  title: "Per? contado por quienes ya la vivieron.",
  cta: { label: "Solicita tu cotización", target: "#second-form" },
  items: [
    {
      id: 1,
      quote:
        "Un viaje increíble lleno de buenas experiencias y excelente servicio.",
      name: "Luz Elena Montemayor",
      location: "Ciudad de México",
      avatar: "/media/landings/peru/testimonials/guadalupe-villa.webp",
    },
    {
      id: 2,
      quote:
        "Hacen que disfrutes al máximo tu viaje. Ellos se encargan de todo.",
      name: "Delia Zaragoza",
      location: "Guadalajara",
      avatar: "/media/landings/peru/testimonials/griselda-y-rafael.webp",
    },
    {
      id: 3,
      quote:
        "Fue nuestra primera vez en Asia y nos sentimos acompañados durante todo el recorrido.",
      name: "Patricia Gómez",
      location: "Monterrey",
      avatar: "/media/landings/peru/testimonials/gabriela-jaime.webp",
    },
  ],
};
