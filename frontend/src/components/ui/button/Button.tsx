import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./button.css";

type ButtonVariant = "primary" | "secondary" | "outline";

const BASE_CLASSNAME = "buttonBase";

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: "buttonPrimary",
  secondary: "buttonSecondary",
  outline: "buttonOutline",
};

export const buttonVariants = (variant: ButtonVariant = "primary") =>
  `${BASE_CLASSNAME} ${VARIANT_CLASSNAMES[variant]}`;

type ButtonBaseProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonElementProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonLinkProps = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type ButtonProps = ButtonElementProps | ButtonLinkProps;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      children,
      fullWidth = false,
      style,
      ...props
    },
    ref,
  ) => {
    const nextClassName = `${buttonVariants(variant)} ${className}`.trim();
    const wrapperStyle: React.CSSProperties = fullWidth
      ? { position: "relative", display: "block", width: "100%" }
      : { position: "relative", display: "inline-block" };
    const buttonStyle: React.CSSProperties | undefined = fullWidth
      ? { ...style, width: "100%", maxWidth: "none" }
      : style;
    const content = (
      <>
        <span className="buttonLabel">{children}</span>

        {variant === "primary" && (
          <span className="buttonIcon" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        )}
      </>
    );

    if ("href" in props && props.href) {
      const { href, ...linkProps } = props;

      return (
        <div className="buttonWrapper" style={wrapperStyle}>
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={nextClassName}
            style={buttonStyle}
            {...linkProps}
          >
            {content}
          </Link>
        </div>
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <div className="buttonWrapper" style={wrapperStyle}>
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={nextClassName}
          style={buttonStyle}
          {...buttonProps}
        >
          {content}
        </button>
      </div>
    );
  },
);

Button.displayName = "Button";

export { Button };
