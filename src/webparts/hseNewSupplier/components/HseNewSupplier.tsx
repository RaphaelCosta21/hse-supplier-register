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
import { FORM_STEPS } from "../utils/formConstants";
import { IHseNewSupplierProps } from "./IHseNewSupplierProps";
import { ICNPJVerificationResult } from "../types/IApplicationPhase";
import styles from "./HseNewSupplier.module.scss";
import { ProgressIndicator as CustomProgressIndicator } from "./common/ProgressIndicator/ProgressIndicator";
import { LoadingSpinner } from "./common/LoadingSpinner/LoadingSpinner";
import { FloatingSaveButton } from "./common/FloatingSaveButton/FloatingSaveButton";
import { formSelectors } from "./context/formReducer";
import { BackToHomeButton } from "./common/BackToHomeButton/BackToHomeButton";

// Componente interno que usa os hooks do contexto HSE
const HseNewSupplierContent: React.FC = () => {
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
  const { state, actions, dispatch, applicationPhase } = context;
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

  // Função para validar Conformidade Legal (navbar só mostra check se TODOS os blocos aplicáveis tiverem check verde)
  const isConformidadeLegalValid = React.useCallback(() => {
    const conformidade = state.formData.conformidadeLegal || {};

    // Estrutura dos blocos (deve ser igual ao do componente ConformidadeLegal)
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

    // Reconstrói o applicableBlocks: um bloco é aplicável se o objeto do bloco existe (foi inicializado pelo toggle)
    const applicableBlocks: { [key: string]: boolean } = {};
    NR_BLOCKS.forEach((block) => {
      const bloco = conformidade[block.key as keyof typeof conformidade];
      if (bloco && typeof bloco === "object") {
        applicableBlocks[block.key] = true;
      }
    });

    // Função para saber se o bloco está "completo" (check verde individual)
    const isBlockComplete = (
      blockKey: string,
      questions: Array<{ key: string }>
    ): boolean => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;
      // Para o bloco estar completo, todas as questões devem ter resposta preenchida (SIM, NÃO ou NA)
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

    // Lista de blocos aplicáveis
    const blocosAplicaveis = NR_BLOCKS.filter(
      (block) => applicableBlocks[block.key]
    );
    if (blocosAplicaveis.length === 0) return false;
    // Só mostra check verde se TODOS os blocos aplicáveis estão completos
    return blocosAplicaveis.every((block) =>
      isBlockComplete(block.key, block.questions)
    );
  }, [state.formData]);

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

  // Funções utilitárias
  const getProgressPercentage = React.useCallback((): number => {
    return Math.round((currentStep / FORM_STEPS.length) * 100);
  }, [currentStep]);

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
              description={`${getProgressPercentage()}% concluído`}
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
            className={styles.navPanel}
            onRenderLink={(link, defaultRender) => {
              if (!link || !defaultRender) return null;
              let isCompleted = false;
              const stepId = parseInt(link.key || "0");
              if (stepId === 1) isCompleted = isDadosGeraisValid();
              if (stepId === 2) isCompleted = isConformidadeLegalValid();
              if (stepId === 3) isCompleted = isServicosEspeciaisValid();
              // Revisão Final nunca mostra check
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

          {/* Botão Voltar ao Início na navbar */}
          <div className={styles.navFooter}>
            <BackToHomeButton />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.stepContainer}>{renderCurrentStep()}</div>
        </div>
      </div>

      {/* Botão flutuante de salvar para as três primeiras etapas */}
      <FloatingSaveButton />
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
