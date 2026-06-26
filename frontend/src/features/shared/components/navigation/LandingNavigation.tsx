"use client";

import { usePathname } from "next/navigation";
import StaggeredMenu from "@/features/shared/components/navigation/staggered-menu/StaggeredMenu";
import { getLandingBySlug } from "@/features/landings/data";
import {
  HOME_NAVBAR_ITEMS,
  SITE_NAVBAR,
} from "@/features/shared/data/site-navbar";

export default function LandingNavigation() {
  const pathname = usePathname();

  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  const landing = getLandingBySlug(slug);

  if (!landing) {
    const isHome = pathname === "/";
    const items = isHome ? HOME_NAVBAR_ITEMS : SITE_NAVBAR.menuItems;

    return (
      <StaggeredMenu
        items={items}
        socialItems={SITE_NAVBAR.socialItems}
        logoUrl={SITE_NAVBAR.logoUrl}
        accentColor={SITE_NAVBAR.accentColor}
        colors={SITE_NAVBAR.colors}
        menuButtonColor={SITE_NAVBAR.menuButtonColor}
        openMenuButtonColor={SITE_NAVBAR.openMenuButtonColor}
      />
    );
  }

  return (
    <StaggeredMenu
      items={landing.navbar.menuItems}
      socialItems={landing.footer.socialLinks.map((item) => ({
        label: item.label,
        link: item.href,
      }))}
      logoUrl={landing.navbar.logoUrl}
      accentColor={landing.palette.primary}
      colors={landing.navbar.colors}
      menuButtonColor={landing.navbar.menuButtonColor}
      openMenuButtonColor={landing.navbar.openMenuButtonColor}
      homeCta={{
        label: "Ver más viajes premium",
        href: "/",
        ariaLabel: "Ver más viajes premium en la página de inicio",
      }}
    />
  );
}
