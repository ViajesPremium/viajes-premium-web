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
  "Alianzas de Per? Premium",
  "Nuestras alianzas",
  {
    src: "/media/landings/peru/aliances/logo-peru.svg",
    alt: "Per? Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/landings/peru/aliances/peru-grande-logo.png",
    alt: "Per? Premium",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/landings/peru/aliances/peru-grande-logo.png",
      alt: "Per? Premium",
      width: 420,
      height: 90,
    },
    {
      src: "/media/landings/peru/aliances/peru-grande-logo.avif",
      alt: "Per? Premium",
      width: 280,
      height: 90,
    },
    {
      src: "/media/landings/peru/aliances/logo-peru.svg",
      alt: "Per? Premium",
      width: 360,
      height: 110,
    },
    {
      src: "/media/landings/peru/aliances/peru-grande-logo.png",
      alt: "Per? Premium",
      width: 540,
      height: 120,
    },
  ],
);
