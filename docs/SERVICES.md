# Serviços - HSE Supplier Register

## Visão Geral

Este documento detalha todos os serviços utilizados no projeto HSE Supplier Register. Os serviços são responsáveis pela integração com SharePoint, validação de dados, manipulação de arquivos e outras operações de negócio.

## Arquitetura de Serviços

### Padrão de Design

```typescript
// Estrutura padrão de um serviço
export class ServiceName {
  private dependency: DependencyType;

  constructor(context: WebPartContext, config?: ConfigType) {
    this.dependency = new Dependency(context);
  }

  public async operation(): Promise<ResultType> {
    // implementação
  }
}
```

---

## Serviços Principais

### 1. SharePointService

**Localização**: `/services/SharePointService.ts`
**Função**: Gerencia todas as operações CRUD com as listas SharePoint.

#### Responsabilidades

- **Salvamento de formulários**: Persiste dados em progresso
- **Submissão final**: Envia formulários completos
- **Busca de dados**: Recupera formulários por ID ou CNPJ
- **Gestão de usuários**: Lista formulários por usuário
- **Validação de CNPJ**: Verifica duplicatas

#### Métodos Principais

##### `saveFormData(formData, attachments): Promise<number>`

```typescript
// Salva progresso do formulário (parcial)
const formId = await sharePointService.saveFormData(formData, attachments);
```

**Características**:

- Permite salvamento parcial
- Calcula percentual de conclusão automaticamente
- Status: "Em Andamento"
- Retorna ID do item criado

##### `submitFormData(formData, attachments): Promise<number>`

```typescript
// Submete formulário completo
const formId = await sharePointService.submitFormData(formData, attachments);
```

**Características**:

- Exige validação completa
- Status: "Enviado"
- Percentual de conclusão: 100%
- Dados imutáveis após submissão

##### `getFormById(itemId): Promise<IHSEFormData>`

```typescript
// Busca formulário específico
const form = await sharePointService.getFormById(123);
```

##### `searchByCNPJ(cnpj): Promise<ICNPJVerificationResult>`

```typescript
// Verifica existência de CNPJ
const result = await sharePointService.searchByCNPJ("12.345.678/0001-90");
```

##### `getUserForms(userEmail): Promise<IUserFormSummary[]>`

```typescript
// Lista formulários do usuário
const forms = await sharePointService.getUserForms("user@company.com");
```

#### Estrutura de Dados SharePoint

**Campos da Lista HSE**:

```typescript
interface SharePointListItem {
  Title: string; // Nome da empresa
  CNPJ: string; // CNPJ formatado
  NumeroContrato: string; // Número do contrato
  StatusAvaliacao: string; // Em Andamento | Enviado | Aprovado | Rejeitado
  DataEnvio: string; // ISO date string
  ResponsavelTecnico: string;
  GrauRisco: string; // Choice field: 1|2|3|4
  PercentualConclusao: number; // 0-100
  DadosFormulario: string; // JSON serializado
  EmailPreenchimento: string;
  NomePreenchimento: string;
  AnexosCount: number;
  Observacoes: string;
}
```

---

### 2. SharePointFileService

**Localização**: `/services/SharePointFileService.ts`
**Função**: Gerencia upload e organização de arquivos na Document Library.

#### Responsabilidades

- **Upload estruturado**: Organiza arquivos por CNPJ e categoria
- **Metadados**: Adiciona informações contextuais aos arquivos
- **Validação**: Verifica tipos e tamanhos permitidos
- **Progresso**: Callback de progresso para uploads longos

#### Métodos Principais

##### `saveFormAttachments(cnpj, nomeEmpresa, attachments, formularioId?, progressCallback?)`

```typescript
// Upload de todos os anexos do formulário
const savedAttachments = await fileService.saveFormAttachments(
  "12345678000190",
  "Empresa Teste Ltda",
  attachments,
  123,
  (message, percent) => console.log(`${message}: ${percent}%`)
);
```

**Estrutura de Pastas Criada**:

