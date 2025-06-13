# Tipos TypeScript - HSE Supplier Register

Este documento detalha todas as interfaces TypeScript, tipos e definições de dados utilizados no projeto HSE Supplier Register.

## Índice

- [Interfaces Principais](#interfaces-principais)
- [Tipos de Formulário](#tipos-de-formulário)
- [Tipos de Validação](#tipos-de-validação)
- [Tipos de Anexos](#tipos-de-anexos)
- [Tipos de Estado](#tipos-de-estado)
- [Tipos de Serviços](#tipos-de-serviços)
- [Tipos de Contexto](#tipos-de-contexto)

---

## Interfaces Principais

### `IHSEFormData`

**Localização**: `/types/IHSEFormData.ts`
**Função**: Interface principal que define a estrutura completa dos dados do formulário HSE.

```typescript
export interface IHSEFormData {
  // Metadados do formulário
  id?: number;
  statusFormulario:
    | "Rascunho"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado";
  usuarioPreenchimento?: string;
  dataCriacao?: Date;
  dataUltimaModificacao?: Date;

  // Blocos principais do formulário
  dadosGerais: IDadosGerais;
  conformidadeLegal: IConformidadeLegal;
  servicosEspeciais: IServicosEspeciais;

  // Campos adicionais
  outrasAcoes?: string;
  comentariosFinais?: string;
  justificativasNA?: string;

  // Anexos
  anexos: IAnexosFormulario;
}
```

**Características**:

- **Estrutura Modular**: Dividida em blocos lógicos do formulário
- **Metadados**: Informações de controle e auditoria
- **Tipagem Rigorosa**: Status do formulário com valores específicos
- **Campos Opcionais**: Flexibilidade para diferentes cenários

---

## Tipos de Formulário

### `IDadosGerais`

**Função**: Dados gerais da empresa contratada (Bloco A).

```typescript
export interface IDadosGerais {
  empresa: string;
  cnpj: string;
  numeroContrato: string;
  dataInicioContrato: Date | undefined;
  dataTerminoContrato: Date | undefined;
  escopoServico: string;
  responsavelTecnico: string;
  atividadePrincipalCNAE: string;
  totalEmpregados: number | undefined;
  empregadosParaServico: number | undefined;
  grauRisco: "1" | "2" | "3" | "4" | "";
  possuiSESMT: boolean;
  numeroComponentesSESMT: number | undefined;
  gerenteContratoMarine: string;
}
```

### `IConformidadeLegal`

**Função**: Estrutura para questões de conformidade legal (Bloco B).

```typescript
export interface IConformidadeLegal {
  nr01: INR01;
  nr04: INR04;
  nr05: INR05;
  nr06: INR06;
  nr07: INR07;
  nr09: INR09;
  nr10: INR10;
  nr11: INR11;
  nr12: INR12;
  nr13: INR13;
  nr15: INR15;
  nr23: INR23;
  licencasAmbientais: ILicencasAmbientais;
  legislacaoMaritima: ILegislacaoMaritima;
  treinamentos: ITreinamentos;
  gestaoSMS: IGestaoSMS;
}
```

### `IQuestaoConformidade`

**Função**: Estrutura padrão para questões de conformidade.

```typescript
export interface IQuestaoConformidade {
  resposta: "SIM" | "NÃO" | "NA" | "";
  comentarios?: string;
}
```

**Características**:

- **Respostas Padronizadas**: Valores específicos para consistência
- **Comentários Opcionais**: Flexibilidade para justificativas
- **Validação**: Facilita validação automática

### Interfaces de NRs Específicas

#### `INR01` - Disposições Gerais

```typescript
export interface INR01 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  questao4: IQuestaoConformidade;
  questao5: IQuestaoConformidade;
  comentarios?: string;
}
```

#### `INR04` - Serviços Especializados em Engenharia de Segurança

```typescript
export interface INR04 {
  questao7: IQuestaoConformidade;
  questao8: IQuestaoConformidade;
  comentarios?: string;
}
```

#### `INR23` - Proteção contra Incêndios

```typescript
export interface INR23 {
  questao38: IQuestaoConformidade;
  questao39: IQuestaoConformidade;
  questao40: IQuestaoConformidade;
  comentarios?: string;
}
```

### `IServicosEspeciais`

**Função**: Dados para serviços especializados (Bloco C).

```typescript
export interface IServicosEspeciais {
  fornecedorEmbarcacoes: boolean;
  embarcacoes?: IEmbarcacoes;

  fornecedorIcamento: boolean;
  icamento?: IIcamento;
}
```

### `IEmbarcacoes`

**Função**: Certificados de embarcações (questões 74-87).

```typescript
export interface IEmbarcacoes {
  iopp: IQuestaoConformidade; // Questão 74
  registroArmador: IQuestaoConformidade; // Questão 75
  propriedadeMaritima: IQuestaoConformidade; // Questão 76
  arqueacao: IQuestaoConformidade; // Questão 77
  segurancaNavegacao: IQuestaoConformidade; // Questão 78
  classificacaoCasco: IQuestaoConformidade; // Questão 79
  classificacaoMaquinas: IQuestaoConformidade; // Questão 80
  bordaLivre: IQuestaoConformidade; // Questão 81
  seguroDepem: IQuestaoConformidade; // Questão 82
  autorizacaoAntaq: IQuestaoConformidade; // Questão 83
  tripulacaoSeguranca: IQuestaoConformidade; // Questão 84
  agulhaMagnetica: IQuestaoConformidade; // Questão 85
  balsaInflavel: IQuestaoConformidade; // Questão 86
  licencaRadio: IQuestaoConformidade; // Questão 87
}
```

### `IIcamento`

**Função**: Documentos de içamento (questões 88-93).

```typescript
export interface IIcamento {
  testeCarga: IQuestaoConformidade; // Questão 88
  creaEngenheiro: IQuestaoConformidade; // Questão 89
  art: IQuestaoConformidade; // Questão 90
  planoManutencao: IQuestaoConformidade; // Questão 91
  fumacaPreta: IQuestaoConformidade; // Questão 92
  certificacaoEquipamentos: IQuestaoConformidade; // Questão 93
}
```

---

## Tipos de Validação

### `IValidationError`

**Localização**: `/types/IValidationError.ts`
**Função**: Interface para erros de validação.

```typescript
export interface IValidationError {
  field: string;
  message: string;
  section: string;
}
```

### `IValidationResult`

**Função**: Resultado de operações de validação.

```typescript
export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
  warnings?: string[];
}
```

**Exemplo de Uso**:

```typescript
const validateForm = (data: IHSEFormData): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!data.dadosGerais.empresa) {
    errors.push({
      field: "empresa",
      message: "Nome da empresa é obrigatório",
      section: "dadosGerais",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## Tipos de Anexos

### `IAttachmentMetadata`

**Localização**: `/types/IAttachmentMetadata.ts`
**Função**: Metadados de arquivos anexados.

```typescript
export interface IAttachmentMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  sharePointPath: string;
  category: string;
  subcategory: string;
  originalName: string;
  fileType: string;
  url: string;
  sharepointItemId?: number;
  uploaded?: boolean;
}
```

**Características**:

- **Identificação Única**: ID único para cada arquivo
- **Informações Completas**: Tamanho, tipo, datas
- **Integração SharePoint**: Paths e IDs do SharePoint
- **Categorização**: Sistema de categorias e subcategorias

### `IAnexosFormulario`

**Função**: Estrutura organizada de anexos por categoria.

```typescript
export interface IAnexosFormulario {
  dadosGerais: {
    rem?: IAttachmentMetadata;
  };
  conformidade: {
    sesmt?: IAttachmentMetadata;
    cipa?: IAttachmentMetadata;
    epiCA?: IAttachmentMetadata;
  };
  embarcacoes?: {
    iopp?: IAttachmentMetadata;
    registroArmador?: IAttachmentMetadata;
    propriedadeMaritima?: IAttachmentMetadata;
    // ... outros certificados
  };
  icamento?: {
    testeCarga?: IAttachmentMetadata;
    creaEngenheiro?: IAttachmentMetadata;
    art?: IAttachmentMetadata;
    // ... outros documentos
  };
}
```

---

## Tipos de Estado

### `IFormState`

**Localização**: `/types/IHSEFormData.ts`
**Função**: Estado completo do formulário no Context.

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

**Características**:

- **Controle de Fluxo**: Step atual e estados de loading
- **Dados Completos**: Formulário e anexos
- **Validação**: Erros e tentativas de submissão
- **Persistência**: Controle de alterações e último save

### `IFormProgress`

**Função**: Progresso de preenchimento do formulário.

```typescript
export interface IFormProgress {
  dadosGerais: number;
  conformidadeLegal: number;
  servicosEspeciais: number;
  total: number;
}
```

---

## Tipos de Serviços

### `ISharePointConfig`

**Função**: Configuração dos serviços SharePoint.

```typescript
export interface ISharePointConfig {
  listName: string;
  documentLibraryName: string;
  siteUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}
```

### `IFileUploadResult`

**Localização**: `/types/IFileUploadResult.ts`
**Função**: Resultado de operações de upload.

```typescript
export interface IFileUploadResult {
  success: boolean;
  metadata?: IAttachmentMetadata;
  error?: string;
  progress?: number;
}
```

---

## Tipos de Contexto

### `IApplicationPhase`

**Localização**: `/types/IApplicationPhase.ts`
**Função**: Fase atual da aplicação.

```typescript
export interface IApplicationPhase {
  phase: "CNPJ_VERIFICATION" | "FORMULARIO" | "REVISAO";
  cnpj?: string;
  isOverwrite?: boolean;
}
```

### `ICNPJVerificationResult`

**Função**: Resultado da verificação de CNPJ.

```typescript
export interface ICNPJVerificationResult {
  exists: boolean;
  canOverwrite: boolean;
  existingFormId?: number;
  message: string;
}
```

### `IUserFormSummary`

**Função**: Resumo de formulários do usuário.

```typescript
export interface IUserFormSummary {
  id: number;
  empresa: string;
  cnpj: string;
  status: string;
  dataModificacao: Date;
  percentualConclusao: number;
}
```

---

## Tipos de Ações (Reducer)

### `FormAction`

**Localização**: `/components/context/formReducer.ts`
**Função**: Ações disponíveis no reducer do formulário.

```typescript
export type FormAction =
  | { type: "UPDATE_FIELD"; payload: { field: string; value: unknown } }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_FORM_DATA"; payload: IHSEFormData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
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
```

---

## Utilitários de Tipo

### Type Guards

**Função**: Verificações de tipo em runtime.

```typescript
export const isValidQuestaoConformidade = (
  value: any
): value is IQuestaoConformidade => {
  return (
    value &&
    typeof value === "object" &&
    ["SIM", "NÃO", "NA", ""].includes(value.resposta)
  );
};

export const isValidHSEFormData = (value: any): value is IHSEFormData => {
  return (
    value &&
    typeof value === "object" &&
    value.dadosGerais &&
    value.conformidadeLegal &&
    value.servicosEspeciais
  );
};
```

### Utility Types

**Função**: Tipos utilitários para transformações.

```typescript
// Partial para updates
export type PartialHSEFormData = Partial<IHSEFormData>;

// Pick para campos específicos
export type FormMetadata = Pick<
  IHSEFormData,
  "id" | "statusFormulario" | "dataCriacao"
>;

// Omit para criação
export type CreateHSEFormData = Omit<
  IHSEFormData,
  "id" | "dataCriacao" | "dataUltimaModificacao"
>;
```

---

## Mapeamento de Constantes

### Status do Formulário

```typescript
export const FORM_STATUS = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em Análise",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
} as const;

export type FormStatus = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];
```

### Tipos de Resposta

```typescript
export const RESPOSTA_TYPES = {
  SIM: "SIM",
  NAO: "NÃO",
  NA: "NA",
  VAZIO: "",
} as const;

export type RespostaType = (typeof RESPOSTA_TYPES)[keyof typeof RESPOSTA_TYPES];
```

---

## Extensibilidade de Tipos

### Interfaces Extensíveis

```typescript
// Base interface
interface IBaseFormBlock {
  comentarios?: string;
  dataPreenchimento?: Date;
}

// Extensões específicas
interface INRBlock extends IBaseFormBlock {
  questoes: { [key: string]: IQuestaoConformidade };
}

interface ICertificateBlock extends IBaseFormBlock {
  certificados: { [key: string]: IQuestaoConformidade };
  anexosObrigatorios: string[];
}
```

### Tipos Genéricos para Reutilização

```typescript
// Generic form block
interface IFormBlock<T = any> {
  data: T;
  errors: IValidationError[];
  isValid: boolean;
}

// Usage
type DadosGeraisBlock = IFormBlock<IDadosGerais>;
type ConformidadeBlock = IFormBlock<IConformidadeLegal>;
```

---

## Considerações de Migração

### Versionamento de Tipos

```typescript
// Versioning interfaces
interface IHSEFormDataV1 {
  // versão 1.0
}

interface IHSEFormDataV2 extends IHSEFormDataV1 {
  // versão 2.0 - adiciona novos campos
  newField?: string;
}

// Migration function
const migrateFormData = (data: IHSEFormDataV1): IHSEFormDataV2 => {
  return {
    ...data,
    newField: "default value",
  };
};
```

### Compatibilidade com SharePoint

```typescript
// SharePoint-specific types
interface ISharePointFormData {
  Title: string;
  DadosFormulario: string; // JSON string
  StatusFormulario: string;
  PercentualConclusao: number;
}

// Conversion utilities
const convertToSharePoint = (data: IHSEFormData): ISharePointFormData => {
  return {
    Title: data.dadosGerais.empresa,
    DadosFormulario: JSON.stringify(data),
    StatusFormulario: data.statusFormulario,
    PercentualConclusao: calculateProgress(data),
  };
};
```

---

## Próximos Passos

1. **Adicionar Documentação JSDoc**: Documentar interfaces com comentários detalhados
2. **Implementar Validação de Runtime**: Adicionar validadores para todas as interfaces
3. **Criar Tipos de Teste**: Definir interfaces específicas para testing
4. **Otimizar Performance**: Revisar tipos para melhor performance do TypeScript
5. **Adicionar Tipos de API**: Definir interfaces para comunicação com APIs externas

Para mais detalhes sobre implementações específicas, consulte:

- [Hooks](./HOOKS.md)
- [Serviços](./SERVICES.md)
- [Componentes](./COMPONENTS.md)
