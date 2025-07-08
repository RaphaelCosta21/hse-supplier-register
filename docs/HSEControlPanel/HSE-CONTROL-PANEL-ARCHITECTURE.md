# HSE Control Panel - Arquitetura e Plano de Reutilização

## 📋 Visão Geral

Este documento descreve a estratégia para criar o **HSE Control Panel**, um webpart para o time interno HSE gerenciar as submissões de fornecedores, reutilizando a base de código existente do **HSE Supplier Register**.

## 🎯 Objetivos do HSE Control Panel

- **Visualizar** todas as submissões de fornecedores
- **Avaliar** formulários submetidos
- **Aprovar/Rejeitar** submissões com comentários
- **Dashboard** com métricas e status
- **Busca e filtros** avançados
- **Histórico** de alterações e aprovações
- **Relatórios** e exportação de dados

## 🏗️ Estratégia de Reutilização

### 1. Componentes Compartilhados (Shared Library)

Criar uma biblioteca compartilhada com os componentes reutilizáveis:

```
src/shared/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner/
│   │   ├── LoadingOverlay/
│   │   ├── ProgressIndicator/
│   │   ├── SectionTitle/
│   │   ├── FormNavigation/
│   │   └── HSEFileUploadSharePoint/
│   ├── display/
│   │   ├── HSEFormViewer/          # Novo - Para visualizar formulários
│   │   ├── AttachmentViewer/       # Novo - Para visualizar anexos
│   │   └── CNPJDisplay/            # Adaptação do CNPJVerification
├── services/
│   ├── SharePointService.ts        # Versão otimizada e unificada
│   ├── SharePointFileService.ts    # Reutilizar diretamente
│   └── HSEFormService.ts           # Novo - Lógica específica de formulários
├── types/
│   ├── IHSEFormData.ts             # Reutilizar diretamente
│   ├── IAttachmentMetadata.ts      # Reutilizar diretamente
│   ├── IHSEFormEvaluation.ts       # Novo - Para avaliações
│   └── IControlPanelData.ts        # Novo - Para dashboard
├── utils/
│   ├── validators.ts               # Reutilizar diretamente
│   ├── formatters.ts               # Reutilizar diretamente
│   ├── constants.ts                # Expandir com novas constantes
│   └── formConstants.ts            # Reutilizar diretamente
├── hooks/
│   ├── useHSEForm.ts               # Reutilizar e expandir
│   ├── useSharePointData.ts        # Reutilizar
│   ├── useFormEvaluation.ts        # Novo - Para avaliações
│   └── useDashboardData.ts         # Novo - Para métricas
└── styles/
    ├── modern-design-system.scss   # Reutilizar diretamente
    ├── variables.scss              # Reutilizar diretamente
    └── microinteractions.scss      # Reutilizar diretamente
```

### 2. Novo WebPart: HSE Control Panel

```
src/webparts/hseControlPanel/
├── HseControlPanelWebPart.ts
├── components/
│   ├── HseControlPanel.tsx         # Componente principal
│   ├── IHseControlPanelProps.ts
│   ├── dashboard/
│   │   ├── Dashboard.tsx           # Visão geral com métricas
│   │   ├── MetricsCards.tsx        # Cards com estatísticas
│   │   ├── StatusChart.tsx         # Gráficos de status
│   │   └── RecentActivity.tsx      # Atividades recentes
│   ├── forms/
│   │   ├── FormsList.tsx           # Lista de formulários
│   │   ├── FormDetails.tsx         # Detalhes do formulário
│   │   ├── FormEvaluation.tsx      # Interface de avaliação
│   │   └── FormHistory.tsx         # Histórico de mudanças
│   ├── filters/
│   │   ├── FormFilters.tsx         # Filtros avançados
│   │   └── SearchBox.tsx           # Busca
│   └── reports/
│       ├── ReportsView.tsx         # Relatórios
│       └── ExportOptions.tsx       # Opções de exportação
├── context/
│   └── ControlPanelContext.tsx     # Context específico do painel
├── styles/
│   └── control-panel-theme.scss   # Tema específico do painel
└── loc/
    ├── mystrings.d.ts
    └── en-us.js
```

## 🔧 Componentes Específicos do Control Panel

### 1. Dashboard Principal

```typescript
interface IDashboardMetrics {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number;
  recentActivity: IActivityItem[];
}
```

### 2. Lista de Formulários

