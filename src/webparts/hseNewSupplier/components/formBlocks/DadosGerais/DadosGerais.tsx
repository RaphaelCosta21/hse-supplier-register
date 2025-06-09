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

export const DadosGerais: React.FC<IDadosGeraisProps> = ({
  value,
  onChange,
  errors,
}) => {
  const formatCNPJ = (val: string): string => {
    const cleanValue = val.replace(/\D/g, "");
    return cleanValue
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
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
          <div className={styles.gridRow}>
            {" "}
            <TextField
              label="Nome da Empresa"
              value={value.empresa || ""}
              onChange={(_, v) => onChange("empresa", v)}
              required
              className={styles.fullWidth}
              placeholder="Razão Social da empresa"
            />
          </div>
          <div className={styles.gridRow}>
            <TextField
              label="CNPJ"
              value={value.cnpj || ""}
              onChange={(_, v) => onChange("cnpj", formatCNPJ(v || ""))}
              required
              className={styles.halfWidth}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            <TextField
              label="Número do Contrato"
              value={value.numeroContrato || ""}
              onChange={(_, v) => onChange("numeroContrato", v)}
              required
              className={styles.halfWidth}
              placeholder="Número do contrato com a Oceaneering"
            />
          </div>
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
                onChange("dataInicioContrato", date ?? undefined)
              }
              isRequired
              className={styles.halfWidth}
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
                onChange("dataTerminoContrato", date ?? undefined)
              }
              isRequired
              className={styles.halfWidth}
              placeholder="Selecione a data de término"
            />
          </div>
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
          </div>
          <div className={styles.gridRow}>
            {" "}
            <TextField
              label="Responsável Técnico"
              value={value.responsavelTecnico || ""}
              onChange={(_, v) => onChange("responsavelTecnico", v)}
              required
              className={styles.halfWidth}
              placeholder="Nome completo do responsável técnico"
            />
            <TextField
              label="Atividade Principal (CNAE)"
              value={value.atividadePrincipalCNAE || ""}
              onChange={(_, v) => onChange("atividadePrincipalCNAE", v)}
              required
              errorMessage={errors?.atividadePrincipalCNAE}
              className={styles.halfWidth}
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
            />
            <Dropdown
              label="Grau de Risco (NR-4)"
              options={GRAU_RISCO_OPTIONS}
              selectedKey={value.grauRisco}
              onChange={(_, option) => onChange("grauRisco", option?.key)}
              required
              className={styles.quarterWidth}
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
          </div>
          <div className={styles.gridRow}>
            {" "}
            <TextField
              label="Gerente do Contrato Marine"
              value={value.gerenteContratoMarine || ""}
              onChange={(_, v) => onChange("gerenteContratoMarine", v)}
              required
              className={styles.fullWidth}
              placeholder="Nome do gerente responsável pelo contrato"
            />
          </div>
        </div>{" "}
        <Separator />
        <div className={styles.attachmentSection}>
          <Text variant="large" className={styles.attachmentTitle}>
            Anexo Obrigatório
          </Text>
          <HSEFileUpload
            label="REM - Resumo Estatístico Mensal"
            required
            category="rem"
            accept=".pdf,.xlsx,.xls,.docx,.doc"
            maxFileSize={50}
            helpText="Anexe o REM dos acidentes de trabalho do ano corrente e do ano anterior (NBR14280)."
          />{" "}
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
