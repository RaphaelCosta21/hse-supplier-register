import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  formReducer,
  initialFormState,
  IFormState,
  FormAction,
  formSelectors,
} from "./formReducer";
import { SharePointService } from "../../services/SharePointService";
import { SharePointFileService } from "../../services/SharePointFileService";
import { PDFGeneratorService } from "../../services/pdfGenerator";
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
  // InformaÃ§Ãµes do usuÃ¡rio atual
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
    // Novas funcionalidades para gerenciamento do usuÃ¡rio
    getUserForms: () => Promise<IUserFormSummary[]>;
    searchCNPJWithSecurity: (cnpj: string) => Promise<ICNPJVerificationResult>;
    // Funcionalidades para download de PDF
    loadFormDataForPDF: (formId: number) => Promise<IHSEFormData | undefined>;
    downloadFormAsPDF: (
      formData: IHSEFormData,
      fileName: string
    ) => Promise<void>;
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

// Criar o contexto com valor padrÃ£o
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
  // InicializaÃ§Ã£o dos serviÃ§os SharePoint
  const sharePointService = React.useMemo(() => {
    return new SharePointService(context, "hse-new-register");
  }, [context]);
  const sharePointFileService = React.useMemo(() => {
    return new SharePointFileService(
      context,
      sharePointConfig.documentLibraryName
    );
  }, [context, sharePointConfig.documentLibraryName]);

  // Carregar dados do formulÃ¡rio do SharePoint (se existir)
  const loadFormData = React.useCallback(
    async (formId?: number) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        if (formId) {
          // Carregar formulÃ¡rio existente
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
        console.error("Erro ao carregar formulÃ¡rio:", error);
        // Tratar erro de carregamento
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [sharePointService]
  ); // Salvar dados do formulÃ¡rio (como rascunho ou no SharePoint)
  const saveFormData = React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      // Salvar no localStorage como backup
      localStorage.setItem("hse_form_draft", JSON.stringify(state.formData));

      const cnpj = state.formData.dadosGerais.cnpj;
      const empresa = state.formData.dadosGerais.empresa;

      console.log("=== INICIANDO SALVAMENTO DO FORMULÁRIO ===");
      console.log("Form ID atual:", state.formData.id);
      console.log("CNPJ:", cnpj);
      console.log("Empresa:", empresa);

      let formId: number;

      // 🔄 ORDEM CORRETA: 1️⃣ PRIMEIRO salvar o formulário na lista principal
      if (state.formData.id) {
        // FORMULÁRIO EXISTENTE
        console.log("Atualizando formulário existente ID:", state.formData.id);
        await sharePointService.updateFormWithChanges(
          state.formData.id,
          state.formData,
          state.attachments
        );
        formId = state.formData.id;
        console.log("✅ Formulário atualizado com sucesso");
      } else {
        // NOVO FORMULÁRIO - Criar primeiro na lista principal
        console.log("🔄 CRIANDO NOVO FORMULÁRIO NA LISTA PRINCIPAL...");
        formId = await sharePointService.saveFormData(
          state.formData,
          state.attachments
        );
        console.log("✅ Formulário criado na lista principal com ID:", formId);

        // Atualizar o estado com o novo ID
        dispatch({
          type: "SET_FORM_DATA",
          payload: {
            ...state.formData,
            id: formId,
          },
        });
      }

      // 2️⃣ DEPOIS processar anexos novos (se houver)
      if (cnpj && empresa && Object.keys(state.attachments).length > 0) {
        try {
          console.log("=== PROCESSANDO ANEXOS (APÓS FORMULÁRIO SALVO) ===");

          // Separar anexos que precisam ser salvos vs anexos já salvos
          const attachmentsToSave: {
            [category: string]: IAttachmentMetadata[];
          } = {};
          let hasNewAttachments = false;

          Object.keys(state.attachments).forEach((category) => {
            const files = state.attachments[category];
            const newFiles = files.filter((file) => file.fileData);

            if (newFiles.length > 0) {
              attachmentsToSave[category] = newFiles;
              hasNewAttachments = true;
              console.log(
                `Categoria '${category}': ${newFiles.length} novos anexos para salvar`
              );
            }
          });

          if (hasNewAttachments) {
            console.log("🔄 SALVANDO ANEXOS (FORMULÁRIO JÁ EXISTE)...");
            const newlySavedAttachments =
              await sharePointFileService.saveFormAttachments(
                cnpj,
                empresa,
                attachmentsToSave
              );

            // Mesclar anexos salvos com existentes
            const updatedAttachments = { ...state.attachments };
            Object.keys(newlySavedAttachments).forEach((category) => {
              if (updatedAttachments[category]) {
                const existingFiles = updatedAttachments[category].filter(
                  (f) => !f.fileData
                );
                updatedAttachments[category] = [
                  ...existingFiles,
                  ...newlySavedAttachments[category],
                ];
              } else {
                updatedAttachments[category] = newlySavedAttachments[category];
              }
            });

            // Atualizar estado com anexos salvos usando o método correto
            Object.keys(updatedAttachments).forEach((category) => {
              dispatch({
                type: "ADD_ATTACHMENT",
                payload: {
                  category,
                  attachment: updatedAttachments[category][0], // Processar um por vez
                },
              });
            });

            console.log("✅ Anexos salvos após o formulário");
          } else {
            console.log("ℹ️ Nenhum anexo novo para salvar");
          }
        } catch (attachmentError) {
          console.warn(
            "⚠️ Erro ao salvar anexos, mas formulário foi salvo:",
            attachmentError
          );
        }
      }

      dispatch({ type: "SAVE_SUCCESS", payload: new Date() });
      return true;
    } catch (error) {
      console.error("❌ Erro ao salvar formulário:", error);
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

  // Validar uma etapa especÃ­fica
  const validateStep = React.useCallback(
    async (stepNumber: number): Promise<boolean> => {
      const { formData, attachments } = state;
      const errors: IValidationError[] = [];

      // FunÃ§Ã£o auxiliar para adicionar erro
      const addError = (field: string, message: string): void => {
        errors.push({ field, message, section: `Step ${stepNumber}` });
      };

      // ValidaÃ§Ã£o especÃ­fica para cada etapa
      switch (stepNumber) {
        case 1: {
          // Validar Dados Gerais
          if (!formData.dadosGerais.empresa)
            addError("empresa", "O nome da empresa Ã© obrigatÃ³rio");
          if (!formData.dadosGerais.cnpj)
            addError("cnpj", "O CNPJ Ã© obrigatÃ³rio");
          else if (
            !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(
              formData.dadosGerais.cnpj
            )
          )
            addError("cnpj", "CNPJ invÃ¡lido");

          if (!formData.dadosGerais.numeroContrato)
            addError("numeroContrato", "O nÃºmero do contrato Ã© obrigatÃ³rio");
          if (!formData.dadosGerais.dataInicioContrato)
            addError(
              "dataInicioContrato",
              "A data de inÃ­cio do contrato Ã© obrigatÃ³ria"
            );
          if (!formData.dadosGerais.dataTerminoContrato)
            addError(
              "dataTerminoContrato",
              "A data de término do contrato é obrigatória"
            );

          // Validar que data de tÃ©rmino Ã© posterior Ã de inÃ­cio
          if (
            formData.dadosGerais.dataInicioContrato &&
            formData.dadosGerais.dataTerminoContrato &&
            new Date(formData.dadosGerais.dataInicioContrato) >=
              new Date(formData.dadosGerais.dataTerminoContrato)
          ) {
            addError(
              "dataTerminoContrato",
              "A data de tÃ©rmino deve ser posterior Ã  de inÃ­cio"
            );
          }

          // REM Ã© opcional para testes
          // const remAttachments = attachments.rem || [];
          // if (remAttachments.length === 0) {
          //   addError("rem", "O Resumo EstatÃ­stico Mensal (REM) Ã© obrigatÃ³rio");
          // }

          break;
        }
        case 2: {
          // ValidaÃ§Ã£o da Conformidade Legal
          // A lÃ³gica completa depende das respostas do formulÃ¡rio
          break;
        }

        case 3: {
          // ValidaÃ§Ã£o dos ServiÃ§os Especializados
          // Validar embarcaÃ§Ãµes
          if (formData.servicosEspeciais.fornecedorEmbarcacoes) {
            // Verificar certificados marÃ­timos obrigatÃ³rios
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
                  `O certificado ${cert.toUpperCase()} Ã© obrigatÃ³rio`
                );
              }
            });
          }

          // Validar iÃ§amento
          if (formData.servicosEspeciais.fornecedorIcamento) {
            // Verificar documentos tÃ©cnicos obrigatÃ³rios
            const requiredDocuments = ["testeCarga", "registroCREA", "art"];

            requiredDocuments.forEach((doc) => {
              const docAttachments = attachments[doc] || [];
              if (docAttachments.length === 0) {
                addError(doc, `O documento ${doc} Ã© obrigatÃ³rio`);
              }
            });
          }
          break;
        }

        case 4: {
          // RevisÃ£o final - verificar todas as validaÃ§Ãµes anteriores
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
    }, [validateStep]); // Enviar formulÃ¡rio (versÃ£o final)
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
        console.log("=== SUBMISSÃƒO: VERIFICANDO ANEXOS ===");

        // Separar anexos que precisam ser salvos (tÃªm fileData) vs anexos jÃ¡ salvos
        const attachmentsToSave: { [category: string]: IAttachmentMetadata[] } =
          {};
        let hasNewAttachments = false;

        Object.keys(state.attachments).forEach((category) => {
          const files = state.attachments[category];
          const newFiles = files.filter((file) => file.fileData);

          if (newFiles.length > 0) {
            attachmentsToSave[category] = newFiles;
            hasNewAttachments = true;
            console.log(
              `Categoria '${category}': ${newFiles.length} novos anexos para salvar na submissÃ£o`
            );
          }
        });

        if (hasNewAttachments) {
          console.log("Salvando novos anexos na submissÃ£o final...");
          const newlySavedAttachments =
            await sharePointFileService.saveFormAttachments(
              cnpj,
              empresa,
              attachmentsToSave
            );

          // Mesclar anexos jÃ¡ existentes com os recÃ©m-salvos
          savedAttachments = { ...state.attachments };
          Object.keys(newlySavedAttachments).forEach((category) => {
            if (savedAttachments[category]) {
              const existingFiles = savedAttachments[category].filter(
                (f) => !f.fileData
              );
              savedAttachments[category] = [
                ...existingFiles,
                ...newlySavedAttachments[category],
              ];
            } else {
              savedAttachments[category] = newlySavedAttachments[category];
            }
          });
        } else {
          console.log(
            "Todos os anexos jÃ¡ estÃ£o salvos para submissÃ£o final"
          );
        }
      }

      // Marcar como "Enviado" no SharePoint - atualizar ao invÃ©s de criar novo
      if (state.formData.id) {
        // Se jÃ¡ existe um ID, atualizar o formulÃ¡rio existente
        await sharePointService.submitFormWithUpdate(
          state.formData.id,
          {
            ...state.formData,
            statusFormulario: "Enviado",
          },
          savedAttachments
        );
      } else {
        // Se nÃ£o tem ID, usar o mÃ©todo original (criar novo)
        await sharePointService.submitFormData(
          {
            ...state.formData,
            statusFormulario: "Enviado",
          },
          savedAttachments
        );
      }

      // Limpar rascunho local apÃ³s envio bem-sucedido
      localStorage.removeItem("hse_form_draft");

      return true;
    } catch (error) {
      console.error("Erro ao enviar formulÃ¡rio:", error);
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
          "Armazenando arquivo apenas localmente (nÃ£o serÃ¡ salvo no SharePoint atÃ© clicar em Salvar/Submeter)"
        );

        // Criar metadata local sem fazer upload para SharePoint
        const localMetadata = sharePointFileService.createLocalFileMetadata(
          file,
          category,
          subcategory
        );

        // Registrar o anexo no estado do formulÃ¡rio (armazenamento local apenas)
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
          "O arquivo serÃ¡ salvo no SharePoint apenas quando o usuÃ¡rio clicar em 'Salvar' ou 'Submeter'"
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
          // Se o arquivo jÃ¡ foi salvo no SharePoint, remover de lÃ¡ tambÃ©m
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

  // NavegaÃ§Ã£o de etapas
  const goToNextStep = React.useCallback(() => {
    const { currentStep } = state;
    const nextStep = currentStep + 1;
    if (nextStep <= 5 && formSelectors.canProceedToStep(state, nextStep)) {
      dispatch({ type: "SET_CURRENT_STEP", payload: nextStep });
    }
  }, [state.currentStep, state]);

  const goToPreviousStep = React.useCallback(() => {
    const { currentStep } = state;
    const previousStep = currentStep - 1;
    if (previousStep >= 1) {
      dispatch({ type: "SET_CURRENT_STEP", payload: previousStep });
    }
  }, [state.currentStep]);
  // Reset do formulÃ¡rio
  const resetForm = React.useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    localStorage.removeItem("hse_form_draft");
  }, []);

  // Nova funcionalidade: Estado da fase da aplicaÃ§Ã£o
  const [applicationPhase, setApplicationPhaseState] =
    React.useState<IApplicationPhase>({
      phase: "ENTRADA",
    });
  // Nova funcionalidade: Verificar CNPJ
  const verifyCNPJ = React.useCallback(
    async (cnpj: string): Promise<ICNPJVerificationResult> => {
      try {
        console.log("=== INICIANDO VERIFICAÃ‡ÃƒO DE CNPJ ===");
        console.log("CNPJ recebido:", cnpj);

        // ValidaÃ§Ã£o prÃ©via do CNPJ
        const normalizedCNPJ = cnpj.replace(/\D/g, "");
        if (normalizedCNPJ.length !== 14) {
          throw new Error("CNPJ deve conter exatamente 14 dÃ­gitos");
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

        console.log("Resultado final da verificaÃ§Ã£o:", verificationResult);
        return verificationResult;
      } catch (error) {
        console.error("=== ERRO NA VERIFICAÃ‡ÃƒO DE CNPJ ===");
        console.error("Erro:", error);
        console.error("Stack:", error.stack);

        // Re-throw com mensagem mais especÃ­fica
        if (error.message && error.message.includes("dÃ­gitos")) {
          throw new Error("CNPJ invÃ¡lido: deve conter exatamente 14 dÃ­gitos");
        }

        if (error.message && error.message.includes("conexÃ£o")) {
          throw new Error(
            "Erro de conexÃ£o. Verifique sua internet e tente novamente."
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

  // Nova funcionalidade: Definir fase da aplicaÃ§Ã£o
  const setApplicationPhase = React.useCallback(
    (phase: IApplicationPhase): void => {
      console.log("Mudando fase da aplicaÃ§Ã£o:", phase);
      setApplicationPhaseState(phase);
      // NÃ£o altera mais o formData aqui!
    },
    []
  );

  // Nova funcionalidade: Carregar formulÃ¡rio existente
  const loadExistingForm = React.useCallback(
    async (itemId: number): Promise<void> => {
      try {
        console.log("=== CARREGANDO FORMULÃRIO EXISTENTE ===");
        console.log("Item ID:", itemId);

        dispatch({ type: "SET_LOADING", payload: true });

        const formData = await sharePointService.getFormById(itemId);
        console.log("Dados retornados pelo SharePointService:", formData);

        if (formData) {
          console.log("=== ENVIANDO DADOS PARA O REDUCER ===");
          console.log("Form Data completo:", formData);

          dispatch({ type: "SET_FORM_DATA", payload: formData });
          console.log("FormulÃ¡rio carregado e enviado para o reducer"); // Mudar para a fase do formulÃ¡rio apÃ³s carregar os dados
          setApplicationPhase({
            phase: "FORMULARIO",
            cnpj: formData.dadosGerais?.cnpj || "",
            existingItemId: itemId,
            isOverwrite: false,
          });
          console.log("Fase alterada para 'FORMULARIO'");

          // Aguardar um pouco para garantir que o estado foi atualizado
          setTimeout(() => {
            console.log("=== VERIFICAÃ‡ÃƒO FINAL DO ESTADO ===");
            console.log("Estado atual apÃ³s carregamento");
          }, 100);
        } else {
          console.error("FormulÃ¡rio nÃ£o encontrado ou dados vazios");
          throw new Error(
            "FormulÃ¡rio nÃ£o encontrado ou nÃ£o pÃ´de ser carregado"
          );
        }
      } catch (error) {
        console.error("=== ERRO AO CARREGAR FORMULÃRIO EXISTENTE ===");
        console.error("Erro:", error);

        // Mostrar mensagem de erro mais amigÃ¡vel para o usuÃ¡rio
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar formulÃ¡rio";
        console.error("Mensagem de erro:", errorMessage);

        // Re-throw para que o componente chamador possa lidar com o erro
        throw new Error(
          `Falha ao carregar formulÃ¡rio existente: ${errorMessage}`
        );
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [sharePointService, setApplicationPhase]
  );
  // Nova funcionalidade: Iniciar novo formulÃ¡rio
  const startNewForm = React.useCallback((cnpj: string): void => {
    console.log("Iniciando novo formulÃ¡rio para CNPJ:", cnpj);

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
    console.log("Novo formulÃ¡rio iniciado");
  }, []);

  // Nova funcionalidade: Buscar formulÃ¡rios do usuÃ¡rio
  const getUserForms = React.useCallback(async (): Promise<
    IUserFormSummary[]
  > => {
    try {
      console.log("=== BUSCANDO FORMULÃRIOS DO USUÃRIO ===");
      const currentUserEmail = context.pageContext.user.email;
      console.log("Email do usuÃ¡rio atual:", currentUserEmail);

      const forms = await sharePointService.getUserForms(currentUserEmail);
      console.log("FormulÃ¡rios encontrados:", forms.length);

      return forms;
    } catch (error) {
      console.error("Erro ao buscar formulÃ¡rios do usuÃ¡rio:", error);
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
        console.log("Email do usuÃ¡rio atual:", currentUserEmail);

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

  // FunÃ§Ã£o para carregar dados do formulÃ¡rio para PDF
  const loadFormDataForPDF = React.useCallback(
    async (formId: number): Promise<IHSEFormData | undefined> => {
      try {
        console.log("Carregando dados do formulÃ¡rio para PDF:", formId);
        const formData = await sharePointService.getFormById(formId);
        return formData;
      } catch (error) {
        console.error("Erro ao carregar dados do formulÃ¡rio para PDF:", error);
        return undefined;
      }
    },
    [sharePointService]
  );

  // Função para download do formulário como PDF
  const downloadFormAsPDF = React.useCallback(
    async (formData: IHSEFormData, fileName: string): Promise<void> => {
      try {
        console.log("Gerando PDF do formulário...");

        // Obter informações do usuário atual
        const userDisplayName = context.pageContext.user.displayName;
        const userEmail = context.pageContext.user.email;

        // Usar o serviço de PDF para gerar o HTML
        const htmlContent = PDFGeneratorService.generateFormHTML(
          formData,
          userDisplayName,
          userEmail
        );

        // Criar um blob com o HTML
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        // Abrir em nova janela para impressão/PDF
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              URL.revokeObjectURL(url);
            }, 1000);
          };
        }

        console.log("PDF gerado com sucesso!");
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        throw error;
      }
    },
    [context.pageContext.user]
  );

  // Montar o valor do contexto
  const contextValue = React.useMemo<IHSEFormContext>(
    () => ({
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      applicationPhase,
      currentUser: {
        displayName: context.pageContext.user.displayName,
        email: context.pageContext.user.email,
        loginName: context.pageContext.user.loginName,
      },
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
        loadFormDataForPDF,
        downloadFormAsPDF,
      },
    }),
    [
      state,
      dispatch,
      sharePointService,
      sharePointFileService,
      applicationPhase,
      context.pageContext.user,
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
      loadFormDataForPDF,
      downloadFormAsPDF,
    ]
  );

  return (
    <HSEFormContext.Provider value={contextValue}>
      {children}
    </HSEFormContext.Provider>
  );
};
