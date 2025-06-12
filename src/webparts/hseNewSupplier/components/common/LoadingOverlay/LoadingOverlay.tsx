import * as React from "react";
import { Spinner, SpinnerSize, Text } from "@fluentui/react";
import styles from "./LoadingOverlay.module.scss";

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = "Carregando...",
  subMessage,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContent}>
        <Spinner size={SpinnerSize.large} className={styles.spinner} />
        <Text variant="large" className={styles.loadingMessage}>
          {message}
        </Text>
        {subMessage && (
          <Text variant="medium" className={styles.loadingSubMessage}>
            {subMessage}
          </Text>
        )}
      </div>
    </div>
  );
};
