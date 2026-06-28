import type { LandingAliances } from "../types";

const aliances = (
  srHeading: string,
  badgeText: string,
  left: LandingAliances["introLeftLogo"],
  right: LandingAliances["introRightLogo"],
  logos: LandingAliances["logos"],
): LandingAliances => ({
  srHeading,
  badgeText,
  title: "",
  introLeftLogo: left,
  introRightLogo: right,
  logos,
});

export const PERU_ALIANCES = aliances(
  "Alianzas de Corea Premium",
  "Nuestras alianzas",
  {
    src: "/media/shared/logos/corea/logo-corea.svg",
    alt: "Corea Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/shared/logos/corea/corea-grande-logo.png",
    alt: "Corea Premium",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/shared/logos/corea/corea-grande-logo.png",
      alt: "Corea Premium",
      width: 420,
      height: 90,
    },
    {
      src: "/media/shared/logos/corea/corea-grande-logo.avif",
      alt: "Corea Premium",
      width: 280,
      height: 90,
    },
    {
      src: "/media/shared/logos/corea/logo-corea.svg",
      alt: "Corea Premium",
      width: 360,
      height: 110,
    },
    {
      src: "/media/shared/logos/corea/corea-grande-logo.png",
      alt: "Corea Premium",
      width: 540,
      height: 120,
    },
  ],
);
