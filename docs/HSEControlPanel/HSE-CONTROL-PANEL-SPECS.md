# HSE Control Panel - Especificações Técnicas

## 📋 Visão Geral Técnica

O **HSE Control Panel** é um SPFx WebPart que permite ao time interno HSE gerenciar, avaliar e aprovar submissões de fornecedores. Utiliza uma arquitetura baseada na biblioteca compartilhada extraída do HSE Supplier Register.

## 🏗️ Arquitetura Técnica

### Tecnologias Base

- **SPFx Framework**: 1.18+
- **React**: 18+
- **TypeScript**: 4.7+
- **Fluent UI**: 9.x
- **PnPjs**: 3.x para SharePoint
- **SCSS Modules**: Para estilos
- **React Hooks**: Para gerenciamento de estado

### Dependências Compartilhadas

```json
{
  "dependencies": {
    "@microsoft/sp-core-library": "^1.18.0",
    "@microsoft/sp-webpart-base": "^1.18.0",
    "@microsoft/sp-property-pane": "^1.18.0",
    "@fluentui/react": "^8.110.0",
    "@fluentui/react-components": "^9.34.0",
    "@pnp/sp": "^3.19.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0"
  }
}
```

## 📊 Estrutura de Dados

### SharePoint Lists & Libraries

#### Lista Principal: "hse-new-register"

**Reutiliza a mesma lista** do HSE Supplier Register com campos adicionais:

```typescript
interface ISharePointFormItem {
  // Campos existentes do formulário
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

  // Novos campos para avaliação
  DataAvaliacao?: string;
  Avaliador?: string;
  ComentariosAvaliacao?: string;
  ObservacoesAvaliacao?: string;
  QuestoesPendentes?: string; // JSON array
  DocumentosPendentes?: string; // JSON array
  HistoricoAvaliacoes?: string; // JSON array
}
```

#### Library: "anexos-contratadas"

**Reutiliza a mesma biblioteca** de documentos para visualização de anexos.

#### Nova Lista: "hse-evaluations" (Opcional)

Para histórico detalhado de avaliações:

```typescript
interface IEvaluationHistoryItem {
  Id: number;
  FormId: number;
  StatusAnterior: string;
  StatusNovo: string;
  Avaliador: string;
  DataAvaliacao: string;
  Comentarios: string;
  Observacoes: string;
  TipoAcao: "Avaliação" | "Aprovação" | "Rejeição" | "Solicitação Info";
}
```

## 🎛️ Componentes Principais

### 1. Dashboard (Landing Page)

#### DashboardContainer.tsx

```typescript
interface IDashboardProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

interface IDashboardState {
  metrics: IDashboardMetrics;
  recentForms: IFormListItem[];
  loading: boolean;
  error?: string;
}

const Dashboard: React.FC<IDashboardProps> = ({ context, serviceConfig }) => {
  // Hook personalizado para dados do dashboard
  const { metrics, recentForms, loading, error, refreshData } =
    useDashboardData(context, serviceConfig);

  return (
    <div className={styles.dashboard}>
      <DashboardHeader metrics={metrics} />
      <MetricsCards metrics={metrics} />
      <div className={styles.dashboardGrid}>
        <StatusChart data={metrics} />
        <RecentActivity forms={recentForms} />
      </div>
    </div>
  );
};
```

#### MetricsCards.tsx

```typescript
interface IMetricsCardsProps {
  metrics: IDashboardMetrics;
}

const MetricsCards: React.FC<IMetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Total de Submissões",
      value: metrics.totalSubmissions,
      icon: "FileText",
      color: "primary",
      trend: "+12% vs mês anterior",
    },
    {
      title: "Pendentes de Avaliação",
      value: metrics.pendingReview,
      icon: "Clock",
      color: "warning",
      trend: `${metrics.pendingReview} aguardando`,
    },
    {
      title: "Aprovados",
      value: metrics.approved,
      icon: "CheckCircle",
      color: "success",
      trend: "+8% vs mês anterior",
    },
    {
      title: "Tempo Médio de Avaliação",
      value: `${metrics.averageReviewTime}d`,
      icon: "Timer",
      color: "info",
      trend: "-2 dias vs média",
    },
  ];

  return (
    <div className={styles.metricsGrid}>
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
};
```

