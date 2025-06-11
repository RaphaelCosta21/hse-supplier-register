import type {
  IFormState,
  IHSEFormData,
  IAnexosFormulario,
  IConformidadeLegal,
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
  | { type: "SET_FIELD_ERRORS"; payload: { [fieldName: string]: string } }
  | { type: "CLEAR_FIELD_ERRORS" }
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
                sharePointPath: (anexo.sharePointPath ||
                  anexo.url ||
                  "") as string,
                category: category,
                subcategory: (anexo.subcategory || "") as string,
                originalName: (anexo.fileName ||
                  anexo.name ||
                  "arquivo.pdf") as string,
                fileType: (anexo.fileType || ".pdf") as string,
                url: (anexo.url || anexo.sharePointPath || "") as string,
              })
            );
          }
        });
      }

      // Corrija aqui: mantenha os campos obrigatórios do IHSEFormData
      return {
        ...state,
        formData: {
          ...state.formData, // mantém id, statusFormulario, etc.
          dadosGerais: action.payload.dadosGerais,
          conformidadeLegal: action.payload.conformidadeLegal,
          servicosEspeciais: action.payload.servicosEspeciais,
          anexos: action.payload.anexos,
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
    const requiredCategories = ["rem", "sesmt", "cipa", "ppra", "pcmso", "aso"];
    return requiredCategories.every(
      (category) => (state.attachments[category] || []).length > 0
    );
  },
  canProceedToStep: (state: IFormState, targetStep: number): boolean => {
    // Etapas 1-3: permitir navegação livre
    if (targetStep >= 1 && targetStep <= 3) {
      return true;
    }

    // Etapa 4 (Revisão Final): só permitir se todas as outras etapas estão completas
    if (targetStep === 4) {
      // Validar Dados Gerais
      const { dadosGerais } = state.formData;
      const attachments = state.attachments || {};
      if (!dadosGerais) return false;
      const dadosOk = [
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
      const remOk = attachments.rem && attachments.rem.length > 0;
      const isDadosGeraisValid = dadosOk && remOk;

      // Validar Conformidade Legal
      const conformidade = state.formData.conformidadeLegal || {};
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
        {
          key: "nr05",
          questions: [{ key: "questao10" }, { key: "questao11" }],
        },
        {
          key: "nr06",
          questions: [{ key: "questao13" }, { key: "questao14" }],
        },
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
        {
          key: "nr11",
          questions: [{ key: "questao28" }, { key: "questao29" }],
        },
        {
          key: "nr12",
          questions: [{ key: "questao31" }, { key: "questao32" }],
        },
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

      const applicableBlocks: { [key: string]: boolean } = {};
      NR_BLOCKS.forEach((block) => {
        const bloco = conformidade[block.key as keyof typeof conformidade];
        if (bloco && typeof bloco === "object") {
          applicableBlocks[block.key] = true;
        }
      });

      const isBlockComplete = (
        blockKey: string,
        questions: Array<{ key: string }>
      ): boolean => {
        const bloco = conformidade[blockKey as keyof typeof conformidade];
        if (!bloco || typeof bloco !== "object") return false;
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

      const blocosAplicaveis = NR_BLOCKS.filter(
        (block) => applicableBlocks[block.key]
      );
      const isConformidadeLegalValid =
        blocosAplicaveis.length > 0 &&
        blocosAplicaveis.every((block) =>
          isBlockComplete(block.key, block.questions)
        );

      // Validar Serviços Especializados
      const { servicosEspeciais } = state.formData;
      let isServicosEspeciaisValid = true;
      if (servicosEspeciais) {
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
              isServicosEspeciaisValid = false;
              break;
            }
          }
        }
        if (servicosEspeciais.fornecedorIcamento && isServicosEspeciaisValid) {
          const required = [
            "testeCarga",
            "creaEngenheiro",
            "art",
            "planoManutencao",
            "fumacaPreta",
            "certificacaoEquipamentos",
          ];
          for (const doc of required) {
            if (!attachments[doc] || attachments[doc].length === 0) {
              isServicosEspeciaisValid = false;
              break;
            }
          }
        }
      }

      return (
        isDadosGeraisValid &&
        isConformidadeLegalValid &&
        isServicosEspeciaisValid
      );
    }

    return false;
  },
};
