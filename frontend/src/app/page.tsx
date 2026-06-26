import Link from "next/link";
import { landingList } from "@/features/landings/data";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300 backdrop-blur">
            Viajes Premium
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Un sistema de landings con palette propia por marca.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Cada slug carga su archivo individual dentro de{" "}
            <code>src/features/landings/data</code>{" "}
            y solo define su paleta: primary, secondary y complementary.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {landingList.map((landing) => (
            <Link
              key={landing.slug}
              href={`/${landing.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20"
              style={{
                background: `linear-gradient(135deg, ${landing.palette.primary}, ${landing.palette.secondary})`,
              }}
            >
              <div
                className="h-2 w-full"
                style={{ background: landing.palette.complementary }}
              />
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  {landing.slug}
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {landing.label}
                </h2>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <span
                    className="h-10 rounded-2xl border border-white/15"
                    style={{ background: landing.palette.primary }}
                  />
                  <span
                    className="h-10 rounded-2xl border border-white/15"
                    style={{ background: landing.palette.secondary }}
                  />
                  <span
                    className="h-10 rounded-2xl border border-white/15"
                    style={{ background: landing.palette.complementary }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
