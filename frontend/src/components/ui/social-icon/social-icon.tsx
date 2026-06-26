"use client";

import type { ReactNode } from "react";

type SocialIconProps = {
  platform: string;
  size?: number;
};

function IconShell({
  size = 30,
  children,
}: {
  size?: number;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
      {children}
    </svg>
  );
}

export function SocialIcon({ platform, size = 30 }: SocialIconProps) {
  const normalized = platform.trim().toLowerCase();

  if (normalized.includes("instagram")) {
    return (
      <IconShell size={size}>
        <rect x="5" y="5" width="20" height="20" rx="6" fill="currentColor" />
        <circle cx="15" cy="15" r="5.5" fill="var(--white)" />
        <circle cx="20.25" cy="9.75" r="1.4" fill="var(--white)" />
      </IconShell>
    );
  }

  if (normalized.includes("facebook")) {
    return (
      <IconShell size={size}>
        <path
          fill="currentColor"
          d="M18.5 5h-3.2c-2.5 0-4.3 1.8-4.3 4.6V12H8v4h3v9h4.1v-9h3.2l.6-4h-3.8v-2c0-1 .5-1.5 1.5-1.5h2V5Z"
        />
      </IconShell>
    );
  }

  if (normalized.includes("whatsapp")) {
    return (
      <IconShell size={size}>
        <path
          fill="currentColor"
          d="M24 14.6a9.9 9.9 0 0 1-14.8 8.6L5 24l.9-4.1A9.9 9.9 0 1 1 24 14.6Zm-9.9-8a8 8 0 0 0-6.8 12.1l-.6 2.2 2.3-.6a8 8 0 1 0 5.1-13.7Zm4.6 10.9c-.2.6-1.2 1-1.7 1-1.2 0-3.4-1-4.9-2.8-1.6-1.8-2-4-2-4.8 0-.5.3-1.5.9-1.7.3-.1.7-.2 1 0l.8 1.9c.1.4 0 .7-.2 1l-.4.5c.3.7.9 1.7 1.8 2.4.8.7 1.8 1.1 2.4 1.3l.5-.4c.3-.2.6-.3 1-.2l1.9.8c.2.1.1.7 0 1Z"
        />
      </IconShell>
    );
  }

  return (
    <IconShell size={size}>
      <circle cx="15" cy="15" r="10.5" fill="currentColor" />
      <path
        d="M10 15h10M15 10l5 5-5 5"
        stroke="var(--white)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}
