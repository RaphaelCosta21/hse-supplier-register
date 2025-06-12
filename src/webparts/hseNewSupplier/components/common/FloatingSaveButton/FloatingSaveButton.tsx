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
              <span>{}</span>
            </Stack>
          </MessageBar>
        </div>
      )}{" "}
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
            disabled={isSaving || state.isSubmitting || progressOpen}
            className={styles.submitButtonGreen}
            title="Revisar e submeter o formulário"
          />
        ) : (
          <ActionButton
            iconProps={{ iconName: "Save" }}
            text={isSaving ? "Salvando..." : "Salvar Progresso"}
            onClick={handleSaveWithProgress}
            disabled={isSaving || state.isSubmitting || progressOpen}
            className={styles.saveButton}
            title="Salvar o progresso do formulário (validação apenas dos Dados Gerais)"
          />
        )}{" "}
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