### 2. Lista de Formulários

#### FormsListContainer.tsx

```typescript
interface IFormsListProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const FormsList: React.FC<IFormsListProps> = ({ context, serviceConfig }) => {
  const { forms, loading, filters, updateFilters, refreshForms, exportData } =
    useFormsList(context, serviceConfig);

  return (
    <div className={styles.formsListContainer}>
      <FormsListHeader
        onRefresh={refreshForms}
        onExport={exportData}
        totalCount={forms.length}
      />
      <FormsFilters filters={filters} onFiltersChange={updateFilters} />
      <FormsTable
        forms={forms}
        loading={loading}
        onRowClick={(form) => navigateToDetail(form.id)}
      />
    </div>
  );
};
```

#### FormsTable.tsx

```typescript
interface IFormsTableProps {
  forms: IFormListItem[];
  loading: boolean;
  onRowClick: (form: IFormListItem) => void;
}

const FormsTable: React.FC<IFormsTableProps> = ({
  forms,
  loading,
  onRowClick,
}) => {
  const columns = [
    {
      key: "empresa",
      name: "Empresa",
      fieldName: "empresa",
      minWidth: 200,
      onRender: (item: IFormListItem) => (
        <div className={styles.companyCell}>
          <Text variant="medium" className={styles.companyName}>
            {item.empresa}
          </Text>
          <Text variant="small" className={styles.cnpj}>
            CNPJ: {formatCNPJ(item.cnpj)}
          </Text>
        </div>
      ),
    },
    {
      key: "status",
      name: "Status",
      fieldName: "status",
      minWidth: 120,
      onRender: (item: IFormListItem) => <StatusBadge status={item.status} />,
    },
    {
      key: "dataSubmissao",
      name: "Data Submissão",
      fieldName: "dataSubmissao",
      minWidth: 120,
      onRender: (item: IFormListItem) => (
        <Text>{formatDate(item.dataSubmissao)}</Text>
      ),
    },
    {
      key: "grauRisco",
      name: "Grau de Risco",
      fieldName: "grauRisco",
      minWidth: 100,
      onRender: (item: IFormListItem) => <RiskBadge level={item.grauRisco} />,
    },
    {
      key: "percentualConclusao",
      name: "Conclusão",
      fieldName: "percentualConclusao",
      minWidth: 100,
      onRender: (item: IFormListItem) => (
        <ProgressIndicator
          percentComplete={item.percentualConclusao / 100}
          label={`${item.percentualConclusao}%`}
        />
      ),
    },
    {
      key: "actions",
      name: "Ações",
      minWidth: 120,
      onRender: (item: IFormListItem) => (
        <div className={styles.actionsCell}>
          <IconButton
            iconProps={{ iconName: "View" }}
            title="Visualizar"
            onClick={() => onRowClick(item)}
          />
          <IconButton
            iconProps={{ iconName: "Edit" }}
            title="Avaliar"
            onClick={() => navigateToEvaluation(item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DetailsList
      items={forms}
      columns={columns}
      loading={loading}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      className={styles.formsTable}
    />
  );
};
```

### 3. Visualização e Avaliação de Formulário

#### FormEvaluationContainer.tsx

```typescript
interface IFormEvaluationProps {
  formId: number;
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const FormEvaluation: React.FC<IFormEvaluationProps> = ({
  formId,
  context,
  serviceConfig,
}) => {
  const {
    formData,
    evaluation,
    loading,
    saving,
    updateEvaluation,
    saveEvaluation,
    approveForm,
    rejectForm,
  } = useFormEvaluation(formId, context, serviceConfig);

  return (
    <div className={styles.evaluationContainer}>
      <EvaluationHeader
        formData={formData}
        evaluation={evaluation}
        onSave={saveEvaluation}
        onApprove={approveForm}
        onReject={rejectForm}
        saving={saving}
      />

      <div className={styles.evaluationContent}>
        <div className={styles.formViewer}>
          <HSEFormViewer
            formData={formData}
            readOnly={true}
            showAttachments={true}
          />
        </div>

        <div className={styles.evaluationPanel}>
          <EvaluationPanel
            evaluation={evaluation}
            onEvaluationChange={updateEvaluation}
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
};
```

#### HSEFormViewer.tsx (Componente Compartilhado)

