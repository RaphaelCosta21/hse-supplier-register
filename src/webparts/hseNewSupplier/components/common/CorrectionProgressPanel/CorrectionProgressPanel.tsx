import * as React from "react";
import {
  Panel,
  PanelType,
  Text,
  Icon,
  Separator,
  ProgressIndicator,
  IconButton,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import { CorrectionCheckbox } from "../CorrectionCheckbox/CorrectionCheckbox";
import styles from "./CorrectionProgressPanel.module.scss";

export interface ICorrectionProgressPanelProps {
  isOpen: boolean;
}

export const CorrectionProgressPanel: React.FC<
  ICorrectionProgressPanelProps
> = ({ isOpen }) => {
  const { state, actions } = useHSEForm();

  // Estado para controlar se o painel está minimizado
  const [isMinimized, setIsMinimized] = React.useState(false);

  // Função para toggle minimize/expand
  const toggleMinimize = React.useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  // Função para marcar/desmarcar campo como corrigido
  const handleFieldCorrectionChange = React.useCallback(
    (fieldPath: string, isCorrected: boolean) => {
      actions.setFieldCorrected(fieldPath, isCorrected);
    },
    [actions]
  );

  // Calcular progresso das correções baseado em marcações manuais
  const getRestrictionProgress = React.useCallback(() => {
    if (!state.correctionMode || !state.restrictedFields) {
      return { corrected: 0, total: 0, restrictions: [] };
    }

    // Buscar restrições originais do sessionStorage se disponível
    const camposRestricaoJson = sessionStorage.getItem("camposRestricao");
    let originalRestrictions: Array<{
      secao: string;
      campo: string;
      nomeExibicao: string;
      motivo: string;
    }> = [];

    if (camposRestricaoJson) {
      try {
        originalRestrictions = JSON.parse(camposRestricaoJson);
      } catch (e) {
        console.warn("Erro ao parsear restrições do sessionStorage:", e);
      }
    }

    const restrictions = state.restrictedFields.map((fieldPath: string) => {
      // Encontrar restrição original correspondente
      const originalRestriction = originalRestrictions.find(
        (r) => `${r.secao}.${r.campo}` === fieldPath
      );

      // Verificar se o campo foi marcado como corrigido manualmente
      const isCorrected = state.manualCorrectedFields.includes(fieldPath);

      return {
        fieldPath,
        fieldName: originalRestriction?.nomeExibicao || fieldPath,
        reason: originalRestriction?.motivo || "Campo precisa ser corrigido",
        isCorrected,
      };
    });

    const correctedCount = restrictions.filter((r) => r.isCorrected).length;

    return {
      corrected: correctedCount,
      total: restrictions.length,
      restrictions,
    };
  }, [
    state.correctionMode,
    state.restrictedFields,
    state.manualCorrectedFields,
  ]);

  const progress = getRestrictionProgress();
  const progressPercentage =
    progress.total > 0 ? progress.corrected / progress.total : 0;

  if (!state.correctionMode) {
    return null;
  }

  // Renderizar versão minimizada
  if (isMinimized) {
    const isCompleted =
      progress.corrected === progress.total && progress.total > 0;

    return (
      <div
        className={`${styles.minimizedPanel} ${
          isCompleted ? styles.completed : ""
        }`}
        onClick={toggleMinimize}
      >
        <div className={styles.minimizedContent}>
          <div className={styles.minimizedHeader}>
            <Icon iconName="ChevronLeft" className={styles.expandIcon} />
            <Icon iconName="Warning" className={styles.minimizedIcon} />
          </div>

          <div className={styles.minimizedProgress}>
            <div className={styles.minimizedStats}>
              <Text variant="medium" className={styles.minimizedText}>
                {progress.corrected}/{progress.total}
              </Text>
            </div>

            <div className={styles.minimizedProgressBar}>
              <div
                className={styles.minimizedProgressFill}
                style={{
                  height: `${progressPercentage * 100}%`,
                  backgroundColor: isCompleted ? "#90EE90" : "#ff8c00", // Verde claro quando completo
                }}
              />
            </div>
          </div>

          {isCompleted && (
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

  // Renderizar versão completa
  return (
    <Panel
      isOpen={isOpen}
      type={PanelType.medium}
      isBlocking={false}
      hasCloseButton={false}
      headerText="Progresso das Correções"
      onRenderHeader={() => (
        <div className={styles.panelHeader}>
          <div className={styles.headerContent}>
            <Icon iconName="Warning" className={styles.headerIcon} />
            <Text variant="large" className={styles.headerTitle}>
              Progresso das Correções
            </Text>
            <IconButton
              iconProps={{ iconName: "ChevronRight" }}
              onClick={toggleMinimize}
              className={styles.minimizeButton}
              title="Minimizar painel"
            />
          </div>
          <div className={styles.progressSummary}>
            <Text variant="medium" className={styles.progressText}>
              {progress.corrected} de {progress.total} concluídas
            </Text>
            <ProgressIndicator
              percentComplete={progressPercentage}
              className={styles.progressBar}
              barHeight={6}
            />
          </div>
        </div>
      )}
      className={styles.correctionPanel}
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
          {progress.corrected === progress.total && progress.total > 0 ? (
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
                Ainda há correções pendentes. Continue preenchendo os campos
                destacados.
              </Text>
            </div>
          )}
        </div>

        <Separator className={styles.separator} />

        {/* Lista de restrições */}
        <div className={styles.restrictionsSection}>
          <Text variant="mediumPlus" className={styles.sectionTitle}>
            Campos para Correção
          </Text>

          <div className={styles.restrictionsList}>
            {progress.restrictions.map((restriction, index) => (
              <div
                key={index}
                className={`${styles.restrictionItem} ${
                  restriction.isCorrected ? styles.corrected : styles.pending
                }`}
              >
                <CorrectionCheckbox
                  fieldPath={restriction.fieldPath}
                  fieldName={restriction.fieldName}
                  isChecked={restriction.isCorrected}
                  onChange={handleFieldCorrectionChange}
                  className={
                    restriction.isCorrected ? styles.corrected : styles.pending
                  }
                />
                <div className={styles.restrictionReason}>
                  <Text variant="small" className={styles.reasonText}>
                    <strong>Motivo:</strong> {restriction.reason}
                  </Text>
                </div>
              </div>
            ))}
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
                Use os checkboxes para marcar manualmente os campos que você já
                corrigiu
              </Text>
            </li>
            <li>
              <Text variant="small">
                Os campos restritos estão destacados em laranja no formulário
              </Text>
            </li>
            <li>
              <Text variant="small">
                O progresso é atualizado conforme você marca os campos como
                corrigidos
              </Text>
            </li>
            <li>
              <Text variant="small">
                Você pode desmarcar um campo se precisar corrigir novamente
              </Text>
            </li>
          </ul>
        </div>
      </div>
    </Panel>
  );
};
