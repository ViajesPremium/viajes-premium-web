import type { LandingAliances } from "./../types";

const coreaAllianceSrc = (fileName: string) =>
  encodeURI(`/media/landings/corea/aliances/${fileName}`);

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

export const KOREA_ALIANCES = aliances(
  "Alianzas de Corea Premium",
  "Nuestras alianzas",
  {
    src: coreaAllianceSrc("corea-premium-blanco.svg"),
    alt: "Corea Premium",
    width: 460,
    height: 96,
  },
  {
    src: coreaAllianceSrc("korea-tourism-organization-logo-exacto.svg"),
    alt: "Korea Tourism Organization",
    width: 460,
    height: 96,
  },
  [
    {
      src: coreaAllianceSrc("air_busan.png"),
      alt: "Air Busan",
      width: 420,
      height: 90,
    },
    {
      src: coreaAllianceSrc("air_seoul.png"),
      alt: "Air Seoul",
      width: 280,
      height: 90,
    },
    {
      src: coreaAllianceSrc("asiana.png"),
      alt: "Asiana",
      width: 360,
      height: 110,
    },
    {
      src: coreaAllianceSrc("asti.png"),
      alt: "Asti",
      width: 540,
      height: 120,
    },
    {
      src: coreaAllianceSrc("bw.png"),
      alt: "BW",
      width: 420,
      height: 90,
    },
    {
      src: coreaAllianceSrc("bw_plus.png"),
      alt: "BW Plus",
      width: 280,
      height: 90,
    },
    {
      src: coreaAllianceSrc("commodore.png"),
      alt: "Commodore",
      width: 360,
      height: 110,
    },
    {
      src: coreaAllianceSrc("eastar.png"),
      alt: "Eastar",
      width: 540,
      height: 120,
    },
    {
      src: coreaAllianceSrc("jejuair.png"),
      alt: "Jeju Air",
      width: 420,
      height: 90,
    },
    {
      src: coreaAllianceSrc("jinair.png"),
      alt: "Jin Air",
      width: 280,
      height: 90,
    },
    {
      src: coreaAllianceSrc("ktx.png"),
      alt: "KTX",
      width: 360,
      height: 110,
    },
    {
      src: coreaAllianceSrc("memorial_corea.png"),
      alt: "Memorial Corea",
      width: 540,
      height: 120,
    },
    {
      src: coreaAllianceSrc("museum_korea.png"),
      alt: "Museum Korea",
      width: 420,
      height: 90,
    },
    {
      src: coreaAllianceSrc("novotel.png"),
      alt: "Novotel",
      width: 280,
      height: 90,
    },
    {
      src: coreaAllianceSrc("ramada.png"),
      alt: "Ramada",
      width: 360,
      height: 110,
    },
    {
      src: coreaAllianceSrc("tway.png"),
      alt: "Tway",
      width: 540,
      height: 120,
    },
    {
      src: coreaAllianceSrc("venezia.png"),
      alt: "Venezia",
      width: 420,
      height: 90,
    },
  ],
);
