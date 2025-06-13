# Componentes - HSE Supplier Register

## Visão Geral

Este documento detalha todos os componentes React utilizados no projeto HSE Supplier Register, organizados por categoria e funcionalidade.

## Estrutura de Componentes

### Componente Principal

#### `HseNewSupplier.tsx`

**Localização**: `/components/HseNewSupplier.tsx`
**Função**: Componente raiz da aplicação que orquestra todo o formulário multi-etapas.

**Funcionalidades**:

- Navegação entre etapas do formulário
- Gerenciamento de estado global via Context API
- Renderização condicional baseada no estado atual
- Validação e controle de fluxo entre etapas
- Interface de progresso visual

**Props**:

```typescript
interface IHseNewSupplierProps {
  context: WebPartContext;
  sharePointListName: string;
  sharePointDocumentLibraryName: string;
  maxFileSize: number;
  enableDebugMode: boolean;
}
```

**Estados Principais**:

- `currentStep`: Etapa atual do formulário (1-4)
- `isProcessing`: Estado de processamento
- `error`: Mensagens de erro globais
- `validationErrors`: Erros de validação acumulados

**Hooks Utilizados**:

- `useHSEForm()`: Contexto principal da aplicação
- `React.useCallback()`: Otimização de performance
- `React.useMemo()`: Memoização de navegação

---

### Tela Inicial

#### `InitialScreen.tsx`

**Localização**: `/components/screens/InitialScreen.tsx`
**Função**: Tela inicial para verificação de CNPJ e seleção de formulário.

**Funcionalidades**:

- Validação e busca por CNPJ
- Listagem de formulários existentes do usuário
- Controle de permissões (edição/visualização)
- Iniciação de novo formulário
- Carregamento de formulário existente

**Estados**:

- `cnpjValue`: Valor do CNPJ digitado
- `isSearching`: Estado de busca
- `searchResult`: Resultado da busca por CNPJ
- `userForms`: Lista de formulários do usuário
- `loadingUserForms`: Estado de carregamento

**Componentes Internos**:

- `SimpleCard`: Card simples para organização visual
- Formulário de busca CNPJ
- Lista de formulários existentes
- Controles de ação (Editar/Iniciar Novo)

---

### Blocos de Formulário

#### `DadosGerais.tsx`

**Localização**: `/components/formBlocks/DadosGerais/DadosGerais.tsx`
**Função**: Primeira etapa - dados básicos da empresa e contrato.

**Campos Principais**:

- Informações da empresa (CNPJ, razão social, endereço)
- Dados do contrato (número, datas, valores)
- Responsável técnico
- Atividade principal CNAE
- Grau de risco
- Upload de REM (Registro de Empregado)

**Validações**:

- CNPJ obrigatório e válido
- Campos obrigatórios preenchidos
- Datas de contrato válidas
- Upload de REM obrigatório

#### `ConformidadeLegal.tsx`

**Localização**: `/components/formBlocks/ConformidadeLegal/ConformidadeLegal.tsx`
**Função**: Segunda etapa - conformidade com normas regulamentadoras.

**Estrutura**:

- Blocos organizados por NR (Norma Regulamentadora)
- Perguntas de "Sim/Não/Não Aplicável"
- Upload de documentos por categoria
- Validação condicional baseada em aplicabilidade

**NRs Implementadas**:

- NR-01: Disposições Gerais
- NR-04: Serviços Especializados
- NR-05: CIPA
- NR-06: EPI
- NR-07: PCMSO
- NR-09: PPRA
- NR-10: Segurança em Instalações Elétricas
- E outras...

#### `ServicosEspeciais.tsx`

**Localização**: `/components/formBlocks/ServicosEspeciais/ServicosEspeciais.tsx`
**Função**: Terceira etapa - serviços especializados (embarcações e içamento).

**Subcomponentes**:

- `EmbarcacoesSection`: Documentação de embarcações
- `IcamentoSection`: Documentação de içamento

**Documentos Requeridos**:

- **Embarcações**: IOPP, Registro de Armador, Propriedade Marítima, etc.
- **Içamento**: Certificados de equipamentos, laudos técnicos, etc.

