import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  formReducer,
  initialFormState,
  IFormState,
  FormAction,
} from "./formReducer";
import { SharePointService } from "../../services/SharePointService";
import { SharePointFileService } from "../../services/SharePointFileService";
import { IHSEFormData, IValidationError } from "../../types/IHSEFormData";
import { IAttachmentMetadata } from "../../types/IAttachmentMetadata";
import {
  ICNPJVerificationResult,
  IApplicationPhase,
  IUserFormSummary,
} from "../../types/IApplicationPhase";

export interface IHSEFormContext {
  state: IFormState;
  dispatch: React.Dispatch<FormAction>;
  sharePointService: SharePointService;
  sharePointFileService: SharePointFileService;
  // Novo estado de fase
  applicationPhase: IApplicationPhase;
  // Informações do usuário atual
  currentUser: {
    displayName: string;
    email: string;
    loginName: string;
  };
  actions: {
    // Funcionalidades existentes
    loadFormData: (formId?: number) => Promise<void>;
    saveFormData: () => Promise<boolean>;
    submitForm: () => Promise<boolean>;
    uploadAttachment: (
      file: File,
      category: string,
      subcategory?: string
    ) => Promise<IAttachmentMetadata>;
    removeAttachment: (category: string, attachmentId: string) => Promise<void>;
    validateStep: (stepNumber: number) => Promise<boolean>;
    triggerSubmissionValidation: () => Promise<boolean>;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    resetForm: () => void;
    // Novas funcionalidades para CNPJ
    verifyCNPJ: (cnpj: string) => Promise<ICNPJVerificationResult>;
    loadExistingForm: (itemId: number) => Promise<void>;
    startNewForm: (cnpj: string) => void;
    setApplicationPhase: (phase: IApplicationPhase) => void;
    // Novas funcionalidades para gerenciamento do usuário
    getUserForms: () => Promise<IUserFormSummary[]>;
    searchCNPJWithSecurity: (cnpj: string) => Promise<ICNPJVerificationResult>;
  };
}

interface IHSEFormProviderProps {
  context: WebPartContext;
  sharePointConfig: {
    siteUrl: string;
    listName: string;
    documentLibraryName: string;
  };
  maxFileSize: number;
  debugMode: boolean;
  children: React.ReactNode;
}

// Criar o contexto com valor padrão
export const HSEFormContext = React.createContext<IHSEFormContext | undefined>(
  undefined
);

// Hook customizado para acessar o contexto
export const useHSEForm = (): IHSEFormContext => {
  const context = React.useContext(HSEFormContext);
  if (!context) {
    throw new Error("useHSEForm deve ser usado dentro de um HSEFormProvider");
  }
  return context;
};

