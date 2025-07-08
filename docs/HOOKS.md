# Hooks - HSE Supplier Register

Este documento detalha todos os custom hooks utilizados no projeto HSE Supplier Register, incluindo sua funcionalidade, parâmetros e casos de uso.

## Índice

- [Hooks de Validação](#hooks-de-validação)
- [Hooks de Upload](#hooks-de-upload)
- [Hooks de Estado](#hooks-de-estado)
- [Hooks de Utilitários](#hooks-de-utilitários)

---

## Hooks de Validação

### `useFormValidation`

**Localização**: `/hooks/useFormValidation.ts`
**Função**: Hook para validação de formulários com diferentes etapas.

**Interface**:

```typescript
interface UseFormValidationReturn {
  errors: IValidationError[];
  validateStep1: (formData: IHSEFormData) => IValidationResult;
  validateStep2: (formData: IHSEFormData) => IValidationResult;
  validateCompleteForm: (
    formData: IHSEFormData,
    attachments: IAnexosFormulario
  ) => IValidationResult;
  clearErrors: () => void;
}
```

**Funcionalidades**:

- **Validação por Etapas**: Validação específica para cada step do formulário
- **Validação Completa**: Validação de todo o formulário antes do envio
- **Gerenciamento de Erros**: Estado centralizado de erros de validação
- **Limpeza de Erros**: Função para resetar estado de erros

**Validações Implementadas**:

- **Step 1 (Dados Gerais)**:

  - Campos obrigatórios: empresa, CNPJ, número do contrato
  - Validação de CNPJ
  - Validação de datas (início/término do contrato)
  - Validação de grau de risco (1-4)

- **Step 2 (Conformidade Legal)**:
  - Verificação de respostas nas NRs aplicáveis
  - Validação de comentários obrigatórios

**Exemplo de Uso**:

```typescript
const MyComponent: React.FC = () => {
  const { errors, validateStep1, clearErrors } = useFormValidation();

  const handleValidate = (formData: IHSEFormData) => {
    const result = validateStep1(formData);
    if (!result.isValid) {
      console.log("Erros encontrados:", result.errors);
    }
  };

  return <div>/* componente */</div>;
};
```

---

## Hooks de Upload

### `useSharePointUpload`

**Localização**: `/hooks/useSharePointUpload.ts`
**Função**: Hook para gerenciamento de upload de arquivos para SharePoint.

**Interface**:

```typescript
interface IUseSharePointUploadProps {
  sharePointFileService: SharePointFileService;
  cnpj: string;
  empresa: string;
  onUploadComplete?: (metadata: IAttachmentMetadata) => void;
  onUploadError?: (error: string) => void;
}

interface UseSharePointUploadReturn {
  isUploading: boolean;
  progress: number;
  uploadedFiles: IAttachmentMetadata[];
  errors: string[];
  uploadFile: (
    file: File,
    category: string,
    subcategory?: string,
    maxSizeInMB?: number
  ) => Promise<IAttachmentMetadata | null>;
  uploadMultipleFiles: (
    files: File[],
    category: string,
    subcategory?: string,
    maxSizeInMB?: number
  ) => Promise<IAttachmentMetadata[]>;
  removeFile: (fileId: string) => Promise<boolean>;
  clearErrors: () => void;
  clearAllFiles: () => void;
  validateFile: (file: File, maxSizeInMB?: number) => string | null;
}
```

**Funcionalidades**:

- **Upload Simples**: Upload de arquivo único
- **Upload Múltiplo**: Upload de vários arquivos simultaneamente
- **Validação de Arquivos**: Verificação de tipo e tamanho
- **Progresso Visual**: Tracking do progresso de upload
- **Gerenciamento de Erros**: Estado centralizado de erros
- **Remoção de Arquivos**: Funcionalidade para remover arquivos

**Validações de Arquivo**:

- **Tipos Permitidos**: PDF, Excel, Word, Imagens (JPG, PNG)
- **Tamanho Máximo**: Configurável (padrão 50MB)
- **Validação de Extensão**: Verificação de extensões permitidas

**Exemplo de Uso**:

```typescript
const MyUploadComponent: React.FC = () => {
  const { uploadFile, isUploading, progress, errors } = useSharePointUpload({
    sharePointFileService,
    cnpj: "12345678000199",
    empresa: "Empresa Teste",
    onUploadComplete: (metadata) => console.log("Upload completo:", metadata),
    onUploadError: (error) => console.error("Erro:", error),
  });

  const handleFileUpload = async (file: File) => {
    const result = await uploadFile(file, "rem", "documentos");
    if (result) {
      console.log("Arquivo enviado:", result);
    }
  };

  return <div>/* componente de upload */</div>;
};
```

---

## Hooks de Estado

### `useLocalStorage`

**Localização**: `/hooks/useLocalStorage.ts`
**Função**: Hook para gerenciamento de estado persistente no localStorage.

**Interface**:

```typescript
type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((val: T) => T)) => void,
  () => void
];

const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): UseLocalStorageReturn<T>
```

**Funcionalidades**:

- **Estado Persistente**: Sincronização automática com localStorage
- **Tipo Genérico**: Suporte a qualquer tipo de dados
- **Função de Update**: Suporte a função callback para updates
- **Remoção**: Função para remover dados do localStorage
- **Tratamento de Erros**: Error handling para operações de localStorage

**Exemplo de Uso**:

```typescript
const MyComponent: React.FC = () => {
  const [formDraft, setFormDraft, removeFormDraft] =
    useLocalStorage<IHSEFormData>("hse_form_draft", initialFormData);

  const updateDraft = (newData: IHSEFormData) => {
    setFormDraft(newData);
  };

  const clearDraft = () => {
    removeFormDraft();
  };

  return <div>/* componente */</div>;
};
```

### `useScreenLock`

**Localização**: `/hooks/useScreenLock.ts`
**Função**: Hook para controlar o bloqueio da tela durante operações críticas.

**Funcionalidades**:

- **Prevenção de Navegação**: Bloqueia saída da página durante operações
- **Controle de Estado**: Gerencia estado de bloqueio
- **Cleanup Automático**: Remove listeners ao desmontar componente

**Exemplo de Uso**:

```typescript
const MyComponent: React.FC = () => {
  const { lockScreen, unlockScreen, isLocked } = useScreenLock();

  const handleCriticalOperation = async () => {
    lockScreen();
    try {
      await performCriticalTask();
    } finally {
      unlockScreen();
    }
  };

  return <div>/* componente */</div>;
};
```

---

## Hooks de Utilitários

### Hook Pattern no Contexto HSE

**Localização**: `/components/context/HSEFormContext.tsx`
**Função**: `useHSEForm()` - Hook principal para acessar o contexto do formulário.

**Interface**:

```typescript
const useHSEForm = (): IHSEFormContext => {
  const context = React.useContext(HSEFormContext);
  if (!context) {
    throw new Error("useHSEForm deve ser usado dentro de um HSEFormProvider");
  }
  return context;
};
```

**Funcionalidades Disponíveis**:

- **Estado do Formulário**: Acesso completo ao estado atual
- **Ações de Formulário**: Todas as funções de manipulação
- **Serviços**: Acesso aos serviços SharePoint
- **Validação**: Funções de validação integradas

**Exemplo de Uso**:

```typescript
const MyFormComponent: React.FC = () => {
  const { state, actions, sharePointService, currentUser } = useHSEForm();

  const handleSave = async () => {
    const success = await actions.saveFormData();
    if (success) {
      console.log("Formulário salvo com sucesso");
    }
  };

  return <div>/* componente do formulário */</div>;
};
```

---

## Padrões de Uso dos Hooks

### 1. Composição de Hooks

```typescript
const ComplexFormComponent: React.FC = () => {
  // Hook principal do contexto
  const { state, actions } = useHSEForm();

  // Hook de validação
  const { validateStep1, errors } = useFormValidation();

  // Hook de upload
  const { uploadFile, isUploading } = useSharePointUpload({
    sharePointFileService,
    cnpj: state.formData.dadosGerais.cnpj,
    empresa: state.formData.dadosGerais.empresa,
  });

  // Hook de localStorage
  const [draft, setDraft] = useLocalStorage("form_draft", null);

  // Lógica do componente...
};
```

### 2. Error Handling

```typescript
const ComponentWithErrorHandling: React.FC = () => {
  const { actions } = useHSEForm();
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await actions.submitForm();
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    }
  };

  return (
    <div>
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}
      {/* resto do componente */}
    </div>
  );
};
```

### 3. Cleanup e Memory Management

```typescript
const ComponentWithCleanup: React.FC = () => {
  const { uploadFile, clearErrors } = useSharePointUpload({
    // configurações...
  });

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  return <div>/* componente */</div>;
};
```

---

## Considerações de Performance

### 1. Memoização de Hooks

- Uso de `useCallback` e `useMemo` nos hooks customizados
- Prevenção de re-renders desnecessários
- Otimização de dependências

### 2. Debouncing e Throttling

- Implementação de debounce em validações
- Throttling em operações de save automático
- Rate limiting em uploads

### 3. Lazy Loading

- Carregamento lazy de validações complexas
- Inicialização tardia de serviços pesados
- Cleanup automático de recursos

---

## Próximos Passos

1. **Expandir Validações**: Adicionar mais regras de validação específicas
2. **Melhorar Performance**: Otimizar hooks com memoização avançada
3. **Adicionar Testes**: Implementar testes unitários para todos os hooks
4. **Documentar Edge Cases**: Documentar casos especiais e limitações
5. **Implementar Retry Logic**: Adicionar lógica de retry em operações de rede

Para mais detalhes sobre implementações específicas, consulte:

- [Componentes](./COMPONENTS.md)
- [Serviços](./SERVICES.md)
- [Tipos](./TYPES.md)
