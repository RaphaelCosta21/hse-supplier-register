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
import {
  MARITIME_CERTIFICATES,
  LIFTING_DOCUMENTS,
} from "../../../utils/formConstants";
import { IServicosEspeciaisProps } from "./IServicosEspeciaisProps";
import styles from "./ServicosEspeciais.module.scss";

export const ServicosEspeciais: React.FC<IServicosEspeciaisProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const handleServiceToggle = (
    service: "fornecedorEmbarcacoes" | "fornecedorIcamento",
    checked: boolean
  ): void => {
    onChange(service, checked);
  };
  const renderMaritimeCertificates = (): JSX.Element | null => {
    if (!value?.fornecedorEmbarcacoes) return null;

    return (
      <div className={styles.serviceSection}>
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
                accept=".pdf,.jpg,.png"
                maxFileSize={50}
                helpText="Anexar certificado válido"
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
      <div className={styles.serviceSection}>
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
                accept=".pdf,.docx,.xlsx"
                maxFileSize={50}
                helpText="Anexar documento técnico"
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
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            Serviços Especializados
          </Text>
        </div>
        <MessageBar messageBarType={MessageBarType.info}>
          Indique quais tipos de serviços especializados sua empresa fornece.
          Documentos adicionais serão solicitados conforme aplicável.
        </MessageBar>{" "}
        <div className={styles.serviceToggles}>
          {" "}
          <Toggle
            label="Fornecedor de Serviços Envolvendo Embarcações"
            checked={value?.fornecedorEmbarcacoes || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorEmbarcacoes", checked || false)
            }
            inlineLabel
            className={styles.serviceToggle}
          />
          <Toggle
            label="Fornecedor de Serviços Envolvendo Içamento de Carga"
            checked={value?.fornecedorIcamento || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorIcamento", checked || false)
            }
            inlineLabel
            className={styles.serviceToggle}
          />
        </div>
        <Separator /> {renderMaritimeCertificates()}
        {renderLiftingDocuments()}
        {!value?.fornecedorEmbarcacoes && !value?.fornecedorIcamento && (
          <MessageBar messageBarType={MessageBarType.success}>
            {" "}
            Nenhum serviço especializado selecionado. Você pode prosseguir para
            a próxima etapa.
          </MessageBar>
        )}
      </Stack>
    </div>
  );
};
