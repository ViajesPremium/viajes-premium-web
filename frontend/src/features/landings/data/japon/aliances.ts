import type { LandingAliances } from "./../types";

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

export const JAPAN_ALIANCES = aliances(
  "Alianzas de Japón Premium",
  "Nuestras alianzas premium",
  {
    src: "/media/landings/japon/aliances/japon-premium-blanco.svg",
    alt: "Japón Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/landings/japon/aliances/japan-endless-discovery.svg",
    alt: "Japan Endless Discovery",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/landings/japon/aliances/aero-mexico.avif",
      alt: "Aero México",
      width: 420,
      height: 90,
    },
    {
      src: "/media/landings/japon/aliances/ana.png",
      alt: "Ana",
      width: 280,
      height: 90,
    },
    {
      src: "/media/landings/japon/aliances/disney-sea.png",
      alt: "Disney Sea",
      width: 540,
      height: 120,
    },
    {
      src: "/media/landings/japon/aliances/fujiya-1935.png",
      alt: "Fujiya 1935",
      width: 380,
      height: 110,
    },
    {
      src: "/media/landings/japon/aliances/japan-airlines.avif",
      alt: "Japan Airlines",
      width: 480,
      height: 210,
    },
    {
      src: "/media/landings/japon/aliances/japan-rail.png",
      alt: "Japan Rail",
      width: 480,
      height: 160,
    },
    {
      src: "/media/landings/japon/aliances/japan-universal-studios.png",
      alt: "Japan Universal Studios",
      width: 520,
      height: 160,
    },
    {
      src: "/media/landings/japon/aliances/jnto.avif",
      alt: "JNTO",
      width: 300,
      height: 140,
    },
    {
      src: "/media/landings/japon/aliances/kikunoi-honten.png",
      alt: "Kikunoi Honten",
      width: 260,
      height: 100,
    },
    {
      src: "/media/landings/japon/aliances/kobe-beef-wanomeya.png",
      alt: "Kobe Beef Wanomeya",
      width: 520,
      height: 150,
    },
    {
      src: "/media/landings/japon/aliances/miyajima-ferri.png",
      alt: "Miyajima Ferri",
      width: 320,
      height: 130,
    },
    {
      src: "/media/landings/japon/aliances/narisawa.png",
      alt: "Narisawa",
      width: 360,
      height: 120,
    },
    {
      src: "/media/landings/japon/aliances/osaka-castle.png",
      alt: "Osaka Castle",
      width: 340,
      height: 140,
    },
    {
      src: "/media/landings/japon/aliances/profeco.avif",
      alt: "Profeco",
      width: 290,
      height: 120,
    },
    {
      src: "/media/landings/japon/aliances/secretaria-de-turismo.avif",
      alt: "Secretaria de Turismo",
      width: 340,
      height: 140,
    },
    {
      src: "/media/landings/japon/aliances/teamlab.png",
      alt: "TeamLab",
      width: 320,
      height: 120,
    },
    {
      src: "/media/landings/japon/aliances/tokio-disneyland.png",
      alt: "Tokio DisneyLand",
      width: 280,
      height: 110,
    },
    {
      src: "/media/landings/japon/aliances/shinkansen.png",
      alt: "Shinkansen",
      width: 520,
      height: 160,
    },
  ],
);
