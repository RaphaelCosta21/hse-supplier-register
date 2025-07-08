# Fase 1: Extração da Biblioteca Compartilhada

## 📋 Objetivo

Extrair componentes, serviços, tipos e utilitários reutilizáveis do HSE Supplier Register para criar uma biblioteca compartilhada que será usada tanto pelo webpart existente quanto pelo novo HSE Control Panel.

## 🏗️ Estrutura da Biblioteca Compartilhada

### Criar nova estrutura em `src/shared/`

```
src/shared/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSpinner.module.scss
│   │   │   └── index.ts
│   │   ├── LoadingOverlay/
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── LoadingOverlay.module.scss
│   │   │   └── index.ts
│   │   ├── ProgressIndicator/
│   │   │   ├── ProgressIndicator.tsx
│   │   │   ├── ProgressIndicator.module.scss
│   │   │   └── index.ts
│   │   ├── ProgressModal/
│   │   │   ├── ProgressModal.tsx
│   │   │   ├── ProgressModal.module.scss
│   │   │   └── index.ts
│   │   ├── SectionTitle/
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── SectionTitle.module.scss
│   │   │   └── index.ts
│   │   ├── FormNavigation/
│   │   │   ├── FormNavigation.tsx
│   │   │   ├── FormNavigation.module.scss
│   │   │   └── index.ts
│   │   ├── HSEFileUpload/
│   │   │   ├── HSEFileUploadSharePoint.tsx
│   │   │   ├── SharePointFileUpload.tsx
│   │   │   ├── HSEFileUpload.module.scss
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── forms/
│   │   ├── HSEFormViewer/              # Novo - Para Control Panel
│   │   │   ├── HSEFormViewer.tsx
│   │   │   ├── HSEFormViewer.module.scss
│   │   │   └── index.ts
│   │   ├── AttachmentViewer/           # Novo - Para Control Panel
│   │   │   ├── AttachmentViewer.tsx
│   │   │   ├── AttachmentViewer.module.scss
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── services/
│   ├── SharePointService.ts            # Versão unificada e otimizada
│   ├── SharePointFileService.ts        # Mover da localização atual
│   ├── HSEFormService.ts               # Novo - Lógica específica
│   └── index.ts
├── types/
│   ├── IHSEFormData.ts                 # Mover da localização atual
│   ├── IAttachmentMetadata.ts          # Mover da localização atual
│   ├── IHSEFormEvaluation.ts           # Novo - Para avaliações
│   ├── IControlPanelData.ts            # Novo - Para dashboard
│   ├── ISharePointConfig.ts            # Novo - Configurações
│   └── index.ts
├── utils/
│   ├── validators.ts                   # Mover da localização atual
│   ├── formatters.ts                   # Mover da localização atual
│   ├── constants.ts                    # Expandir com novas constantes
│   ├── formConstants.ts                # Mover da localização atual
│   ├── sharePointUtils.ts              # Novo - Utilitários SP
│   └── index.ts
├── hooks/
│   ├── useHSEForm.ts                   # Extrair lógica do Context
│   ├── useSharePointData.ts            # Novo - Para dados do SP
│   ├── useFormValidation.ts            # Extrair validações
│   ├── useFileUpload.ts                # Extrair lógica de upload
│   └── index.ts
├── styles/
│   ├── modern-design-system.scss       # Mover da localização atual
│   ├── variables.scss                  # Mover da localização atual
│   ├── microinteractions.scss          # Mover da localização atual
│   ├── themes.scss                     # Novo - Para temas
│   └── index.scss
└── index.ts
```

## 📋 Checklist de Extração

### 1. Componentes Comuns ✅

#### LoadingSpinner

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/LoadingSpinner/`
- [x] **Destino**: `src/shared/components/common/LoadingSpinner/`
- [ ] **Ação**: Mover arquivos sem modificações
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### LoadingOverlay

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/LoadingOverlay/`
- [x] **Destino**: `src/shared/components/common/LoadingOverlay/`
- [ ] **Ação**: Mover arquivos sem modificações
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### ProgressIndicator

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/ProgressIndicator/`
- [x] **Destino**: `src/shared/components/common/ProgressIndicator/`
- [ ] **Ação**: Mover arquivos sem modificações
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### ProgressModal

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/ProgressModal.*`
- [x] **Destino**: `src/shared/components/common/ProgressModal/`
- [ ] **Ação**: Reorganizar em pasta com index.ts
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### SectionTitle

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/SectionTitle/`
- [x] **Destino**: `src/shared/components/common/SectionTitle/`
- [ ] **Ação**: Mover arquivos sem modificações
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### FormNavigation

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/FormNavigation/`
- [x] **Destino**: `src/shared/components/common/FormNavigation/`
- [ ] **Ação**: Mover arquivos sem modificações
- [ ] **Atualizar**: Imports no HSE Supplier Register

