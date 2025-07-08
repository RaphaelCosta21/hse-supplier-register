# Guia de Implementação - Fase 1: Biblioteca Compartilhada

## 🚀 Começando a Implementação

Este guia fornece os comandos e códigos necessários para extrair a biblioteca compartilhada do HSE Supplier Register.

## 📋 Pré-requisitos

1. **Backup do projeto atual**
2. **Git branch** para desenvolvimento
3. **Node.js** e **npm** atualizados
4. **SPFx** 1.18+ instalado

### Criar Branch de Desenvolvimento

```bash
cd "c:\Users\Raphael Souza\Documents\programacao\hse-supplier-register\hse-supplier-register"
git checkout -b feature/shared-library-extraction
git push -u origin feature/shared-library-extraction
```

## 📁 Passo 1: Criar Estrutura Base

### Criar Estrutura de Pastas

```bash
# Criar estrutura principal
mkdir -p src/shared/components/common
mkdir -p src/shared/components/forms
mkdir -p src/shared/services
mkdir -p src/shared/types
mkdir -p src/shared/utils
mkdir -p src/shared/hooks
mkdir -p src/shared/styles

# Criar subpastas dos componentes
mkdir -p src/shared/components/common/LoadingSpinner
mkdir -p src/shared/components/common/LoadingOverlay
mkdir -p src/shared/components/common/ProgressIndicator
mkdir -p src/shared/components/common/ProgressModal
mkdir -p src/shared/components/common/SectionTitle
mkdir -p src/shared/components/common/FormNavigation
mkdir -p src/shared/components/common/HSEFileUpload
mkdir -p src/shared/components/forms/HSEFormViewer
mkdir -p src/shared/components/forms/AttachmentViewer
```

## 📦 Passo 2: Mover Componentes Comuns

### LoadingSpinner

```bash
# Mover arquivos
mv src/webparts/hseNewSupplier/components/common/LoadingSpinner/* src/shared/components/common/LoadingSpinner/
```

Criar `src/shared/components/common/LoadingSpinner/index.ts`:

```typescript
export { default as LoadingSpinner } from "./LoadingSpinner";
export type { ILoadingSpinnerProps } from "./LoadingSpinner";
```

### LoadingOverlay

```bash
# Mover arquivos
mv src/webparts/hseNewSupplier/components/common/LoadingOverlay/* src/shared/components/common/LoadingOverlay/
```

Criar `src/shared/components/common/LoadingOverlay/index.ts`:

```typescript
export { default as LoadingOverlay } from "./LoadingOverlay";
export type { ILoadingOverlayProps } from "./LoadingOverlay";
```

### ProgressIndicator

```bash
# Mover arquivos
mv src/webparts/hseNewSupplier/components/common/ProgressIndicator/* src/shared/components/common/ProgressIndicator/
```

Criar `src/shared/components/common/ProgressIndicator/index.ts`:

```typescript
export { default as ProgressIndicator } from "./ProgressIndicator";
export type { IProgressIndicatorProps } from "./ProgressIndicator";
```

### ProgressModal

```bash
# Mover arquivos (assumindo que existem arquivos ProgressModal.tsx e ProgressModal.module.scss)
mv src/webparts/hseNewSupplier/components/common/ProgressModal.tsx src/shared/components/common/ProgressModal/
mv src/webparts/hseNewSupplier/components/common/ProgressModal.module.scss src/shared/components/common/ProgressModal/
```

Criar `src/shared/components/common/ProgressModal/index.ts`:

```typescript
export { default as ProgressModal } from "./ProgressModal";
export type { IProgressModalProps } from "./ProgressModal";
```

### SectionTitle

```bash
# Mover arquivos
mv src/webparts/hseNewSupplier/components/common/SectionTitle/* src/shared/components/common/SectionTitle/
```

Criar `src/shared/components/common/SectionTitle/index.ts`:

```typescript
export { default as SectionTitle } from "./SectionTitle";
export type { ISectionTitleProps } from "./SectionTitle";
```

### FormNavigation

```bash
# Mover arquivos
mv src/webparts/hseNewSupplier/components/common/FormNavigation/* src/shared/components/common/FormNavigation/
```

Criar `src/shared/components/common/FormNavigation/index.ts`:

```typescript
export { default as FormNavigation } from "./FormNavigation";
export type { IFormNavigationProps } from "./FormNavigation";
```

### HSEFileUpload

