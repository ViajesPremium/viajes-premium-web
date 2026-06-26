export type BlogContentEntry = {
  id: string;
  slug: string;
  image: string;
  question: string;
  subtitle: string;
};

export const BLOG_CONTENT_ENTRIES: BlogContentEntry[] = [
  {
    id: "01",
    slug: "blog-01-japon-premium",
    image: "/media/shared/blog/portada-blog-japon.avif",
    question: "¿Cuál es la mejor temporada para viajar a Japón?",
    subtitle: "Japón cambia completamente según la época del año.",
  },
  {
    id: "02",
    slug: "blog-02-viajes-familia-premium",
    image: "/media/shared/blog/portada-blog-europa.avif",
    question: "¿Qué países visitar en un primer viaje a Europa?",
    subtitle: "Europa cambia completamente en cada frontera.",
  },
  {
    id: "03",
    slug: "blog-03-viajero-consciente",
    image: "/media/shared/blog/portada-blog-canada.avif",
    question: "¿Dónde ver auroras boreales en Canadá?",
    subtitle: "El norte canadiense ofrece las mejores Auroras Boreales.",
  },
  {
    id: "04",
    slug: "blog-04-arte-itinerarios-premium",
    image: "/media/shared/blog/portada-blog-peru.avif",
    question: "¿Qué incluye un viaje a Machu Picchu?",
    subtitle: "La experiencia comienza mucho antes de llegar a la ciudadela.",
  },
  {
    id: "05",
    slug: "blog-05-hospedaje-con-identidad",
    image: "/media/shared/blog/portada-blog-barrancas.avif",
    question: "¿Qué experiencias se pueden vivir en Barrancas del Cobre?",
    subtitle: "El norte de México se descubre a otro ritmo.",
  },
  {
    id: "06",
    slug: "blog-06-experiencias-culturales-curadas",
    image: "/media/shared/blog/portada-blog-corea.avif",
    question: "¿Es difícil viajar a Corea del Sur sin hablar coreano?",
    subtitle: "Resulta mucho más accesible de lo que muchos imaginan.",
  },
];

export const BLOG_CONTENT_BY_SLUG = BLOG_CONTENT_ENTRIES.reduce<
  Record<string, BlogContentEntry>
>((accumulator, entry) => {
  accumulator[entry.slug] = entry;
  return accumulator;
}, {});
