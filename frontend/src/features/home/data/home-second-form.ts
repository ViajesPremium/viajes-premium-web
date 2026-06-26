import type { SecondFormContent } from "@/features/shared/sections/second-form/SecondForm";
import { LANDING_CONTACT } from "@/features/landings/data/shared";

const HOME_SECOND_FORM_EXPERIENCES = [
  {
    label: "Alma de Japón — Espiritual y de bienestar",
    value: "alma-de-japon",
  },
  {
    label: "Japón Pop — Anime, tecnología y cultura pop",
    value: "japon-pop",
  },
  {
    label: "El Camino del Shogun — Auténtico y cultural",
    value: "camino-del-shogun",
  },
  { label: "Otro", value: "otro" },
] as const;

export const HOME_SECOND_FORM: SecondFormContent = {
  srHeading: "Formulario de contacto Japón Premium",
  eyebrow: "",
  title: "Cotiza tu viaje ahora",
  titleHighlightWord: "ahora",
  description:
    "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal",
  backgroundImage: "/media/shared/home/form/formulario.avif",
  mobileImage: {
    src: "/media/shared/home/form/form-sola.webp",
    alt: "Imagen decorativa del formulario de Viajes PREMIUM",
  },
  submitLabel: "Solicita tu cotización",
  contactEmail: LANDING_CONTACT.email,
  contactPhoneDisplay: "+52 55 9763 3210",
  contactPhoneLink: LANDING_CONTACT.phoneLink,
  crmTag: "#tags:Japon Premium",
  theme: "terra",
  experienceOptions: HOME_SECOND_FORM_EXPERIENCES,
};
