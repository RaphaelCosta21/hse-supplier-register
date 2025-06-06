import { IHSEFormState, IHSEFormAction } from "../types/IHSEFormData";

export const initialState: IHSEFormState = {
  currentStep: 1,
  formData: {
    empresa: "",
    cnpj: "",
    numeroContrato: "",
    dataInicioContrato: null,
    dataTerminoContrato: null,
    escopoServico: "",
    responsavelTecnico: "",
    atividadePrincipalCNAE: "",
    totalEmpregados: 0,
    empregadosParaServico: 0,
    grauRisco: 1,
    possuiSESMT: false,
    numeroComponentesSESMT: 0,
    gerenteContratoMarine: "",
    conformidadeLegal: {},
    fornecedorEmbarcacoes: false,
    fornecedorIcamento: false,
    embarcacoesData: {},
    icamentoData: {},
  },
  attachments: {},
  validationErrors: [],
  isSubmitting: false,
  isLoading: false,
  lastSaved: null,
};

export const formReducer = (
  state: IHSEFormState,
  action: IHSEFormAction
): IHSEFormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
      };

    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "ADD_ATTACHMENT":
      const currentAttachments =
        state.attachments[action.payload.category] || [];
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.payload.category]: [
            ...currentAttachments,
            action.payload.attachment,
          ],
        },
      };

    case "REMOVE_ATTACHMENT":
      const filteredAttachments = (
        state.attachments[action.payload.category] || []
      ).filter((att) => att.id !== action.payload.attachmentId);
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.payload.category]: filteredAttachments,
        },
      };

    case "SET_VALIDATION_ERRORS":
      return {
        ...state,
        validationErrors: action.payload,
      };

    case "CLEAR_VALIDATION_ERRORS":
      return {
        ...state,
        validationErrors: [],
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case "LOAD_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload.formData },
        attachments: { ...state.attachments, ...action.payload.attachments },
      };

    case "MARK_SAVED":
      return {
        ...state,
        lastSaved: new Date().toISOString(),
      };

    default:
      return state;
  }
};

export const formSelectors = {
  getCompletionPercentage: (state: IHSEFormState): number => {
    const requiredFields = [
      "empresa",
      "cnpj",
      "numeroContrato",
      "dataInicioContrato",
      "dataTerminoContrato",
      "responsavelTecnico",
    ];

    const completedFields = requiredFields.filter(
      (field) => state.formData[field as keyof typeof state.formData]
    ).length;

    const conformidadeCompleted = Object.keys(
      state.formData.conformidadeLegal || {}
    ).length;
    const evidenciasCompleted = Object.keys(state.attachments).length;

    const totalRequiredItems = requiredFields.length + 10 + 5; // estimativa
    const completedItems =
      completedFields +
      Math.min(conformidadeCompleted, 10) +
      Math.min(evidenciasCompleted, 5);

    return Math.round((completedItems / totalRequiredItems) * 100);
  },

  hasRequiredAttachments: (state: IHSEFormState): boolean => {
    const requiredCategories = ["rem", "sesmt", "cipa", "ppra", "pcmso", "aso"];
    return requiredCategories.every(
      (category) => (state.attachments[category] || []).length > 0
    );
  },

  canProceedToStep: (state: IHSEFormState, targetStep: number): boolean => {
    switch (targetStep) {
      case 1:
        return true;
      case 2:
        return !!(state.formData.empresa && state.formData.cnpj);
      case 3:
        return (
          state.currentStep >= 2 &&
          Object.keys(state.formData.conformidadeLegal || {}).length > 0
        );
      case 4:
        return state.currentStep >= 3;
      case 5:
        return (
          state.currentStep >= 4 && formSelectors.hasRequiredAttachments(state)
        );
      default:
        return false;
    }
  },
};
