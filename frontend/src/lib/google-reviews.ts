/**
 * google-reviews.ts
 *
 * Utilidad para traer métricas reales desde la Google Places API (v1 — nueva).
 *
 * ── Cómo activar ──────────────────────────────────────────────────────────────
 * 1. Habilita "Places API (New)" en Google Cloud Console.
 * 2. Crea una API Key con restricción de servidor (HTTP referrer o IP).
 * 3. Agrega al .env.local:
 *      GOOGLE_PLACES_API_KEY=tu_clave_aqui
 *      GOOGLE_PLACE_ID=ChIJ...  (el Place ID de tu negocio)
 *
 * Para obtener el Place ID:
 *   https://developers.google.com/maps/documentation/places/web-service/place-id
 *
 * ── Uso desde un Server Component ────────────────────────────────────────────
 *   import { getGoogleRating } from "@/lib/google-reviews";
 *   const data = await getGoogleRating();          // devuelve GoogleRatingData
 *
 * ── Revalidación ─────────────────────────────────────────────────────────────
 * La función usa fetch con { next: { revalidate: 86400 } }  →  1 día de cache.
 * Ajusta el número según la frecuencia de actualización que necesites.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface GoogleRatingData {
  rating: number;          // p. ej. 4.8
  totalRatings: number;    // p. ej. 128
  source: "google" | "fallback";
}

// ── Fallback (mockup) — se usa si no hay credenciales o falla la API ──────────
export const GOOGLE_RATING_FALLBACK: GoogleRatingData = {
  rating: 4.9,
  totalRatings: 84,
  source: "fallback",
};

// ── Fetcher principal ─────────────────────────────────────────────────────────
export async function getGoogleRating(): Promise<GoogleRatingData> {
  const apiKey  = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Si no están configuradas las variables de entorno devolvemos el fallback
  if (!apiKey || !placeId) {
    return GOOGLE_RATING_FALLBACK;
  }

  try {
    // Places API (New) — endpoint de detalle
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        // Solo pedimos los campos que nos interesan (reduce coste por token)
        "X-Goog-FieldMask": "rating,userRatingCount",
      },
      // ISR: revalida cada 24 h en producción
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn("[google-reviews] Places API respondió con", res.status);
      return GOOGLE_RATING_FALLBACK;
    }

    const data = await res.json();

    return {
      rating:       data.rating        ?? GOOGLE_RATING_FALLBACK.rating,
      totalRatings: data.userRatingCount ?? GOOGLE_RATING_FALLBACK.totalRatings,
      source: "google",
    };
  } catch (err) {
    console.error("[google-reviews] Error al obtener métricas:", err);
    return GOOGLE_RATING_FALLBACK;
  }
}
