import type {
  IFormState,
  IHSEFormData,
  IAnexosFormulario,
  IConformidadeLegal,
  IEvidencias,
  IServicosEspeciais,
  IAttachmentMetadata,
  IValidationError,
} from "../../types/IHSEFormData";

export type { IFormState };

export type FormAction =
  | { type: "UPDATE_FIELD"; payload: { field: string; value: unknown } }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_FORM_DATA"; payload: IHSEFormData }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_SUBMISSION_ATTEMPTED"; payload: boolean }
  | { type: "SAVE_SUCCESS"; payload: Date }
  | {
      type: "ADD_ATTACHMENT";
      payload: { category: string; attachment: IAttachmentMetadata };
    }
  | {
      type: "REMOVE_ATTACHMENT";
      payload: { category: string; attachmentId: string };
    }
  | { type: "SET_VALIDATION_ERRORS"; payload: IValidationError[] }
  | { type: "CLEAR_VALIDATION_ERRORS" }
  | { type: "RESET_FORM" };

export const initialFormState: IFormState = {
  currentStep: 1,
  formData: {
    dadosGerais: {
      empresa: "",
      cnpj: "",
      numeroContrato: "",
      dataInicioContrato: undefined,
      dataTerminoContrato: undefined,
      escopoServico: "",
      responsavelTecnico: "",
      atividadePrincipalCNAE: "",
      totalEmpregados: undefined,
      empregadosParaServico: undefined,
      grauRisco: "1",
      possuiSESMT: false,
      numeroComponentesSESMT: undefined,
      gerenteContratoMarine: "",
    },
    conformidadeLegal: {} as IConformidadeLegal,
    evidencias: {} as IEvidencias,
    servicosEspeciais: {
      fornecedorEmbarcacoes: false,
      fornecedorIcamento: false,
    } as IServicosEspeciais,
    anexos: {} as IAnexosFormulario,
  } as IHSEFormData,
  attachments: {},
  validationErrors: [],
  isSubmitting: false,
  isLoading: false,
  submissionAttempted: false,
  lastSaved: undefined,
  errors: {},
  isDirty: false,
};

export const formReducer = (
  state: IFormState,
  action: FormAction
): IFormState => {
  switch (action.type) {
    case "UPDATE_FIELD": {
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
        isDirty: true,
      };
    }
    case "SET_STEP": {
      return {
        ...state,
        currentStep: action.payload,
      };
    }
    case "SET_FORM_DATA": {
      return {
        ...state,
        formData: action.payload,
        isDirty: false,
      };
    }
    case "SET_CURRENT_STEP": {
      return {
        ...state,
        currentStep: action.payload,
      };
    }
    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case "SET_SUBMITTING": {
      return {
        ...state,
        isSubmitting: action.payload,
      };
    }
    case "SET_SUBMISSION_ATTEMPTED": {
      return {
        ...state,
        submissionAttempted: action.payload,
      };
    }
    case "SAVE_SUCCESS": {
      return {
        ...state,
        lastSaved: action.payload,
        isDirty: false,
      };
    }
    case "ADD_ATTACHMENT": {
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.payload.category]: [
            ...(state.attachments[action.payload.category] || []),
            action.payload.attachment,
          ],
        },
        isDirty: true,
      };
    }
    case "REMOVE_ATTACHMENT": {
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.payload.category]: (
            state.attachments[action.payload.category] || []
          ).filter((a) => a.id !== action.payload.attachmentId),
        },
        isDirty: true,
      };
    }
    case "SET_VALIDATION_ERRORS": {
      return {
        ...state,
        validationErrors: action.payload,
      };
    }
    case "CLEAR_VALIDATION_ERRORS": {
      return {
        ...state,
        validationErrors: [],
      };
    }
    case "RESET_FORM": {
      return initialFormState;
    }
    default:
      return state;
  }
};

// Seletor de progresso do formulário
export const formSelectors = {
  getCompletionPercentage: (state: IFormState): number => {
    // Exemplo: calcula progresso baseado em steps preenchidos
    let completed = 0;
    if (state.formData.dadosGerais.empresa) completed++;
    if (state.formData.conformidadeLegal) completed++;
    if (state.formData.evidencias) completed++;
    if (state.formData.servicosEspeciais) completed++;
    return Math.round((completed / 4) * 100);
  },
  hasRequiredAttachments: (state: IFormState): boolean => {
    const requiredCategories = ["rem", "sesmt", "cipa", "ppra", "pcmso", "aso"];
    return requiredCategories.every(
      (category) => (state.attachments[category] || []).length > 0
    );
  },
  canProceedToStep: (state: IFormState, targetStep: number): boolean => {
    // Permitir navegação livre entre todas as etapas em qualquer momento
    return targetStep >= 1 && targetStep <= 5;
  },
};
