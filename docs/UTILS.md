# Utilitários - HSE Supplier Register

Este documento detalha todas as funções utilitárias, formatadores, validadores e constantes utilizados no projeto HSE Supplier Register.

## Índice

- [Validadores](#validadores)
- [Formatadores](#formatadores)
- [Constantes de Formulário](#constantes-de-formulário)
- [Utilitários de Validação](#utilitários-de-validação)
- [Utilitários de Arquivo](#utilitários-de-arquivo)
- [Utilitários de Exportação](#utilitários-de-exportação)
- [Helpers Gerais](#helpers-gerais)

---

## Validadores

### `validators`

**Localização**: `/utils/validators.ts`
**Função**: Conjunto de funções de validação para diferentes tipos de dados.

```typescript
export const validators = {
  required: (value: any): boolean;
  cnpj: (cnpj: string): boolean;
  email: (email: string): boolean;
  dateRange: (startDate: string | null, endDate: string | null): boolean;
  fileSize: (file: File, maxSizeMB: number): boolean;
  fileType: (file: File, allowedTypes: string[]): boolean;
};
```

#### `validators.required`

**Função**: Valida se um campo é obrigatório.

```typescript
const isValid = validators.required("texto"); // true
const isEmpty = validators.required(""); // false
const isNumber = validators.required(123); // true
```

#### `validators.cnpj`

**Função**: Valida CNPJ brasileiro com verificação de dígitos.

```typescript
const validCNPJ = validators.cnpj("11.222.333/0001-81"); // true/false
const invalidCNPJ = validators.cnpj("11111111111111"); // false (sequência)
```

**Características**:

- Remove formatação automaticamente
- Verifica sequências inválidas (todos os dígitos iguais)
- Calcula e valida dígitos verificadores
- Suporta entrada com ou sem formatação

#### `validators.email`

**Função**: Valida formato de email.

```typescript
const validEmail = validators.email("usuario@empresa.com.br"); // true
const invalidEmail = validators.email("email-invalido"); // false
```

#### `validators.dateRange`

**Função**: Valida se uma data final é posterior à inicial.

```typescript
const validRange = validators.dateRange("2024-01-01", "2024-12-31"); // true
const invalidRange = validators.dateRange("2024-12-31", "2024-01-01"); // false
```

#### `validators.fileSize`

**Função**: Valida tamanho de arquivo.

```typescript
const isValidSize = validators.fileSize(file, 10); // máximo 10MB
```

#### `validators.fileType`

**Função**: Valida tipo de arquivo por extensão.

```typescript
const allowedTypes = [".pdf", ".docx", ".xlsx"];
const isValidType = validators.fileType(file, allowedTypes);
```

### `validateFormForSave`

**Função**: Validação completa do formulário antes de salvar.

```typescript
export const validateFormForSave = (
  formData: any,
  attachments: any
): IValidationResult => {
  // Retorna objeto com campos e anexos faltantes
};
```

**Retorno**:

```typescript
interface IValidationResult {
  isValid: boolean;
  missingFields: string[];
  missingAttachments: string[];
}
```

**Exemplo de Uso**:

```typescript
const result = validateFormForSave(formData, attachments);
if (!result.isValid) {
  console.log("Campos faltantes:", result.missingFields);
  console.log("Anexos faltantes:", result.missingAttachments);
}
```

---

## Formatadores

### `formatters`

**Localização**: `/utils/formatters.ts`
**Função**: Funções para formatação de dados para exibição.

```typescript
export const formatters = {
  cnpj: (value: string): string;
  fileSize: (bytes: number): string;
  date: (dateString: string | null): string;
  currency: (value: number): string;
  percentage: (value: number): string;
};
```

#### `formatters.cnpj`

**Função**: Formata CNPJ com máscara visual.

```typescript
const formatted = formatters.cnpj("12345678000195");
// Resultado: "12.345.678/0001-95"
```

#### `formatters.fileSize`

**Função**: Converte bytes para formato legível.

```typescript
const size1 = formatters.fileSize(1024); // "1 KB"
const size2 = formatters.fileSize(1048576); // "1 MB"
const size3 = formatters.fileSize(1073741824); // "1 GB"
```

#### `formatters.date`

**Função**: Formata data para padrão brasileiro.

```typescript
const formatted = formatters.date("2024-12-31");
// Resultado: "31/12/2024"
```

#### `formatters.currency`

**Função**: Formata valores monetários em Real.

```typescript
const price = formatters.currency(1234.56);
// Resultado: "R$ 1.234,56"
```

#### `formatters.percentage`

**Função**: Formata percentuais.

```typescript
const percent = formatters.percentage(75.5);
// Resultado: "76%"
```

---

## Constantes de Formulário

### `FORM_CONSTANTS`

**Localização**: `/utils/formConstants.ts`
**Função**: Constantes utilizadas em todo o formulário.

#### Opções de Resposta

```typescript
export const RESPOSTA_OPTIONS = [
  { key: "SIM", text: "Sim" },
  { key: "NÃO", text: "Não" },
  { key: "NA", text: "Não se Aplica" },
];
```

#### Certificados Marítimos

```typescript
export const MARITIME_CERTIFICATES = {
  iopp: "Certificado Internacional de Prevenção da Poluição por Óleo",
  registroArmador: "Registro de Armador",
  propriedadeMaritima: "Certidão de Propriedade Marítima",
  arqueacao: "Certificado de Arqueação",
  segurancaNavegacao: "Certificado de Segurança da Navegação",
  // ... outros certificados
};
```

#### Documentos de Içamento

```typescript
export const LIFTING_DOCUMENTS = {
  testeCarga: "Teste de Carga",
  creaEngenheiro: "CREA do Engenheiro Responsável",
  art: "ART - Anotação de Responsabilidade Técnica",
  planoManutencao: "Plano de Manutenção",
  fumacaPreta: "Certificado de Opacidade de Fumaça Preta",
  certificacaoEquipamentos: "Certificação dos Equipamentos",
};
```

#### Etapas do Formulário

```typescript
export const FORM_STEPS = [
  {
    id: 1,
    title: "Dados Gerais",
    description: "Informações básicas da empresa e contrato",
    icon: "ContactInfo",
    requiredFields: [
      "dadosGerais.empresa",
      "dadosGerais.cnpj",
      "dadosGerais.numeroContrato",
      // ... outros campos
    ],
  },
  {
    id: 2,
    title: "Conformidade Legal",
    description: "Questões de conformidade com NRs",
    icon: "ComplianceAudit",
  },
  // ... outras etapas
];
```

#### Mensagens de Validação

```typescript
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Campo obrigatório",
  INVALID_CNPJ: "CNPJ inválido",
  INVALID_EMAIL: "Email inválido",
  FILE_TOO_LARGE: "Arquivo muito grande",
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido",
  MIN_LENGTH: "Mínimo de caracteres: ",
  MAX_LENGTH: "Máximo de caracteres: ",
  INVALID_DATE: "Data inválida",
  DATE_BEFORE_TODAY: "Data deve ser posterior a hoje",
  END_DATE_BEFORE_START: "Data de término deve ser posterior à data de início",
};
```

---

## Utilitários de Validação

### `formValidation`

**Localização**: `/utils/formValidation.ts`
**Função**: Utilitários específicos para validação do formulário HSE.

#### `validateFormForSave`

```typescript
export const validateFormForSave = (
  formData: unknown,
  attachments: unknown
): IValidationResult => {
  // Validação completa do formulário
};
```

#### `generateValidationMessage`

```typescript
export const generateValidationMessage = (
  missingFields: string[],
  missingAttachments: string[]
): string => {
  // Gera mensagem de erro amigável
};
```

#### `mapMissingFieldsToFormFields`

```typescript
export const mapMissingFieldsToFormFields = (
  missingFields: string[]
): { [key: string]: string } => {
  // Mapeia campos faltantes para mensagens específicas
};
```

**Exemplo de Uso**:

```typescript
const validation = validateFormForSave(formData, attachments);
if (!validation.isValid) {
  const message = generateValidationMessage(
    validation.missingFields,
    validation.missingAttachments
  );
  const fieldErrors = mapMissingFieldsToFormFields(validation.missingFields);

  console.log("Mensagem:", message);
  console.log("Erros por campo:", fieldErrors);
}
```

---

## Utilitários de Arquivo

### `fileValidators`

**Localização**: `/utils/fileValidators.ts`
**Função**: Validações específicas para arquivos.

```typescript
export const fileValidators = {
  validateFileType: (fileName: string, allowedExtensions: string[]): boolean;
  validateFileSize: (fileSize: number, maxSizeMB: number): boolean;
  getFileExtension: (fileName: string): string;
  getMimeType: (fileName: string): string;
  isImageFile: (fileName: string): boolean;
  isPDFFile: (fileName: string): boolean;
  isOfficeFile: (fileName: string): boolean;
};
```

#### Exemplo de Uso

```typescript
const file = inputFile;
const isValid = fileValidators.validateFileType(file.name, [".pdf", ".docx"]);
const sizeOk = fileValidators.validateFileSize(file.size, 10); // 10MB max

if (fileValidators.isPDFFile(file.name)) {
  console.log("É um arquivo PDF");
}
```

---

## Utilitários de Exportação

### `exportUtils`

**Localização**: `/utils/exportUtils.ts`
**Função**: Utilitários para exportação de dados.

```typescript
export const exportUtils = {
  exportToJSON: (data: any, fileName: string): void;
  exportToCSV: (data: any[], fileName: string): void;
  generatePDFReport: (formData: IHSEFormData): Promise<Blob>;
  downloadFile: (blob: Blob, fileName: string): void;
};
```

#### `exportToJSON`

```typescript
const exportData = () => {
  exportUtils.exportToJSON(formData, "formulario-hse.json");
};
```

#### `exportToCSV`

```typescript
const exportReports = () => {
  const reportData = [
    { empresa: "Empresa A", status: "Aprovado", data: "2024-01-01" },
    { empresa: "Empresa B", status: "Pendente", data: "2024-01-02" },
  ];

  exportUtils.exportToCSV(reportData, "relatorio-hse.csv");
};
```

---

## Helpers Gerais

### Utilitários de Data

```typescript
export const dateUtils = {
  formatToBrazilian: (date: Date): string => {
    return date.toLocaleDateString("pt-BR");
  },

  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  isWeekend: (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  getBusinessDays: (startDate: Date, endDate: Date): number => {
    // Calcula dias úteis entre duas datas
  },
};
```

### Utilitários de String

```typescript
export const stringUtils = {
  removeSpecialChars: (str: string): string => {
    return str.replace(/[^a-zA-Z0-9\s]/g, "");
  },

  capitalizeWords: (str: string): string => {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  },

  truncate: (str: string, maxLength: number): string => {
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  },

  sanitizeFileName: (fileName: string): string => {
    return fileName.replace(/[^a-z0-9.-]/gi, "_");
  },
};
```

### Utilitários de Array

```typescript
export const arrayUtils = {
  groupBy: <T>(
    array: T[],
    keyFn: (item: T) => string
  ): { [key: string]: T[] } => {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as { [key: string]: T[] });
  },

  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  sortBy: <T>(array: T[], keyFn: (item: T) => any): T[] => {
    return array.sort((a, b) => {
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  },
};
```

### Utilitários de URL e Query String

```typescript
export const urlUtils = {
  getQueryParams: (): { [key: string]: string } => {
    const params = new URLSearchParams(window.location.search);
    const result: { [key: string]: string } = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  buildQueryString: (params: { [key: string]: string }): string => {
    const query = new URLSearchParams(params);
    return query.toString();
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
```

---

## Constantes de Configuração

### Configurações de Arquivo

```typescript
export const FILE_CONFIG = {
  MAX_SIZE_MB: 100,
  ALLOWED_TYPES: [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".jpg", ".png"],
  MIME_TYPES: {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
};
```

### Configurações de UI

```typescript
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  PROGRESS_UPDATE_INTERVAL: 100,
};
```

### Configurações de SharePoint

```typescript
export const SHAREPOINT_CONFIG = {
  LIST_NAME: "hse-new-register",
  DOCUMENT_LIBRARY: "HSE Documents",
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 30000,
};
```

---

## Padrões de Uso

### Composição de Validadores

```typescript
const validateComplexField = (value: string): boolean => {
  return (
    validators.required(value) && validators.email(value) && value.length >= 10
  );
};
```

### Pipeline de Formatação

```typescript
const formatDisplayValue = (rawValue: string): string => {
  return stringUtils.capitalizeWords(stringUtils.removeSpecialChars(rawValue));
};
```

### Tratamento de Erros

```typescript
const safeValidator = (validator: Function, value: any): boolean => {
  try {
    return validator(value);
  } catch (error) {
    console.error("Erro na validação:", error);
    return false;
  }
};
```

---

## Performance e Otimização

### Memoização de Validadores

```typescript
const memoizedCNPJValidator = (() => {
  const cache = new Map<string, boolean>();

  return (cnpj: string): boolean => {
    if (cache.has(cnpj)) {
      return cache.get(cnpj)!;
    }

    const result = validators.cnpj(cnpj);
    cache.set(cnpj, result);
    return result;
  };
})();
```

### Debounce para Validações

```typescript
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Uso
const debouncedValidation = debounce(validateField, 300);
```

---

## Testes e Qualidade

### Casos de Teste para Validadores

```typescript
// Exemplos de casos de teste
const testCases = {
  cnpj: [
    { input: "11.222.333/0001-81", expected: true },
    { input: "11111111111111", expected: false },
    { input: "12345678000195", expected: true },
  ],
  email: [
    { input: "user@domain.com", expected: true },
    { input: "invalid-email", expected: false },
  ],
};
```

### Cobertura de Validação

```typescript
const validateAllFields = (data: IHSEFormData): string[] => {
  const errors: string[] = [];

  // Validar todos os campos obrigatórios
  Object.keys(data.dadosGerais).forEach((field) => {
    if (!validators.required(data.dadosGerais[field])) {
      errors.push(`Campo ${field} é obrigatório`);
    }
  });

  return errors;
};
```

---

## Próximos Passos

1. **Expandir Utilitários**: Adicionar mais funções de formatação e validação
2. **Melhorar Performance**: Implementar cache e memoização
3. **Adicionar Testes**: Criar testes unitários para todas as funções
4. **Documentar Edge Cases**: Documentar casos especiais e limitações
5. **Internacionalização**: Preparar utilitários para múltiplos idiomas

Para mais detalhes sobre implementações específicas, consulte:

- [Tipos](./TYPES.md)
- [Hooks](./HOOKS.md)
- [Serviços](./SERVICES.md)
