# Exemplo Prático: Implementando Restrições no DadosGerais.tsx

Este exemplo mostra como modificar um componente de formulário existente para suportar o sistema de correção de restrições.

## Antes (Código Original)

```tsx
<TextField
  label="Nome da Empresa"
  value={value.empresa || ""}
  onChange={(_, v) => handleFieldChange("empresa", v)}
  required
  disabled={!!state.formData?.id} // Desabilita se o formulário já foi criado
  className={`${styles.fullWidth} ${
    showError("empresa") ? styles.fieldError : ""
  }`}
/>
```

## Depois (Com Suporte a Restrições)

```tsx
<TextField
  label="Nome da Empresa"
  value={value.empresa || ""}
  onChange={(_, v) => handleFieldChange("empresa", v)}
  required
  disabled={
    !!state.formData?.id || // Condição original
    !actions.canEditField("dadosGerais.empresa") // NOVA: verifica se pode editar
  }
  className={`${styles.fullWidth} ${
    showError("empresa") ? styles.fieldError : ""
  }`}
  styles={{
    fieldGroup: {
      // Destacar campos que podem ser editados no modo de correção
      borderColor:
        state.correctionMode && actions.canEditField("dadosGerais.empresa")
          ? "#ca5010" // Laranja para campos que podem ser corrigidos
          : undefined,
      borderWidth:
        state.correctionMode && actions.canEditField("dadosGerais.empresa")
          ? "2px"
          : undefined,
    },
  }}
/>
```

## Modificações Necessárias

### 1. Importar o contexto (se não estiver importado)

```tsx
import { useHSEForm } from "../../context/HSEFormContext";
```

### 2. Acessar as actions no componente

```tsx
const DadosGerais: React.FC<IDadosGeraisProps> = ({
  value,
  onChange,
  errors,
}) => {
  const { state, dispatch, actions } = useHSEForm(); // Adicionar 'actions'

  // ... resto do código
};
```

### 3. Aplicar para cada campo

Para cada campo do formulário, aplicar o padrão:

```tsx
// Campo: Escopo do Serviço
<TextField
  label="Escopo do Serviço"
  value={value.escopoServico || ""}
  onChange={(_, v) => handleFieldChange("escopoServico", v)}
  required
  disabled={
    !!state.formData?.id ||
    !actions.canEditField("dadosGerais.escopoServico") // Path específico do campo
  }
  multiline
  rows={3}
  styles={{
    fieldGroup: {
      borderColor: state.correctionMode && actions.canEditField("dadosGerais.escopoServico")
        ? "#ca5010"
        : undefined,
      borderWidth: state.correctionMode && actions.canEditField("dadosGerais.escopoServico")
        ? "2px"
        : undefined
    }
  }}
/>

// Campo: Responsável Técnico
<TextField
  label="Responsável Técnico"
  value={value.responsavelTecnico || ""}
  onChange={(_, v) => handleFieldChange("responsavelTecnico", v)}
  required
  disabled={
    !!state.formData?.id ||
    !actions.canEditField("dadosGerais.responsavelTecnico")
  }
  styles={{
    fieldGroup: {
      borderColor: state.correctionMode && actions.canEditField("dadosGerais.responsavelTecnico")
        ? "#ca5010"
        : undefined,
      borderWidth: state.correctionMode && actions.canEditField("dadosGerais.responsavelTecnico")
        ? "2px"
        : undefined
    }
  }}
/>

// Campo: Dropdown Grau de Risco
<Dropdown
  label="Grau de Risco"
  selectedKey={value.grauRisco}
  onChange={(_, option) => handleFieldChange("grauRisco", option?.key)}
  options={GRAU_RISCO_OPTIONS}
  required
  disabled={
    !!state.formData?.id ||
    !actions.canEditField("dadosGerais.grauRisco")
  }
  styles={{
    dropdown: {
      borderColor: state.correctionMode && actions.canEditField("dadosGerais.grauRisco")
        ? "#ca5010"
        : undefined,
      borderWidth: state.correctionMode && actions.canEditField("dadosGerais.grauRisco")
        ? "2px"
        : undefined
    }
  }}
/>
```

### 4. Para campos de anexos (exemplo REM)

```tsx
<FileUpload
  category="rem"
  label="Resumo Estatístico Mensal de Acidentes (REM)"
  description="Arquivo obrigatório - Upload do documento REM"
  required
  disabled={
    !!state.formData?.id || !actions.canEditField("dadosGerais.rem") // Campo de anexo também pode ser restrito
  }
  // Destacar se pode ser editado no modo correção
  styles={{
    container: {
      borderColor:
        state.correctionMode && actions.canEditField("dadosGerais.rem")
          ? "#ca5010"
          : undefined,
      borderWidth:
        state.correctionMode && actions.canEditField("dadosGerais.rem")
          ? "2px"
          : undefined,
      borderStyle: "dashed",
    },
  }}
/>
```

## Padrão de Paths para Campos

### Dados Gerais

- `dadosGerais.empresa`
- `dadosGerais.cnpj`
- `dadosGerais.escopoServico`
- `dadosGerais.responsavelTecnico`
- `dadosGerais.atividadePrincipalCNAE`
- `dadosGerais.grauRisco`
- `dadosGerais.possuiSESMT`
- `dadosGerais.rem` (anexo)

### Conformidade Legal

- `conformidadeLegal.nr01`
- `conformidadeLegal.nr04`
- `conformidadeLegal.nr05`
- `conformidadeLegal.nr06`
- `conformidadeLegal.nr07`
- `conformidadeLegal.nr10`
- `conformidadeLegal.nr11`
- `conformidadeLegal.nr12`
- `conformidadeLegal.nr13`
- `conformidadeLegal.nr15`
- `conformidadeLegal.nr16`
- `conformidadeLegal.nr23`

### Serviços Especiais

- `servicosEspeciais.fornecedorEmbarcacoes`
- `servicosEspeciais.fornecedorIcamento`
- `servicosEspeciais.naoFornecedorServicos`

## Componente de Notificação (Opcional)

Para melhor UX, você pode adicionar uma notificação no topo do formulário quando estiver no modo correção:

```tsx
{
  state.correctionMode && (
    <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
      <Text variant="medium" style={{ fontWeight: 600 }}>
        Modo de Correção Ativo
      </Text>
      <Text variant="small">
        Você pode editar apenas os campos destacados em laranja. Estes são os
        campos que necessitam de correção conforme avaliação HSE.
      </Text>
    </MessageBar>
  );
}
```

## Resultado Final

Com essas modificações:

1. **Formulários normais**: Funcionam como antes
2. **Modo correção**: Apenas campos com restrições são editáveis
3. **Visual**: Campos editáveis são destacados em laranja
4. **UX**: Usuario entende claramente o que pode ser editado
