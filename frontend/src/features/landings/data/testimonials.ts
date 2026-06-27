import type { LandingTestimonials } from "./types";

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

export const KOREA_TESTIMONIALS: LandingTestimonials = {
  ...JAPAN_TESTIMONIALS,
  srHeading: "Testimonios Corea Premium",
  title: "Corea contada por quienes ya la vivieron.",
  items: [
    {
      id: 1,
      quote:
        "Un viaje increíble lleno de buenas experiencias y excelente servicio.",
      name: "Luz Elena Montemayor",
      location: "Ciudad de México",
      avatar: "/media/shared/home/testimonials/anabel-gonzalez-vp.avif",
    },
    {
      id: 2,
      quote:
        "Hacen que disfrutes al máximo tu viaje. Ellos se encargan de todo.",
      name: "Delia Zaragoza",
      location: "Guadalajara",
      avatar: "/media/shared/home/testimonials/sofia-aguirre-vp.avif",
    },
    {
      id: 3,
      quote:
        "Fue nuestra primera vez en Asia y nos sentimos acompañados durante todo el recorrido.",
      name: "Patricia Gómez",
      location: "Monterrey",
      avatar: "/media/shared/home/testimonials/virginia-cardenas-vp.avif",
    },
  ],
};

export const EUROPE_TESTIMONIALS: LandingTestimonials = {
  ...JAPAN_TESTIMONIALS,
  title: "Europa con organización, ritmo y detalle.",
  items: [
    {
      id: 1,
      quote:
        "Hospedaje de gran calidad y guías bien capacitados durante todo el recorrido.",
      name: "Virginia Cárdenas",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/virginia-cardenas.jpeg",
    },
    {
      id: 2,
      quote:
        "Todo el viaje fue excelente: hoteles, servicios, tours, guías y horarios.",
      name: "Dr. Abel Peña",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/dr-abiel-pena.jpeg",
    },
    {
      id: 3,
      quote:
        "Mi viaje fue la mejor experiencia siendo la primera vez en Europa.",
      name: "Tania Pérez",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/tania-perez.webp",
    },
  ],
};

export const BARRANCAS_TESTIMONIALS: LandingTestimonials = {
  ...JAPAN_TESTIMONIALS,
  title: "Europa con organización, ritmo y detalle.",
  items: [
    {
      id: 1,
      quote:
        "“El paquete estuvo súper padre. Queremos reconocer el trabajo de todos los guías; en verdad, todos 10 de 10.",
      name: "Anabel González y Juan Hernández",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/virginia-cardenas.jpeg",
    },
    {
      id: 2,
      quote:
        "Excelente servicio. El tour completo fue divino; nos sentimos cómodos y seguros en todo momento.",
      name: "Patricia Vega",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/dr-abiel-pena.jpeg",
    },
    {
      id: 3,
      quote:
        "Servicio personalizado y de gran calidad. Guías atentos, excelente logística y experiencias increíbles en Chepe y destinos.",
      name: "Javier y Tere González",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/tania-perez.webp",
    },
        {
      id: 4,
      quote:
        "Gracias por las atenciones; el viaje fue inolvidable. Paisajes increíbles, actividades divertidas y mucho aprendizaje.",
      name: "Ing. Hernán García y Aurelia Patricia Govea",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/tania-perez.webp",
    },
        {
      id: 5,
      quote:
        "Atención personalizada desde el inicio, guías muy amables y un viaje hermoso. Totalmente recomendable.",
      name: "Félix Romo",
      location: "Ciudad de México",
      avatar: "/media/landings/europa/testimonios/tania-perez.webp",
    },
  ],
};
