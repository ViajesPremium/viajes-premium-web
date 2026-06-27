const BRAND_FAVICONS: Record<string, string> = {
  home: "/media/shared/favicones/favicon-viajes-premium.svg",
  "japon-premium": "/media/shared/favicones/favicon-japon-premium.svg",
  "corea-premium": "/media/shared/favicones/favicon-corea-premium.svg",
  "europa-premium": "/media/shared/favicones/favicon-europa-premium.svg",
  "barrancas-premium": "/media/shared/favicones/favicon-barrancas-premium.svg",
  "canada-premium": "/media/shared/favicones/favicon-canada-premium.svg",
  "peru-premium": "/media/shared/favicones/favicon-peru-premium.svg",
  "chiapas-premium": "/media/shared/favicones/favicon-chiapas-premium.svg",
  "yucatan-premium": "/media/shared/favicones/favicon-yucatan-premium.svg",
};

export function getBrandFaviconPath(slug?: string | null) {
  const normalizedSlug = slug?.trim() || "home";
  return BRAND_FAVICONS[normalizedSlug] ?? BRAND_FAVICONS.home;
}

export function getBrandFaviconMeta(slug?: string | null) {
  const icon = getBrandFaviconPath(slug);
  return {
    icon,
    shortcut: icon,
    apple: icon,
  };
}
