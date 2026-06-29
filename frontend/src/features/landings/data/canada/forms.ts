import type { LandingFormSection } from "./../types";
import { LANDING_CONTACT } from "./../shared";

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

export const CANADA_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Canad?",
  title: "Canad?, planeada con claridad desde el primer contacto.",
  backgroundImage: "/media/landings/canada/forms/canada-premium-3.webp",
  mobileImage: {
    src: "/media/landings/canada/forms/canada-premium-4.webp",
    alt: "Canad? Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
});

export const CANADA_SECOND_FORM = {
  ...CANADA_FIRST_FORM,
  srHeading: "Formulario de contacto Canad? Premium",
  title: "Hablemos de la Canad? que quieres vivir.",
  backgroundImage: "/media/landings/canada/forms/canada-premium-1.webp",
  mobileImage: {
    src: "/media/landings/canada/forms/canada-premium-2.webp",
    alt: "Canad? Premium",
  },
};
