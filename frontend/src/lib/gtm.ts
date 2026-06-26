export type GTMGenerateLeadEvent = {
  event: "generate_lead";
  destination: string;
  landing_slug: string;
  page_path: string;
  form_id: string;
  method: "web-form";
};

export type GTMLeadStartedEvent = {
  event: "lead_started";
  destination: string;
  landing_slug: string;
  page_path: string;
  bot_slug: string;
  session_id: string;
  conversation_id?: string;
  stage?: string;
  score?: number;
  method: "chatbot";
};

function resolveLandingSlugFromPath(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "home";
}

function resolveDestinationFromPath(pathname: string): string {
  return resolveLandingSlugFromPath(pathname).replace(/-premium$/i, "");
}

export function pushGenerateLeadEvent(params: {
  pathname: string;
  formId: string;
}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  const payload: GTMGenerateLeadEvent = {
    event: "generate_lead",
    destination: resolveDestinationFromPath(params.pathname),
    landing_slug: resolveLandingSlugFromPath(params.pathname),
    page_path: params.pathname,
    form_id: params.formId,
    method: "web-form",
  };

  window.dataLayer.push(payload);
}

export function pushLeadStartedEvent(params: {
  pathname: string;
  botSlug: string;
  sessionId: string;
  conversationId?: string;
  stage?: string;
  score?: number;
}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  const payload: GTMLeadStartedEvent = {
    event: "lead_started",
    destination: resolveDestinationFromPath(params.pathname),
    landing_slug: resolveLandingSlugFromPath(params.pathname),
    page_path: params.pathname,
    bot_slug: params.botSlug,
    session_id: params.sessionId,
    conversation_id: params.conversationId,
    stage: params.stage,
    score: params.score,
    method: "chatbot",
  };

  window.dataLayer.push(payload);
}
