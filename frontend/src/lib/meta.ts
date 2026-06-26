import {
  captureLeadAttributionFromCurrentPage,
  getLeadAttribution,
  type LeadAttribution,
} from "@/lib/lead-attribution";

export type MetaLeadEventParams = {
  pathname: string;
  formId: string;
  method?: "web-form" | "whatsapp";
};

type MetaTrackFn = (
  action: "track",
  eventName: "Lead",
  parameters?: Record<string, unknown>,
) => void;

function getMetaTrackFunction(): MetaTrackFn | null {
  if (typeof window === "undefined") return null;
  return typeof window.fbq === "function" ? (window.fbq as MetaTrackFn) : null;
}

function resolveAttribution(pathname: string): LeadAttribution | null {
  return (
    captureLeadAttributionFromCurrentPage({ pathname }) ??
    getLeadAttribution(pathname)
  );
}

export function trackMetaLeadEvent(params: MetaLeadEventParams) {
  const track = getMetaTrackFunction();
  if (!track) return;

  const attribution = resolveAttribution(params.pathname);
  const landingSlug =
    attribution?.landing_slug ??
    params.pathname.split("/").filter(Boolean)[0] ??
    "home";

  const destination =
    attribution?.destination ?? landingSlug.replace(/-premium$/i, "");

  track("track", "Lead", {
    destination,
    landing_slug: landingSlug,
    page_path: params.pathname,
    form_id: params.formId,
    method: params.method ?? "web-form",
    utm_source: attribution?.utm_source ?? "direct",
    utm_medium: attribution?.utm_medium ?? "none",
    utm_campaign: attribution?.utm_campaign ?? "(not set)",
    utm_content: attribution?.utm_content ?? "(not set)",
    utm_term: attribution?.utm_term ?? "(not set)",
    fbclid: attribution?.fbclid ?? "",
    referrer: attribution?.referrer ?? "",
  });
}
