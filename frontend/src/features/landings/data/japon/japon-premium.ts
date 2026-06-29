import type { LandingMetadata, LandingTheme } from "../types";
import { JAPAN_PREMIUM_HERO } from "./hero";
import { JAPAN_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { JAPAN_FIRST_FORM, JAPAN_SECOND_FORM } from "./forms";
import { JAPAN_BENEFITS } from "./benefits";
import { JAPAN_ITINERARIES } from "./itineraries";
import { JAPAN_PROMISE } from "./promise";
import { JAPAN_TESTIMONIALS } from "./testimonials";
import { JAPAN_FOUNDER } from "./founder";
import { JAPAN_FAQS } from "./faqs";
import { JAPAN_FOOTER } from "./footer";
import { JAPAN_ALIANCES } from "./aliances";

const JAPAN_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qué Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  { label: "Opiniones", ariaLabel: "Ir a opiniones", link: "#testimonials" },
  { label: "Sobre Japón", ariaLabel: "Ir a sobre Japón", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const JAPAN_PREMIUM_METADATA: LandingMetadata = {
  title: "Viajes a Japón desde México | Clase PREMIUM",
  description:
    "Descubre Japón con experiencias diseñadas en Clase PREMIUM, acompañamiento en español y recorridos cuidadosamente planeados desde México.",
  keywords: [
    "Viajes a Japón",
    "Viajes a Japón desde México",
    "Tour en Japón desde México",
    "Japón Premium",
    "Viajar a Japón",
    "Japón desde México",
  ],
  canonicalPath: "/japon-premium",
  ogImagePath: "/media/landings/japon/hero/geisha.avif",
};

export const japonPremium: LandingTheme = {
  slug: "japon-premium",
  label: "Japon Premium",
  metadata: JAPAN_PREMIUM_METADATA,
  palette: {
    primary: "#db2f21",
    secondary: "#95231c",
    complementary: "#8c8380",
  },
  navbar: {
    logoUrl: "/media/shared/logos/jp-negro.svg",
    menuItems: [...JAPAN_MENU_ITEMS],
    colors: ["#db2f21", "#95231c"],
    accentColor: "#db2f21",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: JAPAN_PREMIUM_HERO,
  premiumExperiences: JAPAN_PREMIUM_EXPERIENCES,
  firstForm: JAPAN_FIRST_FORM,
  benefits: JAPAN_BENEFITS,
  itineraries: JAPAN_ITINERARIES,
  promise: JAPAN_PROMISE,
  testimonials: JAPAN_TESTIMONIALS,
  founder: JAPAN_FOUNDER,
  faqs: JAPAN_FAQS,
  video: {
    srHeading: "Video Japón Premium",
    desktop: {
      webm: "/media/landings/japon/videos/japon-premium-desktop.webm",
      mp4: "/media/landings/japon/videos/japon-premium-desktop.mp4",
    },
    mobile: {
      webm: "/media/landings/japon/videos/japon-premium-mobile.webm",
      mp4: "/media/landings/japon/videos/japon-premium-mobile.mp4",
    },
    alt: "Video de la experiencia Japón Premium",
  },
  secondForm: JAPAN_SECOND_FORM,
  aliances: JAPAN_ALIANCES,
  footer: JAPAN_FOOTER,
};
