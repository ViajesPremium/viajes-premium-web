import type { LandingFormSection } from "./types";
import { LANDING_CONTACT } from "./shared";

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

const EUROPE_FORM_OPTIONS = [
  {
    label:
      "De París a Roma — Ciudades icónicas y encanto clásico | Desde $5,286 USD base doble",
    value: "de-paris-a-roma",
  },
  {
    label:
      "Europa Cosmopolita — España, Francia, Bélgica y Países Bajos | Desde $5,094 USD base doble",
    value: "europa-cosmopolita",
  },
  {
    label:
      "Íconos de Europa — Francia, Inglaterra, Países Bajos e Italia | Desde $6,319 USD base doble",
    value: "iconos-de-europa",
  },
  { label: "Deseo una experiencia más personalizada", value: "otro" },
] as const;

const formSection = ({
  srHeading,
  title,
  destination,
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
  destination: string;
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
  destination: "Japón",
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

export const KOREA_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Corea",
  title: "Corea, planeada con claridad desde el primer contacto.",
  destination: "Corea",
  backgroundImage: "/media/landings/corea/forms/corea-form.avif",
  mobileImage: {
    src: "/media/landings/corea/forms/first-form-corea-sola.webp",
    alt: "Corea Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
});

export const EUROPE_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Europa",
  title: "Europa a tu ritmo, sin perder profundidad.",
  destination: "Europa",
  backgroundImage: "/media/landings/europa/forms/europa-form.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/first-form-europa-sola.webp",
    alt: "Figura Europa Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
  crmTag: "#tags:Europa Premium",
  labels: {
    travelWishes: "¿Qué te gustaría vivir en Europa?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. París, Roma, Londres, Ámsterdam, trenes, gastronomía, museos, paisajes y tiempo libre para explorar.",
    experienceType: "Ej. clásico, cosmopolita, cultural profundo...",
  },
  options: EUROPE_FORM_OPTIONS,
});

export const BARRANCAS_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Europa",
  title: "Europa a tu ritmo, sin perder profundidad.",
  destination: "Europa",
  backgroundImage: "/media/landings/europa/forms/europa-form.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/first-form-europa-sola.webp",
    alt: "Figura Europa Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
  crmTag: "#tags:Europa Premium",
  labels: {
    travelWishes: "¿Qué te gustaría vivir en Europa?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. París, Roma, Londres, Ámsterdam, trenes, gastronomía, museos, paisajes y tiempo libre para explorar.",
    experienceType: "Ej. clásico, cosmopolita, cultural profundo...",
  },
  options: EUROPE_FORM_OPTIONS,
});

export const JAPAN_SECOND_FORM = {
  ...JAPAN_FIRST_FORM,
  srHeading: "Formulario de contacto Japón Premium",
  title: "Cotiza tu viaje ahora.",
  backgroundImage: "/media/landings/japon/forms/samurai-form.webp",
  mobileImage: {
    src: "/media/landings/japon/forms/samurai-form-sola-2.webp",
    alt: "Samurai en JapÃ³n",
  },
  experienceOptions: JAPAN_SECOND_FORM_OPTIONS,
};

export const KOREA_SECOND_FORM = {
  ...KOREA_FIRST_FORM,
  srHeading: "Formulario de contacto Corea Premium",
  title: "Hablemos de la Corea que quieres vivir.",
  backgroundImage: "/media/landings/corea/forms/corea-form-2.avif",
  mobileImage: {
    src: "/media/landings/corea/forms/form-corea-sola.webp",
    alt: "Corea Premium",
  },
};

export const EUROPE_SECOND_FORM = {
  ...EUROPE_FIRST_FORM,
  srHeading: "Formulario de contacto Europa Premium",
  title: "Hablemos de tu ruta por Europa.",
  backgroundImage: "/media/landings/europa/forms/cta-form-europa.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/form-europa-sola.webp",
    alt: "Europa Premium",
  },
};

export const BARRANCAS_SECOND_FORM = {
  ...EUROPE_FIRST_FORM,
  srHeading: "Formulario de contacto Europa Premium",
  title: "Hablemos de tu ruta por Europa.",
  backgroundImage: "/media/landings/europa/forms/cta-form-europa.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/form-europa-sola.webp",
    alt: "Europa Premium",
  },
};