#### `RevisaoFinal.tsx`

**Localização**: `/components/formBlocks/RevisaoFinal/RevisaoFinal.tsx`
**Função**: Quarta etapa - revisão e submissão final.

**Funcionalidades**:

- Resumo de todas as etapas
- Indicadores visuais de completude
- Preview de documentos anexados
- Validação final completa
- Submissão com feedback de progresso

---

### Componentes Comuns

#### `FloatingSaveButton.tsx`

**Localização**: `/components/common/FloatingSaveButton/FloatingSaveButton.tsx`
**Função**: Botão flutuante para salvar progresso ou prosseguir para revisão.

**Comportamentos**:

- **Etapas 1-3**: Botão "Salvar Progresso" (azul)
- **Etapas Completas**: Botão "Revisar e Submeter" (verde)
- **Etapa 4**: Não exibido (RevisaoFinal tem seus próprios botões)

**Estados**:

- `isSaving`: Processamento de salvamento
- `progressOpen`: Modal de progresso ativo
- `showValidationError`: Erro de validação visível
- `toastVisible`: Notificação toast ativa

**Validações**:

- Dados Gerais: Campos obrigatórios + REM
- Conformidade Legal: Questões aplicáveis respondidas + documentos
- Serviços Especiais: Documentos obrigatórios se aplicável

#### `ProgressModal.tsx`

**Localização**: `/components/common/ProgressModal.tsx`
**Função**: Modal de progresso durante operações longas.

**Props**:

```typescript
interface ProgressModalProps {
  open: boolean;
  percent: number;
  label: string;
  description?: string;
  fileCount?: number;
  showTimeWarning?: boolean;
  showEstimatedTime?: boolean;
  allowCancel?: boolean;
  onCancel?: () => void;
}
```

**Funcionalidades**:

- Barra de progresso animada
- Mensagens contextuais
- Estimativa de tempo baseada em arquivos
- Opção de cancelamento (quando aplicável)
- Travamento de tela durante processamento

#### `ProgressIndicator.tsx`

**Localização**: `/components/common/ProgressIndicator/ProgressIndicator.tsx`
**Função**: Indicador de progresso customizado mais elegante que o padrão.

**Melhorias sobre o padrão**:

- Design mais moderno
- Animações suaves
- Cores customizáveis
- Labels opcionais
- Responsividade melhorada

#### `LoadingSpinner.tsx`

**Localização**: `/components/common/LoadingSpinner/LoadingSpinner.tsx`
**Função**: Spinner de carregamento padronizado.

**Variações**:

- Tamanhos: small, medium, large
- Com ou sem label
- Centralizamento automático

#### `LoadingOverlay.tsx`

**Localização**: `/components/common/LoadingOverlay/LoadingOverlay.tsx`
**Função**: Overlay de carregamento que bloqueia interações.

**Props**:

```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  showSpinner?: boolean;
}
```

#### `Toast.tsx`

**Localização**: `/components/common/Toast/Toast.tsx`
**Função**: Notificações toast não-intrusivas.

**Tipos**:

- `success`: Verde, ícone de check
- `error`: Vermelho, ícone de erro
- `warning`: Laranja, ícone de aviso
- `info`: Azul, ícone de informação

**Funcionalidades**:

- Auto-dismiss configurável
- Posicionamento fixo (top-right)
- Animações de entrada/saída
- Suporte a mensagens longas

#### `SectionTitle.tsx`

**Localização**: `/components/common/SectionTitle/SectionTitle.tsx`
**Função**: Título padronizado para seções do formulário.

**Props**:

```typescript
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
  required?: boolean;
}
```

#### `FormNavigation.tsx`

**Localização**: `/components/common/FormNavigation/FormNavigation.tsx`
**Função**: Navegação entre etapas (usado principalmente na RevisaoFinal).

**Funcionalidades**:

- Botões de navegação
- Estados de loading
- Validação antes de prosseguir
- Design responsivo

---

### Componentes de Upload

#### `HSEFileUploadSharePoint.tsx`

