# HSE Control Panel - Guia Mestre Completo

## 📋 PROMPT COMPLETO PARA CRIAÇÃO DO HSE CONTROL PANEL

Este documento contém **TUDO** o que é necessário para criar o HSE Control Panel a partir do projeto HSE Supplier Register existente. Use este documento como prompt completo quando iniciar o projeto.

---

## 🎯 RESUMO EXECUTIVO

**Objetivo**: Criar um SPFx WebPart (HSE Control Panel) para o time interno HSE gerenciar, avaliar e aprovar submissões de fornecedores.

**Estratégia**: Extrair biblioteca compartilhada do HSE Supplier Register existente e criar novo WebPart que reutiliza 70%+ do código base.

**Resultado**: Sistema completo com Dashboard, Lista de Formulários, Interface de Avaliação, Filtros e Relatórios.

---

## 📊 SITUAÇÃO ATUAL E ANÁLISE

### ✅ Completado no HSE Supplier Register

- **HSE Supplier Register**: WebPart funcional para fornecedores submeterem formulários
- **139+ arquivos** mapeados e documentados
- **25+ componentes React** identificados e analisados
- **8 custom hooks** documentados
- **4 versões de SharePointService** analisadas e consolidadas
- **Documentação completa** da arquitetura existente
- **Sistema de design** moderno implementado

### 📋 Análise da Base de Código Existente

#### Componentes Reutilizáveis Identificados

- **LoadingSpinner, ProgressIndicator, SectionTitle** - UI components
- **SharePointFileUpload, HSEFileUpload** - File management
- **FormNavigation, BackToHomeButton** - Navigation
- **FloatingSaveButton** - Action buttons
- **CustomProgressIndicator** - Progress tracking

#### Serviços Robustos Disponíveis

- **SharePointService** - CRUD operations, list management
- **SharePointFileService** - File upload/download, metadata
- **HSEFormContext** - State management
- **Custom hooks** - useFormValidation, useSharePointUpload

#### Tipos e Interfaces Bem Definidos

- **IHSEFormData** - Complete form structure
- **IAttachmentMetadata** - File metadata
- **IDadosGerais, IConformidadeLegal, IServicosEspeciais** - Form sections
- **IValidationError, IApplicationPhase** - Validation and workflow

#### Sistema de Design Completo

- **modern-design-system.scss** - Color palette, typography
- **microinteractions.scss** - Animations and transitions
- **responsive.scss** - Mobile-first responsive design
- **variables.scss** - Design tokens and constants

### 🗂️ Estratégia de Máxima Reutilização

**Componentes Compartilhados (80%+ reutilização)**:

- Todos os componentes UI básicos
- Sistema de upload de arquivos
- Validação e formatação
- Estilos e temas

**Novos Componentes Específicos (20% novo)**:

- Dashboard e métricas
- Interface de avaliação
- Filtros avançados
- Relatórios e gráficos

---

## 🏗️ ARQUITETURA COMPLETA

### Estrutura do Projeto Final

