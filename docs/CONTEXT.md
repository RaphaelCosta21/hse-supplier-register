# Context e Estado - HSE Supplier Register

Este documento detalha o sistema de gerenciamento de estado usando React Context API, incluindo contextos, reducers e padrões de estado utilizados no projeto.

## Índice

- [Arquitetura de Estado](#arquitetura-de-estado)
- [HSEFormContext](#hseformcontext)
- [Form Reducer](#form-reducer)
- [Fase da Aplicação](#fase-da-aplicação)
- [Gerenciamento de Anexos](#gerenciamento-de-anexos)
- [Validação de Estado](#validação-de-estado)
- [Padrões de Uso](#padrões-de-uso)
- [Performance](#performance)

---

## Arquitetura de Estado

### Visão Geral

O HSE Supplier Register utiliza React Context API combinado com useReducer para gerenciamento de estado complexo:

- **Centralização**: Estado global centralizado no HSEFormContext
- **Previsibilidade**: Mudanças de estado através de actions bem definidas
- **Modularidade**: Separação de responsabilidades entre contextos
- **Persistência**: Salvamento automático e recuperação de rascunhos

### Estrutura de Contextos

```
context/
├── HSEFormContext.tsx          # Contexto principal do formulário
├── formReducer.ts              # Reducer para estado do formulário
└── formSelectors.ts            # Seletores para computação de estado
```

---

## HSEFormContext

### `IHSEFormContext`

**Localização**: `/components/context/HSEFormContext.tsx`
**Função**: Interface principal do contexto que define todas as propriedades e ações disponíveis.

```typescript
export interface IHSEFormContext {
  // Estado do formulário
  state: IFormState;
  dispatch: React.Dispatch<FormAction>;

  // Serviços
  sharePointService: SharePointService;
  sharePointFileService: SharePointFileService;

  // Estado da aplicação
  applicationPhase: IApplicationPhase;

  // Informações do usuário
  currentUser: {
    displayName: string;
    email: string;
    loginName: string;
  };

  // Ações disponíveis
  actions: {
    // Formulário
    loadFormData: (formId?: number) => Promise<void>;
    saveFormData: () => Promise<boolean>;
    submitForm: () => Promise<boolean>;
    resetForm: () => void;

    // Anexos
    uploadAttachment: (
      file: File,
      category: string,
      subcategory?: string
    ) => Promise<IAttachmentMetadata>;
    removeAttachment: (category: string, attachmentId: string) => Promise<void>;

    // Validação
    validateStep: (stepNumber: number) => Promise<boolean>;
    triggerSubmissionValidation: () => Promise<boolean>;

    // Navegação
    goToNextStep: () => void;
    goToPreviousStep: () => void;

    // CNPJ e Fases
    verifyCNPJ: (cnpj: string) => Promise<ICNPJVerificationResult>;
    loadExistingForm: (itemId: number) => Promise<void>;
    startNewForm: (cnpj: string) => void;
    setApplicationPhase: (phase: IApplicationPhase) => void;

    // Relatórios
    getUserForms: () => Promise<IUserFormSummary[]>;
    searchCNPJWithSecurity: (
      cnpj: string,
      userEmail: string
    ) => Promise<ICNPJVerificationResult>;
  };
}
```

### Provider Component

```typescript
export const HSEFormProvider: React.FC<IHSEFormProviderProps> = ({
  context,
  sharePointConfig,
  maxFileSize,
  debugMode,
  children,
}) => {
  const [state, dispatch] = React.useReducer(formReducer, initialFormState);

  // Inicialização de serviços
  const sharePointService = React.useMemo(() => {
    return new SharePointService(context, "hse-new-register");
  }, [context]);

  const sharePointFileService = React.useMemo(() => {
    return new SharePointFileService(
      context,
      sharePointConfig.documentLibraryName
    );
  }, [context, sharePointConfig.documentLibraryName]);

  // Estado da fase da aplicação
  const [applicationPhase, setApplicationPhaseState] =
    React.useState<IApplicationPhase>({
      phase: "CNPJ_VERIFICATION",
      cnpj: "",
      isOverwrite: false,
    });

  // Informações do usuário atual
  const currentUser = React.useMemo(
    () => ({
      displayName: context.pageContext.user.displayName,
      email: context.pageContext.user.email,
      loginName: context.pageContext.user.loginName,
    }),
    [context.pageContext.user]
  );

  // ... implementação das ações

  return (
    <HSEFormContext.Provider value={contextValue}>
      {children}
    </HSEFormContext.Provider>
  );
};
```

### Hook Customizado

```typescript
export const useHSEForm = (): IHSEFormContext => {
  const context = React.useContext(HSEFormContext);
  if (!context) {
    throw new Error("useHSEForm deve ser usado dentro de um HSEFormProvider");
  }
  return context;
};
```

---

## Form Reducer

### `IFormState`

**Função**: Estado completo do formulário gerenciado pelo reducer.

```typescript
export interface IFormState {
  currentStep: number;
  formData: IHSEFormData;
  attachments: { [category: string]: IAttachmentMetadata[] };
  validationErrors: IValidationError[];
  isSubmitting: boolean;
  isLoading: boolean;
  submissionAttempted: boolean;
  lastSaved?: Date;
  errors: { [key: string]: string };
  isDirty: boolean;
}
```

### Estado Inicial

```typescript
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
```

### Ações do Reducer

```typescript
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
```

### Implementação do Reducer

```typescript
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

    case "SET_FORM_DATA": {
      // Conversão e transformação de dados do SharePoint
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

      return {
        ...state,
        formData: {
          ...state.formData,
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

    case "RESET_FORM": {
      return initialFormState;
    }

    default:
      return state;
  }
};
```

---

## Fase da Aplicação

### `IApplicationPhase`

**Função**: Controla a fase atual da aplicação (verificação CNPJ, formulário, revisão).

```typescript
export interface IApplicationPhase {
  phase: "CNPJ_VERIFICATION" | "FORMULARIO" | "REVISAO";
  cnpj?: string;
  isOverwrite?: boolean;
}
```

### Fluxo de Fases

1. **CNPJ_VERIFICATION**: Tela inicial para verificação de CNPJ
2. **FORMULARIO**: Preenchimento do formulário multi-step
3. **REVISAO**: Revisão final antes do envio

### Gerenciamento de Fases

```typescript
const setApplicationPhase = React.useCallback(
  (newPhase: IApplicationPhase): void => {
    console.log("=== MUDANÇA DE FASE ===");
    console.log("Fase anterior:", applicationPhase);
    console.log("Nova fase:", newPhase);

    setApplicationPhaseState(newPhase);

    // Log para debugging
    if (debugMode) {
      console.log("Estado da aplicação atualizado:", newPhase);
    }
  },
  [applicationPhase, debugMode]
);
```

---

## Gerenciamento de Anexos

### Estrutura de Anexos

```typescript
// Estado dos anexos organizado por categoria
attachments: {
  [category: string]: IAttachmentMetadata[]
}

// Exemplos de categorias:
// - "rem": Registro de Empresa Marítima
// - "iopp": Certificado IOPP
// - "testeCarga": Teste de Carga
```

### Operações com Anexos

```typescript
// Adicionar anexo
const uploadAttachment = React.useCallback(
  async (
    file: File,
    category: string,
    subcategory?: string
  ): Promise<IAttachmentMetadata> => {
    // Criar metadata local (não faz upload imediato)
    const localMetadata = sharePointFileService.createLocalFileMetadata(
      file,
      category,
      subcategory
    );

    // Registrar no estado
    dispatch({
      type: "ADD_ATTACHMENT",
      payload: {
        category,
        attachment: localMetadata,
      },
    });

    return localMetadata;
  },
  [sharePointFileService]
);

// Remover anexo
const removeAttachment = React.useCallback(
  async (category: string, attachmentId: string): Promise<void> => {
    dispatch({
      type: "REMOVE_ATTACHMENT",
      payload: {
        category,
        attachmentId,
      },
    });
  },
  []
);
```

### Persistência de Anexos

```typescript
// Salvamento no SharePoint (apenas quando salvar/submeter)
const saveFormData = React.useCallback(async (): Promise<boolean> => {
  try {
    // Salvar anexos no SharePoint se houver dados suficientes
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

    // Salvar formulário no SharePoint
    await sharePointService.saveFormData(state.formData, savedAttachments);

    return true;
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return false;
  }
}, [state, sharePointService, sharePointFileService]);
```

---

## Validação de Estado

### Validação por Etapas

```typescript
const validateStep = React.useCallback(
  async (stepNumber: number): Promise<boolean> => {
    const { formData, attachments } = state;
    const errors: IValidationError[] = [];

    const addError = (field: string, message: string): void => {
      errors.push({
        field,
        message,
        section: `step${stepNumber}`,
      });
    };

    switch (stepNumber) {
      case 1: {
        // Validação dos Dados Gerais
        if (!formData.dadosGerais.empresa) {
          addError("empresa", "Nome da empresa é obrigatório");
        }

        if (!formData.dadosGerais.cnpj) {
          addError("cnpj", "CNPJ é obrigatório");
        }

        // Verificar anexos obrigatórios
        if (!attachments.rem || attachments.rem.length === 0) {
          addError("rem", "Registro de Empresa Marítima é obrigatório");
        }

        break;
      }

      case 2: {
        // Validação da Conformidade Legal
        const conformidade = formData.conformidadeLegal;

        // Verificar se ao menos uma NR foi respondida
        const hasAnyResponse = Object.keys(conformidade).some((nrKey) => {
          const nr = conformidade[nrKey];
          return (
            nr &&
            Object.keys(nr).some((questionKey) => {
              if (questionKey === "comentarios") return false;
              const question = nr[questionKey];
              return question && question.resposta && question.resposta !== "";
            })
          );
        });

        if (!hasAnyResponse) {
          addError(
            "conformidadeLegal",
            "É necessário responder ao menos uma questão de conformidade"
          );
        }

        break;
      }

      case 3: {
        // Validação dos Serviços Especializados
        const { servicosEspeciais } = formData;

        if (servicosEspeciais.fornecedorEmbarcacoes) {
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

        if (servicosEspeciais.fornecedorIcamento) {
          // Verificar documentos técnicos obrigatórios
          const requiredDocuments = ["testeCarga", "creaEngenheiro", "art"];

          requiredDocuments.forEach((doc) => {
            const docAttachments = attachments[doc] || [];
            if (docAttachments.length === 0) {
              addError(doc, `O documento ${doc} é obrigatório`);
            }
          });
        }

        break;
      }
    }

    // Só mostrar erros se tentativa de submissão foi feita
    if (state.submissionAttempted) {
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
    }

    return errors.length === 0;
  },
  [state]
);
```

### Validação para Submissão

```typescript
const triggerSubmissionValidation =
  React.useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMISSION_ATTEMPTED", payload: true });

    // Validar todas as etapas
    const allStepsValid = await Promise.all(
      [1, 2, 3, 4].map((step) => validateStep(step))
    ).then((results) => results.every(Boolean));

    return allStepsValid;
  }, [validateStep]);
```

---

## Padrões de Uso

### Consumo do Contexto

```typescript
const MyFormComponent: React.FC = () => {
  const { state, actions, sharePointService, currentUser } = useHSEForm();

  const handleFieldChange = (field: string, value: any) => {
    actions.updateField(field, value);
  };

  const handleSave = async () => {
    const success = await actions.saveFormData();
    if (success) {
      console.log("Formulário salvo com sucesso");
    }
  };

  return <div>{/* componente do formulário */}</div>;
};
```

### Atualização de Campos Específicos

```typescript
const DadosGeraisComponent: React.FC = () => {
  const { state, dispatch } = useHSEForm();

  const handleDadosGeraisChange = React.useCallback(
    (field: string, value: unknown): void => {
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

  return <div>/* componente */</div>;
};
```

### Upload de Anexos

```typescript
const FileUploadComponent: React.FC = () => {
  const { actions, state } = useHSEForm();

  const handleFileUpload = async (file: File, category: string) => {
    try {
      const metadata = await actions.uploadAttachment(file, category);
      console.log("Arquivo anexado:", metadata);
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  return <div>/* componente de upload */</div>;
};
```

---

## Performance

### Otimizações Implementadas

#### Memoização de Serviços

```typescript
const sharePointService = React.useMemo(() => {
  return new SharePointService(context, "hse-new-register");
}, [context]);
```

#### Callbacks Memoizados

```typescript
const handleFieldChange = React.useCallback(
  (field: string, value: unknown): void => {
    // lógica de atualização
  },
  [dependencies]
);
```

#### Seletores de Estado

```typescript
// Seletor memoizado para progresso do formulário
export const formSelectors = {
  getProgress: (state: IFormState): IFormProgress => {
    // Cálculo do progresso baseado no estado atual
    const dadosGeraisProgress = calculateDadosGeraisProgress(
      state.formData.dadosGerais
    );
    const conformidadeProgress = calculateConformidadeProgress(
      state.formData.conformidadeLegal
    );
    const servicosProgress = calculateServicosProgress(
      state.formData.servicosEspeciais
    );

    return {
      dadosGerais: dadosGeraisProgress,
      conformidadeLegal: conformidadeProgress,
      servicosEspeciais: servicosProgress,
      total:
        (dadosGeraisProgress + conformidadeProgress + servicosProgress) / 3,
    };
  },
};
```

### Prevenção de Re-renders

```typescript
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
      // ... outras ações
    },
  }),
  [
    state,
    dispatch,
    sharePointService,
    sharePointFileService,
    applicationPhase,
    currentUser,
    // ... dependências das ações
  ]
);
```

---

## Debugging e Logs

### Logs de Estado

```typescript
// Debug mode logging
if (debugMode) {
  console.log("=== ESTADO DO FORMULÁRIO ===");
  console.log("Current Step:", state.currentStep);
  console.log("Form Data:", state.formData);
  console.log("Attachments:", state.attachments);
  console.log("Validation Errors:", state.validationErrors);
  console.log("Is Dirty:", state.isDirty);
}
```

### DevTools Integration

```typescript
// Extensão para Redux DevTools (se necessário)
const devToolsExtension = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
if (devToolsExtension && debugMode) {
  // Integração com DevTools para debug
}
```

---

## Próximos Passos

1. **Implementar Middleware**: Adicionar middleware para logging e debugging
2. **Melhorar Performance**: Otimizar re-renders com React.memo
3. **Adicionar Testes**: Implementar testes para reducer e contexto
4. **Documentar Estado**: Criar diagramas de fluxo de estado
5. **Implementar Undo/Redo**: Adicionar funcionalidade de histórico

Para mais detalhes sobre implementações específicas, consulte:

- [Componentes](./COMPONENTS.md)
- [Hooks](./HOOKS.md)
- [Tipos](./TYPES.md)