```typescript
interface IHSEFormViewerProps {
  formData: IHSEFormData;
  readOnly?: boolean;
  showAttachments?: boolean;
  highlightIssues?: boolean;
  evaluation?: IHSEFormEvaluation;
}

const HSEFormViewer: React.FC<IHSEFormViewerProps> = ({
  formData,
  readOnly = false,
  showAttachments = true,
  highlightIssues = false,
  evaluation,
}) => {
  return (
    <div className={styles.formViewer}>
      <FormSection title="Dados Gerais" icon="Company">
        <DadosGeraisViewer
          data={formData.dadosGerais}
          readOnly={readOnly}
          evaluation={evaluation}
        />
      </FormSection>

      <FormSection title="Conformidade Legal" icon="ComplianceAudit">
        <ConformidadeLegalViewer
          data={formData.conformidadeLegal}
          readOnly={readOnly}
          highlightIssues={highlightIssues}
          evaluation={evaluation}
        />
      </FormSection>

      <FormSection title="Serviços Especializados" icon="Settings">
        <ServicosEspeciaisViewer
          data={formData.servicosEspeciais}
          readOnly={readOnly}
          evaluation={evaluation}
        />
      </FormSection>

      {showAttachments && (
        <FormSection title="Anexos" icon="Attach">
          <AttachmentViewer
            attachments={formData.anexos}
            formId={formData.id}
            serviceConfig={serviceConfig}
          />
        </FormSection>
      )}
    </div>
  );
};
```

#### EvaluationPanel.tsx

```typescript
interface IEvaluationPanelProps {
  evaluation: IHSEFormEvaluation;
  onEvaluationChange: (evaluation: Partial<IHSEFormEvaluation>) => void;
  formData: IHSEFormData;
}

const EvaluationPanel: React.FC<IEvaluationPanelProps> = ({
  evaluation,
  onEvaluationChange,
  formData,
}) => {
  return (
    <div className={styles.evaluationPanel}>
      <Panel headerText="Avaliação do Formulário" isOpen={true}>
        <div className={styles.statusSection}>
          <Label>Status da Avaliação</Label>
          <ChoiceGroup
            options={[
              { key: "Em Análise", text: "Em Análise" },
              { key: "Aprovado", text: "Aprovado" },
              { key: "Rejeitado", text: "Rejeitado" },
              { key: "Pendente Informações", text: "Pendente Informações" },
            ]}
            selectedKey={evaluation.status}
            onChange={(ev, option) =>
              onEvaluationChange({ status: option.key })
            }
          />
        </div>

        <div className={styles.commentsSection}>
          <Label>Comentários Gerais</Label>
          <TextField
            multiline
            rows={4}
            value={evaluation.comentarios}
            onChange={(ev, value) => onEvaluationChange({ comentarios: value })}
            placeholder="Adicione comentários sobre a avaliação..."
          />
        </div>

        <div className={styles.observationsSection}>
          <Label>Observações Específicas</Label>
          <TextField
            multiline
            rows={4}
            value={evaluation.observacoes}
            onChange={(ev, value) => onEvaluationChange({ observacoes: value })}
            placeholder="Observações específicas sobre documentos ou questões..."
          />
        </div>

        {evaluation.status === "Pendente Informações" && (
          <>
            <div className={styles.pendingQuestionsSection}>
              <Label>Questões Pendentes</Label>
              <PendingItemsList
                items={evaluation.questoesPendentes || []}
                onItemsChange={(items) =>
                  onEvaluationChange({ questoesPendentes: items })
                }
                placeholder="Adicionar questão pendente..."
              />
            </div>

            <div className={styles.pendingDocumentsSection}>
              <Label>Documentos Pendentes</Label>
              <PendingItemsList
                items={evaluation.documentosPendentes || []}
                onItemsChange={(items) =>
                  onEvaluationChange({ documentosPendentes: items })
                }
                placeholder="Adicionar documento pendente..."
              />
            </div>
          </>
        )}

        <div className={styles.evaluationHistory}>
          <EvaluationHistory formId={formData.id} />
        </div>
      </Panel>
    </div>
  );
};
```

## 🎣 Hooks Customizados

### useDashboardData.ts

