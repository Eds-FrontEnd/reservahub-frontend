import type React from "react";
import { useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";

import { Button } from "../Button";

import "./ModalStyle.css";

interface ModalProps {
  open?: boolean;
  title?: string;
  message?: string;

  buttonText?: string;
  buttonUrl?: string;
  closeUrl?: string;

  redirectDelay?: number;
  redirectUrl?: string;

  icon?: React.ReactNode;

  iconColor?: string;
  titleColor?: string;
  buttonColor?: string;
  buttonHoverColor?: string;

  onClose?: () => void;
  onNavigate?: (url: string) => void;
  onButtonClick?: () => void;
}

const Modal = ({
  open = false,
  title,
  message = "",
  buttonText,
  buttonUrl,
  closeUrl,
  redirectDelay,
  redirectUrl,
  icon,
  iconColor = "var(--color-primary)",
  titleColor = "var(--color-primary)",
  buttonColor = "var(--color-primary)",
  buttonHoverColor = "var(--color-black)",
  onClose,
  onNavigate,
  onButtonClick,
}: ModalProps) => {
  const handleNavigation = (url?: string) => {
    onClose?.();

    if (!url) {
      return;
    }

    if (onNavigate) {
      onNavigate(url);
      return;
    }

    window.location.href = url;
  };

  useEffect(() => {
    if (
      !open ||
      !redirectUrl ||
      redirectDelay === undefined ||
      redirectDelay <= 0
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleNavigation(redirectUrl);
    }, redirectDelay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, redirectUrl, redirectDelay]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    handleNavigation(buttonUrl);
  };

  const handleCloseClick = () => {
    handleNavigation(closeUrl);
  };

  return (
    <Dialog
      className="modal"
      open={open}
      onClose={onClose}
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={message ? "modal-message" : undefined}
      slots={{
        transition: Grow,
      }}
      slotProps={{
        transition: {
          timeout: 300,
        },
      }}
    >
      <Fade in={open} timeout={300}>
        <div className="modal__content">
          <IconButton
            className="modal__close"
            aria-label="Fechar"
            onClick={handleCloseClick}
            size="small"
          >
            <CloseIcon />
          </IconButton>

          {icon && (
            <div className="modal__header">
              <div
                className="modal__icon"
                style={{
                  color: iconColor,
                }}
              >
                {icon}
              </div>
            </div>
          )}

          {title && (
            <DialogTitle
              className="modal__title"
              id="modal-title"
              style={{
                color: titleColor,
              }}
            >
              {title}
            </DialogTitle>
          )}

          {message && (
            <DialogContent className="modal__message-container">
              <p className="modal__message" id="modal-message">
                {message}
              </p>
            </DialogContent>
          )}

          {buttonText && (
            <div className="modal__actions">
              <Button
                autoFocus
                onClick={handleButtonClick}
                className="modal__button"
                backgroundColor={buttonColor}
                hoverBackgroundColor={buttonHoverColor}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </Fade>
    </Dialog>
  );
};

export default Modal;
