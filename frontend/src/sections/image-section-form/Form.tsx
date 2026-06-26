"use client";

import { motion } from "motion/react";
import { isValidPhoneNumber } from "react-phone-number-input";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button/Button";
import PhoneInput from "@/components/ui/phone-input/PhoneInput";
import { getLeadAttribution } from "@/lib/lead-attribution";
import { pushGenerateLeadEvent } from "@/lib/gtm";
import { trackMetaLeadEvent } from "@/lib/meta";
import styles from "./Form.module.css";

type ImageSectionFormProps = {
  config: ImageSectionFormConfig;
  idPrefix?: string;
  theme?: ImageSectionFormTheme;
};

export type ImageSectionFormTheme = "dark" | "light" | "terra";

type StepFieldKey =
  | "name"
  | "phone"
  | "email"
  | "travelDate"
  | "travelers"
  | "travelWishes"
  | "experienceType";

type TravelFormValues = Record<StepFieldKey, string>;
type TravelFormErrors = Partial<Record<StepFieldKey, string>>;
type TravelFormTouched = Partial<Record<StepFieldKey, boolean>>;

export type ExperienceOption = {
  label: string;
  value: string;
};

export type ImageSectionFormConfig = {
  eyebrow: string;
  submitLabel: string;
  labels?: Partial<Record<StepFieldKey, string>>;
  hints?: Partial<Record<StepFieldKey, string>>;
  placeholders?: Partial<Record<StepFieldKey, string>>;
  contactEmail?: string;
  contactPhoneDisplay?: string;
  contactPhoneLink?: string;
  crmTag?: string;
  /** Exactamente 4 opciones para el paso "¿Con qué tipo de experiencia conectas más?". */
  experienceOptions?: readonly [
    ExperienceOption,
    ExperienceOption,
    ExperienceOption,
    ExperienceOption,
  ];
  onSubmit?: (values: TravelFormValues) => void | Promise<void>;
};

const INITIAL_VALUES: TravelFormValues = {
  name: "",
  phone: "",
  email: "",
  travelDate: "",
  travelers: "",
  travelWishes: "",
  experienceType: "",
};

const FIELD_LABELS: Record<StepFieldKey, string> = {
  name: "Nombre",
  phone: "Celular",
  email: "Correo electrónico",
  travelDate: "Fecha aproximada de viaje",
  travelers: "Número de viajeros",
  travelWishes: "¿Qué te gustaría vivir?",
  experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
};

const INPUT_HINTS: Partial<Record<StepFieldKey, string>> = {
  travelDate: "Selecciona día, mes y año estimado.",
  travelers: "Ingresa un número entre 1 y 20.",
};

const CONTACT_EMAIL = "hola@japonpremium.com";
const CONTACT_PHONE_DISPLAY = "+52 55 1234 5678";
const CONTACT_PHONE_LINK = "+525512345678";
const DEFAULT_CRM_TAG = "#tags:Japon Premium";
const LEAD_API_ENDPOINT = "/api/leads";