```typescript
interface IDashboardDataReturn {
  metrics: IDashboardMetrics;
  recentForms: IFormListItem[];
  loading: boolean;
  error?: string;
  refreshData: () => Promise<void>;
}

export const useDashboardData = (
  context: WebPartContext,
  config: ISharePointConfig
): IDashboardDataReturn => {
  const [metrics, setMetrics] = useState<IDashboardMetrics>();
  const [recentForms, setRecentForms] = useState<IFormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const hseFormService = useMemo(
    () => new HSEFormService(context, config),
    [context, config]
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const [metricsData, recentFormsData] = await Promise.all([
        hseFormService.getDashboardMetrics(),
        hseFormService.getRecentForms(10),
      ]);

      setMetrics(metricsData);
      setRecentForms(recentFormsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hseFormService]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    metrics,
    recentForms,
    loading,
    error,
    refreshData: loadDashboardData,
  };
};
```

### useFormEvaluation.ts

```typescript
interface IFormEvaluationReturn {
  formData?: IHSEFormData;
  evaluation: IHSEFormEvaluation;
  loading: boolean;
  saving: boolean;
  updateEvaluation: (updates: Partial<IHSEFormEvaluation>) => void;
  saveEvaluation: () => Promise<void>;
  approveForm: () => Promise<void>;
  rejectForm: () => Promise<void>;
}

export const useFormEvaluation = (
  formId: number,
  context: WebPartContext,
  config: ISharePointConfig
): IFormEvaluationReturn => {
  const [formData, setFormData] = useState<IHSEFormData>();
  const [evaluation, setEvaluation] = useState<IHSEFormEvaluation>({
    formId,
    status: "Em Análise",
    comentarios: "",
    observacoes: "",
    avaliador: context.pageContext.user.displayName,
    dataAvaliacao: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hseFormService = useMemo(
    () => new HSEFormService(context, config),
    [context, config]
  );

  const loadFormData = useCallback(async () => {
    try {
      setLoading(true);

      const [form, existingEvaluation] = await Promise.all([
        hseFormService.getFormById(formId),
        hseFormService.getEvaluationByFormId(formId),
      ]);

      setFormData(form);

      if (existingEvaluation) {
        setEvaluation(existingEvaluation);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do formulário:", err);
    } finally {
      setLoading(false);
    }
  }, [formId, hseFormService]);

  const updateEvaluation = useCallback(
    (updates: Partial<IHSEFormEvaluation>) => {
      setEvaluation((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const saveEvaluation = useCallback(async () => {
    try {
      setSaving(true);
      await hseFormService.saveEvaluation(evaluation);
    } catch (err) {
      throw new Error(`Erro ao salvar avaliação: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [evaluation, hseFormService]);

  const approveForm = useCallback(async () => {
    const approvedEvaluation = {
      ...evaluation,
      status: "Aprovado" as const,
      dataAvaliacao: new Date(),
    };

    setEvaluation(approvedEvaluation);
    await hseFormService.saveEvaluation(approvedEvaluation);
    await hseFormService.updateFormStatus(formId, "Aprovado");
  }, [evaluation, formId, hseFormService]);

  const rejectForm = useCallback(async () => {
    const rejectedEvaluation = {
      ...evaluation,
      status: "Rejeitado" as const,
      dataAvaliacao: new Date(),
    };

    setEvaluation(rejectedEvaluation);
    await hseFormService.saveEvaluation(rejectedEvaluation);
    await hseFormService.updateFormStatus(formId, "Rejeitado");
  }, [evaluation, formId, hseFormService]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  return {
    formData,
    evaluation,
    loading,
    saving,
    updateEvaluation,
    saveEvaluation,
    approveForm,
    rejectForm,
  };
};
```

## 🔧 Serviços

### HSEFormService.ts

```typescript
export class HSEFormService {
  private sharePointService: SharePointService;
  private fileService: SharePointFileService;

  constructor(context: WebPartContext, config: ISharePointConfig) {
    this.sharePointService = new SharePointService(context, config.listName);
    this.fileService = new SharePointFileService(
      context,
      config.documentLibraryName
    );
  }

