import type { LandingFormSection } from "./../types";
import { LANDING_CONTACT } from "./../shared";

const JAPAN_FIRST_FORM_OPTIONS = [
  {
    label: "Alma de Japón — Espiritualidad y tradición | Desde $5,703 USD",
    value: "alma-de-japon",
  },
  {
    label: "Japón Pop — Anime, tecnología y cultura pop | Desde $6,478 USD",
    value: "japon-pop",
  },
  {
    label: "El Camino del Shogun — Samuráis y cultura | Desde $5,938 USD",
    value: "camino-del-shogun",
  },
  { label: "Deseo una experiencia más personalizada", value: "otro" },
] as const;

const JAPAN_SECOND_FORM_OPTIONS = [
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

const formSection = ({
  srHeading,
  title,
  backgroundImage,
  mobileImage,
  contactPhoneDisplay = LANDING_CONTACT.phoneDisplay,
  contactPhoneLink = LANDING_CONTACT.phoneLink,
  submitLabel = "Solicita tu cotización",
  crmTag,
  labels,
  placeholders,
  options,
}: {
  srHeading: string;
  title: string;
  backgroundImage: string;
  mobileImage?: LandingFormSection["mobileImage"];
  contactPhoneDisplay?: string;
  contactPhoneLink?: string;
  submitLabel?: string;
  crmTag?: string;
  labels?: LandingFormSection["labels"];
  placeholders?: LandingFormSection["placeholders"];
  options?: LandingFormSection["experienceOptions"];
}): LandingFormSection => ({
  srHeading,
  eyebrow: "Asesoría Privada",
  title,
  description:
    "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal.",
  backgroundImage,
  mobileImage,
  submitLabel,
  contactEmail: LANDING_CONTACT.email,
  contactPhoneDisplay,
  contactPhoneLink,
  crmTag,
  labels,
  placeholders,
  experienceOptions: options,
});

export const JAPAN_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Japón",
  title: "Diseñemos tu Japón con intención.",
  backgroundImage: "/media/landings/japon/forms/geisha-form-2.webp",
  mobileImage: {
    src: "/media/landings/japon/forms/geisha-form-sola-2.webp",
    alt: "Geisha en Japón",
  },
  submitLabel: "Enviar ahora",
  crmTag: "#tags:Japon Premium",
  labels: {
    travelWishes: "¿Qué te gustaría vivir en Japón?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. Kioto tradicional, ryokan con onsen, gastronomía, templos, anime, naturaleza, tren bala o tiempo libre para explorar.",
    experienceType: "Ej. lujo relajado, aventura curada, cultural profundo...",
  },
  options: JAPAN_FIRST_FORM_OPTIONS,
});

export const JAPAN_SECOND_FORM = {
  ...JAPAN_FIRST_FORM,
  srHeading: "Formulario de contacto Japón Premium",
  title: "Cotiza tu viaje ahora.",
  backgroundImage: "/media/landings/japon/forms/samurai-form.webp",
  mobileImage: {
    src: "/media/landings/japon/forms/samurai-form-sola-2.webp",
    alt: "Samurai en Japón",
  },
  experienceOptions: JAPAN_SECOND_FORM_OPTIONS,
};
