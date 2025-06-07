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

export interface IHSEFormContext {
  state: IFormState;
  dispatch: React.Dispatch<FormAction>;
  sharePointService: SharePointService;
  sharePointFileService: SharePointFileService;
  actions: {
    loadFormData: (formId?: number) => Promise<void>;
    saveFormData: () => Promise<boolean>;
    submitForm: () => Promise<boolean>;
    uploadAttachment: (file: File, category: string, subcategory?: string) => Promise<IAttachmentMetadata>;
    removeAttachment: (category: string, attachmentId: string) => Promise<void>;
    validateStep: (stepNumber: number) => Promise<boolean>;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    resetForm: () => void;
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
    return new SharePointService(context, sharePointConfig.listName);
  }, [context, sharePointConfig.listName]);
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
  );
  // Salvar dados do formulário (como rascunho ou no SharePoint)
  const saveFormData = React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      // Salvar no localStorage como backup
      localStorage.setItem("hse_form_draft", JSON.stringify(state.formData));

      // Salvar no SharePoint
      await sharePointService.saveFormData(state.formData, state.attachments);

      dispatch({ type: "SAVE_SUCCESS", payload: new Date() });
      return true;
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      return false;
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [sharePointService, state.formData, state.attachments]);

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

          // Validar anexo REM
          const remAttachments = attachments.rem || [];
          if (remAttachments.length === 0) {
            addError("rem", "O Resumo Estatístico Mensal (REM) é obrigatório");
          }

          break;
        }

        case 2: {
          // Validação da Conformidade Legal
          // A lógica completa depende das respostas do formulário
          break;
        }

        case 3: {
          // Validação das Evidências
          // Verificar se os documentos obrigatórios foram anexados
          const requiredEvidences = ["sesmt", "cipa", "ppra", "pcmso", "aso"];

          requiredEvidences.forEach((evidence) => {
            const evidenceAttachments = attachments[evidence] || [];
            if (evidenceAttachments.length === 0) {
              addError(
                evidence,
                `O documento ${evidence.toUpperCase()} é obrigatório`
              );
            }
          });

          break;
        }

        case 4: {
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

        case 5: {
          // Revisão final - verificar todas as validações anteriores
          const allStepsValid = await Promise.all(
            [1, 2, 3, 4].map((step) => validateStep(step))
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

      dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
      return errors.length === 0;
    },
    [state]
  );

  // Enviar formulário (versão final)
  const submitForm = React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });

    // Validação completa antes do envio
    const allStepsValid = await Promise.all(
      [1, 2, 3, 4, 5].map((step) => validateStep(step))
    ).then((results) => results.every(Boolean));

    if (!allStepsValid) {
      dispatch({ type: "SET_SUBMITTING", payload: false });
      return false;
    }

    try {
      // Marcar como "Enviado" no SharePoint
      await sharePointService.submitFormData(
        {
          ...state.formData,
          statusFormulario: "Enviado",
        },
        state.attachments
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
  }, [sharePointService, state.formData, state.attachments, validateStep]);// Fazer upload de anexo usando SharePoint
  const uploadAttachment = React.useCallback(
    async (file: File, category: string, subcategory?: string): Promise<IAttachmentMetadata> => {
      try {
        const cnpj = state.formData.dadosGerais.cnpj || "temp";
        const empresa = state.formData.dadosGerais.empresa || "Empresa";

        // Fazer upload para SharePoint Document Library
        const uploadResult = await sharePointFileService.uploadFile(
          file,
          cnpj,
          empresa,
          category,
          subcategory
        );

        // Registrar o anexo no estado do formulário
        dispatch({
          type: "ADD_ATTACHMENT",
          payload: {
            category,
            attachment: uploadResult,
          },
        });

        return uploadResult;
      } catch (error) {
        console.error("Erro ao fazer upload do anexo:", error);
        if (debugMode) {
          console.error("Debug - Upload Error:", error);
        }
        throw error;
      }
    },
    [sharePointFileService, state.formData.dadosGerais.cnpj, state.formData.dadosGerais.empresa, debugMode]
  );  // Remover anexo
  const removeAttachment = React.useCallback(
    async (category: string, attachmentId: string): Promise<void> => {
      try {
        // Verificar se o anexo existe
        const attachments = state.attachments[category] || [];
        const attachment = attachments.find(
          (a: IAttachmentMetadata) => a.id === attachmentId
        );

        if (attachment && attachment.sharepointItemId) {
          // Remover do SharePoint Document Library
          await sharePointFileService.deleteFile(attachment.sharepointItemId);

          // Remover do estado
          dispatch({
            type: "REMOVE_ATTACHMENT",
            payload: { category, attachmentId },
          });
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
  // Expor ações e estado para os componentes filhos
  const contextValue = React.useMemo<IHSEFormContext>(
    () => ({
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      actions: {
        loadFormData,
        saveFormData,
        submitForm,
        uploadAttachment,
        removeAttachment,
        validateStep,
        goToNextStep,
        goToPreviousStep,
        resetForm,
      },
    }),
    [
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      loadFormData,
      saveFormData,
      submitForm,
      uploadAttachment,
      removeAttachment,
      validateStep,
      goToNextStep,
      goToPreviousStep,
      resetForm,
    ]
  );

  return (
    <HSEFormContext.Provider value={contextValue}>
      {children}
    </HSEFormContext.Provider>
  );
};
