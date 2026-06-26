"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { captureLeadAttributionFromCurrentPage } from "@/lib/lead-attribution";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TDRG9V5W";
const metaPixelId =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "906863172409309";
const TRACKING_FALLBACK_DELAY_MS = 4000;

export default function GTMTracking() {
  const pathname = usePathname();
  const [shouldLoadGtm, setShouldLoadGtm] = useState(false);
  const [shouldLoadPixel, setShouldLoadPixel] = useState(false);

  useEffect(() => {
    captureLeadAttributionFromCurrentPage({
      pathname: pathname ?? "/",
    });
  }, [pathname]);

  useEffect(() => {
    if (shouldLoadGtm && shouldLoadPixel) return;

    const triggerLoad = () => {
      setShouldLoadGtm(true);
      setShouldLoadPixel(true);
    };

    const interactionEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "touchstart",
      "scroll",
      "keydown",
    ];

    for (const eventName of interactionEvents) {
      window.addEventListener(eventName, triggerLoad, {
        once: true,
        passive: true,
      });
    }

    const fallbackTimer = window.setTimeout(
      triggerLoad,
      TRACKING_FALLBACK_DELAY_MS,
    );

    return () => {
      for (const eventName of interactionEvents) {
        window.removeEventListener(eventName, triggerLoad);
      }

      window.clearTimeout(fallbackTimer);
    };
  }, [shouldLoadGtm, shouldLoadPixel]);

  if (!gtmId && !metaPixelId) return null;

  return (
    <>
      {gtmId && shouldLoadGtm ? (
        <>
          <Script id="gtm-datalayer-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
              });
            `}
          </Script>
          <Script
            id="gtm-loader"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
            strategy="afterInteractive"
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {metaPixelId && shouldLoadPixel ? (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt="Facebook Pixel"
              title="Facebook Pixel"
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
