import * as React from "react";
import { MessageBar, MessageBarType } from "@fluentui/react";
import styles from "./Toast.module.scss";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onDismiss,
  duration = 4000,
}) => {
  React.useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  const getMessageBarType = (): MessageBarType => {
    switch (type) {
      case "success":
        return MessageBarType.success;
      case "error":
        return MessageBarType.error;
      case "warning":
        return MessageBarType.warning;
      case "info":
      default:
        return MessageBarType.info;
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.toastContainer}>
      <MessageBar
        messageBarType={getMessageBarType()}
        onDismiss={onDismiss}
        dismissButtonAriaLabel="Fechar"
        className={styles.toastMessage}
      >
        {message}
      </MessageBar>
    </div>
  );
};
