"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import WhatsAppFab from "@/components/ui/whatsapp-fab/WhatsappFab";
import ChatAssistantDock from "@/components/ui/chat-assistant/ChatAssistant";
import { getLandingBySlug } from "@/features/landings/data";

const BRAND_FAVICONS: Record<string, string> = {
  home: "/media/shared/favicones/favicon-viajes-premium.svg",
  "japon-premium": "/media/shared/favicones/favicon-japon-premium.svg",
  "corea-premium": "/media/shared/favicones/favicon-corea-premium.svg",
  "europa-premium": "/media/shared/favicones/favicon-europa-premium.svg",
};

function getLandingFromPathname(pathname: string | null) {
  const slug = pathname?.split("/").filter(Boolean)[0] ?? "";
  return getLandingBySlug(slug);
}

export default function LandingAssistants() {
  const pathname = usePathname();
  const landing = useMemo(() => getLandingFromPathname(pathname), [pathname]);

  if (!landing) {
    if (pathname !== "/") {
      return <WhatsAppFab />;
    }

    return (
      <>
        <WhatsAppFab />
        <ChatAssistantDock
          enabled
          botSlug="home"
          brandLabel="Viajes Premium"
          avatarSrc={BRAND_FAVICONS.home}
          accentColor="var(--primary)"
          welcomeMessage="Bienvenido a Viajes Premium. Cuéntame qué destino tienes en mente y te orientaré hacia la mejor experiencia."
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
        enabled
        botSlug={landing.slug}
        brandLabel={landing.label}
        avatarSrc={BRAND_FAVICONS[landing.slug] ?? "/media/shared/favicones/favicon-viajes-premium.svg"}
        accentColor={landing.palette.primary}
        welcomeMessage={`Bienvenido a ${landing.label}. Me encantará ayudarte a diseñar una experiencia cómoda, bien cuidada y memorable. ¿Cómo te puedo ayudar?`}
        quickReplies={quickReplies}
      />
    </>
  );
}
