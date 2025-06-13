# Setup e Configuração - HSE Supplier Register

Este documento fornece instruções completas para configuração, desenvolvimento e deployment do projeto HSE Supplier Register.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração SharePoint](#configuração-sharepoint)
- [Configuração de Desenvolvimento](#configuração-de-desenvolvimento)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Manutenção](#manutenção)

---

## Pré-requisitos

### Software Necessário

- **Node.js**: versão 16.x ou 18.x
- **npm**: versão 8.x ou superior
- **Git**: para controle de versão
- **Visual Studio Code**: recomendado (com extensões SPFx)

### Acesso SharePoint

- **Tenant SharePoint Online**: com permissões de administrador
- **Site Collection**: onde será implantado o web part
- **Document Library**: para armazenamento de anexos
- **Lists**: para dados do formulário

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-sharepoint.sharepoint-framework-snippets"
  ]
}
```

---

## Instalação

### 1. Clonar o Repositório

```powershell
git clone <repository-url>
cd hse-supplier-register
```

### 2. Instalar Dependências

```powershell
npm install
```

### 3. Instalar SharePoint Framework CLI

```powershell
npm install -g @microsoft/generator-sharepoint
npm install -g gulp-cli
```

### 4. Verificar Instalação

```powershell
# Verificar versões
node --version
npm --version
gulp --version

# Verificar SPFx
yo @microsoft/sharepoint --version
```

---

## Configuração SharePoint

### 1. Criar Site Collection

```powershell
# Via SharePoint Admin Center ou PowerShell
New-SPOSite -Url "https://tenant.sharepoint.com/sites/hse-supplier" -Title "HSE Supplier Register" -Template "STS#3"
```

### 2. Configurar Lists

#### Lista Principal: `hse-new-register`

```json
{
  "title": "HSE New Register",
  "description": "Lista para armazenar dados dos formulários HSE",
  "template": "genericList",
  "columns": [
    {
      "name": "Title",
      "type": "Text",
      "required": true,
      "description": "Nome da empresa"
    },
    {
      "name": "CNPJ",
      "type": "Text",
      "required": true,
      "indexed": true
    },
    {
      "name": "NumeroContrato",
      "type": "Text",
      "required": true
    },
    {
      "name": "StatusFormulario",
      "type": "Choice",
      "choices": ["Rascunho", "Enviado", "Em Análise", "Aprovado", "Rejeitado"],
      "default": "Rascunho"
    },
    {
      "name": "PercentualConclusao",
      "type": "Number",
      "default": 0
    },
    {
      "name": "DadosFormulario",
      "type": "Note",
      "description": "JSON com dados completos do formulário"
    },
    {
      "name": "EmailPreenchimento",
      "type": "Text",
      "indexed": true
    },
    {
      "name": "DataEnvio",
      "type": "DateTime"
    }
  ]
}
```

#### Document Library: `HSE Documents`

```json
{
  "title": "HSE Documents",
  "description": "Biblioteca para anexos dos formulários HSE",
  "template": "documentLibrary",
  "folders": [
    {
      "name": "FormAttachments",
      "description": "Anexos organizados por CNPJ/Empresa"
    }
  ],
  "columns": [
    {
      "name": "Category",
      "type": "Choice",
      "choices": ["rem", "iopp", "testeCarga", "sesmt", "outros"]
    },
    {
      "name": "Subcategory",
      "type": "Text"
    },
    {
      "name": "CNPJ",
      "type": "Text",
      "indexed": true
    },
    {
      "name": "NomeEmpresa",
      "type": "Text"
    },
    {
      "name": "FormularioId",
      "type": "Lookup",
      "lookupList": "hse-new-register"
    }
  ]
}
```

### 3. Configurar Permissões

```powershell
# Exemplo de configuração de permissões
# Grupo: HSE Suppliers - Contribute
# Grupo: HSE Managers - Full Control
# Grupo: HSE Reviewers - Read
```

---

## Configuração de Desenvolvimento

### 1. Arquivo `config/config.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json",
  "version": "2.0",
  "bundles": {
    "hse-new-supplier-web-part": {
      "components": [
        {
          "entrypoint": "./lib/webparts/hseNewSupplier/HseNewSupplierWebPart.js",
          "manifest": "./src/webparts/hseNewSupplier/HseNewSupplierWebPart.manifest.json"
        }
      ]
    }
  },
  "externals": {},
  "localizedResources": {
    "HseNewSupplierWebPartStrings": "lib/webparts/hseNewSupplier/loc/{locale}.js"
  }
}
```

### 2. Arquivo `config/serve.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/spfx-serve.schema.json",
  "port": 4321,
  "https": true,
  "initialPage": "https://localhost:5432/workbench",
  "api": {
    "port": 5432,
    "entryPath": "node_modules/@microsoft/sp-webpart-workbench/lib/api/"
  }
}
```

### 3. Arquivo `.env` (Opcional)

```env
# Configurações de desenvolvimento
SPFX_SERVE_PORT=4321
SPFX_API_PORT=5432