#### HSEFileUpload

- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/HSEFileUploadSharePoint.tsx`
- [x] **Origem**: `src/webparts/hseNewSupplier/components/common/SharePointFileUpload.tsx`
- [x] **Destino**: `src/shared/components/common/HSEFileUpload/`
- [ ] **Ação**: Consolidar em uma pasta organizada
- [ ] **Atualizar**: Imports no HSE Supplier Register

### 2. Serviços 🔄

#### SharePointService (Unificação)

- [x] **Origens**:
  - `src/webparts/hseNewSupplier/services/SharePointService.ts`
  - `src/webparts/hseNewSupplier/services/SharePointService.backup.ts`
  - `src/webparts/hseNewSupplier/services/SharePointService.new.ts`
  - `src/webparts/hseNewSupplier/services/SharePointService.old.ts`
  - `src/webparts/hseNewSupplier/services/SharePointService.simple.ts`
- [x] **Destino**: `src/shared/services/SharePointService.ts`
- [ ] **Ação**: Criar versão unificada com as melhores funcionalidades
- [ ] **Melhorias**:
  - [ ] Tratamento de erro melhorado
  - [ ] Interface mais limpa
  - [ ] Support para diferentes operações (CRUD completo)
  - [ ] Cache de dados

#### SharePointFileService

- [x] **Origem**: `src/webparts/hseNewSupplier/services/SharePointFileService.ts`
- [x] **Destino**: `src/shared/services/SharePointFileService.ts`
- [ ] **Ação**: Mover com pequenas otimizações
- [ ] **Melhorias**:
  - [ ] Interface mais flexível
  - [ ] Support para diferentes tipos de anexos

#### HSEFormService (Novo)

- [ ] **Criar**: `src/shared/services/HSEFormService.ts`
- [ ] **Função**: Lógica específica de formulários HSE
- [ ] **Funcionalidades**:
  - [ ] Validação completa de formulários
  - [ ] Cálculo de percentual de conclusão
  - [ ] Geração de relatórios
  - [ ] Lógica de workflow

### 3. Tipos e Interfaces 📝

#### IHSEFormData

- [x] **Origem**: `src/webparts/hseNewSupplier/types/IHSEFormData.ts`
- [x] **Destino**: `src/shared/types/IHSEFormData.ts`
- [ ] **Ação**: Mover sem modificações
- [ ] **Atualizar**: Todos os imports

#### IAttachmentMetadata

- [x] **Origem**: `src/webparts/hseNewSupplier/types/IAttachmentMetadata.ts`
- [x] **Destino**: `src/shared/types/IAttachmentMetadata.ts`
- [ ] **Ação**: Mover sem modificações
- [ ] **Atualizar**: Todos os imports

#### Novos Tipos para Control Panel

- [ ] **Criar**: `src/shared/types/IHSEFormEvaluation.ts`

```typescript
export interface IHSEFormEvaluation {
  id?: number;
  formId: number;
  status: "Aprovado" | "Rejeitado" | "Pendente Informações" | "Em Análise";
  comentarios: string;
  observacoes: string;
  questoesPendentes?: string[];
  documentosPendentes?: string[];
  avaliador: string;
  dataAvaliacao: Date;
  dataUltimaModificacao?: Date;
}
```

- [ ] **Criar**: `src/shared/types/IControlPanelData.ts`

```typescript
export interface IDashboardMetrics {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number;
  recentActivity: IActivityItem[];
}

export interface IActivityItem {
  id: number;
  type: "submission" | "evaluation" | "approval" | "rejection";
  description: string;
  user: string;
  timestamp: Date;
  formId: number;
}