```bash
# Mover arquivos de upload
mv src/webparts/hseNewSupplier/components/common/HSEFileUploadSharePoint.tsx src/shared/components/common/HSEFileUpload/
mv src/webparts/hseNewSupplier/components/common/SharePointFileUpload.tsx src/shared/components/common/HSEFileUpload/
```

Criar `src/shared/components/common/HSEFileUpload/index.ts`:

```typescript
export { default as HSEFileUploadSharePoint } from "./HSEFileUploadSharePoint";
export { default as SharePointFileUpload } from "./SharePointFileUpload";
export type { IHSEFileUploadProps } from "./HSEFileUploadSharePoint";
export type { ISharePointFileUploadProps } from "./SharePointFileUpload";
```

### Index dos Componentes Comuns

Criar `src/shared/components/common/index.ts`:

```typescript
export * from "./LoadingSpinner";
export * from "./LoadingOverlay";
export * from "./ProgressIndicator";
export * from "./ProgressModal";
export * from "./SectionTitle";
export * from "./FormNavigation";
export * from "./HSEFileUpload";
```

## 🔧 Passo 3: Mover Serviços

### SharePointService (Unificado)

```bash
# Criar backup dos serviços existentes
mkdir -p src/webparts/hseNewSupplier/services/backup
cp src/webparts/hseNewSupplier/services/SharePointService*.ts src/webparts/hseNewSupplier/services/backup/
```

Criar `src/shared/services/SharePointService.ts`:

```typescript
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export interface ISharePointConfig {
  listName: string;
  documentLibraryName?: string;
}

export class SharePointService {
  private sp: SPFI;
  private listName: string;
  private context: WebPartContext;

  constructor(context: WebPartContext, config: ISharePointConfig | string) {
    this.sp = spfi().using(SPFx(context));
    this.context = context;

    // Backward compatibility - aceita string ou config object
    if (typeof config === "string") {
      this.listName = config;
    } else {
      this.listName = config.listName;
    }
  }

  /**
   * Salva dados do formulário (rascunho)
   */
  public async saveFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<number> {
    const dados = formData.dadosGerais;
    const now = new Date();
    const userContext = this.context?.pageContext?.user;

    // Calcular percentual de conclusão
    const calculateCompletionPercentage = (): number => {
      let completed = 0;
      const totalSections = 3;

      if (dados.empresa && dados.cnpj && dados.numeroContrato) completed++;
      if (
        formData.conformidadeLegal &&
        Object.keys(formData.conformidadeLegal).length > 0
      )
        completed++;
      if (formData.servicosEspeciais) completed++;

      return Math.round((completed / totalSections) * 100);
    };

    // Contar anexos
    const countAttachments = (): number => {
      if (!attachments || typeof attachments !== "object") return 0;

      return Object.keys(attachments).reduce((total, category) => {
        const categoryFiles = attachments[category];
        return (
          total + (Array.isArray(categoryFiles) ? categoryFiles.length : 0)
        );
      }, 0);
    };

    // Criar JSON dos dados
    const jsonData = {
      dadosGerais: formData.dadosGerais || {},
      conformidadeLegal: formData.conformidadeLegal || {},
      servicosEspeciais: formData.servicosEspeciais || {},
      anexos: attachments || {},
      metadata: {
        dataSalvamento: now.toISOString(),
        usuario: userContext?.displayName || "Usuário Externo",
        email: userContext?.email || "usuario@externo.com",
        temAnexos: countAttachments() > 0,
        totalAnexos: countAttachments(),
      },
    };

    const itemData = {
      Title: (dados.empresa || "Formulário em Andamento").toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: "Em Andamento",
      DataEnvio: now.toISOString(),
      DataCriacao: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(),
      PercentualConclusao: calculateCompletionPercentage(),
      DadosFormulario: JSON.stringify(jsonData),
      UltimaModificacao: now.toISOString(),
      EmailPreenchimento: (
        userContext?.email || "usuario@externo.com"
      ).toString(),
      NomePreenchimento: (
        userContext?.displayName || "Usuário Externo"
      ).toString(),
      AnexosCount: countAttachments(),
      Observacoes: "",
    };

    try {
      const list = this.sp.web.lists.getByTitle(this.listName);
      const result = await list.items.add(itemData);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      throw new Error(`Falha ao salvar formulário: ${error.message}`);
    }
  }

  /**
   * Submete formulário finalizado
   */
  public async submitFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<number> {
    const dados = formData.dadosGerais;
    const now = new Date();
    const userContext = this.context?.pageContext?.user;

    // Contar anexos de forma segura
    const countAttachments = (): number => {
      if (!attachments || typeof attachments !== "object") return 0;

      return Object.keys(attachments).reduce((total, category) => {
        const categoryFiles = attachments[category];
        return (
          total + (Array.isArray(categoryFiles) ? categoryFiles.length : 0)
        );
      }, 0);
    };

    // Criar JSON dos dados para submissão
    const jsonData = {
      dadosGerais: formData.dadosGerais || {},
      conformidadeLegal: formData.conformidadeLegal || {},
      servicosEspeciais: formData.servicosEspeciais || {},
      anexos: attachments || {},
      metadata: {
        dataSubmissao: now.toISOString(),
        usuario: userContext?.displayName || "Usuário Externo",
        email: userContext?.email || "usuario@externo.com",
        temAnexos: countAttachments() > 0,
        totalAnexos: countAttachments(),
      },
    };

    const itemData = {
      Title: (dados.empresa || "Formulário HSE").toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: "Enviado",
      DataEnvio: now.toISOString(),
      DataCriacao: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(),
      PercentualConclusao: 100,
      DadosFormulario: JSON.stringify(jsonData),
      UltimaModificacao: now.toISOString(),
      EmailPreenchimento: (
        userContext?.email || "usuario@externo.com"
      ).toString(),
      NomePreenchimento: (
        userContext?.displayName || "Usuário Externo"
      ).toString(),
      AnexosCount: countAttachments(),
      Observacoes: "",
    };

    try {
      const list = this.sp.web.lists.getByTitle(this.listName);
      const result = await list.items.add(itemData);
      console.log("Formulário HSE enviado com sucesso! ID:", result.data.Id);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      throw new Error(`Falha ao enviar formulário: ${error.message}`);
    }
  }

  /**
   * Atualiza dados do formulário
   */
  public async updateFormData(
    itemId: number,
    formData: Partial<IHSEFormData> | any
  ): Promise<void> {
    const now = new Date();

    // Se for um formData completo, processar
    if (formData.dadosGerais) {
      const updateData = {
        Title: (
          formData.dadosGerais?.empresa || "Formulário Atualizado"
        ).toString(),
        CNPJ: (formData.dadosGerais?.cnpj || "").toString(),
        NumeroContrato: (formData.dadosGerais?.numeroContrato || "").toString(),
        ResponsavelTecnico: (
          formData.dadosGerais?.responsavelTecnico || ""
        ).toString(),
        GrauRisco: (formData.dadosGerais?.grauRisco || "1").toString(),
        DadosFormulario: JSON.stringify(formData),
        UltimaModificacao: now.toISOString(),
      };

      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .update(updateData);
    } else {
      // Se for dados diretos do SharePoint, usar como está
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .update(formData);
    }
  }

  /**
   * Busca formulário por ID
   */
  public async getFormById(itemId: number): Promise<IHSEFormData | undefined> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .get();

      if (!item) return undefined;

      // Parse dos dados do formulário
      const dadosFormulario = item.DadosFormulario
        ? JSON.parse(item.DadosFormulario)
        : {};

      return {
        id: item.Id,
        statusFormulario: item.StatusAvaliacao || "Rascunho",
        dadosGerais: dadosFormulario.dadosGerais || {},
        conformidadeLegal: dadosFormulario.conformidadeLegal || {},
        servicosEspeciais: dadosFormulario.servicosEspeciais || {},
        anexos: dadosFormulario.anexos || {},
        dataCriacao: item.Created ? new Date(item.Created) : undefined,
        dataUltimaModificacao: item.Modified
          ? new Date(item.Modified)
          : undefined,
      } as IHSEFormData;
    } catch (error) {
      console.error(`Erro ao buscar formulário com ID ${itemId}:`, error);
      return undefined;
    }
  }

  /**
   * Lista todos os formulários (para Control Panel)
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

      const items = await query.orderBy("DataEnvio", false).get();
      return items;
    } catch (error) {
      console.error("Erro ao obter formulários com filtros:", error);
      throw new Error(`Falha ao obter formulários: ${error.message}`);
    }
  }
}
```

### SharePointFileService

```bash
# Mover arquivo
mv src/webparts/hseNewSupplier/services/SharePointFileService.ts src/shared/services/
```

### HSEFormService (Novo)

Criar `src/shared/services/HSEFormService.ts`:

```typescript
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SharePointService, ISharePointConfig } from "./SharePointService";
import { SharePointFileService } from "./SharePointFileService";
import { IHSEFormData } from "../types/IHSEFormData";
import {
  IDashboardMetrics,
  IFormListItem,
  IActivityItem,
} from "../types/IControlPanelData";

export class HSEFormService {
  private sharePointService: SharePointService;
  private fileService: SharePointFileService;

  constructor(context: WebPartContext, config: ISharePointConfig) {
    this.sharePointService = new SharePointService(context, config);
    this.fileService = new SharePointFileService(
      context,
      config.documentLibraryName || "anexos-contratadas"
    );
  }

  /**
   * Obtém métricas para o dashboard
   */
  public async getDashboardMetrics(): Promise<IDashboardMetrics> {
    try {
      const forms = await this.sharePointService.getAllForms();

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

      const recentActivity = await this.getRecentActivity();

      return {
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        averageReviewTime: Math.round(averageReviewTime),
        recentActivity,
      };
    } catch (error) {
      throw new Error(`Erro ao obter métricas do dashboard: ${error.message}`);
    }
  }

  /**
   * Obtém lista de formulários para exibição
   */
  public async getFormsList(filters?: any): Promise<IFormListItem[]> {
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

  /**
   * Obtém formulários recentes
   */
  public async getRecentForms(limit: number = 10): Promise<IFormListItem[]> {
    const allForms = await this.getFormsList();
    return allForms.slice(0, limit);
  }

  /**
   * Obtém formulário completo por ID
   */
  public async getFormById(formId: number): Promise<IHSEFormData> {
    return this.sharePointService.getFormById(formId);
  }

  /**
   * Atualiza status do formulário
   */
  public async updateFormStatus(formId: number, status: string): Promise<void> {
    await this.sharePointService.updateFormData(formId, {
      StatusAvaliacao: status,
      DataAvaliacao: new Date().toISOString(),
    });
  }

  /**
   * Calcula percentual de conclusão do formulário
   */
  public calculateCompletionPercentage(formData: IHSEFormData): number {
    let completed = 0;
    const totalSections = 3;

    if (
      formData.dadosGerais.empresa &&
      formData.dadosGerais.cnpj &&
      formData.dadosGerais.numeroContrato
    ) {
      completed++;
    }

    if (
      formData.conformidadeLegal &&
      Object.keys(formData.conformidadeLegal).length > 0
    ) {
      completed++;
    }

    if (formData.servicosEspeciais) {
      completed++;
    }

    return Math.round((completed / totalSections) * 100);
  }

  /**
   * Obtém atividades recentes (placeholder)
   */
  private async getRecentActivity(): Promise<IActivityItem[]> {
    // Implementar lógica para obter atividades recentes
    // Por enquanto retorna array vazio
    return [];
  }
}
```

### Index dos Serviços

Criar `src/shared/services/index.ts`:

```typescript
export * from "./SharePointService";
export * from "./SharePointFileService";
export * from "./HSEFormService";
```

## 📝 Passo 4: Mover Tipos

### Mover Tipos Existentes

```bash
# Mover tipos existentes
mv src/webparts/hseNewSupplier/types/IHSEFormData.ts src/shared/types/
mv src/webparts/hseNewSupplier/types/IAttachmentMetadata.ts src/shared/types/
```

### Criar Novos Tipos

Criar `src/shared/types/IControlPanelData.ts`:

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
  status: "Em Andamento" | "Enviado" | "Em Análise" | "Aprovado" | "Rejeitado";
  dataSubmissao: Date;
  dataAvaliacao?: Date;
  avaliador?: string;
  grauRisco: string;
  percentualConclusao: number;
}

