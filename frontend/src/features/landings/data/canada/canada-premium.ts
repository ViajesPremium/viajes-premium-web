import type { LandingMetadata, LandingTheme } from "../types";
import { CANADA_PREMIUM_HERO } from "./hero";
import { CANADA_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { CANADA_FIRST_FORM, CANADA_SECOND_FORM } from "./forms";
import { CANADA_BENEFITS } from "./benefits";
import { CANADA_ITINERARIES } from "./itineraries";
import { CANADA_PROMISE } from "./promise";
import { CANADA_TESTIMONIALS } from "./testimonials";
import { CANADA_FOUNDER } from "./founder";
import { CANADA_FAQS } from "./faqs";
import { CANADA_FOOTER } from "./footer";
import { CANADA_ALIANCES } from "./aliances";

const CANADA_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qu? Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  { label: "Testimonios", ariaLabel: "Ir a testimonios", link: "#testimonials" },
  { label: "Sobre Canad?", ariaLabel: "Ir a sobre Canad?", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const CANADA_PREMIUM_METADATA: LandingMetadata = {
  title: "Viajes a Canad? | Clase PREMIUM",
  description:
    "Descubre Canad? entre naturaleza, ciudades ic?nicas, paisajes espectaculares y experiencias dise?adas en Clase PREMIUM.",
  keywords: [
    "Tour por Canad?",
    "Viaje a Canad? desde M?xico",
    "Viajar a Canad?",
    "Canad? Premium",
    "Viajes a Canad?",
  ],
  canonicalPath: "/canada-premium",
  ogImagePath: "/media/landings/canada/hero/canada-premium-1.webp",
};

export const canadaPremium: LandingTheme = {
  slug: "canada-premium",
  label: "Canad? Premium",
  metadata: CANADA_PREMIUM_METADATA,
  palette: {
    primary: "#9E1F1E",
    secondary: "#377AA8",
    complementary: "#ABA639",
  },
  navbar: {
    logoUrl: "/media/shared/logos/canada/logo-canada.svg",
    menuItems: [...CANADA_MENU_ITEMS],
    colors: ["#9E1F1E", "#377AA8"],
    accentColor: "#ABA639",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: CANADA_PREMIUM_HERO,
  premiumExperiences: CANADA_PREMIUM_EXPERIENCES,
  firstForm: CANADA_FIRST_FORM,
  benefits: CANADA_BENEFITS,
  itineraries: CANADA_ITINERARIES,
  promise: CANADA_PROMISE,
  testimonials: CANADA_TESTIMONIALS,
  founder: CANADA_FOUNDER,
  faqs: CANADA_FAQS,
  video: {
    srHeading: "Video Canad? Premium",
    desktop: {
      webm: "/media/landings/corea/videos/corea-web-horizontal.webm",
      mp4: "/media/landings/corea/videos/corea-web-horizontal.mp4",
    },
    mobile: {
      webm: "/media/landings/corea/videos/corea-web-vertical.webm",
      mp4: "/media/landings/corea/videos/corea-web-vertical.mp4",
    },
    alt: "Video de la experiencia Canad? Premium",
  },
  secondForm: CANADA_SECOND_FORM,
  aliances: CANADA_ALIANCES,
  footer: CANADA_FOOTER,
};
