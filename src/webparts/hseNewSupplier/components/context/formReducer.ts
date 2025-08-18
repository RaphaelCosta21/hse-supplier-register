import type {
  IFormState,
  IHSEFormData,
  IAnexosFormulario,
  IConformidadeLegal,
  IServicosEspeciais,
  IAttachmentMetadata,
  IValidationError,
} from "../../types/IHSEFormData";
import { NR_QUESTIONS_MAP } from "../../utils/formConstants";

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
  | { type: "SET_FIELD_ERRORS"; payload: { [fieldName: string]: string } }
  | { type: "CLEAR_FIELD_ERRORS" }
  | { type: "RESET_FORM" };

export const initialFormState: IFormState = {
  currentStep: 1,
  formData: {
    statusFormulario: "Rascunho",
    dadosGerais: {
      empresa: "",
      cnpj: "",
      escopoServico: "",
      responsavelTecnico: "",
      atividadePrincipalCNAE: "",
      totalEmpregados: undefined,
      empregadosParaServico: undefined,
      grauRisco: "",
      possuiSESMT: false,
      numeroComponentesSESMT: undefined,
    },
    conformidadeLegal: {} as IConformidadeLegal,
    servicosEspeciais: {
      fornecedorEmbarcacoes: false,
      fornecedorIcamento: false,
      naoFornecedorServicos: false,
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
      // Converter anexos se existirem (mantém igual)
      const convertedAttachments: {
        [category: string]: IAttachmentMetadata[];
      } = {};
      if (action.payload.anexos && typeof action.payload.anexos === "object") {
        const anexos = action.payload.anexos as unknown as Record<
          string,
          unknown[]
        >;
        Object.keys(anexos).forEach((category) => {
          const anexosCategoria = anexos[category];
          if (Array.isArray(anexosCategoria)) {
            convertedAttachments[category] = anexosCategoria.map(
              (anexo: Record<string, unknown>) => ({
                id: (anexo.id || anexo.fileName || `${Date.now()}`) as string,
                fileName: (anexo.fileName ||
                  anexo.name ||
                  "arquivo.pdf") as string,
                fileSize: (anexo.fileSize || anexo.size || 0) as number,
                uploadDate: anexo.uploadDate
                  ? new Date(anexo.uploadDate as string).toISOString()
                  : new Date().toISOString(),
                category: category,
                subcategory: (anexo.subcategory || "") as string,
                originalName: (anexo.fileName ||
                  anexo.name ||
                  "arquivo.pdf") as string,
                fileType: (anexo.fileType || ".pdf") as string,
                url: (anexo.url || "") as string,
              })
            );
          }
        });
      }

      // Corrija aqui: preserve todos os campos do payload, incluindo id
      return {
        ...state,
        formData: {
          ...state.formData, // mantém campos existentes como fallback
          ...action.payload, // sobrescreve com os dados recebidos, incluindo id
        },
        attachments: convertedAttachments,
        isDirty: false,
        errors: {},
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
    case "SET_FIELD_ERRORS": {
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload,
        },
      };
    }
    case "CLEAR_FIELD_ERRORS": {
      return {
        ...state,
        errors: {},
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
    // Calcula progresso baseado em 4 steps: Dados Gerais, Conformidade Legal, Serviços Especializados, Revisão Final
    let completed = 0;
    if (state.formData.dadosGerais.empresa) completed++;
    if (state.formData.conformidadeLegal) completed++;
    if (state.formData.servicosEspeciais) completed++;
    // Step 4 (Revisão Final) é considerado completo quando os outros estão preenchidos
    if (completed >= 3) completed++;
    return Math.round((completed / 4) * 100);
  },
  hasRequiredAttachments: (state: IFormState): boolean => {
    const requiredCategories = ["rem", "sesmt", "cipa", "pcmso", "aso"];
    return requiredCategories.every(
      (category) => (state.attachments[category] || []).length > 0
    );
  },

  // Função auxiliar para validar Dados Gerais
  isDadosGeraisValid: (state: IFormState): boolean => {
    const { dadosGerais } = state.formData;
    const attachments = state.attachments || {};
    if (!dadosGerais) return false;

    // Validar campos básicos
    const camposOk = [
      dadosGerais.empresa,
      dadosGerais.cnpj,
      dadosGerais.responsavelTecnico,
      dadosGerais.atividadePrincipalCNAE,
    ].every((v) => v !== undefined && v !== null && v !== "");

    // Validar grau de risco separadamente (não pode ser string vazia)
    const grauRiscoOk = dadosGerais.grauRisco !== "";

    const remOk = attachments.rem && attachments.rem.length > 0;
    return camposOk && grauRiscoOk && remOk;
  },

  // Função auxiliar para validar Conformidade Legal
  isConformidadeLegalValid: (state: IFormState): boolean => {
    const conformidade = state.formData.conformidadeLegal || {};
    const attachments = state.attachments || {};

    // NRs obrigatórias que sempre devem estar presentes
    const MANDATORY_NR_BLOCKS = ["nr01", "nr04", "nr05", "nr06", "nr07"];

    const NR_BLOCKS = [
      {
        key: "nr01",
        questions: [{ key: "questao1" }, { key: "questao2" }],
      },
      { key: "nr04", questions: [{ key: "questao1" }, { key: "questao2" }] },
      {
        key: "nr05",
        questions: [{ key: "questao1" }, { key: "questao2" }],
      },
      {
        key: "nr06",
        questions: [{ key: "questao1" }, { key: "questao2" }],
      },
      {
        key: "nr07",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
        ],
      },
      {
        key: "nr10",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
        ],
      },
      {
        key: "nr11",
        questions: [{ key: "questao1" }, { key: "questao2" }],
      },
      {
        key: "nr12",
        questions: [{ key: "questao1" }, { key: "questao2" }],
      },
      { key: "nr13", questions: [{ key: "questao1" }] },
      { key: "nr15", questions: [{ key: "questao1" }] },
      { key: "nr16", questions: [{ key: "questao1" }] },
      {
        key: "nr23",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
        ],
      },
      { key: "licencasAmbientais", questions: [{ key: "questao1" }] },
      {
        key: "legislacaoMaritima",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
          { key: "questao4" },
          { key: "questao5" },
          { key: "questao6" },
        ],
      },
      {
        key: "treinamentos",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
        ],
      },
      {
        key: "gestaoSMS",
        questions: [
          { key: "questao1" },
          { key: "questao2" },
          { key: "questao3" },
          { key: "questao4" },
          { key: "questao5" },
        ],
      },
    ];

    const applicableBlocks: { [key: string]: boolean } = {};
    NR_BLOCKS.forEach((block) => {
      const bloco = conformidade[block.key as keyof typeof conformidade];
      if (bloco && typeof bloco === "object") {
        const blockObj = bloco as unknown as { aplicavel?: boolean };

        // NRs obrigatórias são sempre aplicáveis
        if (MANDATORY_NR_BLOCKS.includes(block.key)) {
          applicableBlocks[block.key] = true;
        } else {
          // NRs opcionais: verificar flag de aplicabilidade
          applicableBlocks[block.key] = blockObj.aplicavel === true;
        }
      } else if (MANDATORY_NR_BLOCKS.includes(block.key)) {
        // Garantir que NRs obrigatórias sejam sempre consideradas aplicáveis
        applicableBlocks[block.key] = true;
      }
    });

    const isBlockComplete = (
      blockKey: string,
      questions: Array<{ key: string }>
    ): boolean => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return false;

      // Mapeamento de questões para índices no NR_QUESTIONS_MAP
      const questionIndexMap: {
        [blockKey: string]: { [questionKey: string]: number };
      } = {
        nr01: { questao1: 1, questao2: 2 },
        nr04: { questao1: 3, questao2: 4 },
        nr05: { questao1: 5, questao2: 6 },
        nr06: { questao1: 7, questao2: 8 },
        nr07: { questao1: 9, questao2: 10, questao3: 11 },
        nr10: { questao1: 12, questao2: 13, questao3: 14 },
        nr11: { questao1: 15, questao2: 16 },
        nr12: { questao1: 17, questao2: 18 },
        nr13: { questao1: 19 },
        nr15: { questao1: 20 },
        nr16: { questao1: 21 },
        nr23: { questao1: 22, questao2: 23, questao3: 24 },
        licencasAmbientais: { questao1: 25 },
        legislacaoMaritima: {
          questao1: 26,
          questao2: 27,
          questao3: 28,
          questao4: 29,
          questao5: 30,
          questao6: 31,
        },
        treinamentos: { questao1: 32, questao2: 33, questao3: 34 },
        gestaoSMS: {
          questao1: 35,
          questao2: 36,
          questao3: 37,
          questao4: 38,
          questao5: 39,
        },
      };

      return questions.every((q) => {
        const questionObj = (
          bloco as unknown as Record<string, { resposta?: string }>
        )[q.key];

        // Verificar se a pergunta tem resposta
        if (
          !questionObj ||
          typeof questionObj.resposta !== "string" ||
          questionObj.resposta === ""
        ) {
          return false;
        }

        // Se a resposta é "SIM", verificar se há anexo obrigatório
        if (questionObj.resposta === "SIM") {
          const questionIndex = questionIndexMap[blockKey]?.[q.key];
          if (questionIndex) {
            const questionMeta = (
              NR_QUESTIONS_MAP as Record<
                string,
                { text: string; attachment?: string }
              >
            )[String(questionIndex)];

            // Se a pergunta requer anexo e a resposta é SIM
            if (questionMeta && questionMeta.attachment) {
              const categoryFiles = attachments[questionMeta.attachment] || [];
              return categoryFiles.length > 0;
            }
          }
        }

        return true;
      });
    };

    const blocosAplicaveis = NR_BLOCKS.filter(
      (block) => applicableBlocks[block.key]
    );

    // Validação: deve ter pelo menos as NRs obrigatórias aplicáveis
    const mandatoryBlocksApplicable = MANDATORY_NR_BLOCKS.every(
      (blockKey) => applicableBlocks[blockKey]
    );

    return (
      mandatoryBlocksApplicable &&
      blocosAplicaveis.length > 0 &&
      blocosAplicaveis.every((block) =>
        isBlockComplete(block.key, block.questions)
      )
    );
  },

  // Função auxiliar para validar Serviços Especializados
  isServicosEspeciaisValid: (state: IFormState): boolean => {
    const { servicosEspeciais } = state.formData;
    const attachments = state.attachments || {};

    if (!servicosEspeciais) return true;

    // Se marcou que não fornece serviços, está válido
    if (servicosEspeciais.naoFornecedorServicos) return true;

    // Se não marcou nenhum serviço E não marcou "não fornece", é inválido
    if (
      !servicosEspeciais.fornecedorEmbarcacoes &&
      !servicosEspeciais.fornecedorIcamento &&
      !servicosEspeciais.naoFornecedorServicos
    ) {
      return false;
    }

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
        if (!attachments[cert] || attachments[cert].length === 0) {
          return false;
        }
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
        if (!attachments[doc] || attachments[doc].length === 0) {
          return false;
        }
      }
    }

    return true;
  },

  canProceedToStep: (state: IFormState, targetStep: number): boolean => {
    // Etapa 1 (Dados Gerais): sempre permitir acesso
    if (targetStep === 1) {
      return true;
    }

    // Etapa 2 (Conformidade Legal): só permitir se Dados Gerais estiver completa
    if (targetStep === 2) {
      return formSelectors.isDadosGeraisValid(state);
    }

    // Etapa 3 (Serviços Especializados): só permitir se Dados Gerais E Conformidade Legal estiverem completas
    if (targetStep === 3) {
      return (
        formSelectors.isDadosGeraisValid(state) &&
        formSelectors.isConformidadeLegalValid(state)
      );
    }

    // Etapa 4 (Revisão Final): só permitir se todas as etapas anteriores estiverem completas
    if (targetStep === 4) {
      return (
        formSelectors.isDadosGeraisValid(state) &&
        formSelectors.isConformidadeLegalValid(state) &&
        formSelectors.isServicosEspeciaisValid(state)
      );
    }

    return false;
  },
};