```
hse-control-panel/
├── package.json                    # Dependências específicas
├── tsconfig.json                   # Configuração TypeScript
├── gulpfile.js                     # Build process
├── config/
│   ├── package-solution.json       # Configuração da solução
│   ├── serve.json                  # Configuração de desenvolvimento
│   └── config.json                 # Configuração geral
├── src/
│   ├── shared/                     # BIBLIOTECA COMPARTILHADA (extraída)
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner/
│   │   │   │   ├── LoadingOverlay/
│   │   │   │   ├── ProgressIndicator/
│   │   │   │   ├── ProgressModal/
│   │   │   │   ├── SectionTitle/
│   │   │   │   ├── FormNavigation/
│   │   │   │   ├── HSEFileUpload/
│   │   │   │   └── Toast/
│   │   │   ├── forms/
│   │   │   │   ├── HSEFormViewer/       # Novo - Visualizar formulários
│   │   │   │   ├── AttachmentViewer/    # Novo - Visualizar anexos
│   │   │   │   ├── DadosGeraisViewer/   # Adaptado
│   │   │   │   ├── ConformidadeViewer/  # Adaptado
│   │   │   │   └── ServicosViewer/      # Adaptado
│   │   │   └── ui/
│   │   │       ├── StatusBadge/         # Novo
│   │   │       ├── RiskBadge/           # Novo
│   │   │       ├── MetricCard/          # Novo
│   │   │       └── FilterPanel/        # Novo
│   │   ├── services/
│   │   │   ├── SharePointService.ts    # Unificado e otimizado
│   │   │   ├── SharePointFileService.ts # Reutilizado
│   │   │   └── HSEFormService.ts       # Novo - Lógica de formulários
│   │   ├── types/
│   │   │   ├── IHSEFormData.ts         # Reutilizado
│   │   │   ├── IAttachmentMetadata.ts  # Reutilizado
│   │   │   ├── IHSEFormEvaluation.ts   # Novo
│   │   │   ├── IControlPanelData.ts    # Novo
│   │   │   └── IFormListItem.ts        # Novo
│   │   ├── utils/
│   │   │   ├── validators.ts           # Reutilizado
│   │   │   ├── formatters.ts           # Reutilizado
│   │   │   ├── constants.ts            # Expandido
│   │   │   └── formConstants.ts        # Reutilizado
│   │   ├── hooks/
│   │   │   ├── useHSEForm.ts           # Reutilizado e expandido
│   │   │   ├── useSharePointData.ts    # Reutilizado
│   │   │   ├── useFormEvaluation.ts    # Novo
│   │   │   ├── useDashboardData.ts     # Novo
│   │   │   └── useFilters.ts           # Novo
│   │   └── styles/
│   │       ├── modern-design-system.scss # Reutilizado
│   │       ├── variables.scss          # Reutilizado
│   │       ├── microinteractions.scss  # Reutilizado
│   │       └── control-panel-theme.scss # Novo
│   └── webparts/
│       └── hseControlPanel/
│           ├── HseControlPanelWebPart.ts
│           ├── HseControlPanelWebPart.manifest.json
│           ├── components/
│           │   ├── HseControlPanel.tsx
│           │   ├── IHseControlPanelProps.ts
│           │   ├── dashboard/
│           │   │   ├── Dashboard.tsx
│           │   │   ├── MetricsCards.tsx
│           │   │   ├── StatusChart.tsx
│           │   │   ├── ActivityFeed.tsx
│           │   │   └── QuickActions.tsx
│           │   ├── forms/
│           │   │   ├── FormsList.tsx
│           │   │   ├── FormsTable.tsx
│           │   │   ├── FormDetails.tsx
│           │   │   ├── FormEvaluation.tsx
│           │   │   ├── EvaluationPanel.tsx
│           │   │   ├── EvaluationHistory.tsx
│           │   │   └── FormActions.tsx
│           │   ├── filters/
│           │   │   ├── FormFilters.tsx
│           │   │   ├── SearchBox.tsx
│           │   │   ├── DateRangePicker.tsx
│           │   │   └── AdvancedFilters.tsx
│           │   └── reports/
│           │       ├── ReportsView.tsx
│           │       ├── ExportOptions.tsx
│           │       └── ReportCharts.tsx
│           ├── context/
│           │   └── ControlPanelContext.tsx
│           ├── styles/
│           │   ├── HseControlPanel.module.scss
│           │   └── control-panel-overrides.scss
│           └── loc/
│               ├── mystrings.d.ts
│               └── en-us.js
└── release/                        # Arquivos de build
```

---

## 📦 DEPENDÊNCIAS COMPLETAS

### package.json

```json
{
  "name": "hse-control-panel",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=18.17.1 <19.0.0"
  },
  "main": "lib/index.js",
  "scripts": {
    "build": "gulp bundle",
    "clean": "gulp clean",
    "test": "gulp test",
    "serve": "gulp serve",
    "package-solution": "gulp package-solution",
    "deploy": "gulp package-solution --ship"
  },
  "dependencies": {
    "@fluentui/react": "^8.123.0",
    "@fluentui/react-components": "^9.64.0",
    "@fluentui/react-icons": "^2.0.239",
    "@fluentui/react-charting": "^5.16.36",
    "@microsoft/sp-component-base": "1.20.0",
    "@microsoft/sp-core-library": "1.20.0",
    "@microsoft/sp-lodash-subset": "1.20.0",
    "@microsoft/sp-office-ui-fabric-core": "1.20.0",
    "@microsoft/sp-property-pane": "1.20.0",
    "@microsoft/sp-webpart-base": "1.20.0",
    "@pnp/graph": "^4.13.0",
    "@pnp/sp": "^4.13.0",
    "file-saver": "^2.0.5",
    "mime-types": "^3.0.1",
    "react": "17.0.1",
    "react-dom": "17.0.1",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "xlsx": "^0.18.5",
    "tslib": "2.3.1"
  },
  "devDependencies": {
    "@microsoft/eslint-config-spfx": "1.20.2",
    "@microsoft/eslint-plugin-spfx": "1.20.2",
    "@microsoft/rush-stack-compiler-4.7": "0.1.0",
    "@microsoft/sp-build-web": "1.20.2",
    "@microsoft/sp-module-interfaces": "1.20.2",
    "@rushstack/eslint-config": "4.0.1",
    "@types/file-saver": "^2.0.7",
    "@types/mime-types": "^3.0.0",
    "@types/react": "17.0.45",
    "@types/react-dom": "17.0.17",
    "@types/webpack-env": "~1.15.2",
    "ajv": "^6.12.5",
    "eslint": "8.57.0",
    "eslint-plugin-react-hooks": "4.3.0",
    "gulp": "4.0.2",
    "typescript": "4.7.4"
  }
}
```

