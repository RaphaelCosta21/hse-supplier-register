import * as React from "react";
import {
  ActionButton,
  MessageBar,
  MessageBarType,
  Stack,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import {
  validateFormForSave,
  generateValidationMessage,
  mapMissingFieldsToFormFields,
} from "../../../utils/formValidation";
import styles from "./FloatingSaveButton.module.scss";

export const FloatingSaveButton: React.FC = (): JSX.Element => {
  const { actions, state, dispatch } = useHSEForm();
  const [validationMessage, setValidationMessage] = React.useState<string>("");
  const [showValidationError, setShowValidationError] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Funções para validar cada etapa (mesma lógica da navbar)
  const isDadosGeraisValid = React.useCallback(() => {
    const { dadosGerais } = state.formData;
    const attachments = state.attachments || {};
    if (!dadosGerais) return false;
    const camposOk = [
      dadosGerais.empresa,
      dadosGerais.cnpj,
      dadosGerais.numeroContrato,
      dadosGerais.dataInicioContrato,
      dadosGerais.dataTerminoContrato,
      dadosGerais.responsavelTecnico,
      dadosGerais.atividadePrincipalCNAE,
      dadosGerais.grauRisco,
      dadosGerais.gerenteContratoMarine,
    ].every((v) => v !== undefined && v !== null && v !== "");
    const remOk = attachments.rem && attachments.rem.length > 0;
    return camposOk && remOk;
  }, [state.formData, state.attachments]);

  const isConformidadeLegalValid = React.useCallback(() => {
    const conformidade = state.formData.conformidadeLegal || {};

    const NR_BLOCKS = [
      {
        key: "nr01",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
          { key: "questao4" },
          { key: "questao5" },
        ],
      },
      { key: "nr04", questions: [{ key: "questao7" }, { key: "questao8" }] },
      { key: "nr05", questions: [{ key: "questao10" }, { key: "questao11" }] },
      { key: "nr06", questions: [{ key: "questao13" }, { key: "questao14" }] },
      {
        key: "nr07",
        questions: [
          { key: "questao16" },
          { key: "questao17" },
          { key: "questao18" },
        ],
      },
      {
        key: "nr09",
        questions: [
          { key: "questao20" },
          { key: "questao21" },
          { key: "questao22" },
        ],
      },
      {
        key: "nr10",
        questions: [
          { key: "questao24" },
          { key: "questao25" },
          { key: "questao26" },
        ],
      },
      { key: "nr11", questions: [{ key: "questao28" }, { key: "questao29" }] },
      { key: "nr12", questions: [{ key: "questao31" }, { key: "questao32" }] },
      { key: "nr13", questions: [{ key: "questao34" }] },
      { key: "nr15", questions: [{ key: "questao36" }] },
      {
        key: "nr23",
        questions: [
          { key: "questao38" },
          { key: "questao39" },
          { key: "questao40" },
        ],
      },
      { key: "licencasAmbientais", questions: [{ key: "questao42" }] },
      {
        key: "legislacaoMaritima",
        questions: [
          { key: "questao44" },
          { key: "questao45" },
          { key: "questao46" },
          { key: "questao47" },
          { key: "questao48" },
          { key: "questao49" },
        ],
      },
      {
        key: "treinamentos",
        questions: [
          { key: "questao51" },
          { key: "questao52" },
          { key: "questao53" },
        ],
      },
      {
        key: "gestaoSMS",
        questions: [
          { key: "questao55" },
          { key: "questao56" },
          { key: "questao57" },
          { key: "questao58" },
          { key: "questao59" },
        ],
      },
    ];

    const applicableBlocks: { [key: string]: boolean } = {};
    NR_BLOCKS.forEach((block) => {
      const bloco = conformidade[block.key as keyof typeof conformidade];
      if (bloco && typeof bloco === "object") {
        applicableBlocks[block.key] = true;
      }
    });

    const isBlockComplete = (
      blockKey: string,
      questions: Array<{ key: string }>
    ): boolean => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;
      return questions.every((q) => {
        const questionObj = (
          bloco as unknown as Record<string, { resposta?: string }>
        )[q.key];
        return (
          questionObj &&
          typeof questionObj.resposta === "string" &&
          questionObj.resposta !== ""
        );
      });
    };

    const blocosAplicaveis = NR_BLOCKS.filter(
      (block) => applicableBlocks[block.key]
    );
    if (blocosAplicaveis.length === 0) return false;
    return blocosAplicaveis.every((block) =>
      isBlockComplete(block.key, block.questions)
    );
  }, [state.formData]);

  const isServicosEspeciaisValid = React.useCallback(() => {
    const { servicosEspeciais } = state.formData;
    const attachments = state.attachments || {};
    if (!servicosEspeciais) return true;
    if (
      !servicosEspeciais.fornecedorEmbarcacoes &&
      !servicosEspeciais.fornecedorIcamento
    )
      return true;

    if (servicosEspeciais.fornecedorEmbarcacoes) {
      const required = [
        "iopp",
        "registroArmador",
        "propriedadeMaritima",
        "arqueacao",
        "segurancaNavegacao",
        "classificacaoCasco",
        "classificacaoMaquinas",
        "bordaLivre",
        "seguroDepem",
        "autorizacaoAntaq",
        "tripulacaoSeguranca",
        "agulhaMagnetica",
        "balsaInflavel",
        "licencaRadio",
      ];
      for (const cert of required) {
        if (!attachments[cert] || attachments[cert].length === 0) return false;
      }
    }
    if (servicosEspeciais.fornecedorIcamento) {
      const required = [
        "testeCarga",
        "creaEngenheiro",
        "art",
        "planoManutencao",
        "fumacaPreta",
        "certificacaoEquipamentos",
      ];
      for (const doc of required) {
        if (!attachments[doc] || attachments[doc].length === 0) return false;
      }
    }
    return true;
  }, [state.formData, state.attachments]);
  // Verificar se todas as etapas estão completas
  const allStepsCompleted =
    isDadosGeraisValid() &&
    isConformidadeLegalValid() &&
    isServicosEspeciaisValid();

  // Handler para "Revisar e Submeter"
  const handleReviewAndSubmit = (): void => {
    if (dispatch) {
      dispatch({ type: "SET_CURRENT_STEP", payload: 4 });
    }
  };

  const handleSaveWithValidation = async (): Promise<void> => {
    setIsSaving(true);

    // Limpar erros de campo anteriores
    if (dispatch) {
      dispatch({ type: "CLEAR_FIELD_ERRORS" });
    }

    // Validar apenas os campos obrigatórios dos Dados Gerais
    const validationResult = validateFormForSave(
      state.formData,
      state.attachments
    );

    if (!validationResult.isValid) {
      // Mostrar erro de validação
      const message = generateValidationMessage(validationResult);
      setValidationMessage(message);
      setShowValidationError(true);

      // Mapear campos faltantes para erros de campo específicos e disparar ação
      if (dispatch) {
        const fieldErrors = mapMissingFieldsToFormFields(
          validationResult.missingFields
        );
        dispatch({
          type: "SET_FIELD_ERRORS",
          payload: fieldErrors,
        });
      }

      setIsSaving(false);
      return;
    }

    // Limpar erros de validação se tudo estiver OK
    setShowValidationError(false);
    setValidationMessage("");

    try {
      // Executar o salvamento
      if (actions.saveFormData) {
        await actions.saveFormData();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setValidationMessage("Erro ao salvar o formulário. Tente novamente.");
      setShowValidationError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Não mostrar o botão na última etapa (Revisão Final)
  if (state.currentStep === 4) {
    return <></>;
  }

  return (
    <>
      {/* Mensagem de erro de validação flutuante */}
      {showValidationError && validationMessage && (
        <div className={styles.floatingError}>
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setShowValidationError(false)}
          >
            <Stack tokens={{ childrenGap: 4 }}>
              <strong>Não é possível salvar o formulário:</strong>
              <span>{validationMessage}</span>
            </Stack>
          </MessageBar>
        </div>
      )}{" "}
      {/* Botão flutuante de salvar ou revisar/submeter */}
      <div className={styles.floatingSaveButton}>
        {allStepsCompleted ? (
          <ActionButton
            iconProps={{ iconName: "CheckMark" }}
            text="Revisar e Submeter"
            onClick={handleReviewAndSubmit}
            disabled={isSaving || state.isSubmitting}
            className={styles.submitButtonGreen}
            title="Revisar e submeter o formulário"
          />
        ) : (
          <ActionButton
            iconProps={{ iconName: "Save" }}
            text="Salvar Progresso"
            onClick={handleSaveWithValidation}
            disabled={isSaving || state.isSubmitting}
            className={styles.saveButton}
            title="Salvar o progresso do formulário (validação apenas dos Dados Gerais)"
          />
        )}
      </div>
    </>
  );
};
