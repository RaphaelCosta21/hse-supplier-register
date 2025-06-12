import * as React from "react";
import {
  ProgressIndicator,
  Text,
  MessageBar,
  MessageBarType,
  DefaultButton,
} from "@fluentui/react";
import styles from "./ProgressModal.module.scss";

export interface ProgressModalProps {
  open: boolean;
  percent: number;
  label?: string;
  description?: string;
  fileCount?: number;
  showTimeWarning?: boolean;
  warningMessage?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
  showEstimatedTime?: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  open,
  percent,
  label = "Processando...",
  description,
  fileCount = 0,
  showTimeWarning = false,
  warningMessage,
  allowCancel = false,
  onCancel,
  showEstimatedTime = true,
}) => {
  // Calcular tempo estimado baseado na quantidade de arquivos
  const getEstimatedTime = (files: number): string => {
    if (files <= 5) return "1-2 minutos";
    if (files <= 10) return "2-4 minutos";
    if (files <= 20) return "4-8 minutos";
    return "8-15 minutos";
  };

  const getWarningMessage = (): string => {
    if (warningMessage) return warningMessage;
    if (fileCount > 5) {
      return `Processando ${fileCount} arquivos. Tempo estimado: ${getEstimatedTime(
        fileCount
      )}. Por favor, aguarde sem fechar esta janela.`;
    }
    return "Por favor, aguarde o processamento finalizar. Não feche esta janela.";
  };

  if (!open) return null;

  return (
    <div className={styles.progressModalOverlay}>
      <div className={styles.progressModalBox}>
        <Text variant="large" className={styles.progressLabel}>
          {label}
        </Text>

        {(showTimeWarning || fileCount > 0) && (
          <MessageBar
            messageBarType={
              fileCount > 10 ? MessageBarType.warning : MessageBarType.info
            }
            className={styles.warningMessage}
            isMultiline
          >
            {getWarningMessage()}
          </MessageBar>
        )}

        {description && (
          <Text variant="medium" className={styles.progressDescription}>
            {description}
          </Text>
        )}

        <div className={styles.progressContainer}>
          <ProgressIndicator
            percentComplete={percent / 100}
            description={`${Math.round(percent)}%`}
          />
        </div>
        {fileCount > 0 && (
          <Text variant="small" className={styles.fileCountInfo}>
            Processando {fileCount} arquivo{fileCount !== 1 ? "s" : ""}
          </Text>
        )}

        {showEstimatedTime && fileCount > 5 && (
          <Text variant="small" className={styles.estimatedTime}>
            Tempo estimado: {getEstimatedTime(fileCount)}
          </Text>
        )}

        {allowCancel && onCancel && (
          <div className={styles.buttonContainer}>
            <DefaultButton
              text="Cancelar"
              onClick={onCancel}
              disabled={percent > 90} // Don't allow cancel when almost done
            />
          </div>
        )}
      </div>
    </div>
  );
};