function validateField(field: StepFieldKey, value: string): string | undefined {
  const trimmedValue = value.trim();

  switch (field) {
    case "name": {
      if (!trimmedValue) return "Ingresa tu nombre.";
      if (trimmedValue.length < 2) return "Debe tener al menos 2 caracteres.";
      if (!/^[\p{L}'`´.\-\s]+$/u.test(trimmedValue)) {
        return "Usa solo letras y espacios.";
      }
      return undefined;
    }
    case "phone": {
      if (!trimmedValue) return "Ingresa tu celular.";
      if (!isValidPhoneNumber(trimmedValue)) {
        return "Ingresa un número válido para el país seleccionado.";
      }
      return undefined;
    }
    case "email": {
      if (!trimmedValue) return "Ingresa tu correo electrónico.";
      const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailPattern.test(trimmedValue)) {
        return "Ingresa un correo válido.";
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export default function ImageSectionForm({
  config,
  idPrefix = "image-form",
  theme = "dark",
}: ImageSectionFormProps) {
  const themeClassName =
    theme === "light"
      ? styles.themeLight
      : theme === "terra"
        ? styles.themeTerra
        : styles.themeDark;
  const [values, setValues] = useState<TravelFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<TravelFormErrors>({});
  const [touched, setTouched] = useState<TravelFormTouched>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const formLoadedAt = useRef<number>(0);

  const fieldLabels = useMemo(
    () => ({ ...FIELD_LABELS, ...(config.labels ?? {}) }),
    [config.labels],
  );

  const inputHints = useMemo(
    () => ({ ...INPUT_HINTS, ...(config.hints ?? {}) }),
    [config.hints],
  );

  const contactEmail = config.contactEmail ?? CONTACT_EMAIL;
  const contactPhoneDisplay =
    config.contactPhoneDisplay ?? CONTACT_PHONE_DISPLAY;
  const contactPhoneLink = config.contactPhoneLink ?? CONTACT_PHONE_LINK;
  const crmTag = config.crmTag ?? DEFAULT_CRM_TAG;
  const onSubmit = config.onSubmit;

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const validateContactFields = useCallback((nextValues: TravelFormValues) => {
    const nextErrors: TravelFormErrors = {};
    for (const field of ["name", "phone", "email"] as const) {
      const fieldError = validateField(field, nextValues[field]);
      if (fieldError) {
        nextErrors[field] = fieldError;
      }
    }
    return nextErrors;
  }, []);

  const setFieldValue = useCallback(
    (field: StepFieldKey, nextValue: string) => {
      setValues((prev) => ({ ...prev, [field]: nextValue }));

      if (touched[field]) {
        const nextError = validateField(field, nextValue);
        setErrors((prev) => ({ ...prev, [field]: nextError }));
      }
    },
    [touched],
  );

  const touchField = useCallback(
    (field: StepFieldKey) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, values[field]),
      }));
    },
    [values],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;

      const nextErrors = validateContactFields(values);
      setErrors(nextErrors);
      setTouched((prev) => ({
        ...prev,
        name: true,
        phone: true,
        email: true,
      }));

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      try {
        setIsSubmitting(true);
        await onSubmit?.(values);

        const payload = {
          name: values.name,
          phone: values.phone,
          email: values.email,
          crmTag,
          formId: idPrefix,
          pagePath: window.location.pathname,
          attribution: getLeadAttribution(window.location.pathname),
          honeypot,
          formLoadedAt: formLoadedAt.current,
          travelDate: values.travelDate,
          travelers: values.travelers,
          travelWishes: values.travelWishes,
          experienceType: values.experienceType,
        };

        const sendLead = async () => {
          const response = await fetch(LEAD_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const responseText = await response.text();
          const result = (() => {
            try {
              return JSON.parse(responseText) as {
                ok?: boolean;
                error?: string;
                messageId?: string;
                details?: string;
                requestId?: string;
              } | null;
            } catch {
              return null;
            }
          })();
          return { response, responseText, result };
        };

        let { response, responseText, result } = await sendLead();
        if (!response.ok && response.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          ({ response, responseText, result } = await sendLead());
        }

        const isLeadSuccess = response.status === 200 && result?.ok === true;

        if (!isLeadSuccess) {
          const errorMessage = [
            result?.error ||
              responseText ||
              `Error HTTP ${response.status} al enviar correo`,
            result?.details ? `Detalle: ${result.details}` : "",
            result?.requestId ? `RequestId: ${result.requestId}` : "",
          ]
            .filter(Boolean)
            .join(" | ");
          throw new Error(errorMessage);
        }

        console.log("[LeadForm] Correo enviado correctamente", {
          formId: idPrefix,
          messageId: result?.messageId ?? null,
          requestId: result?.requestId ?? null,
        });
        pushGenerateLeadEvent({
          pathname: window.location.pathname,
          formId: idPrefix,
        });
        trackMetaLeadEvent({
          pathname: window.location.pathname,
          formId: idPrefix,
          method: "web-form",
        });
        setIsSubmitted(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error);
        console.error("[LeadForm] Error al enviar correo", {
          formId: idPrefix,
          message,
          error,
        });
        alert(
          "Hubo un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos directamente.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      crmTag,
      honeypot,
      idPrefix,
      isSubmitting,
      onSubmit,
      validateContactFields,
      values,
    ],
  );

  const resetForm = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setIsSubmitting(false);
    setHoneypot("");
    formLoadedAt.current = Date.now();
  }, []);

  return (
    <div className={`${styles.formContainer} ${themeClassName}`}>
      {isSubmitted ? (
        <motion.div
          className={styles.completionContainer}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={styles.completion}>
            <h4 className={styles.completionTitle}>Solicitud enviada</h4>
            <p className={styles.completionText}>
              Te hemos enviado un correo de confirmación, un asesor
              especializado te contactará personalmente.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className={styles.secondaryButton}
              style={{ width: "auto", minWidth: "96px" }}
            >
              Llenar de nuevo
            </Button>
          </div>
        </motion.div>
      ) : (
        <form className={styles.stepperRoot} onSubmit={handleSubmit} noValidate>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor={`${idPrefix}-website`}>Website</label>
            <input
              id={`${idPrefix}-website`}
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>
          <StepFieldShell
            label={fieldLabels.name}
            hint={inputHints.name}
            htmlFor={`${idPrefix}-name`}
            error={touched.name ? errors.name : undefined}
          >
            <input
              id={`${idPrefix}-name`}
              type="text"
              autoComplete="name"
              placeholder="Tu nombre completo"
              className={styles.formInput}
              value={values.name}
              onChange={(event) => setFieldValue("name", event.target.value)}
              onBlur={() => touchField("name")}
            />
          </StepFieldShell>

          <StepFieldShell
            label={fieldLabels.phone}
            hint={inputHints.phone}
            htmlFor={`${idPrefix}-phone`}
            error={touched.phone ? errors.phone : undefined}
          >
            <PhoneInput
              id={`${idPrefix}-phone`}
              defaultCountry="MX"
              theme={theme}
              autoComplete="tel"
              aria-invalid={touched.phone && Boolean(errors.phone)}
              value={values.phone}
              onChange={(nextValue) => setFieldValue("phone", nextValue)}
              onBlur={() => touchField("phone")}
              invalid={touched.phone && Boolean(errors.phone)}
            />
          </StepFieldShell>

          <StepFieldShell
            label={fieldLabels.email}
            hint={inputHints.email}
            htmlFor={`${idPrefix}-email`}
            error={touched.email ? errors.email : undefined}
          >
            <input
              id={`${idPrefix}-email`}
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className={styles.formInput}
              value={values.email}
              onChange={(event) => setFieldValue("email", event.target.value)}
              onBlur={() => touchField("email")}
            />
          </StepFieldShell>

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : config.submitLabel}
            </Button>
          </div>

          <div className={styles.contactQuickActions}>
            <span className={styles.contactActionLabel}>Contáctanos ahora</span>
            <div className={styles.row}>
              <a
                href={`mailto:${contactEmail}`}
                className={styles.contactActionLink}
                title={`Enviar correo a ${contactEmail}`}
              >
                {contactEmail}
              </a>
              <span className={styles.contactActionLink2}>|</span>
              <a
                href={`tel:${contactPhoneLink}`}
                className={styles.contactActionLink}
                title={`Llamar al ${contactPhoneDisplay}`}
              >
                {contactPhoneDisplay}
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

type StepFieldShellProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function StepFieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: StepFieldShellProps) {
  return (
    <div className={styles.stepFieldShell}>
      <label htmlFor={htmlFor} className={styles.formLabel}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hintText}>{hint}</p>
      ) : null}
    </div>
  );
}
