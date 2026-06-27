"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import WhatsAppFab from "@/components/ui/whatsapp-fab/WhatsappFab";
import ChatAssistantDock from "@/components/ui/chat-assistant/ChatAssistant";
import { getLandingBySlug } from "@/features/landings/data";
import { getBrandFaviconPath } from "@/lib/brand-favicons";

function getLandingFromPathname(pathname: string | null) {
  const slug = pathname?.split("/").filter(Boolean)[0] ?? "";
  return getLandingBySlug(slug);
}

export default function LandingAssistants() {
  const pathname = usePathname();
  const landing = useMemo(() => getLandingFromPathname(pathname), [pathname]);
  const assistantKey = landing?.slug ?? "home";

  if (!landing) {
    if (pathname !== "/") {
      return <WhatsAppFab />;
    }

    return (
      <>
        <WhatsAppFab />
        <ChatAssistantDock
          key={assistantKey}
          enabled
          botSlug="home"
          brandLabel="Viajes Premium"
          avatarSrc={getBrandFaviconPath("home")}
          accentColor="var(--primary)"
          welcomeMessage="Bienvenido a Viajes Premium. Me encantará ayudarle a diseñar una experiencia cómoda, bien cuidada y memorable. ¿Cómo le puedo ayudar?"
          quickReplies={[
            "Quiero viajar a Japón",
            "Quiero viajar a Europa",
            "Necesito una cotización",
            "Quiero hablar con un asesor",
          ]}
        />
      </>
    );
  }

  const faqQuickReply = landing.faqs.items[0]?.question;
  const itineraryReplies = landing.itineraries.items
    .slice(0, 2)
    .map((item) => item.title);
  const quickReplies = Array.from(
    new Set(
      [
        ...itineraryReplies,
        faqQuickReply,
        "Quiero hablar con un asesor",
      ].filter(Boolean) as string[],
    ),
  ).slice(0, 4);

  return (
    <>
      <WhatsAppFab />
      <ChatAssistantDock
        key={assistantKey}
        enabled
        botSlug={landing.slug}
        brandLabel={landing.label}
        avatarSrc={getBrandFaviconPath(landing.slug)}
        accentColor={landing.palette.primary}
        welcomeMessage={`Bienvenido a ${landing.label}. Me encantará ayudarte a diseñar una experiencia cómoda, bien cuidada y memorable. ¿Cómo te puedo ayudar?`}
        quickReplies={quickReplies}
      />
    </>
  );
}
