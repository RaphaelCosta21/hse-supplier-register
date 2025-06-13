# Estrutura Completa de Pastas e Arquivos - HSE Supplier Register

## 📁 Estrutura Raiz do Projeto

```
hse-supplier-register/
├── 📁 .git/                    # Controle de versão Git
├── 📁 .vscode/                 # Configurações do VS Code
├── 📁 config/                  # Configurações do SPFx
├── 📁 docs/                    # Documentação do projeto
├── 📁 lib/                     # Build output (TypeScript compilado)
├── 📁 node_modules/            # Dependências npm
├── 📁 release/                 # Pacotes de deployment (.sppkg)
├── 📁 src/                     # Código fonte principal
├── 📁 teams/                   # Assets para Microsoft Teams
├── 📁 temp/                    # Arquivos temporários de build
├── 📄 .eslintrc.js            # Configuração do ESLint
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📄 .npmignore              # Arquivos ignorados pelo npm
├── 📄 .yo-rc.json             # Configurações do Yeoman
├── 📄 gulpfile.js             # Configurações do Gulp
├── 📄 package.json            # Dependências e scripts npm
├── 📄 package-lock.json       # Lockfile das dependências
├── 📄 README.md               # Documentação básica
└── 📄 tsconfig.json           # Configurações TypeScript
```

---

## 📁 Pasta `src/` - Código Fonte Principal

### 📂 src/webparts/hseNewSupplier/

Esta é a pasta principal do webpart contendo toda a lógica da aplicação:

```
src/webparts/hseNewSupplier/
├── 📁 assets/                          # Recursos estáticos
├── 📁 components/                      # Componentes React
├── 📁 hooks/                          # Custom hooks
├── 📁 loc/                            # Arquivos de localização
├── 📁 schemas/                        # Esquemas de validação
├── 📁 services/                       # Serviços e integrações
├── 📁 styles/                         # Estilos globais
├── 📁 types/                          # Definições TypeScript
├── 📁 utils/                          # Utilitários e helpers
├── 📄 HseNewSupplierWebPart.ts        # WebPart principal
└── 📄 HseNewSupplierWebPart.manifest.json # Manifesto do WebPart
```

---

## 📁 Pasta `assets/` - Recursos Estáticos

**Localização:** `src/webparts/hseNewSupplier/assets/`

```
assets/
├── 📄 logo-black.png          # Logo em preto (tema claro)
├── 📄 logo-blue.png           # Logo em azul (principal)
├── 📄 logo-white.png          # Logo em branco (tema escuro)
├── 📄 welcome-dark.png        # Imagem de boas-vindas (tema escuro)
└── 📄 welcome-light.png       # Imagem de boas-vindas (tema claro)
```

**Função:** Armazena todos os recursos visuais estáticos utilizados na aplicação, incluindo logos e imagens de interface.

---

## 📁 Pasta `components/` - Componentes React

**Localização:** `src/webparts/hseNewSupplier/components/`

### 📂 Estrutura Principal dos Componentes

```
components/
├── 📁 CNPJVerification/               # Verificação de CNPJ
├── 📁 common/                         # Componentes reutilizáveis
├── 📁 context/                        # Context API e providers
├── 📁 formBlocks/                     # Blocos do formulário
├── 📁 screens/                        # Telas da aplicação
├── 📄 HseNewSupplier.tsx              # Componente raiz
├── 📄 HseNewSupplier.module.scss      # Estilos do componente raiz
├── 📄 HseNewSupplier.module.scss.ts   # Tipos gerados dos estilos
└── 📄 IHseNewSupplierProps.ts         # Interface de props
```

### 📂 components/CNPJVerification/

**Função:** Gerencia a verificação e validação de CNPJ antes do preenchimento do formulário.

```
CNPJVerification/
├── 📄 CNPJVerificationStep.tsx        # Componente principal de verificação
└── 📄 CNPJVerificationStep.module.scss # Estilos específicos
```

**CNPJVerificationStep.tsx** - Funcionalidades:

- ✅ Formatação automática de CNPJ (##.###.###/####-##)
- 🔍 Validação matemática de dígitos verificadores
- 🔄 Verificação contra base de dados SharePoint
- 📋 Detecção de fornecedores já cadastrados
- ⚠️ Modal de confirmação para sobrescrita
- 🎯 Validação em tempo real durante digitação
- 🔄 Estados de loading durante verificação
- 📝 Tratamento de erros específicos (conexão, formato, etc.)

### 📂 components/common/

**Função:** Componentes reutilizáveis utilizados em múltiplas partes da aplicação.

```
common/
├── 📁 BackToHomeButton/               # Botão de retorno
├── 📁 FloatingSaveButton/             # Botão flutuante de salvar
├── 📁 FormNavigation/                 # Navegação entre etapas
├── 📁 LoadingOverlay/                 # Overlay de carregamento
├── 📁 LoadingSpinner/                 # Spinner de loading
├── 📁 ProgressIndicator/              # Indicador de progresso
├── 📁 SectionTitle/                   # Títulos de seção
├── 📁 Toast/                          # Notificações toast
├── 📄 HSEFileUploadSharePoint.tsx     # Upload de arquivos v1
├── 📄 ProgressModal.tsx               # Modal de progresso
├── 📄 ProgressModal.module.scss       # Estilos do modal
├── 📄 ProgressModal.module.scss.ts    # Tipos do modal
└── 📄 SharePointFileUpload.tsx        # Upload de arquivos v2
```

#### 📂 BackToHomeButton/

```
BackToHomeButton/
├── 📄 BackToHomeButton.tsx            # Componente de retorno
├── 📄 BackToHomeButton.module.scss    # Estilos específicos
└── 📄 BackToHomeButton.module.scss.d.ts # Definições TypeScript
```

**Função:** Botão estilizado para retornar à página inicial do SharePoint.

#### 📂 FloatingSaveButton/

```
FloatingSaveButton/
├── 📄 FloatingSaveButton.tsx          # Botão flutuante
└── 📄 FloatingSaveButton.module.scss  # Estilos flutuantes
```

**Função:** Botão de salvamento que permanece visível durante o scroll.

#### 📂 FormNavigation/

```
FormNavigation/
├── 📄 FormNavigation.tsx              # Navegação principal
├── 📄 FormNavigation.module.scss      # Estilos de navegação
└── 📄 IFormNavigationProps.ts         # Interface de props
```

**Função:** Sistema de navegação entre as etapas do formulário com validação.

#### 📂 LoadingOverlay/

```
LoadingOverlay/
├── 📄 LoadingOverlay.tsx              # Overlay de loading
├── 📄 LoadingOverlay.module.scss      # Estilos de overlay
└── 📄 index.ts                        # Export principal
```

**Função:** Overlay que cobre toda a tela durante operações críticas.

#### 📂 LoadingSpinner/

```
LoadingSpinner/
├── 📄 LoadingSpinner.tsx              # Spinner animado
└── 📄 LoadingSpinner.module.scss      # Animações CSS
```

**Função:** Indicador visual de carregamento com animações suaves.

#### 📂 ProgressIndicator/

```
ProgressIndicator/
├── 📄 ProgressIndicator.tsx           # Indicador de progresso
├── 📄 ProgressIndicator.module.scss   # Estilos do indicador
└── 📄 IProgressIndicatorProps.ts      # Props do componente
```

**Função:** Barra de progresso que mostra o avanço nas etapas do formulário.

#### 📂 SectionTitle/

```
SectionTitle/
├── 📄 SectionTitle.tsx                # Títulos padronizados
├── 📄 SectionTitle.module.scss        # Estilos de títulos
└── 📄 index.ts                        # Export
```

**Função:** Componente para títulos consistentes de seções.

#### 📂 Toast/

```
Toast/
├── 📄 Toast.tsx                       # Notificações toast
├── 📄 Toast.module.scss               # Estilos de notificação
└── 📄 index.ts                        # Export
```

**Função:** Sistema de notificações não-intrusivas para feedback ao usuário.

### 📂 components/context/

**Função:** Gerenciamento de estado global da aplicação usando Context API.

```
context/
├── 📄 HSEFormContext.tsx              # Context principal
├── 📄 HSEFormProvider.tsx             # Provider do contexto
└── 📄 formReducer.ts                  # Reducer para estado
```

**HSEFormContext.tsx** - Funcionalidades:

- 🏪 Context principal da aplicação
- 📊 Estado global do formulário
- 🔧 Actions para manipulação de dados
- 🎯 Tipos TypeScript para type safety

**HSEFormProvider.tsx** - Funcionalidades:

- 🎁 Provider que envolve a aplicação
- 🔄 Inicialização do estado
- 💾 Persistência em localStorage
- 🔄 Sincronização com SharePoint

**formReducer.ts** - Funcionalidades:

- ⚡ Reducer para gerenciar mudanças de estado
- 🔄 Actions para cada tipo de operação
- 📋 Validação de estado
- 🎯 Immutabilidade garantida

### 📂 components/formBlocks/

**Função:** Blocos principais do formulário multi-etapas.

```
formBlocks/
├── 📁 ConformidadeLegal/               # Etapa de conformidade
├── 📁 DadosGerais/                     # Etapa de dados básicos
├── 📁 RevisaoFinal/                    # Etapa de revisão
└── 📁 ServicosEspeciais/               # Etapa de serviços
```

#### 📂 ConformidadeLegal/

```
ConformidadeLegal/
├── 📁 subcomponents/                   # Sub-componentes específicos
├── 📄 ConformidadeLegal.tsx            # Componente principal
├── 📄 ConformidadeLegal.module.scss    # Estilos específicos
└── 📄 IConformidadeLegalProps.ts       # Interface de props
```

**subcomponents/**:

```
subcomponents/
├── 📄 NR01Section.tsx                  # Seção NR-01
├── 📄 NR04Section.tsx                  # Seção NR-04
└── 📄 NR05Section.tsx                  # Seção NR-05
```

**Função:** Gerencia documentos de conformidade legal e normas regulamentadoras.

#### 📂 DadosGerais/

```
DadosGerais/
├── 📄 DadosGerais.tsx                  # Componente principal
├── 📄 DadosGerais.module.scss          # Estilos específicos
└── 📄 IDadosGeraisProps.ts             # Interface de props
```

**Função:** Coleta informações básicas da empresa (razão social, endereço, etc.).

#### 📂 RevisaoFinal/

```
RevisaoFinal/
├── 📄 RevisaoFinal.tsx                 # Componente de revisão
├── 📄 RevisaoFinal.module.scss         # Estilos de revisão
├── 📄 IRevisaoFinalProps.ts            # Interface de props
└── 📄 test-visual.html                 # Teste visual manual
```

**Função:** Tela final para revisão e confirmação antes do envio.

#### 📂 ServicosEspeciais/

```
ServicosEspeciais/
├── 📁 subcomponents/                   # Sub-componentes específicos
├── 📄 ServicosEspeciais.tsx            # Componente principal
├── 📄 ServicosEspeciais.module.scss    # Estilos específicos
└── 📄 IServicosEspeciaisProps.ts       # Interface de props
```

**subcomponents/**:

```
subcomponents/
├── 📄 EmbarcacoesSection.tsx           # Seção de embarcações
└── 📄 IcamentoSection.tsx              # Seção de içamento
```

**Função:** Gerencia serviços especializados oferecidos pelo fornecedor.

### 📂 components/screens/

**Função:** Telas principais da aplicação.

```
screens/
└── 📄 InitialScreen.tsx                # Tela inicial/boas-vindas
```

**InitialScreen.tsx** - Funcionalidades:

- 🎨 Interface de boas-vindas
- 🔄 Verificação de estado anterior
- 🚀 Inicialização do processo
- 📱 Design responsivo

---

## 📁 Pasta `hooks/` - Custom Hooks

**Localização:** `src/webparts/hseNewSupplier/hooks/`

```
hooks/
├── 📄 useFileUpload.ts                # Hook para upload de arquivos
├── 📄 useFileValidation.ts            # Hook para validação de arquivos
├── 📄 useFormPersistence.ts           # Hook para persistência
├── 📄 useFormValidation.ts            # Hook para validação de formulário
├── 📄 useLocalStorage.ts              # Hook para localStorage
├── 📄 useScreenLock.ts                # Hook para bloqueio de tela
├── 📄 useSharePointList.ts            # Hook para listas SharePoint
└── 📄 useSharePointUpload.ts          # Hook para upload SharePoint
```

### Detalhamento dos Hooks

**useFileUpload.ts** - Funcionalidades:

- 📁 Gerenciamento de upload de múltiplos arquivos
- 📊 Controle de progresso individual
- ⚠️ Tratamento de erros por arquivo
- 🔄 Retry automático em falhas

**useFileValidation.ts** - Funcionalidades:

- ✅ Validação de tipos de arquivo permitidos
- 📏 Verificação de tamanho máximo
- 🔍 Validação de conteúdo (quando aplicável)
- 📋 Relatórios detalhados de validação

**useFormPersistence.ts** - Funcionalidades:

- 💾 Auto-save periódico do formulário
- 🔄 Recuperação após reload da página
- 🗂️ Versioning de dados salvos
- 🧹 Limpeza de dados antigos

**useFormValidation.ts** - Funcionalidades:

- 📝 Validação por etapas do formulário
- ⚡ Validação em tempo real
- 🎯 Mensagens de erro específicas
- 🔄 Revalidação automática

**useLocalStorage.ts** - Funcionalidades:

- 💾 Interface type-safe para localStorage
- 🔄 Serialização/deserialização automática
- ⚠️ Tratamento de erros de quota
- 🧹 Limpeza automática

**useScreenLock.ts** - Funcionalidades:

- 🔒 Bloqueio de navegação durante operações críticas
- ⚠️ Alertas de saída não salva
- 🔄 Estados de loading global
- 🎯 Controle granular de locks

**useSharePointList.ts** - Funcionalidades:

- 📊 CRUD operations em listas SharePoint
- 🔍 Queries otimizadas
- 📦 Cache inteligente
- ⚠️ Error handling robusto

**useSharePointUpload.ts** - Funcionalidades:

- ☁️ Upload para Document Libraries
- 📊 Progresso detalhado por arquivo
- 🏷️ Metadados automáticos
- 🔄 Retry com backoff exponencial

---

## 📁 Pasta `loc/` - Localização

**Localização:** `src/webparts/hseNewSupplier/loc/`

```
loc/
├── 📄 en-us.js                        # Strings em inglês
├── 📄 pt-br.js                        # Strings em português
└── 📄 mystrings.d.ts                  # Definições TypeScript
```

**Função:** Sistema de internacionalização (i18n) para suporte multi-idioma.

---

## 📁 Pasta `schemas/` - Esquemas de Validação

**Localização:** `src/webparts/hseNewSupplier/schemas/`

```
schemas/
├── 📄 formSchemas.ts                  # Esquemas do formulário
└── 📄 validationSchemas.ts            # Esquemas de validação
```

**formSchemas.ts** - Funcionalidades:

- 📋 Definição da estrutura de dados
- 🎯 Validação de tipos TypeScript
- 🔄 Schemas para cada etapa
- 📊 Metadados de campos

**validationSchemas.ts** - Funcionalidades:

- ✅ Regras de validação complexas
- 🔧 Validators customizados
- 📝 Mensagens de erro personalizadas
- 🎯 Validação condicional

---

## 📁 Pasta `services/` - Serviços e Integrações

**Localização:** `src/webparts/hseNewSupplier/services/`

```
services/
├── 📄 EmailService.ts                 # Serviço de email
├── 📄 FileService.ts                  # Serviço de arquivos
├── 📄 SharePointFileService.ts        # Upload para SharePoint
├── 📄 SharePointFileService_backup.ts # Backup do serviço
├── 📄 SharePointService.ts            # Serviço principal SharePoint
├── 📄 SharePointService.backup.ts     # Backup histórico
├── 📄 SharePointService.new.ts        # Nova versão em desenvolvimento
├── 📄 SharePointService.old.ts        # Versão legada
├── 📄 SharePointService.simple.ts     # Versão simplificada
└── 📄 ValidationService.ts            # Serviço de validação
```

### Detalhamento dos Serviços

**SharePointService.ts** - Serviço Principal:

- 🏪 CRUD operations para listas SharePoint
- 🔍 Queries otimizadas com filtros
- 📊 Batch operations para performance
- 🔄 Retry logic com backoff exponencial
- ⚠️ Error handling robusto
- 📦 Cache inteligente

**SharePointFileService.ts** - Upload de Arquivos:

- ☁️ Upload para Document Libraries
- 📁 Organização automática em pastas
- 🏷️ Aplicação de metadados
- 📊 Controle de progresso
- 🔄 Chunked upload para arquivos grandes
- 🗑️ Limpeza de uploads falhos

**ValidationService.ts** - Validação:

- ✅ Validação de dados de negócio
- 🔍 Verificação de duplicatas
- 📋 Validação cruzada entre campos
- 🎯 Regras específicas por contexto

**EmailService.ts** - Notificações:

- 📧 Envio de emails de notificação
- 📋 Templates personalizáveis
- 🔄 Queue para envios em massa
- ⚠️ Fallback para falhas

**FileService.ts** - Manipulação de Arquivos:

- 📁 Operações com arquivos locais
- 🔄 Conversões de formato
- 📊 Análise de metadados
- ✅ Validações de integridade

---

## 📁 Pasta `styles/` - Estilos Globais

**Localização:** `src/webparts/hseNewSupplier/styles/`

```
styles/
├── 📄 microinteractions.module.scss   # Animações e micro-interações
├── 📄 microinteractions.scss          # Versão global das animações
├── 📄 mixins.scss                     # Mixins SCSS reutilizáveis
├── 📄 modern-design-system.module.scss # Design system modular
├── 📄 modern-design-system.scss       # Design system global
├── 📄 themes.scss                     # Temas da aplicação
└── 📄 variables.scss                  # Variáveis CSS/SCSS
```

### Detalhamento dos Estilos

**variables.scss** - Variáveis Globais:

```scss
// Design tokens
$primary-color: #0078d4;
$secondary-color: #106ebe;
$success-color: #107c10;
$warning-color: #ff8c00;
$error-color: #d13438;

// Typography
$font-family-primary: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
$font-size-base: 14px;
$line-height-base: 1.5;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Breakpoints
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
```

**modern-design-system.scss** - Sistema de Design:

- 🎨 Tokens de design consistentes
- 📱 Utilities responsivas
- 🔧 Classes utilitárias
- 🎯 Componentes base

**microinteractions.scss** - Animações:

- ✨ Hover effects suaves
- 🔄 Loading animations
- 📱 Touch feedback
- 🎭 Transition timing functions

**mixins.scss** - Mixins Reutilizáveis:

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@mixin responsive-text($min-size, $max-size) {
  font-size: clamp($min-size, 2.5vw, $max-size);
}
```

---

## 📁 Pasta `types/` - Definições TypeScript

**Localização:** `src/webparts/hseNewSupplier/types/`

```
types/
├── 📄 IApplicationPhase.ts            # Fases da aplicação
├── 📄 IAttachment.ts                  # Anexos
├── 📄 IAttachmentMetadata.ts          # Metadados de anexos
├── 📄 IFileUploadResult.ts            # Resultado de upload
├── 📄 IFormData.ts                    # Dados do formulário
├── 📄 IFormState.ts                   # Estado do formulário
├── 📄 IHSEFormData.ts                 # Dados principais HSE
├── 📄 IValidationError.ts             # Erros de validação
└── 📄 index.ts                        # Exports centralizados
```

### Detalhamento dos Types

**IHSEFormData.ts** - Interface Principal:

```typescript
export interface IHSEFormData {
  // Dados básicos
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;

  // Endereço
  endereco: IEndereco;

  // Contatos
  contatos: IContato[];

  // Conformidade legal
  conformidadeLegal: IConformidadeLegal;

  // Serviços especiais
  servicosEspeciais: IServicosEspeciais;

  // Metadados
  metadata: IFormMetadata;
}
```

**IApplicationPhase.ts** - Fases da Aplicação:

```typescript
export enum ApplicationPhase {
  INITIAL = "initial",
  CNPJ_VERIFICATION = "cnpj_verification",
  FORM_FILLING = "form_filling",
  REVIEW = "review",
  SUBMITTED = "submitted",
}

export interface ICNPJVerificationResult {
  exists: boolean;
  supplierData?: IHSEFormData;
  lastModified?: Date;
  canOverwrite: boolean;
}
```

---

## 📁 Pasta `utils/` - Utilitários

**Localização:** `src/webparts/hseNewSupplier/utils/`

```
utils/
├── 📄 constants.ts                    # Constantes da aplicação
├── 📄 exportUtils.ts                  # Utilitários de exportação
├── 📄 fileValidators.ts               # Validadores de arquivo
├── 📄 formConstants.ts                # Constantes do formulário
├── 📄 formatters.ts                   # Formatadores de dados
├── 📄 formValidation.ts               # Validação de formulário
├── 📄 helpers.ts                      # Funções auxiliares
└── 📄 validators.ts                   # Validadores gerais
```

### Detalhamento dos Utils

**constants.ts** - Constantes Globais:

```typescript
export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [".pdf", ".doc", ".docx", ".jpg", ".png"],
  MAX_FILES_PER_SECTION: 5,
  AUTO_SAVE_INTERVAL: 30000, // 30 segundos
  CNPJ_LENGTH: 14,
  CEP_LENGTH: 8,
};

export const SHAREPOINT_LISTS = {
  HSE_SUPPLIERS: "HSE_Suppliers",
  HSE_ATTACHMENTS: "HSE_Attachments",
};
```

**validators.ts** - Validadores:

```typescript
export const validateCNPJ = (cnpj: string): boolean => {
  // Implementação completa de validação de CNPJ
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCEP = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};
```

**formatters.ts** - Formatadores:

```typescript
export const formatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
```

---

## 📁 Arquivos de Configuração

### 📂 config/

```
config/
├── 📄 config.json                     # Configuração principal do SPFx
├── 📄 deploy-azure-storage.json       # Deploy para Azure Storage
├── 📄 package-solution.json           # Configuração do pacote
├── 📄 sass.json                       # Configuração SASS
├── 📄 serve.json                      # Configuração do servidor dev
└── 📄 write-manifests.json            # Configuração de manifests
```

### 📂 .vscode/

```
.vscode/
├── 📄 launch.json                     # Configurações de debug
└── 📄 settings.json                   # Configurações do workspace
```

### 📂 teams/

```
teams/
├── 📄 0f0fd23b-7ff4-403a-8c96-368d5169b83b_color.png   # Ícone colorido
└── 📄 0f0fd23b-7ff4-403a-8c96-368d5169b83b_outline.png # Ícone outline
```

### 📂 docs/

```
docs/
├── 📄 README.md                       # Documentação principal
├── 📄 COMPONENTS.md                   # Documentação de componentes
├── 📄 CONTEXT.md                      # Documentação de contexto
├── 📄 HOOKS.md                        # Documentação de hooks
├── 📄 SERVICES.md                     # Documentação de serviços
├── 📄 SETUP.md                        # Guia de configuração
├── 📄 STYLES.md                       # Documentação de estilos
├── 📄 TYPES.md                        # Documentação de tipos
├── 📄 UTILS.md                        # Documentação de utilitários
├── 📄 PROGRESS_SYSTEM_SUMMARY.md      # Resumo do sistema
└── 📄 UX-UI-IMPROVEMENTS.md           # Melhorias de UX/UI
```

---

## 🔧 Arquivos de Build e Desenvolvimento

### Build Output

```
lib/                                   # Código TypeScript compilado
dist/                                  # Build de produção
temp/                                  # Arquivos temporários
release/                               # Pacotes .sppkg para deploy
```

### Dependências

```
node_modules/                          # Dependências npm
package.json                           # Configuração de dependências
package-lock.json                      # Lock file das versões
```

### Configurações de Qualidade

```
.eslintrc.js                          # Configuração ESLint
tsconfig.json                         # Configuração TypeScript
.gitignore                            # Arquivos ignorados pelo Git
.npmignore                            # Arquivos ignorados pelo npm
```

---

## 📊 Estatísticas do Projeto

- **Total de arquivos**: ~139 arquivos
- **Linhas de código**: ~15,000+ linhas
- **Componentes React**: 25+ componentes
- **Custom Hooks**: 8 hooks
- **Serviços**: 10 serviços
- **Interfaces TypeScript**: 20+ interfaces
- **Utilitários**: 8 arquivos de utils
- **Estilos SCSS**: 15+ arquivos de estilo

---

## 🎯 Pontos de Entrada Principais

1. **`HseNewSupplierWebPart.ts`** - Entry point do SPFx
2. **`HseNewSupplier.tsx`** - Componente React principal
3. **`HSEFormContext.tsx`** - Estado global da aplicação
4. **`SharePointService.ts`** - Integração com SharePoint
5. **`CNPJVerificationStep.tsx`** - Primeiro passo do fluxo

---

## 📝 Observações Importantes

1. **Múltiplas versões de serviços**: Existem várias versões dos serviços SharePoint (backup, new, old, simple) que indicam evolução do código.

2. **Arquivos gerados**: Arquivos com extensão `.module.scss.ts` são gerados automaticamente pelo sistema de build.

3. **Estrutura modular**: O projeto segue uma arquitetura bem organizada com separação clara de responsabilidades.

4. **TypeScript rigoroso**: Uso extensivo de TypeScript com interfaces bem definidas.

5. **Padrões modernos**: Utilização de hooks, context API, e padrões modernos do React.

Esta estrutura representa um projeto SPFx maduro e bem arquitetado, pronto para manutenção e evolução por outros desenvolvedores.
