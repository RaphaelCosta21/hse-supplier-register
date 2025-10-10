import * as React from "react";
import {
  Panel,
  PanelType,
  Text,
  Icon,
  IconButton,
  Separator,
  Checkbox,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import styles from "./PendingInfoPanel.module.scss";

export interface IPendingInfoPanelProps {
  isOpen: boolean;
}

export const PendingInfoPanel: React.FC<IPendingInfoPanelProps> = ({
  isOpen,
}) => {
  const { state } = useHSEForm();

  // Estado para controlar se o painel está minimizado
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isResolved, setIsResolved] = React.useState(false);

  // Função para toggle minimize/expand
  const toggleMinimize = React.useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  if (!state.pendingMode) {
    return null;
  }

  // Renderizar versão minimizada
  if (isMinimized) {
    return (
      <div
        className={`${styles.minimizedPanel} ${
          isResolved ? styles.completed : ""
        }`}
        onClick={toggleMinimize}
      >
        <div className={styles.minimizedContent}>
          <div className={styles.minimizedHeader}>
            <Icon iconName="ChevronLeft" className={styles.expandIcon} />
            <Icon iconName="Info" className={styles.minimizedIcon} />
          </div>

          <div className={styles.minimizedProgress}>
            <div className={styles.minimizedStats}>
              <Text variant="medium" className={styles.minimizedText}>
                {isResolved ? "Resolvido" : "Pendente"}
              </Text>
            </div>
          </div>

          {isResolved && (
            <div className={styles.minimizedComplete}>
              <Icon
                iconName="CheckMark"
                className={styles.minimizedCompleteIcon}
              />
            </div>
          )}
        </div>

        <div className={styles.minimizedTooltip}>
          <Text variant="xSmall">Clique para expandir</Text>
        </div>
      </div>
    );
  }

  // Renderizar versão completa - igual ao CorrectionProgressPanel
  return (
    <Panel
      isOpen={isOpen}
      type={PanelType.medium}
      isBlocking={false}
      hasCloseButton={false}
      headerText="Motivo da Pendência"
      onRenderHeader={() => (
        <div className={styles.panelHeader}>
          <div className={styles.headerContent}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon iconName="Info" className={styles.headerIcon} />
              <Text variant="large" className={styles.headerTitle}>
                Correção das Pendências
              </Text>
            </div>
            <IconButton
              iconProps={{ iconName: "ChevronRight" }}
              onClick={toggleMinimize}
              className={styles.minimizeButton}
              title="Minimizar painel"
            />
          </div>
        </div>
      )}
      className={styles.pendingPanel}
      styles={{
        main: {
          marginTop: 0,
        },
        content: {
          padding: 0,
        },
        commands: {
          margin: 0,
        },
      }}
    >
      <div className={styles.panelContent}>
        {/* Status geral */}
        <div className={styles.statusSection}>
          {isResolved ? (
            <div className={styles.completedStatus}>
              <Icon iconName="CheckMark" className={styles.completedIcon} />
              <Text variant="mediumPlus" className={styles.completedText}>
                Todas as correções foram concluídas!
              </Text>
              <Text variant="small" className={styles.completedSubtext}>
                Você pode agora prosseguir com a submissão. Vá para a aba de
                Revisão Final.
              </Text>
            </div>
          ) : (
            <div className={styles.pendingStatus}>
              <Icon iconName="Info" className={styles.pendingIcon} />
              <Text variant="medium" className={styles.pendingText}>
                Ainda há correções pendentes. Continue a correção e marque o
                CheckBox quando concluído.
              </Text>
            </div>
          )}
        </div>

        <Separator className={styles.separator} />

        {/* Seção do Motivo da Pendência - Usando estilos do CorrectionProgressPanel */}
        <div className={styles.restrictionsSection}>
          <Text variant="mediumPlus" className={styles.sectionTitle}>
            Motivo da Pendência
          </Text>

          <div className={styles.restrictionsList}>
            <div
              className={`${styles.restrictionItem} ${
                isResolved ? styles.corrected : styles.pending
              }`}
            >
              <Checkbox
                label="Resolver Pendência"
                checked={isResolved}
                onChange={(ev, checked) => setIsResolved(!!checked)}
                className={isResolved ? styles.corrected : styles.pending}
              />
              <div className={styles.restrictionReason}>
                <Text variant="small" className={styles.reasonText}>
                  <strong>Motivo:</strong>{" "}
                  {state.pendingReason || "Não especificado"}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <Separator className={styles.separator} />

        <div className={styles.instructionsSection}>
          <Text variant="medium" className={styles.instructionsTitle}>
            Como usar este painel:
          </Text>
          <ul className={styles.instructionsList}>
            <li>
              <Text variant="small">
                Use o checkboxe para marcar manualmente quando já tiver
                realizado a correção.
              </Text>
            </li>
            <li>
              <Text variant="small">
                Você pode desmarcar um campo se precisar corrigir novamente
              </Text>
            </li>
            <li>
              <Text variant="small">
                Após todas as correções, prossiga para a aba de Revisão Final
                para submeter o formulário.
              </Text>
            </li>
          </ul>
        </div>
      </div>
    </Panel>
  );
};
