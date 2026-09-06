import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

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
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
      ...buttonProps
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const style = {
      ...(textColor && { "--button-text-color": textColor }),
      ...(backgroundColor && {
        "--button-background-color": backgroundColor,
      }),
      ...(hoverBackgroundColor && {
        "--button-hover-background-color": hoverBackgroundColor,
      }),
    } as CSSProperties;

    return (
      <button
        {...buttonProps}
        ref={ref}
        type={type}
        className={`action-button action-button--${size} ${
          fullWidth ? "action-button--full-width" : ""
        } ${className}`}
        style={style}
        disabled={isDisabled}
        aria-busy={loading}
      >
        {loading ? (
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
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