```typescript
interface IFormListItem {
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

### 3. Interface de Avaliação

```typescript
interface IFormEvaluation {
  formId: number;
  status: "Aprovado" | "Rejeitado" | "Pendente Informações";
  comentarios: string;
  observacoes: string;
  avaliador: string;
  dataAvaliacao: Date;
  questoesPendentes?: string[];
  documentosPendentes?: string[];
}
```

## 📊 Novas Funcionalidades

### 1. Dashboard com Métricas

- **Cards de Status**: Total de submissões, pendentes, aprovadas, rejeitadas
- **Gráficos**: Distribuição por status, tempo de avaliação, grau de risco
- **Atividade Recente**: Últimas submissões e avaliações
- **Alertas**: Formulários pendentes há muito tempo

### 2. Sistema de Avaliação

- **Visualização Completa**: Ver todos os dados do formulário de forma organizada
- **Comentários por Seção**: Adicionar observações específicas
- **Status de Aprovação**: Aprovar, rejeitar ou solicitar informações
- **Histórico de Mudanças**: Track de todas as alterações

### 3. Filtros e Busca Avançada

- **Por Status**: Filtrar por status de avaliação
- **Por Data**: Range de datas de submissão/avaliação
- **Por Empresa**: Busca por nome ou CNPJ
- **Por Avaliador**: Filtrar por quem avaliou
- **Por Grau de Risco**: Filtrar por classificação de risco

### 4. Relatórios e Exportação

- **Relatório de Submissões**: Lista completa com filtros
- **Relatório de Pendências**: Formulários em atraso
- **Relatório de Performance**: Tempo médio de avaliação
- **Exportação Excel**: Para análises externas

## 🔄 Fluxo de Trabalho

### 1. Fornecedor (HSE Supplier Register)

1. Preenche formulário
2. Anexa documentos
3. Submete para avaliação
4. Status: "Enviado"

### 2. Time HSE (HSE Control Panel)

1. Visualiza nova submissão no dashboard
2. Abre formulário para avaliação
3. Revisa todas as seções e anexos
4. Adiciona comentários e observações
5. Define status: "Aprovado", "Rejeitado" ou "Pendente Informações"
6. Formulário retorna para fornecedor se necessário

## 🎨 Design e UX

### Paleta de Cores para Control Panel

```scss
:root {
  // Core HSE Colors (reutilizar)
  --hse-primary: #0078d4;
  --hse-secondary: #106ebe;

  // Control Panel Specific
  --control-panel-bg: #f8f9fa;
  --control-panel-sidebar: #ffffff;
  --control-panel-accent: #0078d4;

  // Status Colors
  --status-pending: #ff8c00;
  --status-approved: #107c10;
  --status-rejected: #d13438;
  --status-review: #0078d4;
}
```

### Layout Responsivo

- **Desktop**: Sidebar com navegação + área principal
- **Tablet**: Navegação colapsável
- **Mobile**: Navegação em gaveta

## 🔒 Permissões e Segurança

### Grupos de Permissão

1. **HSE Evaluators**: Podem visualizar e avaliar formulários
2. **HSE Managers**: Podem aprovar/rejeitar e gerar relatórios
3. **HSE Admins**: Acesso completo incluindo configurações

### Controle de Acesso

- Verificar membership em grupos AD/SharePoint
- Audit trail de todas as ações
- Logs de acesso e modificações

## 📝 Cronograma de Implementação

### Fase 1: Extração e Biblioteca Compartilhada (1-2 semanas)

- [ ] Criar estrutura de `src/shared/`
- [ ] Mover componentes reutilizáveis
- [ ] Unificar e otimizar `SharePointService`
- [ ] Atualizar HSE Supplier Register para usar shared library

### Fase 2: Core do Control Panel (2-3 semanas)

- [ ] Criar estrutura básica do webpart
- [ ] Implementar dashboard com métricas
- [ ] Criar lista de formulários
- [ ] Implementar visualização de formulário

### Fase 3: Sistema de Avaliação (2-3 semanas)

- [ ] Interface de avaliação
- [ ] Sistema de comentários
- [ ] Workflow de aprovação/rejeição
- [ ] Histórico de mudanças

### Fase 4: Funcionalidades Avançadas (2-3 semanas)

- [ ] Filtros e busca avançada
- [ ] Sistema de relatórios
- [ ] Exportação de dados
- [ ] Notificações e alertas

### Fase 5: Testes e Refinamentos (1-2 semanas)

- [ ] Testes de integração
- [ ] Testes de performance
- [ ] Refinamentos de UX
- [ ] Documentação final

## 🧪 Estratégia de Testes

### Testes de Componentes Compartilhados

- Unit tests para validadores e formatadores
- Integration tests para SharePoint services
- Component tests para UI components

### Testes do Control Panel

- End-to-end tests para workflow completo
- Performance tests para listas grandes
- Security tests para controle de acesso

## 📚 Próximos Passos

1. **Revisar e aprovar** esta arquitetura
2. **Criar branch** para desenvolvimento do Control Panel
3. **Começar com Fase 1**: Extração da biblioteca compartilhada
4. **Configurar ambiente** de desenvolvimento e testes
5. **Definir métricas** de performance e qualidade

---

Esta arquitetura permite máxima reutilização de código enquanto cria um sistema robusto para o time interno HSE gerenciar as submissões de fornecedores de forma eficiente e organizada.