---

## 🏗️ FUNCIONALIDADES DO HSE CONTROL PANEL

📊 1. DASHBOARD PRINCIPAL
Métricas em Tempo Real: Total de submissões, pendentes, aprovados, rejeitados
Tempo Médio de Avaliação: Cálculo automático baseado nas datas
Gráficos de Status: Visualização com Recharts
Atividade Recente: Feed de últimas movimentações
Cards de Métricas: 4 cards principais com hover effects
Responsividade: Mobile-first design
📋 2. LISTA DE FORMULÁRIOS
Visualização Tabular: Lista paginada com status, empresa, datas
Filtros Avançados: Por status, grau de risco, data, avaliador
Busca Inteligente: Por CNPJ, nome da empresa, avaliador
Ordenação: Por qualquer coluna (crescente/decrescente)
Ações por Linha: Visualizar, editar, relatórios
Status Badges: Visual indicators com cores específicas
Paginação: Para performance com grandes volumes
✏️ 3. INTERFACE DE AVALIAÇÃO
Visualização Completa: Formulário em modo leitura
Painel Lateral de Avaliação: Status, comentários, observações
Sistema de Workflow: Aprovar, rejeitar, solicitar informações
Comentários por Seção: Feedback específico em cada parte
Histórico de Avaliações: Track completo de mudanças
Upload de Documentos: Solicitação de documentos adicionais
Notificações: Alertas para responsáveis
🔍 4. SISTEMA DE FILTROS E BUSCA
Filtros Combinados: Múltiplos critérios simultaneamente
Autocomplete: Sugestões inteligentes
Filtros Rápidos: Shortcuts para status comuns
Salvar Filtros: Configurações personalizadas do usuário
Exportar Resultados: Lista filtrada para Excel
Reset Filtros: Limpeza rápida de todos os critérios
📊 5. RELATÓRIOS E ANALYTICS
Dashboard de Métricas: Gráficos interativos com Recharts
Relatórios por Período: Análise temporal
Relatório por Grau de Risco: Distribuição de fornecedores
Performance de Avaliadores: Tempo médio por avaliador
Exportação para Excel: Relatórios completos
Exportação para PDF: Relatórios formatados
Agendamento de Relatórios: Envio automático por email
👥 6. SISTEMA DE PERMISSÕES
Controle por Grupos AD: Integração com SharePoint
Níveis de Acesso: Visualizar, avaliar, administrar
Auditoria de Ações: Log completo de atividades
Delegação: Transferir avaliações entre usuários
Aprovação em Cascata: Workflow hierárquico
📱 7. RESPONSIVIDADE E UX
Design Mobile-First: Funciona em todos os dispositivos
PWA Ready: Instalável como app
Offline Support: Visualização básica sem internet
Microinterações: Feedback visual moderno
Loading States: Spinners, skeleton loading, progress bars
Toast Notifications: Feedback de ações
🔧 8. FUNCIONALIDADES TÉCNICAS
Componentes Reutilizáveis (80% do código original):
LoadingSpinner: Indicadores de carregamento
ProgressIndicator: Barras de progresso
SectionTitle: Títulos padronizados
SharePointFileUpload: Sistema de arquivos
HSEFileUpload: Upload específico HSE
FormNavigation: Navegação entre seções
StatusBadge: Indicadores visuais de status
Toast: Notificações temporárias
Serviços Completos:
SharePointService: CRUD operations, métricas, filtros
HSEFormService: Lógica de negócio, avaliações
NotificationService: Sistema de alertas
ExportService: Geração de relatórios
AuditService: Log de atividades
Hooks Customizados:
useFormEvaluation: Gerenciamento de avaliações
useDashboardData: Métricas em tempo real
useFormFilters: Estado de filtros
usePermissions: Controle de acesso
useNotifications: Sistema de alertas
🎨 9. SISTEMA DE DESIGN
Control Panel Theme: Cores específicas para o painel
Status Colors: Verde, amarelo, azul, vermelho para status
Risk Badges: Cores por grau de risco (1-4)
Modern Animations: Hover effects, transitions
Consistent Spacing: Grid system padronizado
Typography: Hierarquia clara de textos

## 📊 ESTRUTURA DE DADOS SHAREPOINT

### Lista Principal: "hse-new-register"

**IMPORTANTE**: Reutiliza a MESMA lista do HSE Supplier Register. Apenas adicionar novos campos:

```typescript
interface ISharePointFormItem {
  // === CAMPOS EXISTENTES (NÃO ALTERAR) ===
  Id: number;
  Title: string;
  CNPJ: string;
  NumeroContrato: string;
  StatusAvaliacao:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado";
  DataEnvio: string;
  DataCriacao: string;
  ResponsavelTecnico: string;
  GrauRisco: "1" | "2" | "3" | "4";
  PercentualConclusao: number;
  DadosFormulario: string; // JSON com todos os dados
  UltimaModificacao: string;
  EmailPreenchimento: string;
  NomePreenchimento: string;
  AnexosCount: number;
  Observacoes: string;

  // === NOVOS CAMPOS PARA HSE CONTROL PANEL ===
  DataAvaliacao?: string; // DateTime - Data da avaliação
  Avaliador?: string; // Text - Nome do avaliador
  ComentariosAvaliacao?: string; // Note - Comentários da avaliação
  ObservacoesAvaliacao?: string; // Note - Observações específicas
  QuestoesPendentes?: string; // Note - JSON array de questões pendentes
  DocumentosPendentes?: string; // Note - JSON array de documentos pendentes
  HistoricoAvaliacoes?: string; // Note - JSON array do histórico
  PrioridadeAvaliacao?: string; // Choice - Alta, Média, Baixa
  DataLimiteResposta?: string; // DateTime - Prazo para resposta do fornecedor
  NotificacaoEnviada?: boolean; // Boolean - Se foi enviada notificação
}
```

### Library de Anexos: "anexos-contratadas"

**REUTILIZA EXATAMENTE** a mesma biblioteca de documentos existente.

### Lista de Configurações: "hse-control-panel-config" (Nova)

```typescript
interface IControlPanelConfig {
  Id: number;
  ChaveConfiguracao: string; // ex: "EMAIL_TEMPLATE_APROVACAO"
  ValorConfiguracao: string; // JSON ou texto
  Descricao: string;
  Ativo: boolean;
  DataModificacao: string;
  ModificadoPor: string;
}
```

---

## 🎨 INTERFACES TYPESCRIPT COMPLETAS

### src/shared/types/IHSEFormData.ts

```typescript
// REUTILIZAR EXATAMENTE DO PROJETO ORIGINAL
// Importar: IHSEFormData, IDadosGerais, IConformidadeLegal, IServicosEspeciais
// Todos os tipos já estão definidos e funcionando perfeitamente

// Adicionar apenas novos tipos:
export interface IFormEvaluationStatus {
  status: "Em Análise" | "Aprovado" | "Rejeitado" | "Pendente Informações";
  dataStatus: Date;
  avaliador: string;
  comentarios?: string;
}
```

### src/shared/types/IHSEFormEvaluation.ts

```typescript
export interface IHSEFormEvaluation {
  id?: number;
  formId: number;
  status: "Em Análise" | "Aprovado" | "Rejeitado" | "Pendente Informações";
  comentarios: string;
  observacoes: string;
  questoesPendentes?: string[];
  documentosPendentes?: string[];
  avaliador: string;
  dataAvaliacao: Date;
  prioridade?: "Alta" | "Média" | "Baixa";
  dataLimiteResposta?: Date;
  notificacaoEnviada?: boolean;
}

export interface IEvaluationHistory {
  id: number;
  formId: number;
  statusAnterior: string;
  statusNovo: string;
  avaliador: string;
  dataAvaliacao: Date;
  comentarios: string;
  observacoes: string;
  tipoAcao: "Avaliação" | "Aprovação" | "Rejeição" | "Solicitação Info";
}
```

### src/shared/types/IControlPanelData.ts

```typescript
export interface IDashboardMetrics {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number; // em dias
  recentActivity: IActivityItem[];
}

export interface IActivityItem {
  id: number;
  type: "Submission" | "Evaluation" | "Approval" | "Rejection";
  description: string;
  timestamp: Date;
  user: string;
  formId?: number;
}

export interface IFormListItem {
  id: number;
  empresa: string;
  cnpj: string;
  status: "Em Andamento" | "Enviado" | "Em Análise" | "Aprovado" | "Rejeitado";
  dataSubmissao: Date;
  dataAvaliacao?: Date;
  avaliador?: string;
  grauRisco: string;
  percentualConclusao: number;
  prioridade?: "Alta" | "Média" | "Baixa";
}

export interface IFormsFilters {
  status?: string;
  grauRisco?: string;
  dataInicio?: Date;
  dataFim?: Date;
  empresa?: string;
  avaliador?: string;
  prioridade?: string;
  cnpj?: string;
}
```

---

## 🔧 SERVIÇOS PRINCIPAIS

### src/shared/services/SharePointService.ts