// Componente Provider
export const HSEFormProvider: React.FC<IHSEFormProviderProps> = ({
  context,
  sharePointConfig,
  maxFileSize,
  debugMode,
  children,
}) => {
  const [state, dispatch] = React.useReducer(formReducer, initialFormState);
  // Inicialização dos serviços SharePoint
  const sharePointService = React.useMemo(() => {
    return new SharePointService(context, "hse-new-register");
  }, [context]);
  const sharePointFileService = React.useMemo(() => {
    return new SharePointFileService(
      context,
      sharePointConfig.documentLibraryName
    );
  }, [context, sharePointConfig.documentLibraryName]);

  // Carregar dados do formulário do SharePoint (se existir)
  const loadFormData = React.useCallback(
    async (formId?: number) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        if (formId) {
          // Carregar formulário existente
          const loadedFormData = await sharePointService.getFormById(formId);
          if (loadedFormData) {
            dispatch({ type: "SET_FORM_DATA", payload: loadedFormData });
          }
        } else {
          // Tentar carregar do localStorage (rascunho)
          const savedFormData = localStorage.getItem("hse_form_draft");
          if (savedFormData) {
            const parsedData = JSON.parse(savedFormData) as IHSEFormData;
            dispatch({ type: "SET_FORM_DATA", payload: parsedData });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar formulário:", error);
        // Tratar erro de carregamento
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [sharePointService]
  ); // Salvar dados do formulário (como rascunho ou no SharePoint)
  const saveFormData = React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      // Salvar no localStorage como backup
      localStorage.setItem("hse_form_draft", JSON.stringify(state.formData));

      // Salvar anexos no SharePoint se houver dados suficientes
      let savedAttachments = state.attachments;
      const cnpj = state.formData.dadosGerais.cnpj;
      const empresa = state.formData.dadosGerais.empresa;

      if (cnpj && empresa && Object.keys(state.attachments).length > 0) {
        try {
          console.log("Salvando anexos no SharePoint...");
          savedAttachments = await sharePointFileService.saveFormAttachments(
            cnpj,
            empresa,
            state.attachments
          );
          console.log("Anexos salvos com sucesso");
        } catch (attachmentError) {
          console.warn(
            "Erro ao salvar anexos, continuando com dados do formulário:",
            attachmentError
          );
          // Continuar mesmo se houver erro nos anexos
        }
      }

      // Salvar no SharePoint
      await sharePointService.saveFormData(state.formData, savedAttachments);

      dispatch({ type: "SAVE_SUCCESS", payload: new Date() });
      return true;
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      return false;
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [
    sharePointService,
    sharePointFileService,
    state.formData,
    state.attachments,
  ]);

  // Validar uma etapa específica
  const validateStep = React.useCallback(
    async (stepNumber: number): Promise<boolean> => {
      const { formData, attachments } = state;
      const errors: IValidationError[] = [];

      // Função auxiliar para adicionar erro
      const addError = (field: string, message: string): void => {
        errors.push({ field, message, section: `Step ${stepNumber}` });
      };

      // Validação específica para cada etapa
      switch (stepNumber) {
        case 1: {
          // Validar Dados Gerais
          if (!formData.dadosGerais.empresa)
            addError("empresa", "O nome da empresa é obrigatório");
          if (!formData.dadosGerais.cnpj)
            addError("cnpj", "O CNPJ é obrigatório");
          else if (
            !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(
              formData.dadosGerais.cnpj
            )
          )
            addError("cnpj", "CNPJ inválido");

          if (!formData.dadosGerais.numeroContrato)
            addError("numeroContrato", "O número do contrato é obrigatório");
          if (!formData.dadosGerais.dataInicioContrato)
            addError(
              "dataInicioContrato",
              "A data de início do contrato é obrigatória"
            );
          if (!formData.dadosGerais.dataTerminoContrato)
            addError(
              "dataTerminoContrato",
              "A data de término do contrato é obrigatória"
            );

          // Validar que data de término é posterior à de início
          if (
            formData.dadosGerais.dataInicioContrato &&
            formData.dadosGerais.dataTerminoContrato &&
            new Date(formData.dadosGerais.dataInicioContrato) >=
              new Date(formData.dadosGerais.dataTerminoContrato)
          ) {
            addError(
              "dataTerminoContrato",
              "A data de término deve ser posterior à de início"
            );
          }

          // REM é opcional para testes
          // const remAttachments = attachments.rem || [];
          // if (remAttachments.length === 0) {
          //   addError("rem", "O Resumo Estatístico Mensal (REM) é obrigatório");
          // }

          break;
        }
        case 2: {
          // Validação da Conformidade Legal
          // A lógica completa depende das respostas do formulário
          break;
        }

        case 3: {
          // Validação dos Serviços Especializados
          // Validar embarcações
          if (formData.servicosEspeciais.fornecedorEmbarcacoes) {
            // Verificar certificados marítimos obrigatórios
            const requiredCertificates = [
              "iopp",
              "registroArmador",
              "propriedadeMaritima",
            ];

            requiredCertificates.forEach((cert) => {
              const certAttachments = attachments[cert] || [];
              if (certAttachments.length === 0) {
                addError(
                  cert,
                  `O certificado ${cert.toUpperCase()} é obrigatório`
                );
              }
            });
          }

          // Validar içamento
          if (formData.servicosEspeciais.fornecedorIcamento) {
            // Verificar documentos técnicos obrigatórios
            const requiredDocuments = ["testeCarga", "registroCREA", "art"];

            requiredDocuments.forEach((doc) => {
              const docAttachments = attachments[doc] || [];
              if (docAttachments.length === 0) {
                addError(doc, `O documento ${doc} é obrigatório`);
              }
            });
          }
          break;
        }

        case 4: {
          // Revisão final - verificar todas as validações anteriores
          const allStepsValid = await Promise.all(
            [1, 2, 3].map((step) => validateStep(step))
          ).then((results) => results.every(Boolean));

          if (!allStepsValid) {
            addError(
              "formCompleto",
              "Existem erros em etapas anteriores que precisam ser corrigidos"
            );
          }

          break;
        }
      }

      // Only set validation errors if submission has been attempted
      if (state.submissionAttempted) {
        dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
      }
      return errors.length === 0;
    },
    [state]
  );
  // Trigger submission validation - show all validation errors
  const triggerSubmissionValidation =
    React.useCallback(async (): Promise<boolean> => {
      dispatch({ type: "SET_SUBMISSION_ATTEMPTED", payload: true }); // Validate all steps and force showing errors
      const allStepsValid = await Promise.all(
        [1, 2, 3, 4].map((step) => validateStep(step))
      ).then((results) => results.every(Boolean));

      return allStepsValid;
    }, [validateStep]); // Enviar formulário (versão final)
  const submitForm = React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });

    // Validar todas as etapas antes do envio
    const allStepsValid = await triggerSubmissionValidation();

    if (!allStepsValid) {
      dispatch({ type: "SET_SUBMITTING", payload: false });
      return false;
    }

    try {
      // Salvar anexos no SharePoint primeiro
      let savedAttachments = state.attachments;
      const cnpj = state.formData.dadosGerais.cnpj;
      const empresa = state.formData.dadosGerais.empresa;

      if (cnpj && empresa && Object.keys(state.attachments).length > 0) {
        savedAttachments = await sharePointFileService.saveFormAttachments(
          cnpj,
          empresa,
          state.attachments
        );
      }

      // Marcar como "Enviado" no SharePoint
      await sharePointService.submitFormData(
        {
          ...state.formData,
          statusFormulario: "Enviado",
        },
        savedAttachments
      );

      // Limpar rascunho local após envio bem-sucedido
      localStorage.removeItem("hse_form_draft");

      return true;
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      return false;
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [
    sharePointService,
    sharePointFileService,
    state.formData,
    state.attachments,
    triggerSubmissionValidation,
  ]); // Fazer upload de anexo (apenas armazenamento local)
  const uploadAttachment = React.useCallback(
    async (
      file: File,
      category: string,
      subcategory?: string
    ): Promise<IAttachmentMetadata> => {
      try {
        console.log(`=== UPLOAD ATTACHMENT PARA CATEGORIA: ${category} ===`);
        console.log(
          "Armazenando arquivo apenas localmente (não será salvo no SharePoint até clicar em Salvar/Submeter)"
        );

        // Criar metadata local sem fazer upload para SharePoint
        const localMetadata = sharePointFileService.createLocalFileMetadata(
          file,
          category,
          subcategory
        );

        // Registrar o anexo no estado do formulário (armazenamento local apenas)
        dispatch({
          type: "ADD_ATTACHMENT",
          payload: {
            category,
            attachment: localMetadata,
          },
        });

        console.log(
          `Arquivo ${file.name} armazenado localmente para categoria ${category}`
        );
        console.log(
          "O arquivo será salvo no SharePoint apenas quando o usuário clicar em 'Salvar' ou 'Submeter'"
        );

        return localMetadata;
      } catch (error) {
        console.error("Erro ao processar anexo:", error);
        if (debugMode) {
          console.error("Debug - Upload Error:", error);
        }
        throw error;
      }
    },
    [sharePointFileService, debugMode]
  ); // Remover anexo
  const removeAttachment = React.useCallback(
    async (category: string, attachmentId: string): Promise<void> => {
      try {
        // Verificar se o anexo existe
        const attachments = state.attachments[category] || [];
        const attachment = attachments.find(
          (a: IAttachmentMetadata) => a.id === attachmentId
        );

        if (attachment) {
          // Se o arquivo já foi salvo no SharePoint, remover de lá também
          if (attachment.sharepointItemId) {
            await sharePointFileService.deleteFile(attachment.sharepointItemId);
          }

          // Remover do estado local
          dispatch({
            type: "REMOVE_ATTACHMENT",
            payload: { category, attachmentId },
          });

          console.log(
            `Arquivo ${attachment.originalName} removido da categoria ${category}`
          );
        }
      } catch (error) {
        console.error("Erro ao remover anexo:", error);
        if (debugMode) {
          console.error("Debug - Remove Attachment Error:", error);
        }
        throw error;
      }
    },
    [sharePointFileService, state.attachments, debugMode]
  );

  // Navegação de etapas
  const goToNextStep = React.useCallback(() => {
    const { currentStep } = state;
    if (currentStep < 5) {
      dispatch({ type: "SET_CURRENT_STEP", payload: currentStep + 1 });
    }
  }, [state.currentStep]);

  const goToPreviousStep = React.useCallback(() => {
    const { currentStep } = state;
    if (currentStep > 1) {
      dispatch({ type: "SET_CURRENT_STEP", payload: currentStep - 1 });
    }
  }, [state.currentStep]);
  // Reset do formulário
  const resetForm = React.useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    localStorage.removeItem("hse_form_draft");
  }, []);

  // Nova funcionalidade: Estado da fase da aplicação
  const [applicationPhase, setApplicationPhaseState] =
    React.useState<IApplicationPhase>({
      phase: "ENTRADA",
    });
  // Nova funcionalidade: Verificar CNPJ
  const verifyCNPJ = React.useCallback(
    async (cnpj: string): Promise<ICNPJVerificationResult> => {
      try {
        console.log("=== INICIANDO VERIFICAÇÃO DE CNPJ ===");
        console.log("CNPJ recebido:", cnpj);

        // Validação prévia do CNPJ
        const normalizedCNPJ = cnpj.replace(/\D/g, "");
        if (normalizedCNPJ.length !== 14) {
          throw new Error("CNPJ deve conter exatamente 14 dígitos");
        }

        dispatch({ type: "SET_LOADING", payload: true });

        const result = await sharePointService.searchFormByCNPJ(normalizedCNPJ);
        console.log("Resultado da busca SharePoint:", result);

        const verificationResult: ICNPJVerificationResult = {
          exists: result.exists,
          cnpj: normalizedCNPJ,
          itemId: result.itemId,
          status: result.status,
          formData: result.formData,
          allowEdit: true,
          requiresApproval:
            result.status === "Enviado" || result.status === "Aprovado",
        };

        console.log("Resultado final da verificação:", verificationResult);
        return verificationResult;
      } catch (error) {
        console.error("=== ERRO NA VERIFICAÇÃO DE CNPJ ===");
        console.error("Erro:", error);
        console.error("Stack:", error.stack);

        // Re-throw com mensagem mais específica
        if (error.message && error.message.includes("dígitos")) {
          throw new Error("CNPJ inválido: deve conter exatamente 14 dígitos");
        }

        if (error.message && error.message.includes("conexão")) {
          throw new Error(
            "Erro de conexão. Verifique sua internet e tente novamente."
          );
        }

        throw new Error(
          `Erro ao verificar CNPJ: ${error.message || "Erro desconhecido"}`
        );
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [sharePointService]
  );

  // Nova funcionalidade: Definir fase da aplicação
  const setApplicationPhase = React.useCallback(
    (phase: IApplicationPhase): void => {
      console.log("Mudando fase da aplicação:", phase);
      setApplicationPhaseState(phase);
      // Não altera mais o formData aqui!
    },
    []
  );

  // Nova funcionalidade: Carregar formulário existente
  const loadExistingForm = React.useCallback(
    async (itemId: number): Promise<void> => {
      try {
        console.log("=== CARREGANDO FORMULÁRIO EXISTENTE ===");
        console.log("Item ID:", itemId);

        dispatch({ type: "SET_LOADING", payload: true });

        const formData = await sharePointService.getFormById(itemId);
        console.log("Dados retornados pelo SharePointService:", formData);

        if (formData) {
          console.log("=== ENVIANDO DADOS PARA O REDUCER ===");
          console.log("Form Data completo:", formData);

          dispatch({ type: "SET_FORM_DATA", payload: formData });
          console.log("Formulário carregado e enviado para o reducer"); // Mudar para a fase do formulário após carregar os dados
          setApplicationPhase({
            phase: "FORMULARIO",
            cnpj: formData.dadosGerais?.cnpj || "",
            existingItemId: itemId,
            isOverwrite: false,
          });
          console.log("Fase alterada para 'FORMULARIO'");

          // Aguardar um pouco para garantir que o estado foi atualizado
          setTimeout(() => {
            console.log("=== VERIFICAÇÃO FINAL DO ESTADO ===");
            console.log("Estado atual após carregamento");
          }, 100);
        } else {
          console.error("Formulário não encontrado ou dados vazios");
          throw new Error(
            "Formulário não encontrado ou não pôde ser carregado"
          );
        }
      } catch (error) {
        console.error("=== ERRO AO CARREGAR FORMULÁRIO EXISTENTE ===");
        console.error("Erro:", error);

        // Mostrar mensagem de erro mais amigável para o usuário
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar formulário";
        console.error("Mensagem de erro:", errorMessage);

        // Re-throw para que o componente chamador possa lidar com o erro
        throw new Error(
          `Falha ao carregar formulário existente: ${errorMessage}`
        );
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [sharePointService, setApplicationPhase]
  );
  // Nova funcionalidade: Iniciar novo formulário
  const startNewForm = React.useCallback((cnpj: string): void => {
    console.log("Iniciando novo formulário para CNPJ:", cnpj);

    // Reset form state
    dispatch({ type: "RESET_FORM" });

    // Set CNPJ in form data
    const newFormData = {
      ...initialFormState.formData,
      dadosGerais: {
        ...initialFormState.formData.dadosGerais,
        cnpj: cnpj.replace(/\D/g, ""),
      },
    };

    dispatch({ type: "SET_FORM_DATA", payload: newFormData });

    // Change to form phase
    setApplicationPhaseState({
      phase: "FORMULARIO",
      cnpj: cnpj,
      isOverwrite: false,
    });
    console.log("Novo formulário iniciado");
  }, []);

  // Nova funcionalidade: Buscar formulários do usuário
  const getUserForms = React.useCallback(async (): Promise<
    IUserFormSummary[]
  > => {
    try {
      console.log("=== BUSCANDO FORMULÁRIOS DO USUÁRIO ===");
      const currentUserEmail = context.pageContext.user.email;
      console.log("Email do usuário atual:", currentUserEmail);

      const forms = await sharePointService.getUserForms(currentUserEmail);
      console.log("Formulários encontrados:", forms.length);

      return forms;
    } catch (error) {
      console.error("Erro ao buscar formulários do usuário:", error);
      throw error;
    }
  }, [sharePointService, context.pageContext.user.email]);

  // Nova funcionalidade: Busca segura por CNPJ
  const searchCNPJWithSecurity = React.useCallback(
    async (cnpj: string): Promise<ICNPJVerificationResult> => {
      try {
        console.log("=== BUSCA SEGURA POR CNPJ ===");
        const currentUserEmail = context.pageContext.user.email;
        console.log("CNPJ:", cnpj);
        console.log("Email do usuário atual:", currentUserEmail);

        const result = await sharePointService.searchFormByCNPJWithOwnership(
          cnpj,
          currentUserEmail
        );
        console.log("Resultado da busca:", result);

        return result;
      } catch (error) {
        console.error("Erro na busca segura por CNPJ:", error);
        throw error;
      }
    },
    [sharePointService, context.pageContext.user.email]
  );

  // Informações do usuário atual
  const currentUser = React.useMemo(
    () => ({
      displayName: context.pageContext.user.displayName,
      email: context.pageContext.user.email,
      loginName: context.pageContext.user.loginName,
    }),
    [context.pageContext.user]
  );
  // Expor ações e estado para os componentes filhos
  const contextValue = React.useMemo<IHSEFormContext>(
    () => ({
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      applicationPhase,
      currentUser,
      actions: {
        loadFormData,
        saveFormData,
        submitForm,
        uploadAttachment,
        removeAttachment,
        validateStep,
        triggerSubmissionValidation,
        goToNextStep,
        goToPreviousStep,
        resetForm,
        verifyCNPJ,
        loadExistingForm,
        startNewForm,
        setApplicationPhase,
        getUserForms,
        searchCNPJWithSecurity,
      },
    }),
    [
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      applicationPhase,
      currentUser,
      loadFormData,
      saveFormData,
      submitForm,
      uploadAttachment,
      removeAttachment,
      validateStep,
      triggerSubmissionValidation,
      goToNextStep,
      goToPreviousStep,
      resetForm,
      verifyCNPJ,
      loadExistingForm,
      startNewForm,
      setApplicationPhase,
      getUserForms,
      searchCNPJWithSecurity,
    ]
  );

  return (
    <HSEFormContext.Provider value={contextValue}>
      {children}
    </HSEFormContext.Provider>
  );
};
