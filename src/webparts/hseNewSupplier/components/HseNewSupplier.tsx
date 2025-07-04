import * as React from "react";
import {
  Nav,
  INavLink,
  Text,
  MessageBar,
  MessageBarType,
  Stack,
  Spinner,
  Icon,
} from "@fluentui/react";
import { useHSEForm, HSEFormProvider } from "./context/HSEFormContext";
import { DadosGerais } from "./formBlocks/DadosGerais/DadosGerais";
import { ConformidadeLegal } from "./formBlocks/ConformidadeLegal/ConformidadeLegal";
import { ServicosEspeciais } from "./formBlocks/ServicosEspeciais/ServicosEspeciais";
import { RevisaoFinal } from "./formBlocks/RevisaoFinal/RevisaoFinal";
import { InitialScreen } from "./screens/InitialScreen";
import { FORM_STEPS, NR_QUESTIONS_MAP } from "../utils/formConstants";
import { IHseNewSupplierProps } from "./IHseNewSupplierProps";
import { ICNPJVerificationResult } from "../types/IApplicationPhase";
import styles from "./HseNewSupplier.module.scss";
import { ProgressIndicator as CustomProgressIndicator } from "./common/ProgressIndicator/ProgressIndicator";
import { LoadingSpinner } from "./common/LoadingSpinner/LoadingSpinner";
import { FloatingSaveButton } from "./common/FloatingSaveButton/FloatingSaveButton";
import { formSelectors } from "./context/formReducer";
import { BackToHomeButton } from "./common/BackToHomeButton/BackToHomeButton";
import { Footer } from "./common/Footer/Footer";
import { useSharePointHeaderOverrides } from "../hooks/useSharePointOverrides";

