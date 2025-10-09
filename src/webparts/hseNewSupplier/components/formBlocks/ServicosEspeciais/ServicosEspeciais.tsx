import * as React from "react";
import {
  Stack,
  Text,
  Toggle,
  MessageBar,
  MessageBarType,
  Separator,
} from "@fluentui/react";
import { HSEFileUpload } from "../../common/HSEFileUploadSharePoint";
import { SectionTitle } from "../../common/SectionTitle";
import {
  MARITIME_CERTIFICATES,
  LIFTING_DOCUMENTS,
} from "../../../utils/formConstants";
import { IServicosEspeciaisProps } from "./IServicosEspeciaisProps";
import styles from "./ServicosEspeciais.module.scss";
import "../../../styles/field-restrictions.scss";
import { useHSEForm } from "../../context/HSEFormContext";
import {
  getBlockControlProps,
  getFieldControlProps,
} from "../../../utils/fieldRestrictionHelpers";

export const ServicosEspeciais: React.FC<IServicosEspeciaisProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const context = useHSEForm();
  const handleServiceToggle = (
    service: "fornecedorEmbarcacoes" | "fornecedorIcamento",
    checked: boolean
  ): void => {
    // Se marcar um serviço, desmarcar "não fornecedor"
    if (checked && value?.naoFornecedorServicos) {
      onChange("naoFornecedorServicos", false);
    }
    onChange(service, checked);
  };

  const handleNaoFornecedorToggle = (checked: boolean): void => {
    onChange("naoFornecedorServicos", checked);

    // Se marcar "não fornecedor", desmarcar todos os serviços
    if (checked) {
      if (value?.fornecedorEmbarcacoes) {
        onChange("fornecedorEmbarcacoes", false);
      }
      if (value?.fornecedorIcamento) {
        onChange("fornecedorIcamento", false);
      }
    }
  };
  const renderMaritimeCertificates = (): JSX.Element | null => {
    if (!value?.fornecedorEmbarcacoes) return null;

    return (
      <div
        {...getBlockControlProps(
          "ServicosEspeciais.maritimeCertificates",
          context
        )}
        className={`${styles.serviceSection} ${
          getBlockControlProps(
            "ServicosEspeciais.maritimeCertificates",
            context
          ).className || ""
        }`}
      >
        <Text variant="large" className={styles.serviceTitle}>
          Certificados Marítimos Obrigatórios
        </Text>
        <MessageBar messageBarType={MessageBarType.info}>
          Como fornecedor de serviços envolvendo embarcações, os seguintes
          certificados são obrigatórios:
        </MessageBar>

        <div className={styles.certificatesList}>
          {MARITIME_CERTIFICATES.map((certificate) => (
            <div key={certificate.id} className={styles.certificateItem}>
              <Text variant="medium" className={styles.certificateName}>
                {certificate.id}. {certificate.name}
                {certificate.isRequired && (
                  <span className={styles.required}>*</span>
                )}
              </Text>
              <Text variant="small" className={styles.certificateDescription}>
                {certificate.description}
              </Text>{" "}
              <HSEFileUpload
                label={certificate.name}
                category={certificate.category}
                subcategory="servicosEspeciais"
                required={certificate.isRequired}
                accept=".pdf,.jpg,.png,.txt,.zip"
                maxFileSize={50}
                helpText="Anexar certificado válido"
                allowMultiple={true}
                {...getFieldControlProps(
                  `ServicosEspeciais.maritimeCertificates.${certificate.id}`,
                  context
                )}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderLiftingDocuments = (): JSX.Element | null => {
    if (!value?.fornecedorIcamento) return null;

    return (
      <div
        {...getBlockControlProps("ServicosEspeciais.liftingDocuments", context)}
        className={`${styles.serviceSection} ${
          getBlockControlProps("ServicosEspeciais.liftingDocuments", context)
            .className || ""
        }`}
      >
        <Text variant="large" className={styles.serviceTitle}>
          Documentos para Içamento de Carga
        </Text>
        <MessageBar messageBarType={MessageBarType.info}>
          Como fornecedor de serviços de içamento de carga, os seguintes
          documentos são obrigatórios:
        </MessageBar>

        <div className={styles.documentsList}>
          {LIFTING_DOCUMENTS.map((document) => (
            <div key={document.id} className={styles.documentItem}>
              <Text variant="medium" className={styles.documentName}>
                {document.id}. {document.name}
                {document.isRequired && (
                  <span className={styles.required}>*</span>
                )}
              </Text>
              <Text variant="small" className={styles.documentDescription}>
                {document.description}
              </Text>{" "}
              <HSEFileUpload
                label={document.name}
                category={document.category}
                subcategory="servicosEspeciais"
                required={document.isRequired}
                accept=".pdf,.docx,.xlsx,.txt,.zip"
                maxFileSize={50}
                helpText="Anexar documento técnico"
                allowMultiple={true}
                {...getFieldControlProps(
                  `ServicosEspeciais.liftingDocuments.${document.id}`,
                  context
                )}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.servicosEspeciais}>
      <Stack tokens={{ childrenGap: 20 }}>
        <SectionTitle
          title="C - Serviços Especializados"
          subtitle="Indique os tipos de serviços especializados que sua empresa fornece"
          icon="Settings"
          variant="tertiary"
        />
        <MessageBar messageBarType={MessageBarType.info}>
          Indique quais tipos de serviços especializados sua empresa fornece.
          Documentos adicionais serão solicitados conforme aplicável.
        </MessageBar>{" "}
        <div
          {...getBlockControlProps(
            "ServicosEspeciais.serviceSelection",
            context
          )}
          className={`${styles.serviceToggles} ${
            getBlockControlProps("ServicosEspeciais.serviceSelection", context)
              .className || ""
          }`}
        >
          <Toggle
            label="Fornecedor de Serviços Envolvendo Embarcações"
            checked={value?.fornecedorEmbarcacoes || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorEmbarcacoes", checked || false)
            }
            inlineLabel
            className={`${styles.serviceToggle} ${
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.fornecedorEmbarcacoes",
                context
              ).className || ""
            }`}
            disabled={
              value?.naoFornecedorServicos ||
              false ||
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.fornecedorEmbarcacoes",
                context
              ).disabled
            }
          />
          <Toggle
            label="Fornecedor de Serviços Envolvendo Içamento de Carga"
            checked={value?.fornecedorIcamento || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorIcamento", checked || false)
            }
            inlineLabel
            className={`${styles.serviceToggle} ${
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.fornecedorIcamento",
                context
              ).className || ""
            }`}
            disabled={
              value?.naoFornecedorServicos ||
              false ||
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.fornecedorIcamento",
                context
              ).disabled
            }
          />

          <Separator />

          <Toggle
            label="Minha empresa não fornece nenhum dos serviços especializados listados acima"
            checked={value?.naoFornecedorServicos || false}
            onChange={(_, checked) =>
              handleNaoFornecedorToggle(checked || false)
            }
            inlineLabel
            className={`${styles.serviceToggle} ${
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.naoFornecedorServicos",
                context
              ).className || ""
            }`}
            disabled={
              getFieldControlProps(
                "ServicosEspeciais.serviceSelection.naoFornecedorServicos",
                context
              ).disabled
            }
            styles={{
              root: { marginTop: 16 },
              label: { fontWeight: 600, color: "#0078d4" },
            }}
          />
        </div>
        <Separator />
        {renderMaritimeCertificates()}
        {renderLiftingDocuments()}
        {value?.naoFornecedorServicos && (
          <MessageBar messageBarType={MessageBarType.success}>
            Confirmado: Sua empresa não fornece serviços especializados. Você
            pode prosseguir para a próxima etapa.
          </MessageBar>
        )}
      </Stack>
    </div>
  );
};