```
anexos-contratadas/
└── 12345678000190-EmpresaTesteLtda/
    ├── REM/
    │   └── arquivo1.pdf
    ├── SESMT/
    │   └── arquivo2.pdf
    ├── EMBARCACOES/
    │   ├── arquivo3.pdf
    │   └── arquivo4.pdf
    └── ICAMENTO/
        └── arquivo5.pdf
```

##### `checkDocumentLibraryExists(): Promise<boolean>`

```typescript
// Verifica se a biblioteca existe
const exists = await fileService.checkDocumentLibraryExists();
```

##### `createLocalFileMetadata(file, category, subcategory?): IAttachmentMetadata`

```typescript
// Cria metadata sem fazer upload (para preview)
const metadata = fileService.createLocalFileMetadata(file, "rem", "mensal");
```

#### Mapeamento de Categorias

```typescript
const ATTACHMENT_FOLDER_MAP = {
  // Dados Gerais
  rem: "REM",

  // Conformidade Legal
  sesmt: "SESMT",
  cipa: "CIPA",
  pcmso: "PCMSO",
  ppra: "PPRA",
  // ... outras NRs

  // Serviços Especiais
  iopp: "EMBARCACOES",
  registroArmador: "EMBARCACOES",
  testeCarga: "ICAMENTO",
  certificacaoEquipamentos: "ICAMENTO",
  // ... outros
};
```

---

### 3. ValidationService

**Localização**: `/services/ValidationService.ts` (implícito via utils)
**Função**: Centraliza toda a validação de dados do formulário.

#### Validadores Disponíveis

##### CNPJ

```typescript
validators.cnpj("12.345.678/0001-90"); // true/false
```

**Características**:

- Valida formato e dígitos verificadores
- Rejeita sequências inválidas (00000000000000, etc.)
- Aceita formato com ou sem pontuação

##### Email

```typescript
validators.email("user@domain.com"); // true/false
```

##### Arquivo

```typescript
validators.fileSize(file, 50); // max 50MB
validators.fileType(file, ["pdf", "doc", "docx"]);
```

##### Datas

```typescript
validators.dateRange(startDate, endDate); // endDate > startDate
```

#### Validação de Formulário Completo

```typescript
import { validateFormForSave } from "../utils/formValidation";

const result = validateFormForSave(formData, attachments);
// result: { isValid: boolean, missingFields: string[], missingAttachments: string[] }
```

---

### 4. EmailService

**Localização**: `/services/EmailService.ts`
**Função**: Gerencia notificações por email (futuro).

#### Funcionalidades Planejadas

- Notificação de submissão
- Alertas de aprovação/rejeição
- Lembretes de documentos pendentes
- Relatórios periódicos

```typescript
// Interface planejada
interface IEmailService {
  sendSubmissionNotification(
    formId: number,
    recipientEmail: string
  ): Promise<void>;
  sendApprovalNotification(formId: number, status: string): Promise<void>;
  sendReminderNotification(
    userEmail: string,
    pendingItems: string[]
  ): Promise<void>;
}
```

---

### 5. FileService (Utilitário)

**Localização**: `/services/FileService.ts`
**Função**: Utilitários para manipulação de arquivos.

#### Funcionalidades

```typescript
// Conversão de arquivo para base64
const base64 = await FileService.fileToBase64(file);

// Validação de tipo MIME
const isValid = FileService.validateMimeType(file, allowedTypes);

// Redimensionamento de imagens
const resized = await FileService.resizeImage(file, maxWidth, maxHeight);

// Geração de thumbnail
const thumbnail = await FileService.generateThumbnail(file);
```

---

## Padrões de Integração

### 1. Error Handling

```typescript
try {
  const result = await service.operation();
  return result;
} catch (error) {
  console.error("Operação falhou:", error);
  throw new Error(`Falha na operação: ${error.message}`);
}
```

### 2. Progress Callbacks

```typescript
interface IProgressCallback {
  onProgress: (message: string, percent: number) => void;
}

// Implementação
const progressCallback = {
  onProgress: (message: string, percent: number) => {
    updateUI(message, percent);
  },
};
```

### 3. Retry Logic

```typescript
// Retry automático para operações críticas
const retryOperation = async (
  operation: () => Promise<any>,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // exponential backoff
    }
  }
};
```