export interface IFormListItem {
  id: number;
  empresa: string;
  cnpj: string;
  status: "Enviado" | "Em Análise" | "Aprovado" | "Rejeitado";
  dataSubmissao: Date;
  dataAvaliacao?: Date;
  avaliador?: string;
  grauRisco: string;
  percentualConclusao: number;
}
```

### 4. Utilitários 🛠️

#### Validators

- [x] **Origem**: `src/webparts/hseNewSupplier/utils/validators.ts`
- [x] **Destino**: `src/shared/utils/validators.ts`
- [ ] **Ação**: Mover sem modificações

#### Formatters

- [x] **Origem**: `src/webparts/hseNewSupplier/utils/formatters.ts`
- [x] **Destino**: `src/shared/utils/formatters.ts`
- [ ] **Ação**: Mover sem modificações

#### Constants

- [x] **Origem**: `src/webparts/hseNewSupplier/utils/constants.ts`
- [x] **Destino**: `src/shared/utils/constants.ts`
- [ ] **Ação**: Mover e expandir com novas constantes

#### Form Constants

- [x] **Origem**: `src/webparts/hseNewSupplier/utils/formConstants.ts`
- [x] **Destino**: `src/shared/utils/formConstants.ts`
- [ ] **Ação**: Mover sem modificações

### 5. Hooks Customizados 🎣

#### useHSEForm

- [ ] **Extrair de**: `src/webparts/hseNewSupplier/components/context/HSEFormContext.tsx`
- [ ] **Criar**: `src/shared/hooks/useHSEForm.ts`
- [ ] **Função**: Lógica de gerenciamento de estado do formulário

#### useSharePointData

- [ ] **Criar**: `src/shared/hooks/useSharePointData.ts`
- [ ] **Função**: Hook para buscar e gerenciar dados do SharePoint

#### useFormValidation

- [ ] **Extrair validações**: Das telas de formulário
- [ ] **Criar**: `src/shared/hooks/useFormValidation.ts`
- [ ] **Função**: Validações reutilizáveis

#### useFileUpload

- [ ] **Extrair**: Lógica de upload de arquivos
- [ ] **Criar**: `src/shared/hooks/useFileUpload.ts`
- [ ] **Função**: Gerenciamento de upload de arquivos

### 6. Estilos 🎨

#### Modern Design System

- [x] **Origem**: `src/webparts/hseNewSupplier/styles/modern-design-system.scss`
- [x] **Destino**: `src/shared/styles/modern-design-system.scss`
- [ ] **Ação**: Mover sem modificações

#### Variables

- [x] **Origem**: `src/webparts/hseNewSupplier/styles/variables.scss`
- [x] **Destino**: `src/shared/styles/variables.scss`
- [ ] **Ação**: Mover sem modificações

#### Microinteractions

- [x] **Origem**: `src/webparts/hseNewSupplier/styles/microinteractions.scss`
- [x] **Destino**: `src/shared/styles/microinteractions.scss`
- [ ] **Ação**: Mover sem modificações

## 🔄 Processo de Migração

### Passo 1: Criar Estrutura Base

```bash
# Criar estrutura de pastas
mkdir -p src/shared/{components/common,components/forms,services,types,utils,hooks,styles}
```

### Passo 2: Mover Componentes

- Mover cada componente mantendo estrutura de pastas
- Criar arquivos `index.ts` para cada pasta
- Atualizar imports relativos

### Passo 3: Mover Serviços

- Unificar SharePointService
- Mover SharePointFileService
- Criar HSEFormService

### Passo 4: Mover Tipos

- Mover interfaces existentes
- Criar novas interfaces para Control Panel

### Passo 5: Mover Utilitários

- Mover validators, formatters, constants
- Expandir constants com novas configurações

### Passo 6: Criar Hooks

- Extrair lógica do Context
- Criar hooks especializados

### Passo 7: Mover Estilos

- Mover arquivos SCSS
- Criar tema específico para Control Panel

### Passo 8: Atualizar HSE Supplier Register

- Atualizar todos os imports
- Remover arquivos movidos
- Testar funcionamento

### Passo 9: Criar Arquivo Index Principal

```typescript
// src/shared/index.ts
export * from "./components";
export * from "./services";
export * from "./types";
export * from "./utils";
export * from "./hooks";
```

## 🧪 Validação

### Checklist de Testes

- [ ] HSE Supplier Register continua funcionando após migração
- [ ] Todos os imports foram atualizados
- [ ] Componentes compartilhados funcionam independentemente
- [ ] Estilos são aplicados corretamente
- [ ] Serviços mantêm funcionalidade
- [ ] Build passa sem erros
- [ ] Testes unitários passam

### Testes Específicos

- [ ] Submissão de formulário completa
- [ ] Upload de anexos
- [ ] Validações de campos
- [ ] Navegação entre etapas
- [ ] Salvamento de rascunho

## 📋 Próximos Passos

1. **Executar Fase 1** seguindo este checklist
2. **Validar** funcionamento do HSE Supplier Register
3. **Documentar** mudanças e novos componentes
4. **Preparar** para Fase 2: Desenvolvimento do Control Panel
5. **Criar** templates e boilerplate para o novo webpart

---

Esta fase estabelece a base sólida para reutilização de código e facilita o desenvolvimento do HSE Control Panel com componentes já testados e validados.