**Localização**: `/components/common/HSEFileUploadSharePoint.tsx`
**Função**: Componente especializado para upload de arquivos no SharePoint.

**Funcionalidades**:

- Drag & Drop
- Validação de tipos de arquivo
- Preview de arquivos
- Progresso de upload
- Integração com SharePoint Document Library
- Metadados automáticos

**Validações**:

- Tamanho máximo (configurável)
- Tipos permitidos por categoria
- Prevenção de duplicatas
- Verificação de integridade

#### `SharePointFileUpload.tsx`

**Localização**: `/components/common/SharePointFileUpload.tsx`
**Função**: Versão simplificada do upload para casos específicos.

---

### Componentes de Contexto

#### `HSEFormProvider.tsx`

**Localização**: `/components/context/HSEFormProvider.tsx`
**Função**: Provider do Context API que envolve toda a aplicação.

**Responsabilidades**:

- Inicialização do estado global
- Configuração de serviços
- Gerenciamento de erro global
- Persistência automática

**Props**:

```typescript
interface HSEFormProviderProps {
  context: WebPartContext;
  sharePointConfig: ISharePointConfig;
  maxFileSize: number;
  debugMode: boolean;
  children: React.ReactNode;
}
```

#### `HSEFormContext.tsx`

**Localização**: `/components/context/HSEFormContext.tsx`
**Função**: Definição do contexto e hook personalizado.

**Exports**:

- `HSEFormContext`: Context React
- `useHSEForm()`: Hook personalizado para consumir o contexto

---

## Padrões Arquiteturais

### 1. **Composição de Componentes**

```typescript
// Padrão utilizado em toda a aplicação
const ComponenteComplexo: React.FC<Props> = (props) => {
  return (
    <Provider>
      <SubComponente1 />
      <SubComponente2 />
      <ComponenteComum />
    </Provider>
  );
};
```

### 2. **Hooks Personalizados**

```typescript
// Hook para lógica reutilizável
const useSpecificLogic = () => {
  const [state, setState] = React.useState();
  // lógica complexa
  return { state, actions };
};
```

### 3. **Props Tipadas**

```typescript
// Todas as props são tipadas com TypeScript
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (data: Type) => void;
}
```

### 4. **CSS Modules**

```typescript
// Importação de estilos isolados
import styles from './Component.module.scss';

// Uso
<div className={styles.container}>
```

### 5. **Conditional Rendering**

```typescript
// Renderização condicional baseada em estado
{
  condition && <Component />;
}
{
  loading ? <Spinner /> : <Content />;
}
{
  error ? <Error /> : <Success />;
}
```

## Responsividade

### Breakpoints Utilizados

```scss
// Mobile
@media (max-width: 480px) {
}

// Tablet
@media (max-width: 768px) {
}

// Desktop
@media (min-width: 1024px) {
}
```

### Adaptações Mobile

- **Navegação**: Horizontal scrollable no mobile
- **Formulários**: Stack vertical, campos full-width
- **Modais**: Tela cheia em dispositivos pequenos
- **Botões**: Tamanhos maiores para touch

## Performance

### Otimizações Implementadas

1. **React.memo()**: Componentes que não precisam re-renderizar
2. **useCallback()**: Funções que são dependências de effects
3. **useMemo()**: Cálculos custosos memoizados
4. **Lazy Loading**: Componentes carregados sob demanda
5. **CSS Modules**: Estilos isolados e otimizados

### Métricas de Performance

- **Initial Load**: < 3s
- **Navigation**: < 500ms entre etapas
- **File Upload**: Progresso em tempo real
- **Auto-save**: A cada 2 minutos

## Testes

### Componentes Testáveis

Todos os componentes são desenvolvidos com testabilidade em mente:

- Props bem definidas
- Lógica separada em hooks
- Estados previsíveis
- Mocks fáceis de implementar

### Testes Recomendados

1. **Unit Tests**: Lógica de cada componente
2. **Integration Tests**: Fluxo entre componentes
3. **E2E Tests**: Jornada completa do usuário
4. **Visual Tests**: Screenshots automatizados

---

**Próximo**: [Services](./SERVICES.md) - Documentação dos serviços de integração