# SharePoint URLs para desenvolvimento
SHAREPOINT_SITE_URL=https://tenant.sharepoint.com/sites/hse-supplier
SHAREPOINT_LIST_NAME=hse-new-register
SHAREPOINT_DOCUMENT_LIBRARY=HSE Documents

# Configurações de debug
DEBUG_MODE=true
ENABLE_CONSOLE_LOGS=true
```

### 4. Configuração TypeScript (`tsconfig.json`)

```json
{
  "extends": "./node_modules/@microsoft/sp-build-web/lib/tsconfig.json",
  "compilerOptions": {
    "target": "es2015",
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react",
    "declaration": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "inlineSources": false,
    "strictNullChecks": false,
    "noUnusedLocals": false,
    "typeRoots": ["./node_modules/@types", "./node_modules/@microsoft"],
    "types": ["webpack-env"],
    "lib": ["es6", "dom", "es2017.promise"]
  },
  "include": ["src/**/*"]
}
```

---

## Estrutura do Projeto

### Organização de Pastas

```
src/
├── webparts/
│   └── hseNewSupplier/
│       ├── HseNewSupplierWebPart.ts          # Web Part principal
│       ├── components/                        # Componentes React
│       │   ├── HseNewSupplier.tsx            # Componente raiz
│       │   ├── screens/                      # Telas da aplicação
│       │   ├── formBlocks/                   # Blocos do formulário
│       │   ├── common/                       # Componentes comuns
│       │   └── context/                      # Context e estado
│       ├── services/                         # Serviços SharePoint
│       ├── types/                           # Definições TypeScript
│       ├── utils/                           # Utilitários
│       ├── hooks/                           # Custom hooks
│       ├── styles/                          # Estilos SCSS
│       └── assets/                          # Recursos estáticos
```

### Padrões de Nomenclatura

- **Componentes**: PascalCase (`DadosGerais.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useFormValidation.ts`)
- **Utilitários**: camelCase (`validators.ts`)
- **Tipos**: PascalCase com prefixo `I` (`IHSEFormData.ts`)
- **Estilos**: kebab-case com `.module.scss` (`dados-gerais.module.scss`)

---

## Scripts Disponíveis

### Desenvolvimento

```powershell
# Iniciar servidor de desenvolvimento
npm run serve

# Build para desenvolvimento
npm run build

# Limpar build
npm run clean
```

### Testes

```powershell
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

### Build e Package

```powershell
# Build para produção
npm run build --ship

# Criar package para deployment
gulp bundle --ship
gulp package-solution --ship
```

### Linting e Formatação

```powershell
# Executar ESLint
npm run lint

# Corrigir problemas de linting
npm run lint:fix

# Formatar código com Prettier
npm run format
```

---

## Deployment

### 1. Build de Produção

```powershell
# Limpar builds anteriores
npm run clean

# Build otimizado
npm run build --ship

# Criar bundle
gulp bundle --ship

# Criar package
gulp package-solution --ship
```

### 2. Upload para SharePoint

#### Via SharePoint Admin Center

1. Acessar **SharePoint Admin Center**
2. Ir para **More features** > **Apps**
3. Clicar em **App Catalog**
4. Upload do arquivo `.sppkg` da pasta `sharepoint/solution/`

#### Via PnP PowerShell

```powershell
# Conectar ao tenant
Connect-PnPOnline -Url "https://tenant-admin.sharepoint.com" -Interactive

# Upload da solução
Add-PnPApp -Path "./sharepoint/solution/hse-supplier-register.sppkg"

# Instalar no site específico
Install-PnPApp -Identity "hse-supplier-register"
```

### 3. Configurar Web Part na Página

```powershell
# Via PnP PowerShell
$page = Add-PnPPage -Name "HSE-Supplier-Register" -Title "HSE Supplier Register"
Add-PnPPageWebPart -Page $page -DefaultWebPartType "hse-new-supplier"
```

### 4. Configurações Pós-Deploy

- Verificar permissões das listas
- Testar upload de arquivos
- Validar integração com Document Library
- Configurar notificações por email (se aplicável)

---

## Configuração de Ambientes

### Desenvolvimento Local

```json
{
  "environmentType": "Local",
  "sharePointSiteUrl": "https://localhost:4321",
  "debugMode": true,
  "logLevel": "verbose"
}
```