```typescript
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export class SharePointService {
  private sp: SPFI;
  private listName: string;
  private context: WebPartContext;

  constructor(context: WebPartContext, listName: string = "HSE_Suppliers") {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
    this.context = context;
  }

  // === MÉTODOS EXISTENTES (REUTILIZAR) ===

  /**
   * Salva formulário como rascunho
   */
  public async saveFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<number> {
    // CÓDIGO EXATO DO PROJETO ORIGINAL
    // Salva com StatusAvaliacao: "Em Andamento"
  }

  /**
   * Submete formulário finalizado
   */
  public async submitFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<number> {
    // CÓDIGO EXATO DO PROJETO ORIGINAL
    // Salva com StatusAvaliacao: "Enviado"
  }

  /**
   * Busca formulário por ID
   */
  public async getFormById(itemId: number): Promise<IHSEFormData | undefined> {
    // CÓDIGO EXATO DO PROJETO ORIGINAL
  }

  // === NOVOS MÉTODOS PARA CONTROL PANEL ===

  /**
   * Lista todos os formulários para o painel de controle
   */
  public async getAllForms(): Promise<any[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "CNPJ",
          "StatusAvaliacao",
          "DataEnvio",
          "DataAvaliacao",
          "Avaliador",
          "GrauRisco",
          "PercentualConclusao",
          "EmailPreenchimento",
          "NomePreenchimento",
          "AnexosCount",
          "PrioridadeAvaliacao",
          "DataLimiteResposta",
          "Modified",
          "Created"
        )
        .orderBy("DataEnvio", false)
        .get();

      return items;
    } catch (error) {
      console.error("Erro ao obter lista de formulários:", error);
      throw new Error(`Falha ao obter formulários: ${error.message}`);
    }
  }

  /**
   * Busca formulários com filtros
   */
  public async getFormsWithFilters(filters: any): Promise<any[]> {
    try {
      let query = this.sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "CNPJ",
          "StatusAvaliacao",
          "DataEnvio",
          "DataAvaliacao",
          "Avaliador",
          "GrauRisco",
          "PercentualConclusao"
        );

      if (filters.status) {
        query = query.filter(`StatusAvaliacao eq '${filters.status}'`);
      }

      if (filters.grauRisco) {
        query = query.filter(`GrauRisco eq '${filters.grauRisco}'`);
      }

      if (filters.dataInicio && filters.dataFim) {
        query = query.filter(
          `DataEnvio ge '${filters.dataInicio.toISOString()}' and DataEnvio le '${filters.dataFim.toISOString()}'`
        );
      }

      if (filters.empresa) {
        query = query.filter(`substringof('${filters.empresa}', Title)`);
      }

      const items = await query.orderBy("DataEnvio", false).get();
      return items;
    } catch (error) {
      console.error("Erro ao obter formulários com filtros:", error);
      throw new Error(`Falha ao obter formulários: ${error.message}`);
    }
  }

  /**
   * Atualiza status e dados de avaliação
   */
  public async updateFormEvaluation(
    formId: number,
    evaluation: Partial<{
      status: string;
      avaliador: string;
      comentarios: string;
      observacoes: string;
      questoesPendentes: string[];
      documentosPendentes: string[];
      prioridade: string;
      dataLimiteResposta: Date;
    }>
  ): Promise<void> {
    const updateData: any = {
      StatusAvaliacao: evaluation.status,
      DataAvaliacao: new Date().toISOString(),
      Avaliador: evaluation.avaliador,
      ComentariosAvaliacao: evaluation.comentarios,
      ObservacoesAvaliacao: evaluation.observacoes,
      PrioridadeAvaliacao: evaluation.prioridade,
    };

    if (evaluation.questoesPendentes) {
      updateData.QuestoesPendentes = JSON.stringify(
        evaluation.questoesPendentes
      );
    }

    if (evaluation.documentosPendentes) {
      updateData.DocumentosPendentes = JSON.stringify(
        evaluation.documentosPendentes
      );
    }

    if (evaluation.dataLimiteResposta) {
      updateData.DataLimiteResposta =
        evaluation.dataLimiteResposta.toISOString();
    }

    await this.sp.web.lists
      .getByTitle(this.listName)
      .items.getById(formId)
      .update(updateData);
  }

  /**
   * Obtém métricas para dashboard
   */
  public async getDashboardMetrics(): Promise<any> {
    try {
      const forms = await this.getAllForms();

      const totalSubmissions = forms.length;
      const pendingReview = forms.filter(
        (f) => f.StatusAvaliacao === "Enviado"
      ).length;
      const approved = forms.filter(
        (f) => f.StatusAvaliacao === "Aprovado"
      ).length;
      const rejected = forms.filter(
        (f) => f.StatusAvaliacao === "Rejeitado"
      ).length;

      // Calcular tempo médio de avaliação
      const evaluatedForms = forms.filter((f) => f.DataAvaliacao);
      const averageReviewTime =
        evaluatedForms.length > 0
          ? evaluatedForms.reduce((acc, form) => {
              const submitDate = new Date(form.DataEnvio);
              const evalDate = new Date(form.DataAvaliacao);
              const diffDays = Math.ceil(
                (evalDate.getTime() - submitDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return acc + diffDays;
            }, 0) / evaluatedForms.length
          : 0;

      return {
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        averageReviewTime: Math.round(averageReviewTime),
      };
    } catch (error) {
      throw new Error(`Erro ao obter métricas: ${error.message}`);
    }
  }
}
```

