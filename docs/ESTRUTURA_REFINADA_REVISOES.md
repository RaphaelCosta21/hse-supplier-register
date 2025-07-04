# Estrutura Refinada do Sistema de Revisões HSE

## Estrutura do Metadata Atualizada

### 1. Interface IRevisionEntry (Atualizada)

```typescript
export interface IRevisionEntry {
  numeroRevisao: number; // Ex: 1, 2, 3...
  data: string; // ISO string da data
  usuario: string; // Nome do usuário
  email: string; // Email do usuário
  tipoOperacao: string; // "Rascunho Criado", "Rascunho Atualizado", "Formulário Enviado"
  alteracoes: IFormFieldChange[]; // Array de mudanças específicas
  totalAlteracoes: number; // Quantidade total de mudanças
  resumo: string; // Descrição resumida da operação
}
```

### 2. Estrutura JSON Completa (Exemplo)

```json
{
  "dadosGerais": { ... },
  "conformidadeLegal": { ... },
  "servicosEspeciais": { ... },
  "anexos": { ... },
  "metadata": {
    "dataSalvamento": "2025-01-03T12:30:00.000Z",
    "usuario": "João Silva",
    "email": "joao.silva@empresa.com",
    "temAnexos": true,
    "totalAnexos": 5,
    "numeroRevisao": 3,
    "historicoRevisoes": [
      {
        "numeroRevisao": 1,
        "data": "2025-01-03T10:15:00.000Z",
        "usuario": "João Silva",
        "email": "joao.silva@empresa.com",
        "tipoOperacao": "Rascunho Criado",
        "alteracoes": [
          {
            "campo": "Formulário",
            "tipo": "adicionado",
            "valorAnterior": null,
            "valorNovo": "Formulário criado"
          }
        ],
        "totalAlteracoes": 1,
        "resumo": "Rascunho inicial criado"
      },
      {
        "numeroRevisao": 2,
        "data": "2025-01-03T11:20:00.000Z",
        "usuario": "João Silva",
        "email": "joao.silva@empresa.com",
        "tipoOperacao": "Rascunho Atualizado",
        "alteracoes": [
          {
            "campo": "dadosGerais.empresa",
            "tipo": "alterado",
            "valorAnterior": "Empresa ABC",
            "valorNovo": "Empresa ABC Ltda"
          },
          {
            "campo": "Anexo - Certificados",
            "tipo": "adicionado",
            "valorAnterior": null,
            "valorNovo": "certificado-qualidade.pdf (application/pdf)"
          }
        ],
        "totalAlteracoes": 2,
        "resumo": "Rascunho atualizado (Rev. 2) - 2 mudança(s)"
      },
      {
        "numeroRevisao": 3,
        "data": "2025-01-03T12:30:00.000Z",
        "usuario": "João Silva",
        "email": "joao.silva@empresa.com",
        "tipoOperacao": "Rascunho Atualizado",
        "alteracoes": [
          {
            "campo": "conformidadeLegal.nr06",
            "tipo": "alterado",
            "valorAnterior": false,
            "valorNovo": true
          }
        ],
        "totalAlteracoes": 1,
        "resumo": "Rascunho atualizado (Rev. 3) - 1 mudança(s)"
      }
    ]
  }
}
```

### 3. Tipos de Operação

- **"Rascunho Criado"**: Primeira criação do formulário (Rev. 1)
- **"Rascunho Atualizado"**: Salvamento com mudanças detectadas (Rev. 2, 3, ...)
- **"Formulário Enviado"**: Envio final para análise

### 4. Interface na Página "Meus Formulários"

Na página inicial, o sistema deve exibir:

- **Número de Revisões**: Extraído de `metadata.numeroRevisao` ou `metadata.historicoRevisoes.length`
- **Data de Modificação**: Extraído de `metadata.historicoRevisoes[última].data`
- **Formatação**: `DD/MM/AAAA HH:mm:ss`

### 5. Implementação Atual Corrigida

```typescript
// No SharePointService.getUserForms()
if (
  metadata &&
  metadata.historicoRevisoes &&
  Array.isArray(metadata.historicoRevisoes)
) {
  numeroRevisoes = metadata.historicoRevisoes.length;

  if (numeroRevisoes > 0) {
    const ultimaRevisao = metadata.historicoRevisoes[numeroRevisoes - 1];
    if (ultimaRevisao && ultimaRevisao.data) {
      dataModificacaoCompleta = ultimaRevisao.data;
    }
  }
}
```

### 6. Logs de Debugging

O sistema deve exibir logs claros durante operações:

```
=== INICIANDO ATUALIZAÇÃO COM RASTREAMENTO DE MUDANÇAS ===
Item ID: 123
=== RESUMO FINAL DE MUDANÇAS ===
Mudanças no formulário: 2
Mudanças nos anexos: 1
Total de mudanças: 3
Nova revisão criada: {
  numeroRevisao: 4,
  tipoOperacao: "Rascunho Atualizado",
  totalAlteracoes: 3,
  ...
}
=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===
Histórico de revisões: 4
```

## Benefícios da Nova Estrutura

1. **Clareza**: Campos com nomes mais descritivos (`numeroRevisao` vs `versao`)
2. **Consistência**: Alinhamento com padrões de nomenclatura
3. **Rastreabilidade**: Histórico completo de mudanças com contexto
4. **Debugging**: Logs mais informativos e estruturados
5. **Interface**: Dados prontos para exibição na UI