### Homologação

```json
{
  "environmentType": "Test",
  "sharePointSiteUrl": "https://tenant.sharepoint.com/sites/hse-test",
  "debugMode": true,
  "logLevel": "info"
}
```

### Produção

```json
{
  "environmentType": "Production",
  "sharePointSiteUrl": "https://tenant.sharepoint.com/sites/hse-supplier",
  "debugMode": false,
  "logLevel": "error"
}
```

---

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Certificado SSL

```powershell
# Solução: Instalar certificado de desenvolvimento
gulp trust-dev-cert
```

#### 2. Erro de Permissões SharePoint

```json
// Verificar em package-solution.json
"webApiPermissionRequests": [
  {
    "resource": "Microsoft Graph",
    "scope": "User.Read"
  }
]
```

#### 3. Problemas de CORS

```typescript
// Adicionar em HseNewSupplierWebPart.ts
public async onInit(): Promise<void> {
  this.context.serviceScope.whenFinished(() => {
    // Configurações de CORS se necessário
  });
  return super.onInit();
}
```

#### 4. Erro de Build TypeScript

```powershell
# Limpar cache do TypeScript
npm run clean
rm -rf node_modules
npm install
```

### Logs de Debug

```typescript
// Habilitar logs detalhados
export const DEBUG_CONFIG = {
  enableConsoleLogging: true,
  enableSharePointLogging: true,
  enablePerformanceMetrics: true,
  logLevel: "verbose" as "verbose" | "info" | "warn" | "error",
};
```

---

## Monitoramento e Manutenção

### Métricas de Performance

```typescript
// Implementar métricas customizadas
const performanceMetrics = {
  formLoadTime: 0,
  saveOperationTime: 0,
  validationTime: 0,
  fileUploadTime: 0,
};

// Log de métricas
console.log("Performance Metrics:", performanceMetrics);
```

### Health Checks

```typescript
// Verificações de saúde da aplicação
export const healthChecks = {
  sharePointConnection: () => /* verificar conexão */,
  listAccess: () => /* verificar acesso às listas */,
  documentLibraryAccess: () => /* verificar biblioteca */,
  userPermissions: () => /* verificar permissões */
};
```

### Backup e Recuperação

```powershell
# Script de backup das listas SharePoint
Export-PnPList -Identity "hse-new-register" -Out "./backups/hse-register-backup.xml"

# Backup da Document Library
Export-PnPDocumentLibrary -Identity "HSE Documents" -Out "./backups/documents-backup"
```

---

## Segurança

### Configurações de Segurança

```typescript
// Configurações de segurança no web part
export const securityConfig = {
  enableCSRFProtection: true,
  validateFileTypes: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileExtensions: [".pdf", ".docx", ".xlsx", ".jpg", ".png"],
  enableAuditLogging: true,
};
```

### Auditoria

```typescript
// Log de auditoria
const auditLog = {
  userId: context.pageContext.user.email,
  action: "FORM_SUBMIT",
  timestamp: new Date().toISOString(),
  formId: formData.id,
  ipAddress: "...", // se disponível
};
```

---

## Atualizações e Versionamento

### Estratégia de Versionamento

- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **MAJOR**: Mudanças quebradoras
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Processo de Atualização

1. **Desenvolvimento**: Implementar mudanças
2. **Testes**: Validar em ambiente de teste
3. **Build**: Gerar nova versão
4. **Deploy**: Atualizar em produção
5. **Verificação**: Validar funcionamento

### Script de Atualização

```powershell
# Script para atualização automatizada
function Update-HSESupplierRegister {
    param(
        [string]$Version,
        [string]$Environment = "production"
    )

    Write-Host "Atualizando HSE Supplier Register para versão $Version"

    # Build
    npm run build --ship
    gulp bundle --ship
    gulp package-solution --ship

    # Deploy
    if ($Environment -eq "production") {
        # Deploy para produção
        Update-PnPApp -Identity "hse-supplier-register" -Path "./sharepoint/solution/hse-supplier-register.sppkg"
    }

    Write-Host "Atualização concluída"
}
```

---

## Próximos Passos

1. **Configurar CI/CD**: Implementar pipeline automatizado
2. **Monitoring**: Configurar monitoramento de aplicação
3. **Performance**: Otimizar performance e loading
4. **Testes**: Expandir cobertura de testes
5. **Documentação**: Manter documentação atualizada

Para mais detalhes sobre implementações específicas, consulte:

- [Componentes](./COMPONENTS.md)
- [Serviços](./SERVICES.md)
- [Tipos](./TYPES.md)
- [Contexto](./CONTEXT.md)
