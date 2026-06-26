import type { LandingTestimonial } from "@/features/landings/data/types";
import type { GoogleRatingData } from "@/lib/google-reviews";

type HomeTestimonials = {
  srHeading: string;
  badgeText: string;
  items: LandingTestimonial[];
  googleRating?: GoogleRatingData;
  cta: {
    label: string;
    target: string;
  };
};

export const HOME_TESTIMONIALS: HomeTestimonials = {
  srHeading: "Testimonios de viajeros",
  badgeText: "La voz del viajero premium",
  items: [
    {
      id: 1,
      quote:
        "El paquete estuvo súper padre. Queremos reconocer el trabajo de todos los guías; en verdad, todos 10 de 10.",
      name: "Anabel González y Juan Hernández",
      location: "Ciudad de México",
      avatar: "/media/shared/home/testimonials/anabel-gonzalez-vp.avif",
    },
    {
      id: 2,
      quote:
        "Las auroras boreales superaron cualquier expectativa, todo estuvo perfectamente organizado. Sin duda, un viaje de nivel premium.",
      name: "Sofía Aguirre",
      location: "Guadalajara",
      avatar: "/media/shared/home/testimonials/sofia-aguirre-vp.avif",
    },
    {
      id: 3,
      quote:
        "Un viaje planeado por mucho tiempo que supera mis expectativas: hospedaje de gran calidad, guías bien capacitados durante todo el recorrido.",
      name: "Virginia Cárdenas",
      location: "Ciudad de México",
      avatar: "/media/shared/home/testimonials/virginia-cardenas-vp.avif",
    },
    {
      id: 4,
      quote:
        "Cada parte del proyecto tenía sentido, desde las ciudades hasta las experiencias que vivimos. Fue un viaje que realmente disfruté de principio a fin y que supera completamente mis expectativas.",
      name: "Francesco A",
      location: "Ciudad de México",
      avatar: "/media/shared/home/testimonials/francesco-a-vp.avif",
    },
    {
      id: 5,
      quote:
        "Un viaje increíble, guías, transporte y hospedaje, atención del personal, todo perfecto.",
      name: "Gabriela Jaime",
      location: "Ciudad de México",
      avatar: "/media/shared/home/testimonials/gabriela-jaime-vp.avif",
    },
  ],
  cta: {
    label: "Solicita tu cotización",
    target: "#form",
  },
};
