import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, type LinkProps } from "react-router-dom";

import "./ButtonStyle.css";

type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  textColor?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  to?: LinkProps["to"];
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      icon,
      iconPosition = "right",
      size = "medium",
      fullWidth = false,
      loading = false,
      loadingText = "Carregando...",
      textColor,
      backgroundColor,
      hoverBackgroundColor,
      className = "",
      disabled,
      type = "button",
      to,
      ...buttonProps
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const style = {
      ...(textColor && {
        "--button-text-color": textColor,
      }),
      ...(backgroundColor && {
        "--button-background-color": backgroundColor,
      }),
      ...(hoverBackgroundColor && {
        "--button-hover-background-color": hoverBackgroundColor,
      }),
    } as CSSProperties;

    const classes = [
      "action-button",
      `action-button--${size}`,
      fullWidth && "action-button--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = loading ? (
      <>
        <span className="action-button__spinner" aria-hidden="true" />
        <span>{loadingText}</span>
      </>
    ) : (
      <>
        {icon && iconPosition === "left" && (
          <span className="action-button__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <span className="action-button__label">{children}</span>

        {icon && iconPosition === "right" && (
          <span className="action-button__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </>
    );

    if (to && !isDisabled) {
      return (
        <Link
          to={to}
          className={classes}
          style={style}
          aria-busy={loading}
          aria-disabled={loading}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        {...buttonProps}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        style={style}
        disabled={isDisabled}
        aria-busy={loading}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
