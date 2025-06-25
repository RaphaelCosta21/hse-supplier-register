import * as React from "react";
import {
  ActionButton,
  MessageBar,
  MessageBarType,
  Stack,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import styles from "./FloatingSaveButton.module.scss";
import { ProgressModal } from "../ProgressModal";
import { useScreenLock } from "../../../hooks/useScreenLock";
import { Toast } from "../Toast/Toast";
import {
  validateFormForSave,
  generateValidationMessage,
  mapMissingFieldsToFormFields,
} from "../../../utils/formValidation";
import { NR_QUESTIONS_MAP } from "../../../utils/formConstants";
import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";

export const FloatingSaveButton: React.FC = (): JSX.Element => {
  const { actions, state, dispatch } = useHSEForm();
  const [showValidationError, setShowValidationError] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [progressOpen, setProgressOpen] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [progressLabel, setProgressLabel] = React.useState("");
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [loadingVisible, setLoadingVisible] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");

  // Hook para travar a tela durante o processamento
  useScreenLock(progressOpen);

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

    // Lista de todos os possíveis blocos NR
    const possibleBlocks = [
      "nr01",
      "nr04",
      "nr05",
      "nr06",
      "nr07",
      "nr09",
      "nr10",
      "nr11",
      "nr12",
      "nr13",
      "nr15",
      "nr23",
      "licencasAmbientais",
      "legislacaoMaritima",
      "treinamentos",
      "gestaoSMS",
    ];

    // Identificar blocos aplicáveis (que foram marcados como aplicáveis pelo usuário)
    const applicableBlocks = possibleBlocks.filter((blockKey) => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;

      // Usar a nova flag de aplicabilidade
      const blockObj = bloco as unknown as { aplicavel?: boolean };
      return blockObj.aplicavel === true;
    });

    // Se nenhum bloco aplicável, não está válido
    if (applicableBlocks.length === 0) return false;

    // Estrutura de questões por bloco (incluindo índices para buscar attachment info)
    const blockQuestions: Record<
      string,
      Array<{ key: string; idx: number }>
    > = {
      nr01: [
        { key: "questao1", idx: 1 },
        { key: "questao2", idx: 2 },
        { key: "questao3", idx: 3 },
        { key: "questao4", idx: 4 },
        { key: "questao5", idx: 5 },
      ],
      nr04: [
        { key: "questao1", idx: 6 },
        { key: "questao2", idx: 7 },
      ],
      nr05: [
        { key: "questao1", idx: 8 },
        { key: "questao2", idx: 9 },
      ],
      nr06: [
        { key: "questao1", idx: 10 },
        { key: "questao2", idx: 11 },
      ],
      nr07: [
        { key: "questao1", idx: 12 },
        { key: "questao2", idx: 13 },
        { key: "questao3", idx: 14 },
      ],
      nr09: [
        { key: "questao1", idx: 15 },
        { key: "questao2", idx: 16 },
        { key: "questao3", idx: 17 },
      ],
      nr10: [
        { key: "questao1", idx: 18 },
        { key: "questao2", idx: 19 },
        { key: "questao3", idx: 20 },
      ],
      nr11: [
        { key: "questao1", idx: 21 },
        { key: "questao2", idx: 22 },
      ],
      nr12: [
        { key: "questao1", idx: 23 },
        { key: "questao2", idx: 24 },
      ],
      nr13: [{ key: "questao1", idx: 25 }],
      nr15: [{ key: "questao1", idx: 26 }],
      nr23: [
        { key: "questao1", idx: 27 },
        { key: "questao2", idx: 28 },
        { key: "questao3", idx: 29 },
      ],
      licencasAmbientais: [{ key: "questao1", idx: 30 }],
      legislacaoMaritima: [
        { key: "questao1", idx: 31 },
        { key: "questao2", idx: 32 },
        { key: "questao3", idx: 33 },
        { key: "questao4", idx: 34 },
        { key: "questao5", idx: 35 },
        { key: "questao6", idx: 36 },
      ],
      treinamentos: [
        { key: "questao1", idx: 37 },
        { key: "questao2", idx: 38 },
        { key: "questao3", idx: 39 },
      ],
      gestaoSMS: [
        { key: "questao1", idx: 40 },
        { key: "questao2", idx: 41 },
        { key: "questao3", idx: 42 },
        { key: "questao4", idx: 43 },
        { key: "questao5", idx: 44 },
      ],
    }; // Função para verificar se um bloco individual está completo (MESMA LÓGICA do ConformidadeLegal)
    const isBlockComplete = (blockKey: string): boolean => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;

      const questions = blockQuestions[blockKey] || [];

      return questions.every((q) => {
        const questionObj = (
          bloco as unknown as Record<string, { resposta?: string }>
        )[q.key];

        // Verificar se a pergunta tem resposta
        if (
          !questionObj ||
          !questionObj.resposta ||
          questionObj.resposta === ""
        ) {
          return false;
        }

        // Se a resposta é "SIM", verificar se há anexo obrigatório
        if (questionObj.resposta === "SIM") {
          const questionMeta = (
            NR_QUESTIONS_MAP as Record<
              string,
              { text: string; attachment?: string }
            >
          )[String(q.idx)];

          // Se a pergunta requer anexo e a resposta é SIM
          if (questionMeta && questionMeta.attachment) {
            const categoryFiles =
              state.attachments[questionMeta.attachment] || [];
            return categoryFiles.length > 0;
          }
        }

        return true;
      });
    }; // Verificar se TODOS os blocos aplicáveis estão completos (têm check verde individual)
    return applicableBlocks.every((blockKey) => isBlockComplete(blockKey));
  }, [state.formData, state.attachments]);

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
  }; // Função utilitária para progresso visual mais fluido
  const runWithProgressSimulation = async (
    action: () => Promise<void>,
    operationType: "save" | "submit" = "save"
  ): Promise<void> => {
    // Contar total de arquivos anexados
    const attachments = state.attachments || {};
    const totalFiles = Object.values(attachments).reduce((total, files) => {
      return total + (Array.isArray(files) ? files.length : 0);
    }, 0);

    setProgressOpen(true);
    setProgressPercent(0);

    // Progresso simulado realista baseado no tipo de operação e quantidade de arquivos
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
              delay: totalFiles > 10 ? 2000 : totalFiles > 5 ? 1200 : 800,
            },
            { label: "Finalizando submissão...", percent: 95, delay: 400 },
          ];

    // Executar progresso simulado em paralelo com a ação real
    const progressPromise = (async () => {
      for (const step of progressSteps) {
        setProgressLabel(step.label);
        setProgressPercent(step.percent);
        await new Promise((resolve) => setTimeout(resolve, step.delay));
      }
    })();

    // Executar ação real
    const actionPromise = action();

    // Aguardar ambas terminarem
    await Promise.all([progressPromise, actionPromise]);

    // Finalizar progresso
    const finalMessage =
      operationType === "save"
        ? "Progresso salvo com sucesso!"
        : "Formulário enviado com sucesso!";
    setProgressLabel(finalMessage);
    setProgressPercent(100);

    // Pequeno delay para mostrar conclusão
    await new Promise((resolve) => setTimeout(resolve, 800));
    setProgressOpen(false);
  };
  // Handler para salvar com progresso visual
  const handleSaveWithProgress = async (): Promise<void> => {
    setLoadingVisible(true);
    setLoadingMessage("Salvando progresso...");
    // Validação detalhada dos Dados Gerais antes de salvar
    const validationResult = validateFormForSave(
      state.formData,
      state.attachments
    );
    if (!validationResult.isValid) {
      // Gera mensagem de erro detalhada
      const errorMsg = generateValidationMessage(validationResult);
      setToastMessage(""); // Esconde toast de sucesso/erro anterior
      setShowValidationError(true);
      setToastVisible(false);
      setTimeout(() => setShowValidationError(false), 6000);
      // Mapeia campos faltantes para erros de campo
      if (dispatch) {
        const fieldErrors = mapMissingFieldsToFormFields(
          validationResult.missingFields
        );
        dispatch({ type: "SET_FIELD_ERRORS", payload: fieldErrors });
      }
      setProgressOpen(false);
      setIsSaving(false);
      setToastType("error");
      setToastMessage(errorMsg);
      setToastVisible(true);
      setLoadingVisible(false);
      return;
    }
    setIsSaving(true);
    try {
      await runWithProgressSimulation(async () => {
        await actions.saveFormData();
      }, "save");

      // Mostrar toast de sucesso
      setToastMessage("Progresso salvo com sucesso!");
      setToastType("success");
      setToastVisible(true);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setProgressOpen(false);

      // Mostrar toast de erro
      setToastMessage("Erro ao salvar o progresso. Tente novamente.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsSaving(false);
      setLoadingVisible(false);
    }
  };

  // Não mostrar o botão na última etapa (Revisão Final)
  if (state.currentStep === 4) {
    return <></>;
  }

  return (
    <>
      {/* Mensagem de erro de validação flutuante */}
      {showValidationError && (
        <div className={styles.floatingError}>
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setShowValidationError(false)}
          >
            <Stack tokens={{ childrenGap: 4 }}>
              <strong>Não é possível salvar o formulário:</strong>
              <span>{toastMessage}</span>
            </Stack>
          </MessageBar>
        </div>
      )}
      {/* Overlay de loading igual Revisão Final */}
      <LoadingOverlay visible={loadingVisible} message={loadingMessage} />
      {/* Botão flutuante de salvar ou revisar/submeter */}
      <div
        className={`${styles.floatingSaveButton} ${
          isSaving || progressOpen ? styles.processing : ""
        }`}
      >
        {allStepsCompleted ? (
          <ActionButton
            iconProps={{ iconName: "CheckMark" }}
            text="Revisar e Submeter"
            onClick={handleReviewAndSubmit}
            disabled={
              isSaving || state.isSubmitting || progressOpen || loadingVisible
            }
            className={styles.submitButtonGreen}
            title="Revisar e submeter o formulário"
          />
        ) : (
          <ActionButton
            iconProps={{ iconName: "Save" }}
            text={isSaving ? "Salvando..." : "Salvar Progresso"}
            onClick={handleSaveWithProgress}
            disabled={
              isSaving || state.isSubmitting || progressOpen || loadingVisible
            }
            className={styles.saveButton}
            title="Salvar o progresso do formulário (validação apenas dos Dados Gerais)"
          />
        )}
        <ProgressModal
          open={progressOpen}
          percent={progressPercent}
          label={progressLabel}
          fileCount={Object.values(state.attachments || {}).reduce(
            (total, files) => {
              return total + (Array.isArray(files) ? files.length : 0);
            },
            0
          )}
          showTimeWarning={true}
        />
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onDismiss={() => setToastVisible(false)}
          duration={4000}
        />
      </div>
    </>
  );
};
