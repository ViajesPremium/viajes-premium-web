"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  FormEvent,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { isValidPhoneNumber } from "react-phone-number-input";
import styles from "./WhatsappFab.module.css";
import PhoneInput from "@/components/ui/phone-input/PhoneInput";
import { WhatsAppIcon } from "@/components/ui/social-icon/SocialIcon";
import { getLeadAttribution } from "@/lib/lead-attribution";
import { pushGenerateLeadEvent } from "@/lib/gtm";
import { trackMetaLeadEvent } from "@/lib/meta";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import { getLandingBySlug, getLandingSlugs } from "@/features/landings/data";
import type { LandingTheme } from "@/features/landings/data/types";

const WHATSAPP_NUMBER = "5215514648435";
const LEAD_API_ENDPOINT = "/api/leads";

function resolveLandingConfig(pathname: string | null): LandingTheme | null {
  if (!pathname) return null;
  const normalizedPathname = pathname.replace(/\/+$/, "");
  const slug = getLandingSlugs().find(
    (landingSlug) =>
      normalizedPathname === `/${landingSlug}` ||
      normalizedPathname.startsWith(`/${landingSlug}/`),
  );

  return slug ? getLandingBySlug(slug) : null;
}

function validateName(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "Ingresa tu nombre.";
  if (trimmedValue.length < 2) return "Debe tener al menos 2 caracteres.";
  if (!/^[\p{L}'`´.\-\s]+$/u.test(trimmedValue)) {
    return "Usa solo letras y espacios.";
  }
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "Ingresa tu celular.";
  if (!isValidPhoneNumber(trimmedValue)) {
    return "Ingresa un número válido para el país seleccionado.";
  }
  return undefined;
}

export default function WhatsAppFab() {
  const animationsEnabled = useAnimationsEnabled();
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const formLoadedAt = useRef<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const landingConfig = useMemo(
    () => resolveLandingConfig(pathname),
    [pathname],
  );

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  const nameError = validateName(trimmedName);
  const phoneError = validatePhone(trimmedPhone);

  const canSubmit = !nameError && !phoneError;

  const accentColor = "#1cbd57";
  const submitBg = accentColor;
  const submitText = "#ffffff";
  const focusColor = accentColor;
  const panelBg = "var(--bg, #ffffff)";
  const panelTitle = accentColor;
  const panelLabel = "var(--black, #334155)";
  const panelText = "var(--black, #0f172a)";
  const panelVariants = useMemo(
    () => ({
      closed: {
        opacity: 0,
        y: 14,
        clipPath: "inset(0 0 100% 0 round 2rem)",
        transition: {
          duration: 0.12,
          ease: "easeIn" as const,
        },
      },
      open: {
        opacity: 1,
        y: 0,
        clipPath: "inset(0 0 0% 0 round 2rem)",
        transition: {
          type: "spring" as const,
          stiffness: 240,
          damping: 26,
          mass: 0.9,
        },
      },
    }),
    [],
  );
  const fabIconVariants = useMemo(
    () => ({
      closed: {
        opacity: 0,
        rotate: -18,
      },
      open: {
        opacity: 1,
        rotate: 0,
      },
      exit: {
        opacity: 0,
        rotate: 18,
      },
    }),
    [],
  );

  const safeName = trimmedName || "Sin nombre";
  const safePhone = trimmedPhone || "Sin teléfono";
  const message = [
    `Hola mi nombre es ${safeName}, me gustaría consultar por un viaje:`,
    `• Celular: ${safePhone}`,
  ].join("\n");

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setTouched(true);
    setNameTouched(true);
    setPhoneTouched(true);
    if (!canSubmit) return;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");

    try {
      setIsSubmitting(true);
      const crmTag = landingConfig
        ? `#tags:${landingConfig.label}`
        : "#tags:WhatsApp Lead";
      const payload = {
        name: trimmedName,
        phone: trimmedPhone,
        crmTag,
        formId: `whatsapp-fab-${landingConfig?.slug ?? "default"}`,
        pagePath: window.location.pathname,
        attribution: getLeadAttribution(window.location.pathname),
        honeypot: "",
        formLoadedAt: formLoadedAt.current,
      };

      const sendLead = async () => {
        const response = await fetch(LEAD_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          messageId?: string;
          error?: string;
          details?: string;
          requestId?: string;
        };
        return { response, result };
      };

      let { response, result } = await sendLead();
      if (!response.ok && response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        ({ response, result } = await sendLead());
      }

      const isLeadSuccess = response.status === 200 && result.ok === true;

      if (!isLeadSuccess) {
        throw new Error(
          [
            result.error ?? "No se pudo enviar lead desde WhatsApp FAB.",
            result.details ? `Detalle: ${result.details}` : "",
            result.requestId ? `RequestId: ${result.requestId}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        );
      }

      console.log("[WhatsAppFab] Lead enviado correctamente", {
        formId: `whatsapp-fab-${landingConfig?.slug ?? "default"}`,
        messageId: result.messageId ?? null,
        requestId: result.requestId ?? null,
      });
      pushGenerateLeadEvent({
        pathname: window.location.pathname,
        formId: `whatsapp-fab-${landingConfig?.slug ?? "default"}`,
      });
      trackMetaLeadEvent({
        pathname: window.location.pathname,
        formId: `whatsapp-fab-${landingConfig?.slug ?? "default"}`,
        method: "whatsapp",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("[WhatsAppFab] Error al enviar correo", {
        formId: "whatsapp-fab",
        message,
        error,
      });
      alert(`No se pudo enviar el correo del lead. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const root = wrapRef.current;
      const target = event.target as Node | null;
      if (!root || !target || root.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onPointerDownCapture={(event) => event.stopPropagation()}
    >
      <AnimatePresence>
        {isOpen ? (
          <motion.form
            key="wa-form"
            className={styles.panel}
            style={
              {
                "--wa-bg": panelBg,
                "--wa-title": panelTitle,
                "--wa-label": panelLabel,
                "--wa-text": panelText,
                "--wa-focus": focusColor,
                "--wa-submit-bg": submitBg,
                "--wa-submit-color": submitText,
              } as CSSProperties
            }
            onSubmit={handleSubmit}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            <p className={styles.title}>Escríbenos por WhatsApp</p>

            <label className={styles.label} htmlFor="wa-name">
              Nombre
            </label>
            <input
              id="wa-name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder={
                landingConfig ? "Escribe tu nombre..." : "Tu nombre completo"
              }
              autoComplete="name"
            />
            {(touched || nameTouched) && nameError ? (
              <p className={styles.error}>{nameError}</p>
            ) : null}

            <label className={styles.label} htmlFor="wa-phone">
              Celular
            </label>
            <PhoneInput
              id="wa-phone"
              defaultCountry="MX"
              theme="light"
              className={styles.phoneField}
              autoComplete="tel"
              value={phone}
              onChange={(nextValue) => setPhone(nextValue)}
              onBlur={() => setPhoneTouched(true)}
              invalid={(touched || phoneTouched) && Boolean(phoneError)}
              aria-invalid={(touched || phoneTouched) && Boolean(phoneError)}
            />
            {(touched || phoneTouched) && phoneError ? (
              <p className={styles.error}>{phoneError}</p>
            ) : null}

            {touched && !canSubmit ? (
              <p className={styles.error}>
                Completa todos los campos correctamente.
              </p>
            ) : null}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Abrir formulario de WhatsApp"
        className={`${styles.fab} ${isOpen ? styles.fabOpen : styles.fabClosed}`}
        onClick={() => setIsOpen((prev) => !prev)}
        animate={
          animationsEnabled && !isOpen
            ? {
                y: [0, -3, 0],
                boxShadow: [
                  "0 10px 24px rgba(0,0,0,0.18)",
                  "0 16px 36px rgba(0,0,0,0.28)",
                  "0 10px 24px rgba(0,0,0,0.18)",
                ],
              }
            : undefined
        }
        transition={
          animationsEnabled && !isOpen
            ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        whileHover={
          animationsEnabled
            ? {
                scale: 1.04,
                y: -2,
                transition: { type: "spring", stiffness: 260, damping: 18 },
              }
            : undefined
        }
        whileTap={animationsEnabled ? { scale: 0.985 } : undefined}
      >
        <span className={styles.badge} aria-hidden="true">
          1
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            className={styles.iconWrap}
            variants={fabIconVariants}
            initial="closed"
            animate="open"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <WhatsAppIcon className={styles.icon} aria-hidden="true" />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
