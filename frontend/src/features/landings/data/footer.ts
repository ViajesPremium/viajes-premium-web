import type { LandingFooter } from "./types";
import { LANDING_CONTACT, LANDING_SOCIAL_LINKS } from "./shared";

const footer = (
  logoWord: string,
  pageLinks: LandingFooter["pageLinks"],
  overrides: Partial<LandingFooter> = {},
): LandingFooter => ({
  srHeading: `Footer ${logoWord} Premium`,
  logoWord,
  address:
    "Cda. de Omega 306, Romero de Terreros, Coyoacán, 04310 Ciudad de México, CDMX",
  contactEmail: LANDING_CONTACT.email,
  contactPhoneDisplay: LANDING_CONTACT.phoneDisplay,
  contactPhoneLink: LANDING_CONTACT.phoneLink,
  pageLinks,
  socialLinks: LANDING_SOCIAL_LINKS,
  copyrightText: `© 2026 ${logoWord} Premium. Todos los derechos reservados.`,
  legalLinks: [{ label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" }],
  ...overrides,
});

export const JAPAN_FOOTER = footer(
  "JAPÓN",
  [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Itinerarios", href: "#itinerarios" },
    { label: "Qué Incluye", href: "#includes" },
    { label: "Opiniones", href: "#testimonials" },
    { label: "Contacto", href: "#second-form" },
  ],
  {
    mapEmbedTitle: "Ubicación Japón Premium",
    contactPhoneDisplay: "+52 55 4161 9428",
    contactPhoneLink: "+525541619428",
    copyrightText:
      "Todas las marcas y servicios que se ofrecen son propiedad de Japón PREMIUM® Consulte Términos y Condiciones en el Contrato de Adhesión ante PROFECO con número 7735-2015 & 7180-2015",
  },
);

export const KOREA_FOOTER = footer(
  "COREA",
  [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Itinerarios", href: "#itinerarios" },
    { label: "Qué Incluye", href: "#includes" },
    { label: "Testimonios", href: "#testimonials" },
    { label: "Contacto", href: "#second-form" },
  ],
  {
    mapEmbedTitle: "Ubicación Corea Premium",
    contactPhoneDisplay: "+52 55 4161 9427",
    contactPhoneLink: "+525541619427",
    legalLinks: [
      { label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" },
      { label: "TÉRMINOS", href: "#" },
    ],
  },
);

export const EUROPE_FOOTER = footer(
  "EUROPA",
  [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Itinerarios", href: "#itinerarios" },
    { label: "Qué Incluye", href: "#includes" },
    { label: "Opiniones", href: "#testimonials" },
    { label: "Contacto", href: "#second-form" },
  ],
  {
    mapEmbedTitle: "Ubicación Europa Premium",
    contactPhoneDisplay: "+52 55 4161 9427",
    contactPhoneLink: "+525541619427",
    copyrightText: "© 2026 Viaja a Europa Premium. Todos los derechos reservados.",
    legalLinks: [
      { label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" },
      { label: "TÉRMINOS", href: "#" },
    ],
  },
);

export const BARRANCAS_FOOTER = footer(
  "BARRANCAS",
  [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Itinerarios", href: "#itinerarios" },
    { label: "Qué Incluye", href: "#includes" },
    { label: "Opiniones", href: "#testimonials" },
    { label: "Contacto", href: "#second-form" },
  ],
  {
    mapEmbedTitle: "Ubicación Europa Premium",
    contactPhoneDisplay: "+52 55 4161 9427",
    contactPhoneLink: "+525541619427",
    copyrightText: "© 2026 Viaja a Europa Premium. Todos los derechos reservados.",
    legalLinks: [
      { label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" },
      { label: "TÉRMINOS", href: "#" },
    ],
  },
);

