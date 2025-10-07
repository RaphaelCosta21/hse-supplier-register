import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  Dropdown,
  SpinButton,
  Toggle,
  MessageBar,
  MessageBarType,
  Separator,
} from "@fluentui/react";
import { IDadosGeraisProps } from "./IDadosGeraisProps";
import { GRAU_RISCO_OPTIONS } from "../../../utils/formConstants";
import styles from "./DadosGerais.module.scss";
import { HSEFileUpload } from "../../common/HSEFileUploadSharePoint";
import { useHSEForm } from "../../context/HSEFormContext";
import { SectionTitle } from "../../common/SectionTitle";

export const DadosGerais: React.FC<IDadosGeraisProps> = ({
  value,
  onChange,
  errors,
}) => {
  const { state, dispatch } = useHSEForm();

  const formatCNPJ = (val: string): string => {
    const cleanValue = val.replace(/\D/g, "");
    return cleanValue
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };
  // Função utilitária para mostrar erro visual - combina erros do prop e do contexto
  const showError = (field: string): boolean => {
    // Verificar erros do prop (validação normal)
    const propErrors = errors && errors[field as keyof typeof errors];
    // Verificar erros do contexto (validação do botão salvar)
    const contextErrors = state.errors && state.errors[field];
    return !!(propErrors || contextErrors);
  }; // Função auxiliar para verificar se um campo específico está válido
  const isFieldValidNow = (
    fieldName: string,
    fieldValue: string | number | boolean | Date | undefined
  ): boolean => {
    switch (fieldName) {
      case "empresa":
      case "responsavelTecnico":
      case "atividadePrincipalCNAE":
        return !!(
          fieldValue &&
          typeof fieldValue === "string" &&
          fieldValue.trim() !== ""
        );
      case "grauRisco":
        return (
          fieldValue !== null && fieldValue !== undefined && fieldValue !== ""
        );
      default:
        return true;
    }
  };

  // Função para limpar erro específico quando campo é alterado
  const handleFieldChange = (
    fieldName: string,
    fieldValue: string | number | boolean | Date | undefined
  ): void => {
    // Chamar a função onChange original
    onChange(fieldName as keyof typeof value, fieldValue);

    // Limpar erro específico deste campo se existir E se o campo agora está válido
    if (state.errors && state.errors[fieldName] && dispatch) {
      const isFieldValid = isFieldValidNow(fieldName, fieldValue);

      if (isFieldValid) {
        const newErrors = { ...state.errors };
        delete newErrors[fieldName];
        dispatch({
          type: "SET_FIELD_ERRORS",
          payload: newErrors,
        });
      }
    }
  };
  return (
    <div className={styles.dadosGerais}>
      <Stack tokens={{ childrenGap: 20 }}>
        {" "}
        <SectionTitle
          title="A - Informações e Dados Gerais da Contratada"
          subtitle="Preencha todas as informações básicas sobre a empresa contratada para seguir para a próxima etapa (Conformidade Legal)."
          icon="ContactInfo"
          variant="primary"
        />
        <MessageBar messageBarType={MessageBarType.info}>
          Preencha todas as informações obrigatórias (*) sobre a empresa
          contratada para seguir para a próxima etapa (Conformidade Legal). O
          anexo do Resumo Estatístico Mensal de Acidentes é obrigatório.
        </MessageBar>
        {/* Nova nota destacada sobre salvamento de rascunho */}
        <MessageBar
          messageBarType={MessageBarType.warning}
          styles={{
            root: {
              backgroundColor: "#fff4e6",
              borderLeft: "4px solid #ff8c00",
              marginTop: "12px",
            },
            content: {
              fontWeight: "500",
            },
          }}
        >
          <strong>💾 Salvamento de Rascunho:</strong> Você poderá salvar um
          rascunho do formulário após o preenchimento dos campos obrigatórios
          dessa página. O Rascunho irá aparecer no bloco de &quot;Meus
          Formulários&quot; na página inicial.
        </MessageBar>
        <div className={styles.formGrid}>
          {" "}
          <div className={styles.gridRow}>
            {" "}
            <TextField
              label="Nome da Empresa"
              value={value.empresa || ""}
              onChange={(_, v) => handleFieldChange("empresa", v)}
              required
              disabled={!!state.formData?.id} // Desabilita se o formulário já foi criado (tem ID)
              className={`${styles.fullWidth} ${
                showError("empresa") ? styles.fieldError : ""
              }`}
              placeholder={
                state.formData?.id
                  ? "Nome da empresa não pode ser alterado após a criação do formulário"
                  : "Razão Social da empresa"
              }
              description={
                state.formData?.id
                  ? "⚠️ O nome da empresa não pode ser alterado após o formulário ter sido criado."
                  : undefined
              }
            />
          </div>{" "}
          <div className={styles.gridRow}>
            <TextField
              label="CNPJ"
              value={formatCNPJ(value.cnpj || "")}
              disabled
              required
              className={styles.fullWidth}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>{" "}
          <div className={styles.gridRow}>
            <TextField
              label="Escopo do Serviço"
              value={value.escopoServico || ""}
              onChange={(_, v) => onChange("escopoServico", v)}
              multiline
              rows={3}
              className={styles.fullWidth}
              placeholder="Descreva detalhadamente o escopo dos serviços contratados"
            />
          </div>{" "}
          <div className={styles.gridRow}>
            <TextField
              label="Responsável Técnico ou Representante Legal"
              value={value.responsavelTecnico || ""}
              onChange={(_, v) => handleFieldChange("responsavelTecnico", v)}
              required
              className={`${styles.halfWidth} ${
                showError("responsavelTecnico") ? styles.fieldError : ""
              }`}
              placeholder="Nome completo do responsável técnico ou representante legal"
            />
            <TextField
              label="Atividade Principal (CNAE)"
              value={value.atividadePrincipalCNAE || ""}
              onChange={(_, v) =>
                handleFieldChange("atividadePrincipalCNAE", v)
              }
              required
              className={`${styles.halfWidth} ${
                showError("atividadePrincipalCNAE") ? styles.fieldError : ""
              }`}
              placeholder="Código CNAE da atividade principal"
            />
          </div>
          <div className={styles.gridRow}>
            <SpinButton
              label="Total de Empregados"
              value={value.totalEmpregados?.toString() || "0"}
              onValidate={(v) => onChange("totalEmpregados", parseInt(v) || 0)}
              onIncrement={(v) =>
                onChange("totalEmpregados", (parseInt(v) || 0) + 1)
              }
              onDecrement={(v) =>
                onChange("totalEmpregados", Math.max(0, (parseInt(v) || 0) - 1))
              }
              min={0}
              step={1}
              className={styles.quarterWidth}
            />
            <SpinButton
              label="Empregados para este Serviço"
              value={value.empregadosParaServico?.toString() || "0"}
              onValidate={(v) =>
                onChange("empregadosParaServico", parseInt(v) || 0)
              }
              onIncrement={(v) =>
                onChange("empregadosParaServico", (parseInt(v) || 0) + 1)
              }
              onDecrement={(v) =>
                onChange(
                  "empregadosParaServico",
                  Math.max(0, (parseInt(v) || 0) - 1)
                )
              }
              min={0}
              step={1}
              className={styles.quarterWidth}
            />{" "}
            <Dropdown
              label="Grau de Risco (NR-4)"
              options={GRAU_RISCO_OPTIONS}
              selectedKey={value.grauRisco}
              onChange={(_, option) =>
                handleFieldChange("grauRisco", option?.key)
              }
              required
              className={`${styles.quarterWidth} ${
                showError("grauRisco") ? styles.fieldError : ""
              }`}
              placeholder="Selecione"
            />
          </div>{" "}
          <div className={styles.gridRow}>
            <div className={styles.toggleSection}>
              <div>
                <Toggle
                  label="Possui SESMT registrado?"
                  checked={value.possuiSESMT || false}
                  onChange={(_, checked) => onChange("possuiSESMT", checked)}
                  inlineLabel
                />
                <Text
                  variant="small"
                  style={{
                    color: "#666",
                    fontStyle: "italic",
                    marginTop: "4px",
                    lineHeight: "1.3",
                    maxWidth: "400px",
                  }}
                >
                  SESMT (Serviços Especializados em Engenharia de Segurança e
                  Medicina do Trabalho), segundo NR-4 no estabelecimento
                </Text>
              </div>
              {value.possuiSESMT && (
                <SpinButton
                  label="Número de Componentes SESMT"
                  value={value.numeroComponentesSESMT?.toString() || "0"}
                  onValidate={(v) =>
                    onChange("numeroComponentesSESMT", parseInt(v) || 0)
                  }
                  onIncrement={(v) =>
                    onChange("numeroComponentesSESMT", (parseInt(v) || 0) + 1)
                  }
                  onDecrement={(v) =>
                    onChange(
                      "numeroComponentesSESMT",
                      Math.max(0, (parseInt(v) || 0) - 1)
                    )
                  }
                  min={0}
                  step={1}
                  className={styles.componentesInput}
                />
              )}
            </div>
          </div>{" "}
        </div>{" "}
        <Separator />{" "}
        <div className={styles.attachmentSection}>
          <Text variant="large" className={styles.attachmentTitle}>
            Anexo
          </Text>{" "}
          <HSEFileUpload
            label="Resumo Estatístico Mensal de Acidentes"
            required={true}
            category="rem"
            accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.zip"
            maxFileSize={50}
            helpText="Anexe o Resumo Estatístico Mensal de Acidentes de trabalho do ano corrente e do ano anterior (NBR14280)."
            allowMultiple={true}
          />
        </div>
        <MessageBar messageBarType={MessageBarType.warning}>
          <Text variant="medium" style={{ fontWeight: 600 }}>
            OBS.: a) Cabe a contratada anexar a este questionário o Resumo
            Estatístico Mensal dos acidentes de trabalho (típico e trajeto) do
            ano corrente e do ano anterior ao preenchimento deste questionário.
            As estatísticas de acidentes devem estar preparadas de acordo com a
            Norma de Cadastro de Acidentes do Trabalho, NBR14280, da ABNT.
          </Text>
        </MessageBar>
      </Stack>
    </div>
  );
};
