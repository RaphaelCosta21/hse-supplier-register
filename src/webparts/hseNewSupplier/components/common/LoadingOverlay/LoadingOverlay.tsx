import * as React from "react";
import {
  ProgressIndicator,
  Text,
  MessageBar,
  MessageBarType,
  DefaultButton,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import styles from "./LoadingOverlay.module.scss";

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  description?: string;
  fileCount?: number;
  showTimeWarning?: boolean;
  warningMessage?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
  showEstimatedTime?: boolean;
  operationType?: "save" | "submit";
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = "Processando...",
  description,
  fileCount = 0,
  showTimeWarning = false,
  warningMessage,
  allowCancel = false,
  onCancel,
  showEstimatedTime = true,
  operationType = "save",
}) => {
  // Estados para progresso automático
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [currentMessage, setCurrentMessage] = React.useState(message);

  // Efeito para simular progresso automático
  React.useEffect(() => {
    if (!visible) {
      setCurrentProgress(0);
      setCurrentMessage(message);
      return;
    }

    // Definir etapas de progresso baseado no tipo de operação e quantidade de arquivos
    const progressSteps =
      operationType === "save"
        ? [
            {
              label: "Preparando dados para salvamento...",
              percent: 10,
              delay: 300,
            },
            {
              label: "Validando campos obrigatórios...",
              percent: 25,
              delay: 400,
            },
            {
              label: "Salvando informações no SharePoint...",
              percent: 60,
              delay: 600,
            },
            { label: "Finalizando salvamento...", percent: 90, delay: 300 },
            { label: "Rascunho salvo com sucesso!", percent: 100, delay: 500 },
          ]
        : [
            {
              label: "Validando formulário completo...",
              percent: 8,
              delay: 400,
            },
            {
              label: "Preparando documentos para envio...",
              percent: 20,
              delay: 500,
            },
            {
              label: "Criando estrutura no SharePoint...",
              percent: 35,
              delay: 700,
            },
            {
              label: "Enviando arquivos anexados...",
              percent: 70,
              delay: fileCount > 10 ? 2000 : fileCount > 5 ? 1200 : 800,
            },
            { label: "Finalizando submissão...", percent: 95, delay: 400 },
            {
              label: "Formulário enviado com sucesso!",
              percent: 100,
              delay: 500,
            },
          ];

    setCurrentProgress(0);
    setCurrentMessage(progressSteps[0].label);

    const runProgress = async (): Promise<void> => {
      for (const step of progressSteps) {
        if (!visible) break; // Parar se o componente não estiver mais visível

        setCurrentMessage(step.label);
        setCurrentProgress(step.percent);

        await new Promise((resolve) => setTimeout(resolve, step.delay));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    runProgress();

    // Cleanup function
    return () => {
      setCurrentProgress(0);
      setCurrentMessage(message);
    };
  }, [visible, message, operationType, fileCount]);
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

  // Determinar valores a serem exibidos
  const displayPercent = currentProgress;
  const displayMessage = currentMessage;

  if (!visible) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContent}>
        {displayPercent < 100 && (
          <Spinner size={SpinnerSize.large} className={styles.spinner} />
        )}
        <Text variant="large" className={styles.loadingMessage}>
          {displayMessage}
        </Text>

        {/* Sempre mostrar aviso para não fechar a tela */}
        <MessageBar
          messageBarType={MessageBarType.warning}
          className={styles.warningMessage}
          isMultiline
        >
          ⚠️ <strong>NÃO FECHE ESTA JANELA</strong> - O processo está em
          andamento. Fechar agora pode causar perda de dados.
        </MessageBar>

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
          <Text variant="medium" className={styles.loadingSubMessage}>
            {description}
          </Text>
        )}

        <div className={styles.progressContainer}>
          <ProgressIndicator
            percentComplete={displayPercent / 100}
            description={`${Math.round(displayPercent)}%`}
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

        {allowCancel && onCancel && displayPercent < 90 && (
          <div className={styles.buttonContainer}>
            <DefaultButton text="Cancelar" onClick={onCancel} />
          </div>
        )}
      </div>
    </div>
  );
};