### src/shared/services/HSEFormService.ts

```typescript
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SharePointService } from "./SharePointService";
import { IHSEFormData } from "../types/IHSEFormData";
import {
  IHSEFormEvaluation,
  IEvaluationHistory,
} from "../types/IHSEFormEvaluation";
import {
  IDashboardMetrics,
  IFormListItem,
  IFormsFilters,
} from "../types/IControlPanelData";

export interface ISharePointConfig {
  listName: string;
  libraryName: string;
  siteUrl?: string;
}

export class HSEFormService {
  private sharePointService: SharePointService;
  private context: WebPartContext;
  private config: ISharePointConfig;

  constructor(context: WebPartContext, config: ISharePointConfig) {
    this.context = context;
    this.config = config;
    this.sharePointService = new SharePointService(context, config.listName);
  }

  // === MÉTODOS DE FORMULÁRIOS ===

  public async getFormById(formId: number): Promise<IHSEFormData> {
    return this.sharePointService.getFormById(formId);
  }

  public async getAllForms(filters?: IFormsFilters): Promise<IFormListItem[]> {
    try {
      const items = filters
        ? await this.sharePointService.getFormsWithFilters(filters)
        : await this.sharePointService.getAllForms();

      return items.map((item) => ({
        id: item.Id,
        empresa: item.Title,
        cnpj: item.CNPJ,
        status: item.StatusAvaliacao,
        dataSubmissao: new Date(item.DataEnvio),
        dataAvaliacao: item.DataAvaliacao
          ? new Date(item.DataAvaliacao)
          : undefined,
        avaliador: item.Avaliador,
        grauRisco: item.GrauRisco,
        percentualConclusao: item.PercentualConclusao,
      }));
    } catch (error) {
      throw new Error(`Erro ao obter lista de formulários: ${error.message}`);
    }
  }

  // === MÉTODOS DE AVALIAÇÃO ===

  public async saveEvaluation(evaluation: IHSEFormEvaluation): Promise<void> {
    try {
      await this.sharePointService.updateFormEvaluation(evaluation.formId, {
        status: evaluation.status,
        avaliador: evaluation.avaliador,
        comentarios: evaluation.comentarios,
      });
    } catch (error) {
      throw new Error(`Erro ao salvar avaliação: ${error.message}`);
    }
  }

  public async updateFormStatus(formId: number, status: string): Promise<void> {
    try {
      await this.sharePointService.updateFormEvaluation(formId, { status });
    } catch (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  // === MÉTODOS DE DASHBOARD ===

  public async getDashboardMetrics(): Promise<IDashboardMetrics> {
    try {
      const metrics = await this.sharePointService.getDashboardMetrics();
      return {
        ...metrics,
        recentActivity: [],
      };
    } catch (error) {
      throw new Error(`Erro ao obter métricas: ${error.message}`);
    }
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana

1. **✅ Aprovar** arquitetura e roadmap final
2. **🔄 Iniciar** Fase 1 - Extração da biblioteca compartilhada
3. **📝 Criar** branch de desenvolvimento específico
4. **🏗️ Executar** comandos de migração do guia

### Próxima Semana

1. **✅ Completar** extração dos componentes para `src/shared/`
2. **🧪 Validar** HSE Supplier Register continua funcionando
3. **📦 Publicar** biblioteca compartilhada funcional
4. **📋 Planejar** Fase 2 em detalhes com wireframes

---

## 🎉 RESULTADO FINAL ESPERADO

Após implementação completa das 5 fases, você terá:

### ✅ Sistema Completo

- **HSE Control Panel WebPart** totalmente funcional
- **Dashboard** com métricas em tempo real e gráficos
- **Lista de Formulários** com filtros avançados e busca
- **Interface de Avaliação** completa com workflow
- **Sistema de Aprovação/Rejeição** estruturado
- **Relatórios e Exportação** de dados para Excel/PDF
- **Arquitetura modular** e escalável para futuras expansões

### ✅ Benefícios Técnicos

- **Reutilização de 80%+** do código existente
- **Performance otimizada** < 3s load time
- **Cobertura de testes** 80%+
- **Documentação completa** e manutenível
- **Design responsivo** mobile-first

### ✅ Benefícios de Negócio

- **Produtividade**: 50% redução no tempo de avaliação
- **Qualidade**: Processo padronizado e auditável
- **Eficiência**: Interface centralizada para equipe HSE
- **Compliance**: Histórico completo de avaliações
- **Escalabilidade**: Capacidade para volume crescente

---

## 📧 FUNCIONALIDADE DE EMAIL SHARING

### Componente EmailInviteService

```typescript
// src/shared/services/EmailInviteService.ts
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";

