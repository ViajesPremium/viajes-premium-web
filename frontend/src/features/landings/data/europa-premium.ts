import type { LandingMetadata, LandingTheme } from "./types";
import { EUROPA_PREMIUM_HERO } from "./hero";
import { EUROPA_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { EUROPE_FIRST_FORM, EUROPE_SECOND_FORM } from "./forms";
import { EUROPE_BENEFITS } from "./benefits";
import { EUROPE_ITINERARIES } from "./itineraries";
import { EUROPE_PROMISE } from "./promise";
import { EUROPE_TESTIMONIALS } from "./testimonials";
import { EUROPE_FOUNDER } from "./founder";
import { EUROPE_FAQS } from "./faqs";
import { EUROPE_FOOTER } from "./footer";
import { EUROPE_ALIANCES } from "./aliances";

const EUROPE_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qué Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  { label: "Opiniones", ariaLabel: "Ir a opiniones", link: "#testimonials" },
  { label: "Sobre Europa", ariaLabel: "Ir a sobre Europa", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const EUROPE_PREMIUM_METADATA: LandingMetadata = {
  title: "Viajes a Europa | Clase PREMIUM",
  description:
    "Descubre Europa entre ciudades históricas, cultura, gastronomía y experiencias diseñadas en Clase PREMIUM.",
  keywords: [
    "Viajes a Europa",
    "Tour por Europa",
    "Viaja a Europa desde Mexico",
    "Viajar a Europa",
    "Europa Premium",
  ],
  canonicalPath: "/europa-premium",
  ogImagePath: "/media/landings/europa/hero/diosa.avif",
};

export const europaPremium: LandingTheme = {
  slug: "europa-premium",
  label: "Europa Premium",
  metadata: EUROPE_PREMIUM_METADATA,
  palette: {
    primary: "#511E62",
    secondary: "#882BAC",
    complementary: "#2A1A6E",
  },
  navbar: {
    logoUrl: "/media/shared/logos/europa/logo-europa.svg",
    menuItems: [...EUROPE_MENU_ITEMS],
    colors: ["#511E62", "#882BAC"],
    accentColor: "#511E62",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: EUROPA_PREMIUM_HERO,
  premiumExperiences: EUROPA_PREMIUM_EXPERIENCES,
  firstForm: EUROPE_FIRST_FORM,
  benefits: EUROPE_BENEFITS,
  itineraries: EUROPE_ITINERARIES,
  promise: EUROPE_PROMISE,
  testimonials: EUROPE_TESTIMONIALS,
  founder: EUROPE_FOUNDER,
  faqs: EUROPE_FAQS,
  video: {
    srHeading: "Video Europa Premium",
    desktop: {
      webm: "/media/landings/europa/videos/europa-horizontal.webm",
      mp4: "/media/landings/europa/videos/europa-horizontal.mp4",
    },
    mobile: {
      webm: "/media/landings/europa/videos/europa-vertical.webm",
      mp4: "/media/landings/europa/videos/europa-vertical.mp4",
    },
    alt: "Video de la experiencia Europa Premium",
  },
  secondForm: EUROPE_SECOND_FORM,
  aliances: EUROPE_ALIANCES,
  footer: EUROPE_FOOTER,
};
