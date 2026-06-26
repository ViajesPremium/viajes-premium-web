import type { LandingTheme } from "./types";
import { BARRANCAS_PREMIUM_HERO } from "./hero";
import { BARRANCAS_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { BARRANCAS_FIRST_FORM, EUROPE_SECOND_FORM } from "./forms";
import { BARRANCAS_BENEFITS } from "./benefits";
import { BARRANCAS_ITINERARIES } from "./itineraries";
import { BARRANCAS_PROMISE } from "./promise";
import { BARRANCAS_TESTIMONIALS } from "./testimonials";
import { BARRANCAS_FOUNDER } from "./founder";
import { BARRANCAS_FAQS } from "./faqs";
import { BARRANCAS_FOOTER } from "./footer";
import { BARRANCAS_ALIANCES } from "./aliances";

const BARRANCAS_MENU_ITEMS = [
    { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
    { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
    { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
    { label: "Qué Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
    { label: "Opiniones", ariaLabel: "Ir a opiniones", link: "#testimonials" },
    { label: "Sobre Europa", ariaLabel: "Ir a sobre Europa", link: "#faqs" },
    { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const barrancasPremium: LandingTheme = {
    slug: "barrancas-premium",
    label: "Barrancas Premium",
    palette: {
        primary: "#963825",
        secondary: "#D55C26",
        complementary: "#45736B",
    },
    navbar: {
        logoUrl: "/media/shared/logos/europa/logo-europa.svg",
        menuItems: [...BARRANCAS_MENU_ITEMS],
        colors: ["#963825", "#D55C26"],
        accentColor: "#45736B",
        menuButtonColor: "#ffffff",
        openMenuButtonColor: "#000000",
    },
    hero: BARRANCAS_PREMIUM_HERO,
    premiumExperiences: BARRANCAS_PREMIUM_EXPERIENCES,
    firstForm: BARRANCAS_FIRST_FORM,
    benefits: BARRANCAS_BENEFITS,
    itineraries: BARRANCAS_ITINERARIES,
    promise: BARRANCAS_PROMISE,
    testimonials: BARRANCAS_TESTIMONIALS,
  founder: BARRANCAS_FOUNDER,
  faqs: BARRANCAS_FAQS,
  video: {
    srHeading: "Video Barrancas Premium",
    desktop: {
      webm: "/media/landings/barrancas/videos/barrancas-web.webm",
      mp4: "/media/landings/barrancas/videos/barrancas-web.mp4",
    },
    mobile: {
      webm: "/media/landings/barrancas/videos/barrancas-web-vertical.webm",
      mp4: "/media/landings/barrancas/videos/barrancas-web-vertical.mp4",
    },
    alt: "Video de la experiencia Barrancas Premium",
  },
  secondForm: EUROPE_SECOND_FORM,
  aliances: BARRANCAS_ALIANCES,
  footer: BARRANCAS_FOOTER,
};
