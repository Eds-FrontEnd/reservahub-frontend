import type React from "react";
import { useId, useState } from "react";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

import "./PasswordInputStyle.css";

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  error?: string;
}

export const PasswordInput = ({
  id,
  error,
  "aria-describedby": ariaDescribedby,
  ...props
}: PasswordInputProps) => {
  const generatedId = useId();
  const inputId = id ?? `password-${generatedId}`;
  const errorId = `${inputId}-error`;

  const [showPassword, setShowPassword] = useState(false);

  const describedBy = error
    ? [ariaDescribedby, errorId].filter(Boolean).join(" ")
    : ariaDescribedby;

  return (
    <div className="password-input">
      <div className="password-input__field">
        <input
          {...props}
          id={inputId}
          type={showPassword ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />

        <IconButton
          type="button"
          className="password-input__toggle"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          aria-pressed={showPassword}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </div>

      {error && (
        <span id={errorId} className="password-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
