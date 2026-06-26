import type {
  LandingAliances,
  LandingFaqs,
  LandingPalette,
} from "@/features/landings/data/types";
import { HOME_TESTIMONIALS } from "@/features/home/data/home-testimonials.data";

export const HOME_SHARED_PALETTE: LandingPalette = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  complementary: "var(--complementary)",
};

export const HOME_FAQS: LandingFaqs = {
  srHeading: "Preguntas frecuentes sobre Viajes PREMIUM",
  accordionAriaLabel: "Preguntas frecuentes",
  badgeText: "Preguntas frecuentes",
  title: "Todo lo que necesitas saber",
  subtitle:
    "Resolvemos las dudas más comunes sobre destinos y experiencias de Viajes PREMIUM. Si no encuentras lo que buscas, escríbenos directamente.",
  contactLabel: "¿Otra pregunta?",
  contactEmail: "reservaciones@viajespremium.com.mx",
  leftImage: "/media/shared/avatars/home-avatar-2.avif",
  rightImage: "/media/shared/avatars/home-avatar-1.avif",
  items: [
    {
      id: "1",
      question: "¿Cuál es el mejor destino para viajar desde México?",
      answer:
        "El mejor destino depende del tipo de experiencia que buscas. Japón, Europa, Canadá, Perú y Barrancas del Cobre son opciones ideales para viajeros que buscan cultura, naturaleza, gastronomía y recorridos bien diseñados.",
    },
    {
      id: "2",
      question: "¿Qué destinos ofrece Viajes PREMIUM?",
      answer:
        "Viajes PREMIUM diseña experiencias en Japón, Europa, Canadá, Perú, Barrancas del Cobre y otros destinos seleccionados para viajeros que buscan una experiencia en Clase PREMIUM.",
    },
    {
      id: "3",
      question: "¿Cómo elegir el destino ideal para mi próximo viaje?",
      answer:
        "Para elegir el destino ideal conviene considerar temporada, duración, intereses, ritmo de viaje y nivel de inversión. Un proyecto bien diseñado ayuda a tomar mejores decisiones desde el inicio.",
    },
    {
      id: "4",
      question: "¿Qué incluye normalmente un viaje internacional?",
      answer:
        "Un viaje internacional puede incluir alojamiento, traslados, recorridos seleccionados, experiencias especiales y acompañamiento antes y durante el viaje. Todo depende del destino y del tipo de experiencia.",
    },
    {
      id: "5",
      question: "¿Es mejor viajar con una agencia especializada?",
      answer:
        "Sí, una agencia especializada ayuda a reducir errores, organizar mejor los tiempos y seleccionar experiencias más adecuadas para cada destino. Esto permite viajar con mayor claridad y tranquilidad.",
    },
    {
      id: "6",
      question:
        "¿Qué destinos son recomendables para un primer gran viaje internacional?",
      answer:
        "Europa, Japón y Canadá suelen ser destinos ideales para un primer gran viaje internacional por su riqueza cultural, infraestructura turística y variedad de experiencias.",
    },
    {
      id: "7",
      question: "¿Qué destinos son ideales para viajar en pareja?",
      answer:
        "Japón, Europa, Perú y Canadá son destinos muy recomendables para parejas por su combinación de paisajes, gastronomía, cultura y experiencias memorables.",
    },
    {
      id: "8",
      question: "¿Qué destinos son recomendables para viajar en familia?",
      answer:
        "Canadá, Europa, Japón y Barrancas del Cobre son buenas opciones para familias, ya que ofrecen recorridos organizados, experiencias variadas y destinos con gran atractivo para distintas edades.",
    },
    {
      id: "9",
      question: "¿Cómo viajar sin preocuparme por la logística?",
      answer:
        "La clave está en contar con un proyecto de viaje bien estructurado. En Viajes PREMIUM cuidamos traslados, tiempos, alojamiento y experiencias para que el viajero se enfoque en disfrutar.",
    },
    {
      id: "10",
      question: "¿Por qué elegir Viajes PREMIUM?",
      answer:
        "Porque diseñamos experiencias en Clase PREMIUM con atención personalizada, curaduría de destinos y acompañamiento real antes y durante el viaje.",
    },
  ],
};

export const HOME_ALIANCES: LandingAliances = {
  srHeading: "Alianzas de Viajes Premium",
  badgeText: "Nuestras alianzas",
  title: "",
  introLeftLogo: {
    src: "/media/shared/logos/principal-logo.svg",
    alt: "Viajes Premium",
    width: 460,
    height: 96,
  },
  introRightLogo: {
    src: "/media/shared/logos/principal-logo.svg",
    alt: "Viajes Premium",
    width: 460,
    height: 96,
  },
  logos: [
    {
      src: "/media/shared/home/alianzas/aeromexivo-y-viajes-premium.png",
      alt: "Aeromexico y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/air-canada-y-viajes-premium.png",
      alt: "Air Canada y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/bonjour-quebec-y-viajes-premium.png",
      alt: "Bonjour Quebec y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/chepe-y-viajes-premium.png",
      alt: "Chepe y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/iberia-y-viajes-premium.png",
      alt: "Iberia y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/japan-endless-discovery-y-viajes-premium.png",
      alt: "Japan Endless Discovery y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/jnto-y-viajes-premium.png",
      alt: "JNTO y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/latam-y-viajes-premium.png",
      alt: "LATAM y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/peru-y-viajes-premium.png",
      alt: "Peru y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/perurail-y-viajes-premium.png",
      alt: "Perurail y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/profeco-y-viajes-premium.png",
      alt: "Profeco y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/promperu-y-viajes-premium.png",
      alt: "Promperu y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/turismo-y-viajes-premium.png",
      alt: "Turismo y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/volaris-y-viajes-premium.png",
      alt: "Volaris y Viajes Premium",
      width: 446,
      height: 164,
    },
  ],
};

export const HOME_SHARED_SECTIONS = {
  palette: HOME_SHARED_PALETTE,
  testimonials: HOME_TESTIMONIALS,
  faqs: HOME_FAQS,
  aliances: HOME_ALIANCES,
};