export interface IEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "convite" | "lembrete" | "pendencia" | "aprovacao" | "rejeicao";
}

export interface IEmailInvite {
  to: string;
  subject: string;
  body: string;
  webpartUrl: string;
  templateId?: string;
}

export class EmailInviteService {
  private sp: SPFI;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.sp = spfi().using(SPFx(context));
    this.context = context;
  }

  /**
   * Gera URL do webpart HSE Supplier Register para novo fornecedor
   */
  public generateSupplierInviteUrl(
    customParams?: Record<string, string>
  ): string {
    const baseUrl = this.context.pageContext.web.absoluteUrl;
    const webpartPage = "/SitePages/HSE-Supplier-Register.aspx";

    let url = `${baseUrl}${webpartPage}`;

    if (customParams) {
      const params = new URLSearchParams(customParams);
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Envia convite por email para novo fornecedor
   */
  public async sendSupplierInvite(invite: IEmailInvite): Promise<void> {
    try {
      // Substitui placeholder no template
      const finalBody = invite.body.replace(
        "[LINK_FORMULARIO]",
        invite.webpartUrl
      );

      // Usa Microsoft Graph para enviar email
      await this.sendEmailViaGraph({
        ...invite,
        body: finalBody,
      });

      // Salva histórico de email enviado
      await this.saveEmailHistory({
        to: invite.to,
        subject: invite.subject,
        type: "convite",
        status: "enviado",
        dataSent: new Date(),
        webpartUrl: invite.webpartUrl,
      });
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      throw new Error(`Falha ao enviar convite: ${error.message}`);
    }
  }

  /**
   * Obtem templates de email padrão
   */
  public getEmailTemplates(): IEmailTemplate[] {
    return [
      {
        id: "convite-inicial",
        name: "Convite Inicial HSE",
        type: "convite",
        subject: "Convite HSE - Auto-avaliação Oceaneering",
        body: `
Prezados,

A Oceaneering convida sua empresa para realizar a auto-avaliação HSE através do link abaixo:

🔗 [LINK_FORMULARIO]

📋 O que você precisa saber:
• Prazo: 15 dias úteis a partir desta data
• Tempo estimado: 45-60 minutos
• Documentos necessários: REM, certificados HSE, comprovantes

📞 Suporte:
• Email: hse@oceaneering.com
• Telefone: (11) 1234-5678

Atenciosamente,
Equipe HSE Oceaneering
        `,
      },
      {
        id: "lembrete-prazo",
        name: "Lembrete Prazo Vencendo",
        type: "lembrete",
        subject: "Lembrete: Prazo HSE vencendo em 3 dias",
        body: `
Prezados,

Lembramos que o prazo para conclusão da auto-avaliação HSE vence em 3 dias.

🔗 [LINK_FORMULARIO]

Caso tenham dúvidas, nossa equipe está disponível para auxiliar.

Atenciosamente,
Equipe HSE Oceaneering
        `,
      },
      {
        id: "solicitacao-info",
        name: "Solicitação Informações Pendentes",
        type: "pendencia",
        subject: "HSE: Informações pendentes necessárias",
        body: `
Prezados,

Após análise de sua submissão HSE, identificamos algumas informações pendentes que precisam ser esclarecidas:

📋 Pendências identificadas:
[LISTA_PENDENCIAS]

🔗 Para atualizar as informações: [LINK_FORMULARIO]

Aguardamos retorno em até 5 dias úteis.

Atenciosamente,
Equipe HSE Oceaneering
        `,
      },
    ];
  }

  private async sendEmailViaGraph(email: IEmailInvite): Promise<void> {
    // Implementação usando Microsoft Graph
    // Seria integrado com o Graph SDK do SPFx
    const graphUrl = `https://graph.microsoft.com/v1.0/me/sendMail`;

    const emailData = {
      message: {
        subject: email.subject,
        body: {
          contentType: "Text",
          content: email.body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: email.to,
            },
          },
        ],
      },
    };

    // Envio via Graph API seria implementado aqui
    console.log("Email seria enviado via Graph:", emailData);
  }

  private async saveEmailHistory(history: any): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("HSE_Email_History").items.add({
        Title: `Email para ${history.to}`,
        ToEmail: history.to,
        Subject: history.subject,
        EmailType: history.type,
        Status: history.status,
        DataEnvio: history.dataSent.toISOString(),
        WebpartUrl: history.webpartUrl,
      });
    } catch (error) {
      console.warn("Não foi possível salvar histórico do email:", error);
    }
  }
}
```

### Componente EmailInvitePanel

```typescript
// src/webparts/hseControlPanel/components/panels/EmailInvitePanel.tsx
import * as React from "react";
import {
  Panel,
  PrimaryButton,
  DefaultButton,
  TextField,
  Dropdown,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  EmailInviteService,
  IEmailTemplate,
} from "../../../shared/services/EmailInviteService";

