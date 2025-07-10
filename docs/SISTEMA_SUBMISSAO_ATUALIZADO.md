# Sistema de Submissão de Formulários - Atualização vs Criação

## 📋 **Visão Geral das Mudanças**

A partir desta atualização, o sistema HSE foi modificado para **atualizar formulários existentes** ao invés de criar novos itens quando o usuário submete o formulário final.

## 🔄 **Fluxo Anterior vs Novo Fluxo**

### **❌ Fluxo Anterior (Descontinuado)**

1. Usuário cria rascunho → Status "Em Andamento" → **Novo item no SharePoint**
2. Usuário edita rascunho → Status "Em Andamento" → **Atualiza item existente**
3. Usuário submete → Status "Enviado" → **🚨 Criava NOVO item no SharePoint**

**Problema**: Dois itens na lista para o mesmo formulário.

### **✅ Novo Fluxo (Implementado)**

1. Usuário cria rascunho → Status "Em Andamento" → **Novo item no SharePoint**
2. Usuário edita rascunho → Status "Em Andamento" → **Atualiza item existente**
3. Usuário submete → Status "Enviado" → **✅ Atualiza item existente**

**Resultado**: Sempre um único item por formulário na lista.

## 🛠️ **Mudanças Técnicas Implementadas**

### **1. Novo Método `submitFormWithUpdate()`**

```typescript
public async submitFormWithUpdate(
  itemId: number,
  formData: IHSEFormData,
  attachments: { [category: string]: IAttachmentMetadata[] }
): Promise<void>
```

**Funcionalidade**:

- Atualiza item existente com status "Enviado"
- **PRESERVA TODO o histórico de revisões existente**
- **APENAS adiciona nova entrada no `historicoStatusChange`**
- **NÃO cria nova revisão** (revisões são só para mudanças nos campos)
- **Rastreia mudanças de status com data/hora**

### **2. Histórico de Mudanças de Status**

Agora cada formulário possui um rastreamento detalhado de mudanças de status:

```json
{
  "metadata": {
    "historicoStatusChange": {
      "Em Andamento": {
        "dataAlteracao": "2025-07-10T14:30:00.000Z",
        "usuario": "João Silva",
        "email": "joao@empresa.com"
      },
      "Enviado": {
        "dataAlteracao": "2025-07-10T16:45:00.000Z",
        "usuario": "João Silva",
        "email": "joao@empresa.com"
      }
    }
  }
}
```

### **3. ✅ CORREÇÃO CRÍTICA: Preservação de Histórico**

**Problema identificado e corrigido**:

- ❌ **Antes**: Mudança de status apagava todo histórico de revisões
- ✅ **Agora**: Mudança de status **preserva 100%** do histórico existente

**Lógica corrigida**:

```typescript
// ✅ CORRETO: Preservar histórico existente
historicoRevisoesExistente = currentData.metadata?.historicoRevisoes || [];

// ✅ CORRETO: Só adicionar no historicoStatusChange
historicoStatusChange.Enviado = {
  dataAlteracao: now.toISOString(),
  usuario: "João Silva",
  email: "joao@empresa.com"
};

// ✅ CORRETO: Manter revisões existentes
metadata: {
  historicoRevisoes: historicoRevisoesExistente, // PRESERVADO
  historicoStatusChange: historicoStatusChange   // ATUALIZADO
}
```

### **4. Lógica de Criação de Revisões**

**Regra implementada**:

- 🔄 **Nova revisão**: Só quando há mudanças reais nos campos do formulário
- 📊 **Mudança de status**: Só atualiza `historicoStatusChange`, sem criar revisão
- 📝 **Resultado**: Histórico limpo e preciso

### **5. Lógica de Submissão Inteligente**

O sistema agora verifica se o formulário já possui um ID:

```typescript
if (state.formData.id) {
  // Atualizar formulário existente
  await sharePointService.submitFormWithUpdate(
    state.formData.id,
    formData,
    attachments
  );
} else {
  // Criar novo formulário (casos raros)
  await sharePointService.submitFormData(formData, attachments);
}
```

### **6. Controle de Edição por Status**

O botão "Editar" na `InitialScreen` agora é condicional:

```typescript
{
  form.status !== "Enviado" && (
    <DefaultButton
      text="Editar"
      iconProps={{ iconName: "Edit" }}
      onClick={() => handleEditUserForm(form)}
    />
  );
}
```

**Resultado**: Formulários com status "Enviado" não podem mais ser editados pelo usuário.

## 📊 **Benefícios da Mudança**

### **✅ Para Usuários**

- **Interface mais limpa**: Apenas um formulário por CNPJ em "Meus Formulários"
- **Fluxo lógico**: Rascunho → Edição → Submissão (sem duplicação)
- **Controle de acesso**: Formulários enviados ficam protegidos contra edição acidental

### **✅ Para Time HSE**

- **Lista organizada**: Cada empresa aparece apenas uma vez
- **Histórico completo**: Rastreamento de quando cada status foi alterado
- **Dados consistentes**: Não há mais formulários duplicados para avaliar

### **✅ Para Sistema**

- **Performance**: Menos itens na lista SharePoint
- **Integridade**: Dados únicos por CNPJ
- **Auditoria**: Histórico detalhado de todas as mudanças

## 🔧 **Compatibilidade**

- **✅ Formulários existentes**: Continuam funcionando normalmente
- **✅ Revisões antigas**: Histórico preservado
- **✅ Anexos**: Sistema de arquivos mantido
- **✅ Validações**: Todas as regras de negócio preservadas

## 🔧 **CORREÇÕES IMPLEMENTADAS**

### **Problema Identificado**

- O método `submitFormWithUpdate()` estava **apagando todo o histórico de revisões**
- Mudanças de status criavam **novas revisões desnecessárias**
- Histórico de `historicoRevisoes` era **sobrescrito** ao invés de preservado

### **Soluções Aplicadas**

#### **✅ 1. Preservação Total do Histórico**

```typescript
// Carregar TUDO que já existia
historicoRevisoesExistente = currentData.metadata?.historicoRevisoes || [];
metadataExistente = currentData.metadata || {};

// Preservar TUDO no novo JSON
metadata: {
  ...metadataExistente,                          // Preserva tudo
  historicoRevisoes: historicoRevisoesExistente, // Mantém revisões
  historicoStatusChange: historicoStatusChange   // Só atualiza status
}
```

#### **✅ 2. Separação Clara de Responsabilidades**

- **`historicoRevisoes`**: Só para mudanças reais nos campos/valores
- **`historicoStatusChange`**: Só para mudanças de status
- **Submissão**: Não cria revisão, só altera status

#### **✅ 3. Lógica Inteligente de Revisões**

```typescript
// Só cria nova revisão se houver mudanças de conteúdo
if (allChanges.length > 0) {
  // Criar nova revisão
} else {
  // Não criar revisão, só manter existente
}
```

### **Resultado Final**

- ✅ **Histórico preservado**: Todas as revisões anteriores mantidas
- ✅ **Status rastreado**: Data/hora de mudança de status
- ✅ **Sem revisões desnecessárias**: Só cria quando há mudanças reais
- ✅ **Interface consistente**: Botão "Editar" oculto para formulários enviados

---

**Data da Implementação**: 10 de Julho de 2025  
**Status**: ✅ Implementado e Testado  
**Impacto**: 🟢 Baixo (Melhoria de UX e integridade de dados)
