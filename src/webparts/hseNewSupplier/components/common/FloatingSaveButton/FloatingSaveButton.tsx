import * as React from "react";
import {
  ActionButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import styles from "./FloatingSaveButton.module.scss";
import { ProgressModal } from "../ProgressModal";
import { useScreenLock } from "../../../hooks/useScreenLock";
import { Toast } from "../Toast/Toast";
import {
  validateDadosGeraisForSave,
  generateValidationMessage,
  mapMissingFieldsToFormFields,
} from "../../../utils/formValidation";
import { NR_QUESTIONS_MAP } from "../../../utils/formConstants";
import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";

export const FloatingSaveButton: React.FC = (): JSX.Element => {
  const { actions, state, dispatch } = useHSEForm();
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

  // Estado para controlar o dialog de confirmação
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // Estado para controlar expansão
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [expandTimeout, setExpandTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  // Hook para travar a tela durante o processamento
  useScreenLock(progressOpen);

  // Funções para validar cada etapa (mesma lógica da navbar)
  const isDadosGeraisValid = React.useCallback(() => {
    const { dadosGerais } = state.formData;
    const attachments = state.attachments || {};
    if (!dadosGerais) return false;

    // Validar campos básicos
    const camposOk = [
      dadosGerais.empresa,
      dadosGerais.cnpj,
      dadosGerais.numeroContrato,
      dadosGerais.dataInicioContrato,
      dadosGerais.dataTerminoContrato,
      dadosGerais.responsavelTecnico,
      dadosGerais.atividadePrincipalCNAE,
      dadosGerais.gerenteContratoMarine,
    ].every((v) => v !== undefined && v !== null && v !== "");

    // Validar grau de risco separadamente (não pode ser string vazia)
    const grauRiscoOk = dadosGerais.grauRisco !== "";

    const remOk = attachments.rem && attachments.rem.length > 0;
    return camposOk && grauRiscoOk && remOk;
  }, [state.formData, state.attachments]);
  const isConformidadeLegalValid = React.useCallback(() => {
    const conformidade = state.formData.conformidadeLegal || {};

    // NRs obrigatórias que sempre são aplicáveis (não têm toggle)
    const MANDATORY_NR_BLOCKS = ["nr01", "nr04", "nr05", "nr06", "nr07"];

    // Lista de todos os possíveis blocos NR
    const possibleBlocks = [
      "nr01",
      "nr04",
      "nr05",
      "nr06",
      "nr07",
      "nr10",
      "nr11",
      "nr12",
      "nr13",
      "nr15",
      "nr16",
      "nr23",
      "licencasAmbientais",
      "legislacaoMaritima",
      "treinamentos",
      "gestaoSMS",
    ];

    // Identificar blocos aplicáveis:
    // - NRs obrigatórias são sempre aplicáveis
    // - NRs opcionais só se marcadas pelo usuário
    const applicableBlocks = possibleBlocks.filter((blockKey) => {
      // NRs obrigatórias são sempre aplicáveis
      if (MANDATORY_NR_BLOCKS.includes(blockKey)) {
        return true;
      }

      // NRs opcionais: verificar se foram marcadas como aplicáveis pelo usuário
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;

      const blockObj = bloco as unknown as { aplicavel?: boolean };
      return blockObj.aplicavel === true;
    });

    // Se nenhum bloco aplicável, não está válido
    if (applicableBlocks.length === 0) return false;

    // Estrutura de questões por bloco (incluindo índices para buscar attachment info)
    // ATUALIZADA para corresponder à sequência corrigida após remoção das questões extras da NR01
    const blockQuestions: Record<
      string,
      Array<{ key: string; idx: number }>
    > = {
      nr01: [
        { key: "questao1", idx: 1 },
        { key: "questao2", idx: 2 },
      ],
      nr04: [
        { key: "questao1", idx: 3 },
        { key: "questao2", idx: 4 },
      ],
      nr05: [
        { key: "questao1", idx: 5 },
        { key: "questao2", idx: 6 },
      ],
      nr06: [
        { key: "questao1", idx: 7 },
        { key: "questao2", idx: 8 },
      ],
      nr07: [
        { key: "questao1", idx: 9 },
        { key: "questao2", idx: 10 },
        { key: "questao3", idx: 11 },
      ],
      nr10: [
        { key: "questao1", idx: 12 },
        { key: "questao2", idx: 13 },
        { key: "questao3", idx: 14 },
      ],
      nr11: [
        { key: "questao1", idx: 15 },
        { key: "questao2", idx: 16 },
      ],
      nr12: [
        { key: "questao1", idx: 17 },
        { key: "questao2", idx: 18 },
      ],
      nr13: [{ key: "questao1", idx: 19 }],
      nr15: [{ key: "questao1", idx: 20 }],
      nr16: [{ key: "questao1", idx: 21 }],
      nr23: [
        { key: "questao1", idx: 22 },
        { key: "questao2", idx: 23 },
        { key: "questao3", idx: 24 },
      ],
      licencasAmbientais: [{ key: "questao1", idx: 25 }],
      legislacaoMaritima: [
        { key: "questao1", idx: 26 },
        { key: "questao2", idx: 27 },
        { key: "questao3", idx: 28 },
        { key: "questao4", idx: 29 },
        { key: "questao5", idx: 30 },
        { key: "questao6", idx: 31 },
      ],
      treinamentos: [
        { key: "questao1", idx: 32 },
        { key: "questao2", idx: 33 },
        { key: "questao3", idx: 34 },
      ],
      gestaoSMS: [
        { key: "questao1", idx: 35 },
        { key: "questao2", idx: 36 },
        { key: "questao3", idx: 37 },
        { key: "questao4", idx: 38 },
        { key: "questao5", idx: 39 },
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

    // Se marcou que não fornece nenhum serviço, está válido
    if (servicosEspeciais.naoFornecedorServicos) return true;

    // Se não marcou nenhum serviço E não marcou "não fornece", é inválido
    if (
      !servicosEspeciais.fornecedorEmbarcacoes &&
      !servicosEspeciais.fornecedorIcamento &&
      !servicosEspeciais.naoFornecedorServicos
    )
      return false;

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

  // Cálculo de progresso e informações contextuais
  const progressInfo = React.useMemo(() => {
    let completedSteps = 0;
    let currentStepName = "";
    let nextStepName = "";
    const missingFields: string[] = [];

    // Verificar Dados Gerais
    const dadosGeraisOK = isDadosGeraisValid();
    if (dadosGeraisOK) {
      completedSteps++;
    } else {
      currentStepName = "Dados Gerais";
      const { dadosGerais } = state.formData;
      const attachments = state.attachments || {};

      // Identificar campos faltantes
      if (!dadosGerais?.empresa) missingFields.push("Empresa");
      if (!dadosGerais?.cnpj) missingFields.push("CNPJ");
      if (!dadosGerais?.numeroContrato)
        missingFields.push("Número do Contrato");
      if (!dadosGerais?.dataInicioContrato)
        missingFields.push("Data de Início do Contrato");
      if (!dadosGerais?.dataTerminoContrato)
        missingFields.push("Data de Término do Contrato");
      if (!dadosGerais?.responsavelTecnico)
        missingFields.push("Responsável Técnico");
      if (!dadosGerais?.atividadePrincipalCNAE)
        missingFields.push("Atividade Principal (CNAE)");
      if (!dadosGerais?.grauRisco) missingFields.push("Grau de Risco");
      if (!dadosGerais?.gerenteContratoMarine)
        missingFields.push("Gerente do Contrato");
      if (!attachments.rem || attachments.rem.length === 0)
        missingFields.push("Anexo REM");
    }

    // Verificar Conformidade Legal
    const conformidadeOK = isConformidadeLegalValid();
    if (conformidadeOK) {
      completedSteps++;
    } else if (dadosGeraisOK) {
      currentStepName = "Conformidade Legal";
      missingFields.push("Questões NR pendentes");
    }

    // Verificar Serviços Especializados
    const servicosOK = isServicosEspeciaisValid();
    if (servicosOK) {
      completedSteps++;
    } else if (dadosGeraisOK && conformidadeOK) {
      currentStepName = "Serviços Especializados";
      missingFields.push("Certificados pendentes");
    }

    // Determinar próxima etapa
    if (!dadosGeraisOK) {
      nextStepName = "Dados Gerais";
    } else if (!conformidadeOK) {
      nextStepName = "Conformidade Legal";
    } else if (!servicosOK) {
      nextStepName = "Serviços Especializados";
    } else {
      nextStepName = "Revisão Final";
    }

    const percentage = Math.round((completedSteps / 3) * 100);

    return {
      percentage,
      completedSteps,
      currentStepName,
      nextStepName,
      missingFields,
      isComplete: completedSteps === 3,
    };
  }, [
    isDadosGeraisValid,
    isConformidadeLegalValid,
    isServicosEspeciaisValid,
    state.formData,
    state.attachments,
  ]);

  // Handlers para expansão
  const handleExpand = React.useCallback(() => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
    setIsExpanded(true);
  }, [expandTimeout]);

  const handleCollapse = React.useCallback(() => {
    const timeout = setTimeout(() => {
      setIsExpanded(false);
      setExpandTimeout(null);
    }, 300);
    setExpandTimeout(timeout);
  }, []);

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
        ? "Rascunho salvo com sucesso! Você pode continuar de onde parou."
        : "Formulário enviado com sucesso!";
    setProgressLabel(finalMessage);
    setProgressPercent(100);

    // Pequeno delay para mostrar conclusão
    await new Promise((resolve) => setTimeout(resolve, 800));
    setProgressOpen(false);
  };
  // Handler para validar campos e mostrar confirmação se válido
  const handleSaveClick = async (): Promise<void> => {
    // Primeiro, validar os campos obrigatórios
    const validationResult = validateDadosGeraisForSave(
      state.formData,
      state.attachments
    );

    if (!validationResult.isValid) {
      // Se não for válido, mostrar erro (sem confirmação)
      const errorMsg = generateValidationMessage(validationResult);
      setToastMessage(`Não é possível salvar o formulário:\n${errorMsg}`);
      setToastType("error");
      setToastVisible(true);

      // Mapeia campos faltantes para erros de campo
      if (dispatch) {
        const fieldErrors = mapMissingFieldsToFormFields(
          validationResult.missingFields
        );
        dispatch({ type: "SET_FIELD_ERRORS", payload: fieldErrors });
      }
      return;
    }

    // Se for válido, mostrar confirmação
    setShowConfirmDialog(true);
  };

  // Handler para salvar com progresso visual (chamado após confirmação)
  const handleSaveWithProgress = async (): Promise<void> => {
    setLoadingVisible(true);
    setLoadingMessage("Salvando rascunho...");
    setIsSaving(true);

    try {
      await runWithProgressSimulation(async () => {
        await actions.saveFormData();
      }, "save");

      // Mostrar toast de sucesso
      setToastMessage(
        "Rascunho salvo com sucesso! Redirecionando para a página inicial..."
      );
      setToastType("success");
      setToastVisible(true);

      // Delay de 2.5 segundos para dar tempo do toast ser visto
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Redirecionar para a página inicial usando o mesmo método da RevisaoFinal
      if (actions?.setApplicationPhase) {
        actions.setApplicationPhase({
          phase: "ENTRADA",
          cnpj: "",
          isOverwrite: false,
          requiresApproval: false,
        });
      } else {
        // Fallback: redirecionar recarregando a página
        window.location.href =
          window.location.origin + window.location.pathname;
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setProgressOpen(false);

      // Mostrar toast de erro
      setToastMessage("Erro ao salvar o rascunho. Tente novamente.");
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
      {/* Overlay de loading: só aparece se NÃO estiver mostrando o ProgressModal */}
      {loadingVisible && !progressOpen && (
        <LoadingOverlay visible={loadingVisible} message={loadingMessage} />
      )}

      {/* Toast global, sempre fora do botão flutuante */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        duration={4000}
      />

      {/* Botão flutuante de salvar ou revisar/submeter */}
      <div
        className={`${styles.floatingSaveButton} ${
          isSaving || progressOpen ? styles.processing : ""
        } ${isExpanded ? styles.expanded : ""} ${
          allStepsCompleted
            ? styles.completed
            : !isDadosGeraisValid()
            ? styles.disabled
            : ""
        }`}
        onMouseEnter={handleExpand}
        onMouseLeave={handleCollapse}
      >
        {/* Conteúdo da expansão */}
        <div className={styles.expansionContent}>
          <div className={styles.progressInfo}>
            <span className={styles.progressIcon}>📊</span>
            <span>{progressInfo.percentage}% concluído</span>
          </div>

          {progressInfo.currentStepName && (
            <div className={styles.stepInfo}>
              <span className={styles.stepIcon}>📋</span>
              <span>Etapa: {progressInfo.currentStepName}</span>
            </div>
          )}

          {progressInfo.missingFields.length > 0 && (
            <div className={styles.missingInfo}>
              <span className={styles.missingIcon}>⚠️</span>
              <span>
                Faltam: {progressInfo.missingFields.slice(0, 2).join(", ")}
                {progressInfo.missingFields.length > 2 && ", entre outros..."}
              </span>
            </div>
          )}

          {progressInfo.nextStepName && (
            <div className={styles.nextInfo}>
              <span className={styles.nextIcon}>🎯</span>
              <span>Próxima Etapa: {progressInfo.nextStepName}</span>
            </div>
          )}
        </div>

        {allStepsCompleted ? (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
            }}
          >
            <ActionButton
              onRenderIcon={() => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {!isExpanded && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#ffffff",
                        position: "absolute",
                        left: "-18px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        animation: "pulse 2s infinite",
                        opacity: 0.9,
                        zIndex: 10,
                        fontWeight: "bold",
                      }}
                    >
                      ▲
                    </span>
                  )}
                  <span style={{ fontSize: "18px", marginRight: "8px" }}>
                    ✅
                  </span>
                </div>
              )}
              text="Revisar e Submeter"
              onClick={handleReviewAndSubmit}
              disabled={
                isSaving || state.isSubmitting || progressOpen || loadingVisible
              }
              className={styles.submitButtonGreen}
              title="Revisar e submeter o formulário"
              styles={{ root: { width: "100%" } }}
            />
            {/* Círculo de progresso dinâmico */}
            <div
              className={styles.progressCircle}
              style={
                {
                  "--progress-angle": `${
                    (progressInfo.percentage / 100) * 360
                  }deg`,
                } as React.CSSProperties
              }
            >
              <div className={styles.progressRing} />
              <div className={styles.progressText}>
                {progressInfo.percentage}%
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
            }}
          >
            <ActionButton
              onRenderIcon={() => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {!isExpanded && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#ffffff",
                        position: "absolute",
                        left: "-18px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        animation: "pulse 2s infinite",
                        opacity: 0.9,
                        zIndex: 10,
                        fontWeight: "bold",
                      }}
                    >
                      ▲
                    </span>
                  )}
                  <span style={{ fontSize: "18px", marginRight: "8px" }}>
                    💾
                  </span>
                </div>
              )}
              text={isSaving ? "Salvando..." : "Salvar Rascunho"}
              onClick={handleSaveClick}
              disabled={
                isSaving || state.isSubmitting || progressOpen || loadingVisible
              }
              className={styles.saveButton}
              styles={{ root: { width: "100%" } }}
            />
            {/* Círculo de progresso dinâmico */}
            <div
              className={styles.progressCircle}
              style={
                {
                  "--progress-angle": `${
                    (progressInfo.percentage / 100) * 360
                  }deg`,
                } as React.CSSProperties
              }
            >
              <div className={styles.progressRing} />
              <div className={styles.progressText}>
                {progressInfo.percentage}%
              </div>
            </div>
          </div>
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

        {/* LoadingOverlay adicional */}
        <LoadingOverlay visible={loadingVisible} message={loadingMessage} />

        {/* Dialog de confirmação para salvar rascunho */}
        <Dialog
          hidden={!showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: "Confirmar Salvamento",
            subText:
              "Tem certeza que deseja salvar o rascunho do formulário HSE?",
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
          }}
        >
          <DialogFooter>
            <PrimaryButton
              onClick={async () => {
                setShowConfirmDialog(false);
                await handleSaveWithProgress();
              }}
              text="Confirmar"
            />
            <DefaultButton
              onClick={() => setShowConfirmDialog(false)}
              text="Cancelar"
            />
          </DialogFooter>
        </Dialog>
      </div>
    </>
  );
};