  public async getDashboardMetrics(): Promise<IDashboardMetrics> {
    try {
      const forms = await this.sharePointService.getAllForms();

      const totalSubmissions = forms.length;
      const pendingReview = forms.filter((f) => f.status === "Enviado").length;
      const approved = forms.filter((f) => f.status === "Aprovado").length;
      const rejected = forms.filter((f) => f.status === "Rejeitado").length;

      // Calcular tempo médio de avaliação
      const evaluatedForms = forms.filter((f) => f.dataAvaliacao);
      const averageReviewTime =
        evaluatedForms.length > 0
          ? evaluatedForms.reduce((acc, form) => {
              const submitDate = new Date(form.dataSubmissao);
              const evalDate = new Date(form.dataAvaliacao);
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

  public async getFormById(formId: number): Promise<IHSEFormData> {
    return this.sharePointService.getFormById(formId);
  }

  public async getAllForms(filters?: IFormsFilters): Promise<IFormListItem[]> {
    try {
      let query = this.sharePointService.web.lists
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
        )
        .orderBy("DataEnvio", false);

      if (filters) {
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
      }

      const items = await query.get();

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

  public async saveEvaluation(evaluation: IHSEFormEvaluation): Promise<void> {
    try {
      const updateData = {
        StatusAvaliacao: evaluation.status,
        DataAvaliacao: evaluation.dataAvaliacao.toISOString(),
        Avaliador: evaluation.avaliador,
        ComentariosAvaliacao: evaluation.comentarios,
        ObservacoesAvaliacao: evaluation.observacoes,
        QuestoesPendentes: evaluation.questoesPendentes
          ? JSON.stringify(evaluation.questoesPendentes)
          : "",
        DocumentosPendentes: evaluation.documentosPendentes
          ? JSON.stringify(evaluation.documentosPendentes)
          : "",
      };

      await this.sharePointService.updateFormData(
        evaluation.formId,
        updateData
      );

      // Salvar histórico de avaliação
      await this.saveEvaluationHistory(evaluation);
    } catch (error) {
      throw new Error(`Erro ao salvar avaliação: ${error.message}`);
    }
  }

  public async updateFormStatus(formId: number, status: string): Promise<void> {
    try {
      await this.sharePointService.updateFormData(formId, {
        StatusAvaliacao: status,
        DataAvaliacao: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(
        `Erro ao atualizar status do formulário: ${error.message}`
      );
    }
  }

  private async getRecentActivity(): Promise<IActivityItem[]> {
    // Implementar lógica para obter atividades recentes
    // Pode ser baseado em mudanças de status, novas submissões, etc.
    return [];
  }

  private async saveEvaluationHistory(
    evaluation: IHSEFormEvaluation
  ): Promise<void> {
    // Implementar salvamento do histórico de avaliações
    // Pode usar uma lista separada ou campo JSON na lista principal
  }
}
```

## 🎨 Estilos e Temas

### control-panel-theme.scss

```scss
// Tema específico do Control Panel
@import "../../../shared/styles/modern-design-system";

:root {
  // Core HSE Colors (herdadas)
  --hse-primary: #0078d4;
  --hse-secondary: #106ebe;

  // Control Panel Specific
  --control-panel-bg: #f8f9fa;
  --control-panel-sidebar: #ffffff;
  --control-panel-accent: #0078d4;
  --control-panel-border: #e1e5e9;

  // Status Colors
  --status-pending: #ff8c00;
  --status-approved: #107c10;
  --status-rejected: #d13438;
  --status-review: #0078d4;
  --status-info-needed: #8764b8;

  // Risk Level Colors
  --risk-level-1: #107c10; // Verde - Baixo
  --risk-level-2: #ffaa44; // Amarelo - Médio
  --risk-level-3: #ff8c00; // Laranja - Alto
  --risk-level-4: #d13438; // Vermelho - Muito Alto
}

// Layout do Control Panel
.controlPanelLayout {
  display: flex;
  min-height: 100vh;
  background: var(--control-panel-bg);

  .sidebar {
    width: 280px;
    background: var(--control-panel-sidebar);
    border-right: 1px solid var(--control-panel-border);
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.08);
  }

  .mainContent {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
}

// Cards de métricas
.metricsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metricCard {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--control-panel-border);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .cardHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .cardIcon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;

      &.primary {
        background: var(--hse-primary);
      }
      &.success {
        background: var(--status-approved);
      }
      &.warning {
        background: var(--status-pending);
      }
      &.danger {
        background: var(--status-rejected);
      }
      &.info {
        background: var(--status-review);
      }
    }
  }

  .cardValue {
    font-size: 2rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 8px;
  }

  .cardTitle {
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: 4px;
  }

  .cardTrend {
    font-size: 0.875rem;
    color: var(--gray-500);
  }
}

// Status badges
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.pending {
    background: rgba(255, 140, 0, 0.1);
    color: var(--status-pending);
    border: 1px solid rgba(255, 140, 0, 0.2);
  }

  &.approved {
    background: rgba(16, 124, 16, 0.1);
    color: var(--status-approved);
    border: 1px solid rgba(16, 124, 16, 0.2);
  }

  &.rejected {
    background: rgba(209, 52, 56, 0.1);
    color: var(--status-rejected);
    border: 1px solid rgba(209, 52, 56, 0.2);
  }

  &.review {
    background: rgba(0, 120, 212, 0.1);
    color: var(--status-review);
    border: 1px solid rgba(0, 120, 212, 0.2);
  }

  &.infoNeeded {
    background: rgba(135, 100, 184, 0.1);
    color: var(--status-info-needed);
    border: 1px solid rgba(135, 100, 184, 0.2);
  }
}

// Risk level badges
.riskBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;

  &.level1 {
    background: var(--risk-level-1);
    color: white;
  }

  &.level2 {
    background: var(--risk-level-2);
    color: white;
  }

  &.level3 {
    background: var(--risk-level-3);
    color: white;
  }

  &.level4 {
    background: var(--risk-level-4);
    color: white;
  }
}

// Tabela de formulários
.formsTable {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--control-panel-border);
  overflow: hidden;

  .companyCell {
    .companyName {
      font-weight: 600;
      color: var(--gray-900);
    }

    .cnpj {
      color: var(--gray-500);
      margin-top: 2px;
    }
  }

  .actionsCell {
    display: flex;
    gap: 8px;
  }
}

// Panel de avaliação
.evaluationPanel {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--control-panel-border);

