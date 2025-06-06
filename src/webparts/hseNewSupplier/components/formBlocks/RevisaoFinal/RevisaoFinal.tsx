import * as React from "react";
import {
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Separator,
  Icon,
  Modal,
  Dialog,
  DialogType,
  DialogFooter,
} from "@fluentui/react";
import { useHSEForm } from "../../../context/HSEFormContext";
import { formSelectors } from "../../../context/formReducer";
import styles from "./RevisaoFinal.module.scss";

export const RevisaoFinal: React.FC = () => {
  const { state, actions } = useHSEForm();
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completionPercentage = formSelectors.getCompletionPercentage(state);
  const hasValidationErrors = state.validationErrors.length > 0;

  const getSummaryData = () => {
    const { formData, attachments } = state;

    return {
      empresa: formData.empresa,
      cnpj: formData.cnpj,
      numeroContrato: formData.numeroContrato,
      totalAnexos: Object.values(attachments).reduce(
        (total, files) => total + files.length,
        0
      ),
      respostasConformidade: Object.keys(formData.conformidadeLegal || {})
        .length,
      servicosEspecializados:
        [
          formData.fornecedorEmbarcacoes && "Embarcações",
          formData.fornecedorIcamento && "Içamento",
        ]
          .filter(Boolean)
          .join(", ") || "Nenhum",
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await actions.submitForm();
      if (success) {
        setShowSubmitDialog(false);
        // Redirecionar ou mostrar mensagem de sucesso
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaryData = getSummaryData();

  return (
    <div className={styles.revisaoFinal}>
      <Stack tokens={{ childrenGap: 20 }}>
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            Revisão Final e Envio
          </Text>
          <div className={styles.completionBadge}>
            <Icon
              iconName={
                completionPercentage >= 90 ? "CompletedSolid" : "Warning"
              }
            />
            {completionPercentage}% concluído
          </div>
        </div>

        {hasValidationErrors ? (
          <MessageBar messageBarType={MessageBarType.error}>
            Existem {state.validationErrors.length} erro(s) que precisam ser
            corrigidos antes do envio.
          </MessageBar>
        ) : (
          <MessageBar messageBarType={MessageBarType.success}>
            Formulário está válido e pronto para envio.
          </MessageBar>
        )}

        <div className={styles.summarySection}>
          <Text variant="large" className={styles.summaryTitle}>
            Resumo do Formulário
          </Text>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">Empresa:</Text>
              <Text>{summaryData.empresa || "Não preenchido"}</Text>
            </div>

            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">CNPJ:</Text>
              <Text>{summaryData.cnpj || "Não preenchido"}</Text>
            </div>

            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">Contrato:</Text>
              <Text>{summaryData.numeroContrato || "Não preenchido"}</Text>
            </div>

            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">Total de Anexos:</Text>
              <Text>{summaryData.totalAnexos}</Text>
            </div>

            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">Respostas de Conformidade:</Text>
              <Text>{summaryData.respostasConformidade}</Text>
            </div>

            <div className={styles.summaryItem}>
              <Text variant="mediumPlus">Serviços Especializados:</Text>
              <Text>{summaryData.servicosEspecializados}</Text>
            </div>
          </div>
        </div>

        <Separator />

        <div className={styles.actionsSection}>
          <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            horizontalAlign="space-between"
          >
            <DefaultButton
              text="Etapa Anterior"
              iconProps={{ iconName: "ChevronLeft" }}
              onClick={actions.goToPreviousStep}
            />

            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DefaultButton
                text="Salvar Rascunho"
                iconProps={{ iconName: "Save" }}
                onClick={actions.saveFormData}
                disabled={state.isSubmitting}
              />

              <DefaultButton
                text="Exportar PDF"
                iconProps={{ iconName: "PDF" }}
                // onClick={handleExportPDF}
              />

              <PrimaryButton
                text="Enviar Formulário"
                iconProps={{ iconName: "Send" }}
                onClick={() => setShowSubmitDialog(true)}
                disabled={hasValidationErrors || completionPercentage < 80}
              />
            </Stack>
          </Stack>
        </div>

        <Dialog
          hidden={!showSubmitDialog}
          onDismiss={() => setShowSubmitDialog(false)}
          dialogContentProps={{
            type: DialogType.normal,
            title: "Confirmar Envio do Formulário",
            subText:
              "Tem certeza que deseja enviar o formulário? Esta ação não pode ser desfeita.",
          }}
        >
          <DialogFooter>
            <PrimaryButton
              onClick={handleSubmit}
              text="Confirmar Envio"
              disabled={isSubmitting}
            />
            <DefaultButton
              onClick={() => setShowSubmitDialog(false)}
              text="Cancelar"
            />
          </DialogFooter>
        </Dialog>
      </Stack>
    </div>
  );
};
