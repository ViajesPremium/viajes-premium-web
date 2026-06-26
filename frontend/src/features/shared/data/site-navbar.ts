import type {
  StaggeredMenuItem,
  StaggeredMenuSocialItem,
} from "@/features/shared/components/navigation/staggered-menu/StaggeredMenu";
import { destinationCardsData } from "@/features/home/data/destinations.data";

type SiteNavbar = {
  logoUrl: string;
  menuItems: StaggeredMenuItem[];
  colors: string[];
  accentColor: string;
  menuButtonColor: string;
  openMenuButtonColor: string;
  socialItems: StaggeredMenuSocialItem[];
};

const DESTINATION_MENU_ITEMS: StaggeredMenuItem[] = destinationCardsData.map(
  (destination) => ({
    label: destination.label,
    ariaLabel: `Ir a ${destination.label} Premium`,
    link: destination.route,
    destinationRoute: destination.route,
  }),
);

export const HOME_NAVBAR_ITEMS: StaggeredMenuItem[] = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "#inicio" },
  {
    label: "Destinos",
    ariaLabel: "Abrir destinos",
    link: "#destinations",
    children: DESTINATION_MENU_ITEMS,
  },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "/nosotros" },
  { label: "Blog", ariaLabel: "Ir a blog", link: "/blog" },
];

export const SITE_NAVBAR: SiteNavbar = {
  logoUrl: "/media/shared/logos/principal-logo.svg",
  menuItems: [
    { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
    {
      label: "Destinos",
      ariaLabel: "Abrir destinos",
      link: "/#destinations",
      children: DESTINATION_MENU_ITEMS,
    },
    { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "/nosotros" },
    { label: "Blog", ariaLabel: "Ir a blog", link: "/blog" },
  ],
  colors: ["var(--primary)", "var(--secondary)"],
  accentColor: "var(--secondary)",
  menuButtonColor: "#ffffff",
  openMenuButtonColor: "#000000",
  socialItems: [
    { label: "TikTok", link: "https://www.tiktok.com/@viajespremium" },
    {
      label: "Instagram",
      link: "https://www.instagram.com/viajespremium.oficial",
    },
    {
      label: "Youtube",
      link: "https://www.youtube.com/@viajespremiumelevatuvida",
    },
    {
      label: "Facebook",
      link: "https://www.facebook.com/turismosantafeoficial",
    },
  ],
};