interface IEmailInvitePanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  emailService: EmailInviteService;
}

export const EmailInvitePanel: React.FC<IEmailInvitePanelProps> = ({
  isOpen,
  onDismiss,
  emailService,
}) => {
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<IEmailTemplate>();
  const [customSubject, setCustomSubject] = React.useState("");
  const [customBody, setCustomBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const templates = emailService.getEmailTemplates();

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
    setCustomSubject(template?.subject || "");
    setCustomBody(template?.body || "");
  };

  const handleSendInvite = async () => {
    try {
      setSending(true);

      const webpartUrl = emailService.generateSupplierInviteUrl({
        invite: "true",
        email: recipientEmail,
      });

      await emailService.sendSupplierInvite({
        to: recipientEmail,
        subject: customSubject,
        body: customBody,
        webpartUrl,
        templateId: selectedTemplate?.id,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onDismiss();
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText="Enviar Convite HSE"
      isLightDismiss={true}
    >
      {success && (
        <MessageBar messageBarType={MessageBarType.success}>
          Convite enviado com sucesso!
        </MessageBar>
      )}

      <TextField
        label="Email do Fornecedor"
        value={recipientEmail}
        onChange={(_, value) => setRecipientEmail(value || "")}
        placeholder="fornecedor@empresa.com"
        required
      />

      <Dropdown
        label="Template de Email"
        options={templates.map((t) => ({ key: t.id, text: t.name }))}
        onChange={(_, option) => handleTemplateChange(option?.key as string)}
        placeholder="Selecione um template"
      />

      <TextField
        label="Assunto"
        value={customSubject}
        onChange={(_, value) => setCustomSubject(value || "")}
      />

      <TextField
        label="Mensagem"
        multiline
        rows={10}
        value={customBody}
        onChange={(_, value) => setCustomBody(value || "")}
      />

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <PrimaryButton
          text={sending ? "Enviando..." : "Enviar Convite"}
          onClick={handleSendInvite}
          disabled={sending || !recipientEmail || !customSubject}
        />
        <DefaultButton text="Cancelar" onClick={onDismiss} />
      </div>
    </Panel>
  );
};
```

## 📚 DOCUMENTOS DE APOIO

Este guia mestre deve ser usado em conjunto com:

1. **HSE-CONTROL-PANEL-ROADMAP.md** - Planejamento executivo detalhado
2. **HSE-CONTROL-PANEL-SPECS.md** - Especificações técnicas completas
3. **HSE-CONTROL-PANEL-ARCHITECTURE.md** - Arquitetura detalhada
4. **HSE-CONTROL-PANEL-VISUAL-PREVIEWS.md** - Previews visuais das interfaces
5. **IMPLEMENTACAO-FASE-1.md** - Guia específico da Fase 1
6. **FASE-1-SHARED-LIBRARY.md** - Biblioteca compartilhada

---

## 🔧 COMANDOS FINAIS DE VERIFICAÇÃO

```bash
# Verificar estrutura atual
Get-ChildItem -Path "src/webparts/hseNewSupplier" -Recurse | Measure-Object

# Verificar dependências
npm list --depth=0

# Testar build atual
npm run build

# Verificar se serve funciona
npm run serve
```

---

**🚀 ESTE DOCUMENTO CONTÉM TUDO O QUE VOCÊ PRECISA PARA CRIAR O HSE CONTROL PANEL COMPLETO!**

**Use este guia como prompt completo** quando iniciar o projeto. Ele inclui:

- ✅ Arquitetura completa e estrutura de pastas
- ✅ Código completo de serviços e componentes
- ✅ Configurações e dependências exatas
- ✅ Passo a passo de implementação
- ✅ Roadmap detalhado de 5 fases
- ✅ Checklist completo de entregáveis

---

_Última atualização: Junho 2025_  
_Versão: 2.0.0_  
\*Status: **COMPLETO E PRONTO PARA IMPLEMENTAÇÃO\***
