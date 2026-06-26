"use client";

import type { FormEvent } from "react";
import type { LandingFormSection } from "@/features/landings/data/types";
import { Button } from "@/features/shared/components/ui/button/Button";
import styles from "./TravelLeadForm.module.css";

type TravelLeadFormProps = {
  config: LandingFormSection;
};

export default function TravelLeadForm({ config }: TravelLeadFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const travelWishesLabel =
    config.labels?.travelWishes ?? "¿Qué te gustaría vivir?";
  const travelWishesPlaceholder =
    config.placeholders?.travelWishes ??
    "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal.";
  const experienceTypeLabel =
    config.labels?.experienceType ??
    "¿Con qué tipo de experiencia conectas más? (opcional)";
  const experienceTypePlaceholder =
    config.placeholders?.experienceType ?? "Selecciona una opción";
  const experienceOptions = config.experienceOptions ?? [];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Nombre completo</span>
          <input name="name" type="text" placeholder="Tu nombre" required />
        </label>
        <label className={styles.field}>
          <span>Teléfono</span>
          <input name="phone" type="tel" placeholder={config.contactPhoneDisplay} required />
        </label>
      </div>

      <label className={styles.field}>
        <span>{travelWishesLabel}</span>
        <textarea name="travelWishes" placeholder={travelWishesPlaceholder} rows={4} required />
      </label>

      <label className={styles.field}>
        <span>{experienceTypeLabel}</span>
        <select name="experienceType" defaultValue="">
          <option value="" disabled>
            {experienceTypePlaceholder}
          </option>
          {experienceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.footer}>
        <Button type="submit" variant="primary">
          {config.submitLabel}
        </Button>
        <a href={`tel:${config.contactPhoneLink}`} className={styles.phoneLink}>
          {config.contactPhoneDisplay}
        </a>
      </div>
    </form>
  );
}
