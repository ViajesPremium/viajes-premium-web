const LEAD_ATTRIBUTION_STORAGE_KEY = "vp_lead_attribution_v1";

type LeadAttributionRaw = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  referrer?: string;
  landing_slug?: string;
  destination?: string;
  page_path?: string;
};

export type LeadAttribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  referrer: string;
  landing_slug: string;
  destination: string;
  page_path: string;
};

function normalizeValue(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function resolveLandingSlugFromPath(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "home";
}

function resolveDestinationFromPath(pathname: string): string {
  return resolveLandingSlugFromPath(pathname).replace(/-premium$/i, "");
}

function readStoredAttribution(): LeadAttributionRaw {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as LeadAttributionRaw;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredAttribution(value: LeadAttributionRaw) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LEAD_ATTRIBUTION_STORAGE_KEY,
    JSON.stringify(value),
  );
}

function parseAttributionFromSearch(
  searchLike: string | URLSearchParams | null | undefined,
): LeadAttributionRaw {
  const params =
    typeof searchLike === "string"
      ? new URLSearchParams(searchLike)
      : (searchLike ?? new URLSearchParams());

  return {
    utm_source: normalizeValue(params.get("utm_source")),
    utm_medium: normalizeValue(params.get("utm_medium")),
    utm_campaign: normalizeValue(params.get("utm_campaign")),
    utm_content: normalizeValue(params.get("utm_content")),
    utm_term: normalizeValue(params.get("utm_term")),
    fbclid: normalizeValue(params.get("fbclid")),
  };
}

function hasCampaignSignal(value: LeadAttributionRaw): boolean {
  return Boolean(
    value.utm_source ||
      value.utm_medium ||
      value.utm_campaign ||
      value.utm_content ||
      value.utm_term ||
      value.fbclid,
  );
}

function withDefaults(
  raw: LeadAttributionRaw,
  pathname: string,
): LeadAttribution {
  const finalPathname = normalizePathname(pathname);
  const landingSlug = raw.landing_slug || resolveLandingSlugFromPath(finalPathname);
  const destination =
    raw.destination || resolveDestinationFromPath(finalPathname);

  return {
    utm_source: raw.utm_source || (raw.fbclid ? "facebook" : "direct"),
    utm_medium: raw.utm_medium || (raw.fbclid ? "paid_social" : "none"),
    utm_campaign: raw.utm_campaign || "(not set)",
    utm_content: raw.utm_content || "(not set)",
    utm_term: raw.utm_term || "(not set)",
    fbclid: raw.fbclid || "",
    referrer: raw.referrer || "",
    landing_slug: landingSlug,
    destination: destination || "home",
    page_path: raw.page_path || finalPathname,
  };
}

export function captureLeadAttributionFromCurrentPage(params?: {
  pathname?: string;
  search?: string | URLSearchParams | null;
}): LeadAttribution | null {
  if (typeof window === "undefined") return null;

  const pathname = normalizePathname(
    params?.pathname ?? window.location.pathname ?? "/",
  );
  const stored = readStoredAttribution();
  const fromSearch = parseAttributionFromSearch(
    params?.search ?? window.location.search,
  );

  const shouldUpdateFromSearch =
    hasCampaignSignal(fromSearch) || !normalizeValue(stored.page_path);

  const merged: LeadAttributionRaw = shouldUpdateFromSearch
    ? { ...stored, ...fromSearch }
    : { ...stored };

  merged.page_path = pathname;
  merged.landing_slug = resolveLandingSlugFromPath(pathname);
  merged.destination = resolveDestinationFromPath(pathname);
  if (!normalizeValue(merged.referrer) && normalizeValue(document.referrer)) {
    merged.referrer = document.referrer;
  }

  writeStoredAttribution(merged);
  return withDefaults(merged, pathname);
}

export function getLeadAttribution(pathname?: string): LeadAttribution | null {
  if (typeof window === "undefined") return null;
  const currentPath = normalizePathname(pathname ?? window.location.pathname ?? "/");
  const stored = readStoredAttribution();
  return withDefaults(stored, currentPath);
}