  .statusSection,
  .commentsSection,
  .observationsSection,
  .pendingQuestionsSection,
  .pendingDocumentsSection {
    margin-bottom: 24px;
  }

  .evaluationHistory {
    border-top: 1px solid var(--control-panel-border);
    padding-top: 24px;
    margin-top: 24px;
  }
}

// Responsividade
@media (max-width: 768px) {
  .controlPanelLayout {
    flex-direction: column;

    .sidebar {
      width: 100%;
      order: 2;
    }

    .mainContent {
      order: 1;
      padding: 16px;
    }
  }

  .metricsGrid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

## 🔒 Segurança e Permissões

### Controle de Acesso

```typescript
interface IUserPermissions {
  canView: boolean;
  canEvaluate: boolean;
  canApprove: boolean;
  canReject: boolean;
  canGenerateReports: boolean;
  canManageSettings: boolean;
}

class PermissionService {
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  public async getCurrentUserPermissions(): Promise<IUserPermissions> {
    const userGroups = await this.getUserGroups();

    return {
      canView: this.hasAnyGroup(userGroups, [
        "HSE Evaluators",
        "HSE Managers",
        "HSE Admins",
      ]),
      canEvaluate: this.hasAnyGroup(userGroups, [
        "HSE Evaluators",
        "HSE Managers",
        "HSE Admins",
      ]),
      canApprove: this.hasAnyGroup(userGroups, ["HSE Managers", "HSE Admins"]),
      canReject: this.hasAnyGroup(userGroups, ["HSE Managers", "HSE Admins"]),
      canGenerateReports: this.hasAnyGroup(userGroups, [
        "HSE Managers",
        "HSE Admins",
      ]),
      canManageSettings: this.hasAnyGroup(userGroups, ["HSE Admins"]),
    };
  }

  private async getUserGroups(): Promise<string[]> {
    // Implementar lógica para obter grupos do usuário
    // Pode usar Microsoft Graph ou SharePoint APIs
    return [];
  }

  private hasAnyGroup(userGroups: string[], requiredGroups: string[]): boolean {
    return requiredGroups.some((group) => userGroups.includes(group));
  }
}
```

---

Esta especificação técnica fornece uma base sólida para o desenvolvimento do HSE Control Panel, garantindo reutilização máxima do código existente e uma arquitetura escalável e maintível.
