import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Hero from "@/features/landings/sections/hero/Hero";
import PremiumExperiences from "@/features/landings/sections/premium-experiences/PremiumExperiences";
import {
  getLandingBySlug,
  getLandingSlugs,
} from "@/features/landings/data";

type LandingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = getLandingBySlug(slug);

  if (!landing) {
    return {
      title: "Landing no encontrada",
    };
  }

  return {
    title: landing.hero.seoHeading,
    description: landing.hero.description,
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params;
  const landing = getLandingBySlug(slug);

  if (!landing) {
    notFound();
  }

  return (
    <main
      style={
        {
          "--primary": landing.palette.primary,
          "--secondary": landing.palette.secondary,
          "--complementary": landing.palette.complementary,
        } as CSSProperties
      }
    >
      <Hero landing={landing} />
      <PremiumExperiences landing={landing} />
    </main>
  );
}
