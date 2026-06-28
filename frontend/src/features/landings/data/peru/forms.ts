import type { LandingFormSection } from "../types";
import { LANDING_CONTACT } from "../shared";

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

export const PERU_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Corea",
  title: "Corea, planeada con claridad desde el primer contacto.",
  backgroundImage: "/media/landings/corea/forms/corea-form.avif",
  mobileImage: {
    src: "/media/landings/corea/forms/first-form-corea-sola.webp",
    alt: "Corea Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
});

export const PERU_SECOND_FORM = {
  ...PERU_FIRST_FORM,
  srHeading: "Formulario de contacto Corea Premium",
  title: "Hablemos de la Corea que quieres vivir.",
  backgroundImage: "/media/landings/corea/forms/corea-form-2.avif",
  mobileImage: {
    src: "/media/landings/corea/forms/form-corea-sola.webp",
    alt: "Corea Premium",
  },
};