export interface IFormsFilters {
  status?: string;
  grauRisco?: string;
  dataInicio?: Date;
  dataFim?: Date;
  empresa?: string;
  avaliador?: string;
}
```

Criar `src/shared/types/IHSEFormEvaluation.ts`:

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

### Index dos Tipos

Criar `src/shared/types/index.ts`:

```typescript
export * from "./IHSEFormData";
export * from "./IAttachmentMetadata";
export * from "./IControlPanelData";
export * from "./IHSEFormEvaluation";
```

## 🛠️ Passo 5: Mover Utilitários

### Mover Utilitários Existentes

```bash
# Mover utilitários
mv src/webparts/hseNewSupplier/utils/validators.ts src/shared/utils/
mv src/webparts/hseNewSupplier/utils/formatters.ts src/shared/utils/
mv src/webparts/hseNewSupplier/utils/constants.ts src/shared/utils/
mv src/webparts/hseNewSupplier/utils/formConstants.ts src/shared/utils/
```

### Index dos Utilitários

Criar `src/shared/utils/index.ts`:

```typescript
export * from "./validators";
export * from "./formatters";
export * from "./constants";
export * from "./formConstants";
```

## 🎣 Passo 6: Criar Hooks Customizados

### useHSEForm.ts

Criar `src/shared/hooks/useHSEForm.ts`:

```typescript
import { useState, useCallback, useEffect } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";
import { HSEFormService } from "../services/HSEFormService";
import { ISharePointConfig } from "../services/SharePointService";

interface IUseHSEFormOptions {
  context: WebPartContext;
  config: ISharePointConfig;
  formId?: number;
}

interface IUseHSEFormReturn {
  formData: IHSEFormData;
  loading: boolean;
  saving: boolean;
  updateFormData: (updates: Partial<IHSEFormData>) => void;
  updateAttachments: (
    category: string,
    attachments: IAttachmentMetadata[]
  ) => void;
  saveForm: () => Promise<number>;
  submitForm: () => Promise<number>;
  resetForm: () => void;
}

