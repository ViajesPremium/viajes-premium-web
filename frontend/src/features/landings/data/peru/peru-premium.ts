import type { LandingMetadata, LandingTheme } from "../types";
import { PERU_PREMIUM_HERO } from "./hero";
import { PERU_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { PERU_FIRST_FORM, PERU_SECOND_FORM } from "./forms";
import { PERU_BENEFITS } from "./benefits";
import { PERU_ITINERARIES } from "./itineraries";
import { PERU_PROMISE } from "./promise";
import { PERU_TESTIMONIALS } from "./testimonials";
import { PERU_FOUNDER } from "./founder";
import { PERU_FAQS } from "./faqs";
import { PERU_FOOTER } from "./footer";
import { PERU_ALIANCES } from "./aliances";

const PERU_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qué Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  { label: "Testimonios", ariaLabel: "Ir a testimonios", link: "#testimonials" },
  { label: "Sobre Corea", ariaLabel: "Ir a sobre Corea", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const PERU_PREMIUM_METADATA: LandingMetadata = {
  title: "Viajes a Corea del Sur | Clase PREMIUM ",
  description:
    "Descubre Corea del Sur entre tradición, tecnología, gastronomía y experiencias diseñadas en Clase PREMIUM.",
  keywords: [
    "Viajes a Corea del Sur",
    "Tour por Corea",
    "Viaje a Corea desde México",
    " Viajar a Corea del Sur, Corea Premium",
  ],
  canonicalPath: "/corea-premium",
  ogImagePath: "/media/landings/corea/hero/coreana.avif",
};

export const peruPremium: LandingTheme = {
  slug: "corea-premium",
  label: "Corea Premium",
  metadata: PERU_PREMIUM_METADATA,
  palette: {
    primary: "#1D624E",
    secondary: "#482D55",
    complementary: "#DFDFDF",
  },
  navbar: {
    logoUrl: "/media/shared/logos/corea/logo-corea.svg",
    menuItems: [...PERU_MENU_ITEMS],
    colors: ["#1D624E", "#482D55"],
    accentColor: "#1D624E",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: PERU_PREMIUM_HERO,
  premiumExperiences: PERU_PREMIUM_EXPERIENCES,
  firstForm: PERU_FIRST_FORM,
  benefits: PERU_BENEFITS,
  itineraries: PERU_ITINERARIES,
  promise: PERU_PROMISE,
  testimonials: PERU_TESTIMONIALS,
  founder: PERU_FOUNDER,
  faqs: PERU_FAQS,
  video: {
    srHeading: "Video Corea Premium",
    desktop: {
      webm: "/media/landings/corea/videos/corea-web-horizontal.webm",
      mp4: "/media/landings/corea/videos/corea-web-horizontal.webm",
    },
    mobile: {
      webm: "/media/landings/corea/videos/corea-web-vertical.webm",
      mp4: "/media/landings/corea/videos/corea-web-vertical.webm",
    },
    alt: "Video de la experiencia Corea Premium",
  },
  secondForm: PERU_SECOND_FORM,
  aliances: PERU_ALIANCES,
  footer: PERU_FOOTER,
};
