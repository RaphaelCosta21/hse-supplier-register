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
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [loadingVisible, setLoadingVisible] = React.useState(false);

  // Novos estados para progresso real
  const [realProgress, setRealProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState("");
  const [useRealProgress, setUseRealProgress] = React.useState(false);

  // Estado para controlar o dialog de confirmação
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // Estado para controlar expansão
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [expandTimeout, setExpandTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  // Hook para travar a tela durante o processamento
  useScreenLock(loadingVisible);

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
        "registroCREA",
        "art",
        "planoManutencao",
        "monitoramentoFumaca",
        "certificacaoEquipamentos",
      ];
      for (const doc of required) {
        if (!attachments[doc] || attachments[doc].length === 0) return false;
      }
    }
    return true;
  }, [state.formData, state.attachments]);

  // Função para identificar NRs específicas que estão faltando
  const getMissingNRs = React.useCallback((): string[] => {
    const missingNRs: string[] = [];
    const conformidade = state.formData.conformidadeLegal || {};

    // NRs obrigatórias que sempre devem estar completas
    const MANDATORY_NR_BLOCKS = ["nr01", "nr04", "nr05", "nr06", "nr07"];

    // Mapeamento de blocos para nomes legíveis
    const NR_NAMES: { [key: string]: string } = {
      nr01: "NR 01",
      nr04: "NR 04",
      nr05: "NR 05",
      nr06: "NR 06",
      nr07: "NR 07",
      nr10: "NR 10",
      nr11: "NR 11",
      nr12: "NR 12",
      nr13: "NR 13",
      nr15: "NR 15",
      nr16: "NR 16",
      nr23: "NR 23",
      licencasAmbientais: "Licenças Ambientais",
      legislacaoMaritima: "Legislação Marítima",
      treinamentos: "Treinamentos Obrigatórios",
      gestaoSMS: "Gestão de SMS",
    };

    // Estrutura de questões por bloco para verificação de completude
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
    };

    // Função para verificar se um bloco está completo
    const isBlockComplete = (blockKey: string): boolean => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;

      const questions = blockQuestions[blockKey] || [];
      const blockObj = bloco as unknown as {
        [key: string]: { resposta?: string } | unknown;
      };

      return questions.every((q) => {
        const questionObj = blockObj[q.key] as
          | { resposta?: string }
          | undefined;
        return (
          questionObj && questionObj.resposta && questionObj.resposta !== ""
        );
      });
    };

    // 1. Verificar NRs obrigatórias (sempre devem estar completas)
    MANDATORY_NR_BLOCKS.forEach((blockKey) => {
      if (!isBlockComplete(blockKey)) {
        missingNRs.push(NR_NAMES[blockKey] || blockKey);
      }
    });

    // 2. Verificar NRs opcionais (só se foram marcadas como aplicáveis)
    Object.keys(conformidade).forEach((blockKey) => {
      // Pular NRs obrigatórias (já verificadas acima)
      if (MANDATORY_NR_BLOCKS.includes(blockKey)) return;

      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return;

      const blockObj = bloco as unknown as {
        aplicavel?: boolean;
        [key: string]: unknown;
      };

      // Se o bloco está marcado como aplicável mas não está completo
      if (blockObj.aplicavel === true && !isBlockComplete(blockKey)) {
        missingNRs.push(NR_NAMES[blockKey] || blockKey);
      }
    });

    return missingNRs;
  }, [state.formData.conformidadeLegal]);

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

      // Identificar NRs obrigatórias que estão faltando
      const missingNRs = getMissingNRs();
      if (missingNRs.length > 0) {
        // Mostrar até 3 NRs obrigatórias
        const nrsToShow = missingNRs.slice(0, 3);
        const nrText = nrsToShow.join(", ");
        if (missingNRs.length > 3) {
          missingFields.push(`${nrText}, entre outros...`);
        } else {
          missingFields.push(nrText);
        }
      } else {
        missingFields.push("Questões NR pendentes");
      }
    }

    // Verificar Serviços Especializados
    const servicosOK = isServicosEspeciaisValid();
    if (servicosOK) {
      completedSteps++;
    } else if (dadosGeraisOK && conformidadeOK) {
      currentStepName = "Serviços Especializados";
      missingFields.push("Certificados pendentes");
    }

    // Determinar próxima etapa baseada na etapa atual
    const currentStep = state.currentStep || 1;
    if (currentStep === 1) {
      // Se estamos na etapa 1 (Dados Gerais), próxima é Conformidade Legal
      nextStepName = "Conformidade Legal";
    } else if (currentStep === 2) {
      // Se estamos na etapa 2 (Conformidade Legal), próxima é Serviços Especializados
      nextStepName = "Serviços Especializados";
    } else if (currentStep === 3) {
      // Se estamos na etapa 3 (Serviços Especializados), próxima é Revisão Final
      nextStepName = "Revisão Final";
    } else {
      // Se estamos na etapa 4 (Revisão Final), não há próxima etapa
      nextStepName = "";
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
        // Limpar todos os erros anteriores e definir apenas os novos
        dispatch({ type: "CLEAR_FIELD_ERRORS" });
        dispatch({ type: "SET_FIELD_ERRORS", payload: fieldErrors });
      }
      return;
    }

    // Se for válido, limpar todos os erros e mostrar confirmação
    if (dispatch) {
      dispatch({ type: "CLEAR_FIELD_ERRORS" });
    }
    setShowConfirmDialog(true);
  };

  // Função para atualizar progresso real
  const updateProgress = (percent: number, step: string): void => {
    setRealProgress(percent);
    setCurrentStep(step);
    console.log(`[FLOATING SAVE PROGRESSO] ${percent}%: ${step}`);
  };

  // Handler para salvar com progresso visual (chamado após confirmação)
  const handleSaveWithProgress = async (): Promise<void> => {
    setIsSaving(true);

    // 🔥 ATIVAR PROGRESSO REAL
    setUseRealProgress(true);
    setLoadingVisible(true);
    updateProgress(0, "Iniciando salvamento...");

    try {
      updateProgress(10, "Preparando dados para salvamento...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      updateProgress(25, "Validando campos obrigatórios...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      updateProgress(50, "Salvando informações no SharePoint...");
      await actions.saveFormData();

      updateProgress(85, "Processando anexos...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateProgress(95, "Finalizando salvamento...");
      await new Promise((resolve) => setTimeout(resolve, 200));

      updateProgress(100, "Rascunho salvo com sucesso!");

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

      // Mostrar toast de erro
      setToastMessage("Erro ao salvar o rascunho. Tente novamente.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsSaving(false);
      setLoadingVisible(false); // 🔥 Garantir que o loading seja fechado

      // 🔥 Resetar progresso real para próxima operação
      setTimeout(() => {
        setUseRealProgress(false);
        setRealProgress(0);
        setCurrentStep("");
      }, 1000); // Pequeno delay para o usuário ver o 100%
    }
  };

  // Não mostrar o botão na última etapa (Revisão Final)
  if (state.currentStep === 4) {
    return <></>;
  }

  return (
    <>
      {/* Overlay de loading */}
      {loadingVisible && (
        <LoadingOverlay
          visible={loadingVisible}
          message={currentStep || "Processando..."}
          operationType="save"
          fileCount={Object.values(state.attachments || {}).reduce(
            (total, files) => {
              return total + (Array.isArray(files) ? files.length : 0);
            },
            0
          )}
          showTimeWarning={true}
          // 🔥 Novos props para progresso real
          useRealProgress={useRealProgress}
          currentProgress={realProgress}
          currentStep={currentStep}
        />
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
          isSaving || loadingVisible ? styles.processing : ""
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
                  <span
                    style={{
                      fontSize: "18px",
                      marginRight: "4px",
                      marginLeft: "10px",
                    }}
                  >
                    ✅
                  </span>
                </div>
              )}
              text="Revisar e Submeter"
              onClick={handleReviewAndSubmit}
              disabled={isSaving || state.isSubmitting || loadingVisible}
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
                  <span
                    style={{
                      fontSize: "18px",
                      marginRight: "4px",
                      marginLeft: "10px",
                    }}
                  >
                    💾
                  </span>
                </div>
              )}
              text={isSaving ? "Salvando..." : "Salvar Rascunho"}
              onClick={handleSaveClick}
              disabled={isSaving || state.isSubmitting || loadingVisible}
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

        {/* LoadingOverlay adicional */}
        <LoadingOverlay
          visible={loadingVisible}
          message={currentStep || "Processando..."}
          operationType="save"
          fileCount={Object.values(state.attachments || {}).reduce(
            (total, files) => {
              return total + (Array.isArray(files) ? files.length : 0);
            },
            0
          )}
          showTimeWarning={true}
        />

        {/* Dialog de confirmação para salvar rascunho */}
        <Dialog
          hidden={!showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: "Confirmar Salvamento",
            subText:
              "Tem certeza que deseja salvar o rascunho do formulário HSE? Após salvar, você poderá fechar a página e continuar de onde parou a qualquer hora.",
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
          }}
        >
          {/* Mensagem de alerta destacada */}
          <div className={styles.alertMessage}>
            <div className={styles.alertIcon}>⚠️</div>
            <div className={styles.alertText}>
              <strong>IMPORTANTE:</strong> Oceaneering irá avaliar apenas os
              formulários finalizados e submetidos.
            </div>
          </div>
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