export const useHSEForm = ({
  context,
  config,
  formId,
}: IUseHSEFormOptions): IUseHSEFormReturn => {
  const [formData, setFormData] = useState<IHSEFormData>({
    statusFormulario: "Rascunho",
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
      grauRisco: "",
      possuiSESMT: false,
      numeroComponentesSESMT: undefined,
      gerenteContratoMarine: "",
    },
    conformidadeLegal: {},
    servicosEspeciais: {},
    anexos: {},
  });

  const [attachments, setAttachments] = useState<{
    [category: string]: IAttachmentMetadata[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const hseFormService = new HSEFormService(context, config);

  // Carregar formulário existente se formId for fornecido
  useEffect(() => {
    if (formId) {
      loadExistingForm(formId);
    }
  }, [formId]);

  const loadExistingForm = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const existingForm = await hseFormService.getFormById(id);
        if (existingForm) {
          setFormData(existingForm);
          setAttachments(existingForm.anexos || {});
        }
      } catch (error) {
        console.error("Erro ao carregar formulário:", error);
      } finally {
        setLoading(false);
      }
    },
    [hseFormService]
  );

  const updateFormData = useCallback((updates: Partial<IHSEFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateAttachments = useCallback(
    (category: string, categoryAttachments: IAttachmentMetadata[]) => {
      setAttachments((prev) => ({
        ...prev,
        [category]: categoryAttachments,
      }));

      // Atualizar também no formData
      setFormData((prev) => ({
        ...prev,
        anexos: {
          ...prev.anexos,
          [category]: categoryAttachments,
        },
      }));
    },
    []
  );

  const saveForm = useCallback(async (): Promise<number> => {
    try {
      setSaving(true);
      const formDataWithAttachments = {
        ...formData,
        anexos: attachments,
      };

      if (formId) {
        await hseFormService.sharePointService.updateFormData(
          formId,
          formDataWithAttachments
        );
        return formId;
      } else {
        return await hseFormService.sharePointService.saveFormData(
          formDataWithAttachments,
          attachments
        );
      }
    } catch (error) {
      throw new Error(`Erro ao salvar formulário: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [formData, attachments, formId, hseFormService]);

  const submitForm = useCallback(async (): Promise<number> => {
    try {
      setSaving(true);
      const formDataWithAttachments = {
        ...formData,
        anexos: attachments,
        statusFormulario: "Enviado",
      };

      return await hseFormService.sharePointService.submitFormData(
        formDataWithAttachments,
        attachments
      );
    } catch (error) {
      throw new Error(`Erro ao submeter formulário: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [formData, attachments, hseFormService]);

  const resetForm = useCallback(() => {
    setFormData({
      statusFormulario: "Rascunho",
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
        grauRisco: "",
        possuiSESMT: false,
        numeroComponentesSESMT: undefined,
        gerenteContratoMarine: "",
      },
      conformidadeLegal: {},
      servicosEspeciais: {},
      anexos: {},
    });
    setAttachments({});
  }, []);

  return {
    formData,
    loading,
    saving,
    updateFormData,
    updateAttachments,
    saveForm,
    submitForm,
    resetForm,
  };
};
```

### Index dos Hooks

Criar `src/shared/hooks/index.ts`:

```typescript
export * from "./useHSEForm";
```

## 🎨 Passo 7: Mover Estilos

### Mover Estilos Existentes

```bash
# Mover estilos
mv src/webparts/hseNewSupplier/styles/modern-design-system.scss src/shared/styles/
mv src/webparts/hseNewSupplier/styles/variables.scss src/shared/styles/
mv src/webparts/hseNewSupplier/styles/microinteractions.scss src/shared/styles/
```

### Criar Index dos Estilos

Criar `src/shared/styles/index.scss`:

```scss
@import "./variables";
@import "./modern-design-system";
@import "./microinteractions";
```

## 📦 Passo 8: Criar Index Principal

Criar `src/shared/index.ts`:

```typescript
// Componentes
export * from "./components/common";
export * from "./components/forms";

// Serviços
export * from "./services";

// Tipos
export * from "./types";

// Utilitários
export * from "./utils";

// Hooks
export * from "./hooks";
```

## 🔄 Passo 9: Atualizar HSE Supplier Register

### Atualizar Imports no WebPart Principal

Editar `src/webparts/hseNewSupplier/components/HseNewSupplier.tsx`:

**Localizar e substituir imports:**

```typescript
// Antes
import LoadingSpinner from "./common/LoadingSpinner/LoadingSpinner";
import LoadingOverlay from "./common/LoadingOverlay/LoadingOverlay";
// ... outros imports

// Depois
import {
  LoadingSpinner,
  LoadingOverlay,
  ProgressIndicator,
  ProgressModal,
  SectionTitle,
  FormNavigation,
  HSEFileUploadSharePoint,
} from "../../../shared";

import {
  SharePointService,
  SharePointFileService,
  HSEFormService,
} from "../../../shared";

import { IHSEFormData, IAttachmentMetadata } from "../../../shared";

import { validateCNPJ, formatCNPJ, FORM_STEPS } from "../../../shared";
```

### Atualizar Context

Editar `src/webparts/hseNewSupplier/components/context/HSEFormContext.tsx`:

**Substituir imports:**

```typescript
// Antes
import { SharePointService } from "../../services/SharePointService";
import { SharePointFileService } from "../../services/SharePointFileService";
import { IHSEFormData } from "../../types/IHSEFormData";
import { IAttachmentMetadata } from "../../types/IAttachmentMetadata";

// Depois
import {
  SharePointService,
  SharePointFileService,
  HSEFormService,
  IHSEFormData,
  IAttachmentMetadata,
  useHSEForm,
} from "../../../../shared";
```

### Atualizar Outros Componentes

Editar todos os arquivos que importam dos diretórios movidos:

```bash
# Encontrar arquivos que precisam ser atualizados
grep -r "from.*components/common" src/webparts/hseNewSupplier/
grep -r "from.*services/" src/webparts/hseNewSupplier/
grep -r "from.*types/" src/webparts/hseNewSupplier/
grep -r "from.*utils/" src/webparts/hseNewSupplier/
```

## 🧪 Passo 10: Validação

### Compilar Projeto

```bash
npm run build
```

### Executar Testes

```bash
npm test
```

### Servir Localmente

```bash
gulp serve
```

## 📋 Checklist Final

- [ ] Estrutura de pastas criada em `src/shared/`
- [ ] Componentes comuns movidos e com index.ts
- [ ] Serviços unificados e organizados
- [ ] Tipos movidos e novos tipos criados
- [ ] Utilitários movidos
- [ ] Hooks customizados criados
- [ ] Estilos movidos
- [ ] Index principal criado
- [ ] Imports atualizados no HSE Supplier Register
- [ ] Build passa sem erros
- [ ] Aplicação funciona localmente
- [ ] Git commit das mudanças

### Commit das Mudanças

```bash
git add .
git commit -m "feat: extract shared library from HSE Supplier Register

- Move common components to src/shared/components/
- Unify SharePoint services in src/shared/services/
- Create HSEFormService for business logic
- Move types and utilities to src/shared/
- Create custom hooks for form management
- Update all imports in HSE Supplier Register
- Maintain backward compatibility"

git push origin feature/shared-library-extraction
```

---

Após completar este guia, você terá uma biblioteca compartilhada robusta pronta para ser utilizada tanto pelo HSE Supplier Register quanto pelo novo HSE Control Panel.
