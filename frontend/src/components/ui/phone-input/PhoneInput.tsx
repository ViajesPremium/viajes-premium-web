"use client";

import React from "react";
import RPNInput from "react-phone-number-input/input";
import {
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumber,
  type Country,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import labels from "react-phone-number-input/locale/es.json";
import { cn } from "@/lib/utils";
import styles from "./PhoneInput.module.css";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: Country;
  onCountryChange?: (country: Country) => void;
  invalid?: boolean;
  theme?: "dark" | "light" | "terra";
};

const FALLBACK_COUNTRY: Country = "MX";
const COUNTRY_OPTIONS = getCountries();
const PHONE_LABELS = labels as Record<string, string | undefined>;

function resolveCountry(country?: Country): Country {
  if (country && isSupportedCountry(country)) {
    return country;
  }

  return FALLBACK_COUNTRY;
}

function getCountryPrefix(country: Country): string {
  return `+${getCountryCallingCode(country)}`;
}

function safeParsePhoneNumber(value: string) {
  try {
    return parsePhoneNumber(value);
  } catch {
    return undefined;
  }
}

function getNationalDigits(value: string, fallbackCountry: Country): string {
  const parsed = safeParsePhoneNumber(value);
  if (parsed?.nationalNumber) {
    return parsed.nationalNumber;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const fallbackCallingCode = getCountryCallingCode(fallbackCountry);
  return digits.startsWith(fallbackCallingCode)
    ? digits.slice(fallbackCallingCode.length)
    : digits;
}

function rebasePhoneValue(
  value: string,
  fromCountry: Country,
  toCountry: Country,
): string {
  const nationalDigits = getNationalDigits(value, fromCountry);
  const targetPrefix = getCountryPrefix(toCountry);

  return nationalDigits ? `${targetPrefix}${nationalDigits}` : targetPrefix;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value,
      onChange,
      defaultCountry = FALLBACK_COUNTRY,
      onCountryChange,
      invalid = false,
      theme = "dark",
      className,
      placeholder,
      ...inputProps
    },
    ref,
  ) {
    const isLightTheme = theme === "light";
    const [country, setCountry] = React.useState<Country>(() =>
      resolveCountry(defaultCountry),
    );
    // Gate the full country list behind hydration so the SSR HTML only contains
    // the selected country's <option> instead of 250+ options.
    const [optionsLoaded, setOptionsLoaded] = React.useState(false);

    React.useEffect(() => {
      setCountry(resolveCountry(defaultCountry));
    }, [defaultCountry]);

    React.useEffect(() => {
      setOptionsLoaded(true);
    }, []);

    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;

    const handleRPNChange = React.useCallback((nextValue: Value | undefined) => {
      onChangeRef.current?.(nextValue ?? "");
    }, []);

    const countryName = PHONE_LABELS[country] ?? country;
    const callingCode = getCountryCallingCode(country);
    const Flag = flags[country];
    const normalizedValue = React.useMemo(() => {
      if (!value) return undefined;
      return value as Value;
    }, [value]);

    return (
      <div
        className={cn(
          styles.root,
          isLightTheme ? styles.rootLight : styles.rootDark,
          invalid && styles.invalid,
          className,
        )}
      >
        <label className={styles.countryPicker}>
          <span className={styles.flagSlot} aria-hidden="true">
            {Flag ? <Flag title={countryName} /> : null}
          </span>

          <select
            value={country}
            onChange={(event) => {
              const nextCountry = resolveCountry(event.target.value as Country);
              setCountry(nextCountry);

              if (value) {
                onChange?.(rebasePhoneValue(value, country, nextCountry));
              }

              onCountryChange?.(nextCountry);
            }}
            className={styles.countrySelect}
            aria-label="Seleccionar pais"
          >
            {/* Current country always present for SSR and initial render */}
            <option value={country}>
              {PHONE_LABELS[country] ?? country} (+{callingCode})
            </option>
            {/* Full list deferred until after hydration — keeps SSR HTML clean */}
            {optionsLoaded &&
              COUNTRY_OPTIONS.filter((c) => c !== country).map((countryCode) => {
                const optionLabel = PHONE_LABELS[countryCode] ?? countryCode;
                const optionCode = getCountryCallingCode(countryCode);
                return (
                  <option key={countryCode} value={countryCode}>
                    {optionLabel} (+{optionCode})
                  </option>
                );
              })}
          </select>
        </label>

        <RPNInput
          ref={ref}
          country={country}
          international
          withCountryCallingCode
          value={normalizedValue}
          onChange={handleRPNChange}
          className={styles.numberInput}
          placeholder={placeholder ?? `+${callingCode} 55 1234 5678`}
          {...inputProps}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
