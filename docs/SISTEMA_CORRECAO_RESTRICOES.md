# Sistema de Correção de Restrições - HSE Supplier Register

## Visão Geral

Este documento explica como funciona o novo sistema de correção de restrições para formulários aprovados com restrições no sistema HSE.

## Como Funciona

### 1. Fluxo do Usuario

1. **Formulário Enviado**: Usuario submete o formulário
2. **Análise HSE**: Equipe HSE avalia o formulário
3. **Aprovação com Restrições**: Formulário é aprovado mas com restrições específicas
4. **Correção**: Usuario vê botão "Corrigir Restrições" e pode editar apenas os campos apontados
5. **Reenvio**: Após correções, formulário volta para análise

### 2. Estrutura de Dados das Restrições

```json
{
  "metadata": {
    "Avaliacao": {
      "0": {
        "HSEResponsavel": "Rael Michels",
        "StatusAvaliacao": "Aprovado",
        "Restricao": "Sim",
        "CamposRestricao": [
          {
            "id": 1,
            "secao": "conformidadeLegal",
            "campo": "nr06",
            "nomeExibicao": "NR 06 - EPI",
            "motivo": "Inserir Anexos corretamente"
          },
          {
            "id": 2,
            "secao": "dadosGerais",
            "campo": "rem",
            "nomeExibicao": "Resumo Estatístico Mensal de Acidentes",
            "motivo": "Atualizar anexo"
          }
        ]
      }
    }
  }
}
```

### 3. Lógica de Botões na InitialScreen

```tsx
// Função utilitária para buscar a avaliação mais recente
const getLatestEvaluation = (form: IUserFormSummary): { key: string; data: IFormAvaliacao } | null => {
  const avaliacoes = form.metadata?.Avaliacao;
  if (!avaliacoes) return null;

  const avaliacaoKeys = Object.keys(avaliacoes);
  if (avaliacaoKeys.length === 0) return null;

  // Ordenar as chaves numericamente e pegar a maior (mais recente)
  const ultimaAvaliacaoKey = avaliacaoKeys
    .map(key => parseInt(key))
    .sort((a, b) => b - a)[0]
    .toString();

  return {
    key: ultimaAvaliacaoKey,
    data: avaliacoes[ultimaAvaliacaoKey]
  };
};

// Verificar se formulário tem restrições (usando avaliação mais recente)
const hasRestrictions = (form: IUserFormSummary): boolean => {
  if (form.status !== "Aprovado") return false;

  const latestEvaluation = getLatestEvaluation(form);
  if (!latestEvaluation) return false;

  const ultimaAvaliacao = latestEvaluation.data;
  return ultimaAvaliacao?.Restricao === "Sim" && Boolean(ultimaAvaliacao.CamposRestricao?.length);
};

// Lógica dos botões
{hasRestrictions(form) ? (
  // Botão "Corrigir Restrições" para formulários aprovados com restrições
  <DefaultButton
    text="Corrigir Restrições"
    iconProps={{ iconName: "EditNote" }}
    onClick={() => handleCorrectRestrictions(form)}
  />
) : form.status === "Aprovado" ? (
  // Botão "Download PDF" para formulários aprovados sem restrições
  <DefaultButton
    text="Download PDF"
    iconProps={{ iconName: "Download" }}
    onClick={() => handleDownloadFormPDF(form)}
  />
) : (
  // Outros botões para outros status...
)}
```

### 4. Modo de Correção no Contexto

O formulário entra em "modo de correção" quando carregado via botão "Corrigir Restrições":

```tsx
// Estado do formulário inclui:
interface IFormState {
  // ... outros campos
  correctionMode: boolean;
  restrictedFields: string[];
}

// Função para verificar se campo pode ser editado
canEditField: (fieldPath: string): boolean => {
  // Se não estiver no modo de correção, todos os campos podem ser editados
  if (!state.correctionMode) return true;

  // No modo de correção, apenas campos com restrições podem ser editados
  return state.restrictedFields.some(
    (restrictedPath) =>
      restrictedPath === fieldPath ||
      fieldPath.startsWith(restrictedPath + ".") ||
      restrictedPath.includes(fieldPath)
  );
};
```

### 5. Implementação nos Componentes de Formulário

Para aplicar a restrição de edição nos campos, modifique os componentes assim:

```tsx
// Exemplo no DadosGerais.tsx
import { useHSEForm } from "../../context/HSEFormContext";

const DadosGerais: React.FC<IDadosGeraisProps> = ({
  value,
  onChange,
  errors,
}) => {
  const { actions } = useHSEForm();

  return (
    <TextField
      label="Nome da Empresa"
      value={value.empresa || ""}
      onChange={(_, v) => handleFieldChange("empresa", v)}
      required
      disabled={
        !!state.formData?.id || // Já existia: desabilita se formulário foi criado
        !actions.canEditField("dadosGerais.empresa") // NOVO: verifica se pode editar
      }
      // Destacar campos restritos com estilo diferente
      styles={{
        fieldGroup: {
          borderColor:
            !actions.canEditField("dadosGerais.empresa") && state.correctionMode
              ? "#ca5010" // Laranja para campos restritos
              : undefined,
        },
      }}
    />
  );
};
```

### 6. Mapeamento de Campos

Os campos são identificados usando paths hierárquicos:

- `dadosGerais.empresa` → Campo "empresa" na seção "Dados Gerais"
- `conformidadeLegal.nr06` → NR 06 na seção "Conformidade Legal"
- `servicosEspeciais.fornecedorEmbarcacoes` → Campo na seção "Serviços Especiais"

### 7. Fluxo Técnico Completo

1. **Clique em "Corrigir Restrições"**:

   - Armazena restrições no sessionStorage
   - Chama `loadExistingForm()`

2. **Carregamento do Formulário**:

   - Detecta modo de correção via sessionStorage
   - Converte restrições para paths de campos
   - Ativa modo de correção no estado

3. **Renderização**:

   - Campos restritos ficam habilitados
   - Campos não restritos ficam desabilitados
   - Estilo visual diferenciado

4. **Submissão**:
   - Formulário é reenviado para análise
   - Modo de correção é desativado

## Próximos Passos

Para finalizar a implementação:

1. **Aplicar `canEditField()` em todos os componentes de formulário**
2. **Adicionar estilos visuais** para destacar campos restritos
3. **Implementar validação** específica para campos corrigidos
4. **Adicionar mensagens explicativas** sobre o modo de correção
5. **Testar** o fluxo completo com dados reais

## Tipos TypeScript Adicionados

```typescript
// IApplicationPhase.ts
export interface ICampoRestricao {
  id: number;
  secao: string;
  campo: string;
  nomeExibicao: string;
  motivo: string;
}

export interface IFormAvaliacao {
  HSEResponsavel: string;
  DataInicio: string;
  DataFim: string;
  Comentarios: string;
  StatusAvaliacao: string;
  Restricao: "Sim" | "Nao";
  CamposRestricao?: ICampoRestricao[];
}

export interface IFormMetadata {
  // ... outros campos
  Avaliacao?: { [key: string]: IFormAvaliacao };
  QuantidadeAvaliacao?: number;
}

// IHSEFormData.ts
export interface IFormState {
  // ... outros campos
  correctionMode: boolean;
  restrictedFields: string[];
}
```

## Ações do Reducer Adicionadas

```typescript
// formReducer.ts
export type FormAction =
  // ... outras ações
  | {
      type: "SET_CORRECTION_MODE";
      payload: { enabled: boolean; restrictedFields: string[] };
    }
  | { type: "CLEAR_CORRECTION_MODE" };
```
