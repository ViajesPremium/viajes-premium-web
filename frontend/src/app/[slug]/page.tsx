import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Hero from "@/features/landings/sections/hero/Hero";
import PremiumExperiences from "@/features/landings/sections/premium-experiences/PremiumExperiences";
import FirstForm from "@/features/landings/sections/first-form/FirstForm";
import Benefits from "@/features/landings/sections/benefits/Benefits";
import Itineraries from "@/features/landings/sections/itineraries/Itineraries";
import Promise from "@/features/landings/sections/promise/Promise";
import Founder from "@/features/landings/sections/founder/Founder";
import Aliances from "@/features/shared/sections/aliances/Aliances";
import Footer from "@/features/landings/sections/footer/Footer";
import Testimonials from "@/features/shared/sections/testimonials/Testimonials";
import Faqs from "@/features/shared/sections/faqs/Faqs";
import SecondForm from "@/features/shared/sections/second-form/SecondForm";
import Video from "@/features/landings/sections/video/Video";
import { getLandingBySlug, getLandingSlugs } from "@/features/landings/data";

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
      <section id="inicio">
        <Hero landing={landing} />
      </section>
      <section id="nosotros">
        <PremiumExperiences landing={landing} />
      </section>
      <section id="first-form">
        <FirstForm landing={landing} />
      </section>
      <section id="choose">
        <Benefits landing={landing} />
      </section>
      <section id="itinerarios">
        <Itineraries landing={landing} />
      </section>
      <section id="includes">
        <Promise landing={landing} />
      </section>
      <section id="testimonials">
        <Testimonials landing={landing} />
      </section>
      <section id="interlude">
        <Founder landing={landing} />
      </section>
      <section id="faqs">
        <Faqs landing={landing} />
      </section>
      <section id="video">
        <Video
          srHeading={landing.video.srHeading}
          desktop={landing.video.desktop}
          mobile={landing.video.mobile}
          alt={landing.video.alt}
        />
      </section>
      <section id="second-form">
        <SecondForm landing={landing} />
      </section>
      <section id="marquee">
        <Aliances landing={landing} />
      </section>
      <Footer landing={landing} />
    </main>
  );
}