// Componente interno que usa os hooks do contexto HSE
const HseNewSupplierContent: React.FC = () => {
  // Hook para ocultar elementos do cabeçalho do SharePoint
  useSharePointHeaderOverrides();

  // Estados locais para controle de processamento e erros
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Hook do contexto HSE - SEMPRE é chamado, nunca condicionalmente
  const context = useHSEForm();

  // Verificação de segurança do contexto
  if (!context) {
    return (
      <MessageBar messageBarType={MessageBarType.error}>
        Erro: Contexto do formulário não foi inicializado. Recarregue a página.
      </MessageBar>
    );
  }

  // Extrair dados do contexto
  const { state, actions, dispatch, applicationPhase, currentUser } = context;
  const { currentStep, isLoading, validationErrors } = state;

  // Handler para quando CNPJ é verificado na tela inicial
  const handleCNPJVerified = React.useCallback(
    async (result: ICNPJVerificationResult) => {
      if (!result) {
        setError("Erro na verificação do CNPJ");
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        if (
          result.exists &&
          result.itemId &&
          result.allowEdit &&
          result.isOwner
        ) {
          // Carregar formulário existente
          if (
            actions?.loadExistingForm &&
            typeof actions.loadExistingForm === "function"
          ) {
            await actions.loadExistingForm(result.itemId);
          } else {
            throw new Error("Função de carregamento não disponível");
          }

          // Mudar para fase do formulário
          if (
            actions?.setApplicationPhase &&
            typeof actions.setApplicationPhase === "function"
          ) {
            actions.setApplicationPhase({
              phase: "FORMULARIO",
              cnpj: result.cnpj,
              existingItemId: result.itemId,
              isOverwrite: true,
              requiresApproval: result.requiresApproval,
            });
          } else {
            throw new Error("Função de mudança de fase não disponível");
          }
        } else if (!result.exists) {
          // Novo formulário
          if (
            actions?.startNewForm &&
            typeof actions.startNewForm === "function"
          ) {
            actions.startNewForm(result.cnpj);
          } else {
            throw new Error("Função startNewForm não disponível");
          }

          // Mudar para a fase do formulário
          if (
            actions?.setApplicationPhase &&
            typeof actions.setApplicationPhase === "function"
          ) {
            actions.setApplicationPhase({
              phase: "FORMULARIO",
              cnpj: result.cnpj,
              isOverwrite: false,
              requiresApproval: false,
            });
          } else {
            throw new Error("Função setApplicationPhase não disponível");
          }
        } else {
          // Formulário existe mas não pode ser editado
          setError(
            "Você não tem permissão para editar este formulário ou ele já foi aprovado."
          );
        }
      } catch (error) {
        setError(`Erro: ${(error as Error).message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [actions]
  );

  // Helper para obter erros por etapa
  const getErrorsForStep = React.useCallback(
    (step: number): { [key: string]: string } => {
      const stepErrors: { [key: string]: string } = {};
      const stepSections = [
        "dadosGerais",
        "conformidadeLegal",
        "servicosEspeciais",
      ];
      const sectionName = stepSections[step - 1];

      if (!validationErrors || !Array.isArray(validationErrors)) {
        return stepErrors;
      }

      validationErrors
        .filter((error) => error.section === sectionName)
        .forEach((error) => {
          stepErrors[error.field] = error.message;
        });

      return stepErrors;
    },
    [validationErrors]
  );

  // Remover função não utilizada
  // const isStepCompleted = React.useCallback(
  //   (stepId: number): boolean => {
  //     const step = FORM_STEPS.find((s) => s.id === stepId);
  //     if (!step || !state?.formData) return false;

  //     const { formData, attachments } = state;

  //     // Verificar campos obrigatórios
  //     const isFieldsComplete = step.requiredFields.every((field: string) => {
  //       const fieldPath = field.split(".");
  //       let value: unknown = formData;

  //       for (const prop of fieldPath) {
  //         if (value && typeof value === "object" && prop in value) {
  //           value = (value as Record<string, unknown>)[prop];
  //         } else {
  //           value = undefined;
  //           break;
  //         }
  //       }

  //       return value !== undefined && value !== null && value !== "";
  //     });

  //     // Verificar anexos obrigatórios
  //     const isAttachmentsComplete = step.requiredAttachments.every(
  //       (category: string) => {
  //         return (attachments?.[category] || []).length > 0;
  //       }
  //     );

  //     return isFieldsComplete && isAttachmentsComplete;
  //   },
  //   [state]
  // );

  // Função para validar se todos os campos obrigatórios dos Dados Gerais estão preenchidos (inclui anexo REM)
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
    // Anexo REM obrigatório
    const remOk = attachments.rem && attachments.rem.length > 0;
    return camposOk && remOk;
  }, [state.formData, state.attachments]);

  // Função para validar Conformidade Legal (versão simplificada - usa a mesma lógica dos checks individuais)
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

    // IMPORTANTE: Para cada bloco aplicável, usar a MESMA lógica de validação do componente ConformidadeLegal
    // Isso garante que o check da sidebar só apareça quando TODOS os checks individuais estão verdes

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
    };

    // Função para verificar se um bloco individual está completo (MESMA LÓGICA do ConformidadeLegal)
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
    };

    // Verificar se TODOS os blocos aplicáveis estão completos (têm check verde individual)
    return applicableBlocks.every((blockKey) => isBlockComplete(blockKey));
  }, [state.formData, state.attachments]);

  // Função para validar Serviços Especializados
  const isServicosEspeciaisValid = React.useCallback(() => {
    const { servicosEspeciais } = state.formData;
    const attachments = state.attachments || {};
    if (!servicosEspeciais) return true;
    // Se nenhum serviço selecionado, está válido
    if (
      !servicosEspeciais.fornecedorEmbarcacoes &&
      !servicosEspeciais.fornecedorIcamento
    )
      return true;
    // Se embarcações, precisa de todos os certificados obrigatórios
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
    // Se içamento, precisa de todos os documentos obrigatórios
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

  // Handlers para mudanças nos formulários
  const handleDadosGeraisChange = React.useCallback(
    (field: string, value: unknown): void => {
      if (!dispatch) return;

      const currentDadosGerais = state?.formData?.dadosGerais || {};
      const updatedDadosGerais = {
        ...currentDadosGerais,
        [field]: value,
      };

      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          field: "dadosGerais",
          value: updatedDadosGerais,
        },
      });
    },
    [state?.formData?.dadosGerais, dispatch]
  );

  const handleConformidadeLegalChange = React.useCallback(
    (field: string, value: unknown): void => {
      if (!dispatch) return;

      const currentConformidade = state?.formData?.conformidadeLegal || {};
      const updatedConformidade = {
        ...currentConformidade,
        [field]: value,
      };

      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          field: "conformidadeLegal",
          value: updatedConformidade,
        },
      });
    },
    [state?.formData?.conformidadeLegal, dispatch]
  );

  const handleServicosEspeciaisChange = React.useCallback(
    (field: string, value: unknown): void => {
      if (!dispatch) return;

      const currentServicos = state?.formData?.servicosEspeciais || {};
      const updatedServicos = {
        ...currentServicos,
        [field]: value,
      };

      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          field: "servicosEspeciais",
          value: updatedServicos,
        },
      });
    },
    [state?.formData?.servicosEspeciais, dispatch]
  );

  // Renderizar etapa atual
  const renderCurrentStep = React.useCallback((): JSX.Element => {
    if (!state?.formData) {
      return <div>Carregando dados do formulário...</div>;
    }

    switch (currentStep) {
      case 1:
        return (
          <DadosGerais
            value={state.formData.dadosGerais || {}}
            onChange={handleDadosGeraisChange}
            errors={getErrorsForStep(1)}
          />
        );
      case 2:
        return (
          <ConformidadeLegal
            value={state.formData.conformidadeLegal || {}}
            onChange={handleConformidadeLegalChange}
            errors={getErrorsForStep(2)}
          />
        );
      case 3:
        return (
          <ServicosEspeciais
            value={state.formData.servicosEspeciais || {}}
            onChange={handleServicosEspeciaisChange}
            errors={getErrorsForStep(3)}
          />
        );
      case 4:
        return <RevisaoFinal />;
      default:
        return (
          <DadosGerais
            value={state.formData.dadosGerais || {}}
            onChange={handleDadosGeraisChange}
            errors={getErrorsForStep(1)}
          />
        );
    }
  }, [
    currentStep,
    state?.formData,
    handleDadosGeraisChange,
    handleConformidadeLegalChange,
    handleServicosEspeciaisChange,
    getErrorsForStep,
  ]);

  // Funções utilitárias - Nova lógica de progresso baseada em completude real das etapas
  const getProgressPercentage = React.useCallback((): number => {
    let completedSteps = 0;
    const totalSteps = 3; // Apenas as três primeiras etapas contam para o progresso (Dados Gerais, Conformidade Legal, Serviços Especializados)

    // Verificar se Dados Gerais está completa (step 1)
    if (isDadosGeraisValid()) {
      completedSteps++;
    }

    // Verificar se Conformidade Legal está completa (step 2)
    if (isConformidadeLegalValid()) {
      completedSteps++;
    }

    // Verificar se Serviços Especializados está completa (step 3)
    if (isServicosEspeciaisValid()) {
      completedSteps++;
    }

    // Retorna porcentagem baseada nas etapas realmente concluídas
    return Math.round((completedSteps / totalSteps) * 100);
  }, [isDadosGeraisValid, isConformidadeLegalValid, isServicosEspeciaisValid]);

  const getCurrentStepInfo = React.useCallback(() => {
    return FORM_STEPS.find((step) => step.id === currentStep) || FORM_STEPS[0];
  }, [currentStep]);

  // Links de navegação com status de etapa
  const navLinks: INavLink[] = React.useMemo(() => {
    return FORM_STEPS.map((step) => {
      return {
        name: step.title,
        key: step.id.toString(),
        icon: step.icon,
        url: "",
        isExpanded: currentStep === step.id,
        disabled: !formSelectors.canProceedToStep(state, step.id),
        onClick: (ev?: React.MouseEvent<HTMLElement>) => {
          ev?.preventDefault();
          if (!formSelectors.canProceedToStep(state, step.id) || !dispatch)
            return;
          dispatch({ type: "SET_CURRENT_STEP", payload: step.id });
        },
      };
    });
  }, [currentStep, state, dispatch]);

  // useEffect para aplicar estilos customizados aos links desabilitados
  React.useEffect(() => {
    const applyDisabledStyles = (): void => {
      // Encontrar todos os links de navegação
      const navLinks = document.querySelectorAll(".ms-Nav-link");
      navLinks.forEach((link, index) => {
        const stepId = index + 1; // IDs dos steps começam em 1
        const isDisabled = !formSelectors.canProceedToStep(state, stepId);
        const linkText = link.querySelector(".ms-Nav-linkText") as HTMLElement;

        if (linkText) {
          if (isDisabled) {
            linkText.style.color = "#adb5bd";
            linkText.style.opacity = "0.6";
            link.setAttribute("aria-disabled", "true");
          } else {
            linkText.style.color = "";
            linkText.style.opacity = "";
            link.removeAttribute("aria-disabled");
          }
        }
      });
    };

    // Aplicar estilos imediatamente
    applyDisabledStyles();

    // Aplicar novamente após um pequeno delay para garantir que o DOM foi renderizado
    const timeoutId = setTimeout(applyDisabledStyles, 100);

    return () => clearTimeout(timeoutId);
  }, [currentStep, state]);

  // Renderização baseada no estado
  if (isProcessing) {
    return (
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        styles={{ root: { minHeight: 200 } }}
      >
        <Spinner label="Processando..." size={3} />
      </Stack>
    );
  }

  // Fase de entrada - Tela inicial com informações do usuário
  if (!applicationPhase || applicationPhase.phase === "ENTRADA") {
    return (
      <Stack tokens={{ childrenGap: 16 }}>
        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setError(null)}
          >
            {error}
          </MessageBar>
        )}
        <InitialScreen onCNPJVerified={handleCNPJVerified} />
      </Stack>
    );
  }

  // Loading geral
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner label="Carregando formulário..." size="large" />
      </div>
    );
  }

  // Formulário principal
  return (
    <div className={styles.hseNewSupplier}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Text variant="xxLarge" className={styles.title}>
              Auto-avaliação de HSE para Contratadas
            </Text>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.stepInfo}>
              <Text variant="medium" className={styles.stepText}>
                Etapa {currentStep} de {FORM_STEPS.length}
              </Text>
              <Text variant="large" className={styles.currentStepTitle}>
                {getCurrentStepInfo().title}
              </Text>
            </div>
            <CustomProgressIndicator
              percentComplete={getProgressPercentage() / 100}
              description={`${getProgressPercentage()}% concluído (${Math.round(
                (getProgressPercentage() / 100) * 3
              )} de 3 etapas)`}
              className={styles.progressBar}
              label="Progresso do formulário"
              showLabel
            />
          </div>
          <div className={styles.logoSection}>
            <img
              src={require("../assets/logo-white.png")}
              alt="Oceaneering Logo"
              className={styles.headerLogo}
            />
          </div>
        </div>
      </div>

      {validationErrors && validationErrors.length > 0 && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline
          onDismiss={() =>
            dispatch && dispatch({ type: "CLEAR_VALIDATION_ERRORS" })
          }
          className={styles.errorBar}
        >
          <Text variant="medium">
            {validationErrors.length} erro(s) encontrado(s):
          </Text>
          <ul>
            {validationErrors.map((error, index: number) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </MessageBar>
      )}

      <div className={styles.container}>
        <div className={styles.navigation}>
          <div className={styles.navHeader}>
            <img
              src={require("../assets/logo-blue.png")}
              alt="Oceaneering Logo"
              className={styles.navLogo}
            />
            <Text variant="medium" className={styles.navTitle}>
              Sistema HSE
            </Text>
          </div>
          <Nav
            groups={[{ links: navLinks }]}
            selectedKey={currentStep.toString()}
            className={styles.navPanel}
            onRenderLink={(link, defaultRender) => {
              if (!link || !defaultRender) return null;
              let isCompleted = false;
              const stepId = parseInt(link.key || "0");
              if (stepId === 1) isCompleted = isDadosGeraisValid();
              if (stepId === 2) isCompleted = isConformidadeLegalValid();
              if (stepId === 3) isCompleted = isServicosEspeciaisValid();

              const linkElement = defaultRender(link);

              return (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {linkElement}
                  {isCompleted && stepId !== 4 && (
                    <Icon
                      iconName="CheckMark"
                      style={{ color: "#107c10", marginLeft: 8, fontSize: 18 }}
                    />
                  )}
                </span>
              );
            }}
          />

          {/* Mensagem sobre dados obrigatórios para salvar rascunho */}
          <div className={styles.stepBlockedMessage}>
            <Icon iconName="Save" className={styles.stepBlockedIcon} />
            <span>
              Para Salvar Rascunho, necessário preencher os itens obrigatórios
              da aba de Dados Gerais.
            </span>
          </div>

          {/* Mensagem de aviso quando Revisão Final está desabilitada */}
          {!formSelectors.canProceedToStep(state, 4) && (
            <div className={styles.stepBlockedMessage}>
              <Icon iconName="Info" className={styles.stepBlockedIcon} />
              <span>
                Para liberar a revisão final e submissão do formulário,
                necessário completar as etapas de Dados Gerais, Conformidade
                Legal e Serviços Especializados.
              </span>
            </div>
          )}

          {/* Informação do usuário na navbar - integrado ao botão Voltar */}
          <div style={{ marginTop: "auto" }}>
            {/* Informação do usuário */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #e1dfdd",
                backgroundColor: "#faf9f8",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#0078d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {(() => {
                    const userName = currentUser?.displayName || "Usuário";
                    return userName
                      .split(" ")
                      .slice(0, 2)
                      .map((name) => name.charAt(0).toUpperCase())
                      .join("");
                  })()}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#323130",
                    lineHeight: "20px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.displayName || "Usuário"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#605e5c",
                    lineHeight: "16px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.email || "email@exemplo.com"}
                </div>
              </div>
            </div>

            {/* Botão Voltar ao Início - sem espaçamento */}
            <div className={styles.navFooter} style={{ marginTop: 0 }}>
              <BackToHomeButton />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.stepContainer}>{renderCurrentStep()}</div>
        </div>
      </div>

      {/* Botão flutuante de salvar para as três primeiras etapas */}
      <FloatingSaveButton />

      {/* Rodapé do sistema */}
      <Footer />
    </div>
  );
};

// Componente principal exportado que envolve o conteúdo com o Provider
const HseNewSupplier: React.FC<IHseNewSupplierProps> = (props) => {
  try {
    return (
      <HSEFormProvider
        context={props.context}
        sharePointConfig={{
          siteUrl: props.context.pageContext.web.absoluteUrl,
          listName: props.sharePointListName,
          documentLibraryName: props.sharePointDocumentLibraryName,
        }}
        maxFileSize={props.maxFileSize}
        debugMode={props.enableDebugMode}
      >
        <HseNewSupplierContent />
      </HSEFormProvider>
    );
  } catch (renderError) {
    console.error("Erro ao renderizar HSE New Supplier:", renderError);
    return (
      <MessageBar messageBarType={MessageBarType.error}>
        Erro ao inicializar o formulário. Recarregue a página e tente novamente.
      </MessageBar>
    );
  }
};

export default HseNewSupplier;
