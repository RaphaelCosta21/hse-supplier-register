import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  DatePicker,
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
  }; // Função para limpar erro específico quando campo é alterado
  const handleFieldChange = (
    fieldName: string,
    fieldValue: string | number | boolean | Date | undefined
  ): void => {
    // Chamar a função onChange original
    onChange(fieldName as keyof typeof value, fieldValue);

    // Limpar erro específico deste campo se existir
    if (state.errors && state.errors[fieldName] && dispatch) {
      const newErrors = { ...state.errors };
      delete newErrors[fieldName];
      dispatch({
        type: "SET_FIELD_ERRORS",
        payload: newErrors,
      });
    }
  };

  return (
    <div className={styles.dadosGerais}>
      <Stack tokens={{ childrenGap: 20 }}>
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            A - Informações e Dados Gerais da Contratada
          </Text>
        </div>{" "}
        <MessageBar messageBarType={MessageBarType.info}>
          Preencha todas as informações obrigatórias (*) sobre a empresa
          contratada. O anexo do REM (Resumo Estatístico Mensal) é obrigatório.
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
              className={`${styles.fullWidth} ${
                showError("empresa") ? styles.fieldError : ""
              }`}
              placeholder="Razão Social da empresa"
            />
          </div>{" "}
          <div className={styles.gridRow}>
            <TextField
              label="CNPJ"
              value={formatCNPJ(value.cnpj || "")}
              disabled
              required
              className={styles.halfWidth}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />{" "}
            <TextField
              label="Número do Contrato"
              value={value.numeroContrato || ""}
              onChange={(_, v) => handleFieldChange("numeroContrato", v)}
              required
              className={`${styles.halfWidth} ${
                showError("numeroContrato") ? styles.fieldError : ""
              }`}
              placeholder="Número do contrato com a Oceaneering"
            />
          </div>{" "}
          <div className={styles.gridRow}>
            {" "}
            <DatePicker
              label="Data de Início do Contrato"
              value={
                value.dataInicioContrato
                  ? new Date(value.dataInicioContrato)
                  : undefined
              }
              onSelectDate={(date) =>
                handleFieldChange("dataInicioContrato", date ?? undefined)
              }
              isRequired
              className={`${styles.halfWidth} ${
                showError("dataInicioContrato") ? styles.fieldError : ""
              }`}
              placeholder="Selecione a data de início"
            />
            <DatePicker
              label="Data de Término do Contrato"
              value={
                value.dataTerminoContrato
                  ? new Date(value.dataTerminoContrato)
                  : undefined
              }
              onSelectDate={(date) =>
                handleFieldChange("dataTerminoContrato", date ?? undefined)
              }
              isRequired
              className={`${styles.halfWidth} ${
                showError("dataTerminoContrato") ? styles.fieldError : ""
              }`}
              placeholder="Selecione a data de término"
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
              label="Responsável Técnico"
              value={value.responsavelTecnico || ""}
              onChange={(_, v) => handleFieldChange("responsavelTecnico", v)}
              required
              className={`${styles.halfWidth} ${
                showError("responsavelTecnico") ? styles.fieldError : ""
              }`}
              placeholder="Nome completo do responsável técnico"
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
          </div>
          <div className={styles.gridRow}>
            <div className={styles.toggleSection}>
              <Toggle
                label="Possui SESMT registrado?"
                checked={value.possuiSESMT || false}
                onChange={(_, checked) => onChange("possuiSESMT", checked)}
                inlineLabel
              />
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
          <div className={styles.gridRow}>
            <TextField
              label="Gerente do Contrato Marine"
              value={value.gerenteContratoMarine || ""}
              onChange={(_, v) => handleFieldChange("gerenteContratoMarine", v)}
              required
              className={`${styles.fullWidth} ${
                showError("gerenteContratoMarine") ? styles.fieldError : ""
              }`}
              placeholder="Nome do gerente responsável pelo contrato"
            />
          </div>
        </div>{" "}
        <Separator />{" "}
        <div className={styles.attachmentSection}>
          <Text variant="large" className={styles.attachmentTitle}>
            Anexo
          </Text>{" "}
          <HSEFileUpload
            label="REM - Resumo Estatístico Mensal"
            required={true}
            category="rem"
            accept=".pdf,.xlsx,.xls,.docx,.doc"
            maxFileSize={50}
            helpText="Anexe o REM dos acidentes de trabalho do ano corrente e do ano anterior (NBR14280). (Opcional para testes)"
          />
        </div>
        <MessageBar messageBarType={MessageBarType.warning}>
          <Text variant="medium" style={{ fontWeight: 600 }}>
            OBS.: a) Cabe a contratada anexar a este questionário o REM: Resumo
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
