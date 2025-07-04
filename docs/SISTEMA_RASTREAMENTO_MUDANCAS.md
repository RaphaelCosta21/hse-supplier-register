# Sistema de Rastreamento de Mudanças HSE - Implementação Completa

## 🎯 Objetivo

Implementar um sistema preciso de rastreamento de revisões que registra apenas mudanças reais feitas pelo usuário no formulário HSE e anexos.

## 📋 Funcionalidades Implementadas

### 1. **Interface de Mudanças** (`IApplicationPhase.ts`)

```typescript
export interface IFormFieldChange {
  campo: string;
  tipo: "adicionado" | "alterado" | "removido";
  valorAnterior?: string | number | boolean | Date | undefined;
  valorNovo?: string | number | boolean | Date | undefined;
}

export interface IRevisionEntry {
  versao: number;
  dataRevisao: string;
  usuario: string;
  email: string;
  mudanças: IFormFieldChange[];
  totalMudancas: number;
  resumo: string;
}
```

### 2. **Método Principal: `detectChanges()`**

Detecta mudanças entre versões do formulário com foco em:

#### ✅ **Dados Gerais** - Todos os campos importantes

- empresa, cnpj, numeroContrato, responsavelTecnico, grauRisco
- escopoServico, atividadePrincipalCNAE, totalEmpregados, etc.

#### ✅ **Conformidade Legal** - Detecção inteligente via JSON

- Usa comparação JSON para detectar mudanças reais
- Registra novas seções adicionadas
- Ignora mudanças estruturais automáticas

#### ✅ **Serviços Especiais** - Rastreamento completo

- fornecedorEmbarcacoes / fornecedorIcamento
- Mudanças em dados de embarcações
- Mudanças em dados de içamento

### 3. **Método de Anexos: `detectAttachmentChanges()`**

Rastreia mudanças em anexos:

- ➕ **Arquivos Adicionados**: Novo arquivo anexado
- ➖ **Arquivos Removidos**: Arquivo excluído
- 🔄 **Arquivos Alterados**: Mesmo nome, tipo/tamanho diferente

### 4. **Integração com SharePoint**

#### **Método Principal: `updateFormWithChanges()`**

```typescript
public async updateFormWithChanges(
  itemId: number,
  newFormData: IHSEFormData,
  newAttachments: { [category: string]: IAttachmentMetadata[] }
): Promise<void>
```

**Fluxo completo:**

1. Carrega dados atuais do formulário
2. Detecta mudanças nos campos do formulário
3. Detecta mudanças nos anexos
4. Combina todas as mudanças
5. Cria nova entrada de revisão (se houver mudanças)
6. Atualiza histórico no JSON
7. Salva no SharePoint

#### **Integração nos Métodos Existentes**

- `saveFormData()` - Adiciona entrada "salvo"
- `submitFormData()` - Adiciona entrada "enviado"

## 🔧 Estrutura do JSON de Revisão

### **Metadata Completa**

```json
{
  "dadosGerais": { ... },
  "conformidadeLegal": { ... },
  "servicosEspeciais": { ... },
  "anexos": { ... },
  "metadata": {
    "dataSalvamento": "2025-07-03T10:30:00.000Z",
    "usuario": "João Silva",
    "email": "joao.silva@empresa.com",
    "temAnexos": true,
    "totalAnexos": 5,
    "historicoRevisoes": [
      {
        "versao": 1,
        "dataRevisao": "2025-07-03T10:30:00.000Z",
        "usuario": "João Silva",
        "email": "joao.silva@empresa.com",
        "mudanças": [
          {
            "campo": "Dados Gerais - empresa",
            "tipo": "adicionado",
            "valorAnterior": undefined,
            "valorNovo": "Empresa ABC Ltda"
          },
          {
            "campo": "Anexo - conformidade",
            "tipo": "adicionado",
            "valorAnterior": undefined,
            "valorNovo": "certificado_sesmt.pdf (application/pdf)"
          }
        ],
        "totalMudancas": 2,
        "resumo": "2 mudança(s) detectada(s)"
      }
    ],
    "ultimaRevisao": 1
  }
}
```

## 🎯 Prioridades de Detecção (Como Solicitado)

### **1️⃣ PRIORIDADE MÁXIMA - Questões de NRs**

- ✅ Detecta via comparação JSON de conformidadeLegal
- ✅ Registra mudanças em seções específicas de NRs

### **2️⃣ PRIORIDADE ALTA - NRs Opcionais**

- ✅ Sistema detecta mudanças em servicosEspeciais (que incluem seleções opcionais)
- ✅ Rastreia fornecedorEmbarcacoes / fornecedorIcamento

### **3️⃣ PRIORIDADE MÉDIA - Outras Conformidades**

- ✅ Incluído na detecção de conformidadeLegal
- ✅ Detecta via diferenças JSON

### **❌ O que é IGNORADO:**

- ✅ Mudanças undefined → ""
- ✅ Mudanças null → ""
- ✅ Estruturas automáticas sem conteúdo real

## 🚀 Como Usar

### **Para Atualizações com Rastreamento:**

```typescript
await sharepointService.updateFormWithChanges(
  itemId,
  novoFormData,
  novosAnexos
);
```

### **Para Salvamentos/Envios Normais:**

- `saveFormData()` e `submitFormData()` já incluem rastreamento automático

## 📊 Logs e Debugging

O sistema inclui logging detalhado:

```
=== MUDANÇAS DETECTADAS ===
Total de mudanças: 3
ADICIONADO: Dados Gerais - empresa
ALTERADO: Conformidade Legal
ADICIONADO: Anexo - conformidade
```

## ✅ Status de Implementação

- ✅ Interface de tipos criada
- ✅ Detectores de mudança implementados
- ✅ Integração com SharePoint completa
- ✅ Sistema de histórico de revisões
- ✅ Logging e debugging
- ✅ Tratamento de erros
- ✅ Compatibilidade com estrutura existente

## 🎉 Resultado Final

O sistema agora registra **APENAS mudanças reais do usuário**, ignorando estruturas automáticas e criando um histórico preciso e limpo de todas as revisões do formulário HSE, incluindo anexos!
