import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  DatePicker,
  Dropdown,
  IDropdownOption,
  SpinButton,
  Toggle,
  MessageBar,
  MessageBarType,
  DefaultButton,
  PrimaryButton,
  Separator,
} from "@fluentui/react";
import { useHSEForm } from "../../../context/HSEFormContext";
import { HSEFileUpload } from "../../common/HSEFileUpload/HSEFileUpload";
import { GRAU_RISCO_OPTIONS } from "../../../utils/formConstants";
import { validators } from "../../../utils/validators";
import styles from "./DadosGerais.module.scss";

export const DadosGerais: React.FC = () => {
  const { state, dispatch, actions } = useHSEForm();
  const { formData, validationErrors } = state;

  const updateField = (field: string, value: any) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field, value },
    });
  };

  const formatCNPJ = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    return cleanValue
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const handleCNPJChange = (_: any, newValue?: string) => {
    if (newValue) {
      const formatted = formatCNPJ(newValue);
      updateField("cnpj", formatted);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find((error) => error.field === fieldName)?.message;
  };

  const isFieldRequired = (fieldName: string): boolean => {
    const requiredFields = [
      "empresa",
      "cnpj",
      "numeroContrato",
      "dataInicioContrato",
      "dataTerminoContrato",
      "responsavelTecnico",
      "totalEmpregados",
      "empregadosParaServico",
      "grauRisco",
    ];
    return requiredFields.includes(fieldName);
  };

  return (
    <div className={styles.dadosGerais}>
      <Stack tokens={{ childrenGap: 20 }}>
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            A - Informações e Dados Gerais da Contratada
          </Text>
        </div>

        <MessageBar messageBarType={MessageBarType.info}>
          Preencha todas as informações obrigatórias (*) sobre a empresa
          contratada. O anexo do REM (Resumo Estatístico Mensal) é obrigatório.
        </MessageBar>

        <div className={styles.formGrid}>
          <div className={styles.gridRow}>
            <TextField
              label="Nome da Empresa"
              value={formData.empresa || ""}
              onChange={(_, value) => updateField("empresa", value)}
              required={isFieldRequired("empresa")}
              errorMessage={getFieldError("empresa")}
              className={styles.fullWidth}
              placeholder="Razão Social da empresa"
            />
          </div>

          <div className={styles.gridRow}>
            <TextField
              label="CNPJ"
              value={formData.cnpj || ""}
              onChange={handleCNPJChange}
              required={isFieldRequired("cnpj")}
              errorMessage={getFieldError("cnpj")}
              className={styles.halfWidth}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />

            <TextField
              label="Número do Contrato"
              value={formData.numeroContrato || ""}
              onChange={(_, value) => updateField("numeroContrato", value)}
              required={isFieldRequired("numeroContrato")}
              errorMessage={getFieldError("numeroContrato")}
              className={styles.halfWidth}
              placeholder="Número do contrato com a Oceaneering"
            />
          </div>

          <div className={styles.gridRow}>
            <DatePicker
              label="Data de Início do Contrato"
              value={
                formData.dataInicioContrato
                  ? new Date(formData.dataInicioContrato)
                  : undefined
              }
              onSelectDate={(date) =>
                updateField("dataInicioContrato", date?.toISOString())
              }
              isRequired={isFieldRequired("dataInicioContrato")}
              className={styles.halfWidth}
              placeholder="Selecione a data de início"
            />

            <DatePicker
              label="Data de Término do Contrato"
              value={
                formData.dataTerminoContrato
                  ? new Date(formData.dataTerminoContrato)
                  : undefined
              }
              onSelectDate={(date) =>
                updateField("dataTerminoContrato", date?.toISOString())
              }
              isRequired={isFieldRequired("dataTerminoContrato")}
              className={styles.halfWidth}
              placeholder="Selecione a data de término"
            />
          </div>

          <div className={styles.gridRow}>
            <TextField
              label="Escopo do Serviço"
              value={formData.escopoServico || ""}
              onChange={(_, value) => updateField("escopoServico", value)}
              multiline
              rows={3}
              className={styles.fullWidth}
              placeholder="Descreva detalhadamente o escopo dos serviços contratados"
            />
          </div>

          <div className={styles.gridRow}>
            <TextField
              label="Responsável Técnico"
              value={formData.responsavelTecnico || ""}
              onChange={(_, value) => updateField("responsavelTecnico", value)}
              required={isFieldRequired("responsavelTecnico")}
              errorMessage={getFieldError("responsavelTecnico")}
              className={styles.halfWidth}
              placeholder="Nome completo do responsável técnico"
            />

            <TextField
              label="Atividade Principal (CNAE)"
              value={formData.atividadePrincipalCNAE || ""}
              onChange={(_, value) =>
                updateField("atividadePrincipalCNAE", value)
              }
              className={styles.halfWidth}
              placeholder="Código CNAE da atividade principal"
            />
          </div>

          <div className={styles.gridRow}>
            <SpinButton
              label="Total de Empregados"
              value={formData.totalEmpregados?.toString() || "0"}
              onValidate={(value) =>
                updateField("totalEmpregados", parseInt(value) || 0)
              }
              onIncrement={(value) =>
                updateField("totalEmpregados", (parseInt(value) || 0) + 1)
              }
              onDecrement={(value) =>
                updateField(
                  "totalEmpregados",
                  Math.max(0, (parseInt(value) || 0) - 1)
                )
              }
              min={0}
              step={1}
              className={styles.quarterWidth}
            />

            <SpinButton
              label="Empregados para este Serviço"
              value={formData.empregadosParaServico?.toString() || "0"}
              onValidate={(value) =>
                updateField("empregadosParaServico", parseInt(value) || 0)
              }
              onIncrement={(value) =>
                updateField("empregadosParaServico", (parseInt(value) || 0) + 1)
              }
              onDecrement={(value) =>
                updateField(
                  "empregadosParaServico",
                  Math.max(0, (parseInt(value) || 0) - 1)
                )
              }
              min={0}
              step={1}
              className={styles.quarterWidth}
            />

            <Dropdown
              label="Grau de Risco (NR-4)"
              options={GRAU_RISCO_OPTIONS}
              selectedKey={formData.grauRisco}
              onChange={(_, option) => updateField("grauRisco", option?.key)}
              required={isFieldRequired("grauRisco")}
              className={styles.quarterWidth}
              placeholder="Selecione"
            />
          </div>

          <div className={styles.gridRow}>
            <div className={styles.toggleSection}>
              <Toggle
                label="Possui SESMT registrado?"
                checked={formData.possuiSESMT || false}
                onChange={(_, checked) => updateField("possuiSESMT", checked)}
                inlineLabel
              />

              {formData.possuiSESMT && (
                <SpinButton
                  label="Número de Componentes SESMT"
                  value={formData.numeroComponentesSESMT?.toString() || "0"}
                  onValidate={(value) =>
                    updateField("numeroComponentesSESMT", parseInt(value) || 0)
                  }
                  onIncrement={(value) =>
                    updateField(
                      "numeroComponentesSESMT",
                      (parseInt(value) || 0) + 1
                    )
                  }
                  onDecrement={(value) =>
                    updateField(
                      "numeroComponentesSESMT",
                      Math.max(0, (parseInt(value) || 0) - 1)
                    )
                  }
                  min={0}
                  step={1}
                  className={styles.componentesInput}
                />
              )}
            </div>
          </div>

          <div className={styles.gridRow}>
            <TextField
              label="Gerente do Contrato Marine"
              value={formData.gerenteContratoMarine || ""}
              onChange={(_, value) =>
                updateField("gerenteContratoMarine", value)
              }
              required={isFieldRequired("gerenteContratoMarine")}
              errorMessage={getFieldError("gerenteContratoMarine")}
              className={styles.fullWidth}
              placeholder="Nome do gerente responsável pelo contrato"
            />
          </div>
        </div>

        <Separator />

        <div className={styles.attachmentSection}>
          <Text variant="large" className={styles.attachmentTitle}>
            Anexo Obrigatório
          </Text>

          <HSEFileUpload
            category="rem"
            label="REM - Resumo Estatístico Mensal"
            required={true}
            accept=".pdf,.xlsx,.xls"
            maxFileSize={50}
            multiple={true}
            helpText="Anexar REM do ano corrente e do ano anterior, conforme NBR14280"
          />
        </div>

        <div className={styles.actionsSection}>
          <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
            <DefaultButton
              text="Salvar Progresso"
              iconProps={{ iconName: "Save" }}
              onClick={actions.saveFormData}
              disabled={state.isSubmitting}
            />
            <PrimaryButton
              text="Próxima Etapa"
              iconProps={{ iconName: "ChevronRight" }}
              onClick={actions.goToNextStep}
              disabled={
                !validators.required(formData.empresa) ||
                !validators.cnpj(formData.cnpj || "")
              }
            />
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
