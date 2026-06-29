type DestinationDataCard = {
  label: string;
  route: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  logoSrc: string;
  backgroundImage: string;
  galleryImages: string[];
  reviewUrl: string;
  reviews: Array<{ name: string; quote: string; avatar: string }>;
  overlayImages?: {
    baseImage: string;
    overlayImage: string;
    baseAlt: string;
    overlayAlt: string;
  };
};

const DEFAULT_REVIEWS = [
  {
    name: "Mariana Gutiérrez",
    quote:
      "Se nota cuando un viaje está pensado con criterio. Todo fluya perfecto.",
    avatar: "/media/landings/japon/testimonials/carolina-grijalva.avif",
  },
  {
    name: "Rodrigo Treviño",
    quote:
      "Desde la planeación hasta el regreso, todo se sintió bien acompañado.",
    avatar: "/media/landings/japon/testimonials/francesco.avif",
  },
];

export const destinationCardsData: DestinationDataCard[] = [
  {
    label: "Japón",
    route: "/japon-premium",
    primaryColor: "#db2f21",
    secondaryColor: "#95231c",
    logoSrc:       "/media/landings/japon/aliances/japon-premium-blanco.svg",
    description:
      "Tradición milenaria y vanguardia tecnológica en un viaje diseñado con comodidad y acompañamiento experto.",
    backgroundImage:
      "/media/landings/japon/aliances/japon-premium-blanco.svg",
    galleryImages: [
      "/media/shared/home/destinos/japon/japon-premium-1.webp",
      "/media/shared/home/destinos/japon/japon-premium-2.webp",
      "/media/shared/home/destinos/japon/japon-premium-3.webp",
      "/media/shared/home/destinos/japon/japon-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Japón+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
    overlayImages: {
      baseImage: "/media/landings/japon/hero/geisha.avif",
      overlayImage: "/media/landings/japon/hero/samurai.avif",
      baseAlt: "Hero Japón Premium",
      overlayAlt: "Imagen secundaria Japón Premium",
    },
  },
  {
    label: "Europa",
    route: "/europa-premium",
    primaryColor: "#511E62",
    secondaryColor: "#882BAC",
    logoSrc: "/media/shared/logos/europa/logo-europa.svg",
    description:
      "Los rincones más emblemáticos del viejo continente a un ritmo pausado, con alta cultura y descanso sofisticado.",
    backgroundImage:
      "/media/shared/home/destinos/europa/europa-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/europa/europa-premium-1.webp",
      "/media/shared/home/destinos/europa/europa-premium-2.webp",
      "/media/shared/home/destinos/europa/europa-premium-3.webp",
      "/media/shared/home/destinos/europa/europa-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Europa+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Corea",
    route: "/corea-premium",
    primaryColor: "#1D624E",
    secondaryColor: "#482D55",
    logoSrc: "/media/shared/logos/corea/logo-corea.svg",
    description:
      "El dinamismo urbano de Seúl y la serenidad de sus templos, en una experiencia con atención al detalle sin precedentes.",
    backgroundImage:
      "/media/shared/home/destinos/corea/corea-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/corea/corea-premium-1.webp",
      "/media/shared/home/destinos/corea/corea-premium-2.webp",
      "/media/shared/home/destinos/corea/corea-premium-3.webp",
      "/media/shared/home/destinos/corea/corea-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Corea+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Canadá",
    route: "/canada-premium",
    primaryColor: "#9E1F1E",
    secondaryColor: "#377AA8",
    logoSrc: "/media/shared/logos/canada/logo-canada.svg",
    description:
      "Montañas rocosas y naturaleza pura en un itinerario curado para ofrecerte el máximo confort en cada aventura.",
    backgroundImage:
      "/media/shared/home/destinos/canada/canada-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/canada/canada-premium-1.webp",
      "/media/shared/home/destinos/canada/canada-premium-2.webp",
      "/media/shared/home/destinos/canada/canada-premium-3.webp",
      "/media/shared/home/destinos/canada/canada-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Canadá+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Perú",
    route: "/peru-premium",
    primaryColor: "#1F5198",
    secondaryColor: "#132D4F",
    logoSrc: "/media/shared/logos/peru/logo-peru.svg",
    description:
      "La mística de Machu Picchu, gastronomía de clase mundial y paisajes que te dejarán sin aliento.",
    backgroundImage: "/media/shared/home/destinos/peru/peru-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/peru/peru-premium-1.webp",
      "/media/shared/home/destinos/peru/peru-premium-2.webp",
      "/media/shared/home/destinos/peru/peru-premium-3.webp",
      "/media/shared/home/destinos/peru/peru-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Perú+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Chiapas",
    route: "/chiapas-premium",
    primaryColor: "#E939C4",
    secondaryColor: "#A32B8D",
    logoSrc: "/media/shared/logos/chiapas/logo-chiapas.svg",
    description:
      "Selva profunda y pueblos mágicos en una ruta exclusiva para conectar con la naturaleza y la cultura de México.",
    backgroundImage:
      "/media/shared/home/destinos/chiapas/chiapas-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/chiapas/chiapas-premium-1.webp",
      "/media/shared/home/destinos/chiapas/chiapas-premium-2.webp",
      "/media/shared/home/destinos/chiapas/chiapas-premium-3.webp",
      "/media/shared/home/destinos/chiapas/chiapas-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Chiapas+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Barrancas",
    route: "/barrancas-premium",
    primaryColor: "#963825",
    secondaryColor: "#D55C26",
    logoSrc: "/media/shared/logos/barrancas/logo-barrancas.svg",
    description:
      "Las Barrancas del Cobre a bordo del Chepe Express, con vistas panorámicas en uno de los cañones más profundos del mundo.",
    backgroundImage:
      "/media/shared/home/destinos/barrancas/barrancas-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/barrancas/barrancas-premium-1.webp",
      "/media/shared/home/destinos/barrancas/barrancas-premium-2.webp",
      "/media/shared/home/destinos/barrancas/barrancas-premium-3.webp",
      "/media/shared/home/destinos/barrancas/barrancas-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Barrancas+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  },
  {
    label: "Yucatán",
    route: "/yucatan-premium",
    primaryColor: "#EA558A",
    secondaryColor: "#A42E56",
    logoSrc: "/media/shared/logos/yucatan/logo-yucatan.svg",
    description:
      "Cenotes, haciendas históricas y el lujo de la Riviera Maya en una experiencia para el descanso y la exploración cultural.",
    backgroundImage:
      "/media/shared/home/destinos/yucatan/yucatan-premium-1.webp",
    galleryImages: [
      "/media/shared/home/destinos/yucatan/yucatan-premium-1.webp",
      "/media/shared/home/destinos/yucatan/yucatan-premium-2.webp",
      "/media/shared/home/destinos/yucatan/yucatan-premium-3.webp",
      "/media/shared/home/destinos/yucatan/yucatan-premium-4.webp",
    ],
    reviewUrl: "https://www.google.com/search?q=Yucatán+Premium+reseñas",
    reviews: DEFAULT_REVIEWS,
  }
];

export type { DestinationDataCard };
