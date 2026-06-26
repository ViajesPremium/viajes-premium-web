"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";

type PageTransitionContextValue = {
  triggerTransition: (href: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider",
    );
  }

  return context;
}

type PageTransitionProviderProps = {
  children: ReactNode;
};

export default function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const router = useRouter();

  const value = useMemo<PageTransitionContextValue>(
    () => ({
      triggerTransition: (href: string) => {
        router.push(href);
      },
    }),
    [router],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}
