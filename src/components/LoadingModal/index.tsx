import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";

import "./LoadingModalStyles.css";

interface LoadingModalProps {
  open: boolean;
  message?: string;
}

const LoadingModal = ({
  open,
  message = "Aguarde um instante...",
}: LoadingModalProps) => {
  return (
    <Dialog
      className="loading-modal"
      open={open}
      onClose={() => undefined}
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-message"
    >
      <DialogContent className="loading-modal__content" aria-busy={open}>
        <div className="loading-modal__header">
          <div className="loading-modal__icon">
            <CircularProgress
              className="loading-modal__progress"
              size={42}
              thickness={4}
              aria-label="Carregando"
            />
          </div>
        </div>

        <h2 id="loading-modal-title" className="loading-modal__title">
          Processando...
        </h2>

        <div className="loading-modal__message-container">
          <p
            id="loading-modal-message"
            className="loading-modal__message"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
