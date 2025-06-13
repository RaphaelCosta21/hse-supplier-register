# HSE Supplier Register - Documentação Completa

## Visão Geral

O **HSE Supplier Register** é uma solução SharePoint Framework (SPFx) desenvolvida para gerenciar o cadastro de fornecedores HSE (Health, Safety & Environment). A aplicação oferece um formulário multi-etapas com validação robusta, upload de arquivos e integração completa com SharePoint.

## Arquitetura do Projeto

O projeto segue uma arquitetura modular baseada em React com TypeScript, utilizando Context API para gerenciamento de estado global e hooks customizados para lógica reutilizável.

### Estrutura Principal

```
src/webparts/hseNewSupplier/
├── components/          # Componentes React
├── context/            # Context API e Reducers
├── hooks/              # Custom Hooks
├── services/           # Serviços de integração
├── types/              # Definições TypeScript
├── utils/              # Utilitários e helpers
├── styles/             # Estilos SCSS globais
└── schemas/            # Esquemas de validação
```

## Funcionalidades Principais

### 1. **Formulário Multi-Etapas**

- **Verificação CNPJ**: Validação e consulta de dados empresariais
- **Dados Gerais**: Informações básicas da empresa
- **Conformidade Legal**: Documentação legal e certificações
- **Serviços Especiais**: Especificações técnicas detalhadas
- **Revisão Final**: Validação e submissão

### 2. **Upload de Arquivos**

- Integração nativa com SharePoint Document Library
- Validação de tipos e tamanhos de arquivo
- Preview e gestão de anexos
- Metadados automáticos

### 3. **Validação Robusta**

- Validação em tempo real
- Esquemas de validação customizados
- Feedback visual imediato
- Validação de CNPJ integrada

### 4. **Gestão de Estado**

- Context API para estado global
- Persistência local automática
- Sincronização com SharePoint
- Recovery de dados em caso de falha

## Tecnologias Utilizadas

- **SharePoint Framework (SPFx)** 1.18+
- **React** 17+ com TypeScript
- **Fluent UI React** (componentes Microsoft)
- **SCSS Modules** para estilização
- **Context API** para gerenciamento de estado
- **Custom Hooks** para lógica reutilizável

## Estrutura de Navegação

O projeto implementa uma navegação inteligente com:

- Indicadores visuais de progresso
- Estados disabled/enabled baseados em validação
- Persistência de posição atual
- Navegação via breadcrumbs

## Integração SharePoint

### Listas SharePoint

- **Suppliers**: Dados principais dos fornecedores
- **Attachments**: Metadados de arquivos anexados
- **Application Phases**: Controle de fases do processo

### Serviços

- **SharePointService**: CRUD operations
- **SharePointFileService**: Gestão de arquivos
- **EmailService**: Notificações automáticas

## Como Navegar na Documentação

Esta documentação está organizada em seções específicas:

1. **[Components](./COMPONENTS.md)** - Documentação detalhada de todos os componentes
2. **[Services](./SERVICES.md)** - Serviços de integração e APIs
3. **[Hooks](./HOOKS.md)** - Custom hooks e sua utilização
4. **[Types](./TYPES.md)** - Definições TypeScript e interfaces
5. **[Utils](./UTILS.md)** - Utilitários e funções auxiliares
6. **[Styles](./STYLES.md)** - Sistema de design e estilos
7. **[Context](./CONTEXT.md)** - Gerenciamento de estado global
8. **[Setup](./SETUP.md)** - Configuração e deployment

## Padrões de Desenvolvimento

### Naming Conventions

- **Components**: PascalCase (ex: `FloatingSaveButton`)
- **Files**: PascalCase para componentes, camelCase para utils
- **CSS Classes**: camelCase com BEM quando aplicável
- **Types/Interfaces**: PascalCase com prefixo `I` para interfaces

### Estrutura de Componentes

```typescript
// Estrutura padrão de um componente
interface IComponentProps {
  // props definition
}

const Component: React.FC<IComponentProps> = ({ prop1, prop2 }) => {
  // hooks
  // state
  // effects
  // handlers

  return <div className={styles.container}>{/* JSX */}</div>;
};

export default Component;
```

### Padrões de Estilo

- **SCSS Modules** para isolamento de estilos
- **CSS Variables** para temas consistentes
- **Responsive Design** com breakpoints padrão
- **Micro-interactions** para melhor UX

## Próximos Passos

Para desenvolvedores que assumirão o projeto:

1. **Leia a documentação completa** em ordem sequencial
2. **Configure o ambiente** seguindo o [Setup Guide](./SETUP.md)
3. **Explore os componentes** começando pelos mais simples
4. **Entenda o fluxo de dados** através do Context e Services
5. **Teste localmente** antes de fazer alterações

## Contato e Suporte

Para dúvidas sobre implementação ou arquitetura, consulte:

- Documentação detalhada nas seções específicas
- Comentários inline no código
- Testes unitários como exemplos de uso

---

**Última atualização**: Janeiro 2025
**Versão do SPFx**: 1.18+
**Versão do Node**: 16+
