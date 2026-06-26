"use client";

import { usePathname } from "next/navigation";
import StaggeredMenu from "@/features/shared/components/navigation/staggered-menu/StaggeredMenu";
import { getLandingBySlug } from "@/features/landings/data";

export default function LandingNavigation() {
  const pathname = usePathname();

  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  const landing = getLandingBySlug(slug);

  if (!landing) {
    return null;
  }

  const { navbar } = landing;

  return (
    <StaggeredMenu
      isFixed
      items={navbar.menuItems}
      logoUrl={navbar.logoUrl}
      accentColor={navbar.accentColor}
      colors={navbar.colors}
      menuButtonColor={navbar.menuButtonColor}
      openMenuButtonColor={navbar.openMenuButtonColor}
    />
  );
}
