import type { LandingMetadata, LandingTheme } from "./../types";
import { KOREA_PREMIUM_HERO } from "./hero";
import { KOREA_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { KOREA_FIRST_FORM, KOREA_SECOND_FORM } from "./forms";
import { KOREA_BENEFITS } from "./benefits";
import { KOREA_ITINERARIES } from "./itineraries";
import { KOREA_PROMISE } from "./promise";
import { KOREA_TESTIMONIALS } from "./testimonials";
import { KOREA_FOUNDER } from "./founder";
import { KOREA_FAQS } from "./faqs";
import { KOREA_FOOTER } from "./footer";
import { KOREA_ALIANCES } from "./aliances";

const KOREA_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qué Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  {
    label: "Testimonios",
    ariaLabel: "Ir a testimonios",
    link: "#testimonials",
  },
  { label: "Sobre Corea", ariaLabel: "Ir a sobre Corea", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const KOREA_PREMIUM_METADATA: LandingMetadata = {
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

export const coreaPremium: LandingTheme = {
  slug: "corea-premium",
  label: "Corea Premium",
  metadata: KOREA_PREMIUM_METADATA,
  palette: {
    primary: "#1D624E",
    secondary: "#482D55",
    complementary: "#DFDFDF",
  },
  navbar: {
    logoUrl: "/media/shared/logos/corea/corea-premium-blanco.svg",
    menuItems: [...KOREA_MENU_ITEMS],
    colors: ["#1D624E", "#482D55"],
    accentColor: "#1D624E",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: KOREA_PREMIUM_HERO,
  premiumExperiences: KOREA_PREMIUM_EXPERIENCES,
  firstForm: KOREA_FIRST_FORM,
  benefits: KOREA_BENEFITS,
  itineraries: KOREA_ITINERARIES,
  promise: KOREA_PROMISE,
  testimonials: KOREA_TESTIMONIALS,
  founder: KOREA_FOUNDER,
  faqs: KOREA_FAQS,
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
  secondForm: KOREA_SECOND_FORM,
  aliances: KOREA_ALIANCES,
  footer: KOREA_FOOTER,
};
