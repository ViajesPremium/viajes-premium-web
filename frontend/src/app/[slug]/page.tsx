import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingBySlug, getLandingSlugs } from "@/data";

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
    title: landing.label,
    description: `${landing.label} theme`,
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
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(135deg, ${landing.palette.primary}, ${landing.palette.secondary} 52%, ${landing.palette.complementary})`,
      }}
    >
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            {"<-"} Volver al inicio
          </Link>

          <h1 className="mt-16 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {landing.label}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            {landing.slug}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { key: "primary", value: landing.palette.primary },
            { key: "secondary", value: landing.palette.secondary },
            { key: "complementary", value: landing.palette.complementary },
          ].map((item) => (
            <article
              key={item.key}
              className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                {item.key}
              </p>
              <div
                className="mt-4 h-24 rounded-2xl border border-white/10"
                style={{ background: item.value }}
              />
              <p className="mt-4 font-mono text-sm text-white/80">
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