---

## Configuração e Setup

### 1. SharePoint Lists

**Lista HSE**: `hse-new-register`

```xml
<!-- Campos principais -->
<Field Type="Text" Name="CNPJ" DisplayName="CNPJ" Required="TRUE" />
<Field Type="Choice" Name="StatusAvaliacao" DisplayName="Status da Avaliação">
  <Choices>
    <Choice>Em Andamento</Choice>
    <Choice>Enviado</Choice>
    <Choice>Aprovado</Choice>
    <Choice>Rejeitado</Choice>
  </Choices>
</Field>
<Field Type="Note" Name="DadosFormulario" DisplayName="Dados do Formulário" />
```

**Document Library**: `anexos-contratadas`

```xml
<!-- Campos customizados -->
<Field Type="Text" Name="CNPJEmpresa" DisplayName="CNPJ da Empresa" />
<Field Type="Text" Name="CategoriaAnexo" DisplayName="Categoria do Anexo" />
<Field Type="Number" Name="FormularioId" DisplayName="ID do Formulário" />
```

### 2. Permissões

```typescript
// Permissões mínimas necessárias
const requiredPermissions = {
  lists: ["Read", "Write", "Create"],
  documentLibrary: ["Read", "Write", "Create", "Upload"],
  web: ["ViewPages", "Open"],
};
```

### 3. Configuração de Ambiente

```typescript
// Variáveis de configuração
export const SERVICE_CONFIG = {
  LIST_NAME: "hse-new-register",
  DOCUMENT_LIBRARY: "anexos-contratadas",
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_FILE_TYPES: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png"],
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MS: 30000,
};
```

---

## Performance e Otimização

### 1. Batching de Operações

```typescript
// Agrupar múltiplas operações
const batch = sp.web.createBatch();
items.forEach((item) => {
  batch.add(sp.web.lists.getByTitle(listName).items.add(item));
});
await batch.execute();
```

### 2. Caching

```typescript
// Cache simples para metadados
const cache = new Map<string, any>();

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

### 3. Lazy Loading

```typescript
// Carregar dados apenas quando necessário
const lazyLoadFormData = async (formId: number) => {
  if (!formDataCache.has(formId)) {
    const data = await sharePointService.getFormById(formId);
    formDataCache.set(formId, data);
  }
  return formDataCache.get(formId);
};
```

---

## Monitoramento e Logs

### 1. Logging Estruturado

```typescript
interface ILogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  operation: string;
  userId: string;
  formId?: number;
  message: string;
  data?: any;
}

const logger = {
  info: (operation: string, message: string, data?: any) => {
    console.log(`[INFO] ${operation}: ${message}`, data);
  },
  error: (operation: string, error: Error, data?: any) => {
    console.error(`[ERROR] ${operation}: ${error.message}`, data);
  },
};
```

### 2. Métricas de Performance

```typescript
const performanceMonitor = {
  measureOperation: async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      console.log(`Operation ${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(
        `Operation ${name} failed after ${duration.toFixed(2)}ms:`,
        error
      );
      throw error;
    }
  },
};
```

---

## Testes

### 1. Testes Unitários

```typescript
describe("SharePointService", () => {
  it("should save form data correctly", async () => {
    const mockFormData = createMockFormData();
    const mockAttachments = createMockAttachments();

    const formId = await sharePointService.saveFormData(
      mockFormData,
      mockAttachments
    );

    expect(formId).toBeGreaterThan(0);
  });
});
```

### 2. Testes de Integração

```typescript
describe("File Upload Integration", () => {
  it("should upload files and create correct folder structure", async () => {
    const files = [createMockFile("test.pdf", "rem")];

    const result = await fileService.saveFormAttachments(
      "12345678000190",
      "Test Company",
      { rem: files }
    );

    expect(result.rem).toHaveLength(1);
    expect(result.rem[0].sharePointUrl).toContain(
      "12345678000190-TestCompany/REM/"
    );
  });
});
```

---

**Próximo**: [Hooks](./HOOKS.md) - Documentação dos custom hooks
