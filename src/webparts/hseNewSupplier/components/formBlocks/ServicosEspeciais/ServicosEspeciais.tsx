import * as React from "react";
import {
  Stack,
  Text,
  Toggle,
  MessageBar,
  MessageBarType,
  DefaultButton,
  Separator,
} from "@fluentui/react";
import { useHSEForm } from "../../../context/HSEFormContext";
import { HSEFileUpload } from "../../common/HSEFileUpload/HSEFileUpload";
import {
  MARITIME_CERTIFICATES,
  LIFTING_DOCUMENTS,
} from "../../../types/IHSEFormData";
import styles from "./ServicosEspeciais.module.scss";

export const ServicosEspeciais: React.FC = () => {
  const { state, dispatch, actions } = useHSEForm();
  const { formData } = state;

  const handleServiceToggle = (
    service: "fornecedorEmbarcacoes" | "fornecedorIcamento",
    checked: boolean
  ) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: service, value: checked },
    });
  };

  const renderMaritimeCertificates = () => {
    if (!formData.fornecedorEmbarcacoes) return null;

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
              </Text>
              <HSEFileUpload
                category={certificate.category}
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

  const renderLiftingDocuments = () => {
    if (!formData.fornecedorIcamento) return null;

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
              </Text>
              <HSEFileUpload
                category={document.category}
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
        </MessageBar>

        <div className={styles.serviceToggles}>
          <Toggle
            label="Fornecedor de Serviços Envolvendo Embarcações"
            checked={formData.fornecedorEmbarcacoes || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorEmbarcacoes", checked || false)
            }
            inlineLabel
            className={styles.serviceToggle}
          />

          <Toggle
            label="Fornecedor de Serviços Envolvendo Içamento de Carga"
            checked={formData.fornecedorIcamento || false}
            onChange={(_, checked) =>
              handleServiceToggle("fornecedorIcamento", checked || false)
            }
            inlineLabel
            className={styles.serviceToggle}
          />
        </div>

        <Separator />

        {renderMaritimeCertificates()}
        {renderLiftingDocuments()}

        {!formData.fornecedorEmbarcacoes && !formData.fornecedorIcamento && (
          <MessageBar messageBarType={MessageBarType.success}>
            Nenhum serviço especializado selecionado. Você pode prosseguir para
            a próxima etapa.
          </MessageBar>
        )}

        <div className={styles.actionsSection}>
          <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            horizontalAlign="space-between"
          >
            <DefaultButton
              text="Etapa Anterior"
              iconProps={{ iconName: "ChevronLeft" }}
              onClick={actions.goToPreviousStep}
            />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DefaultButton
                text="Salvar Progresso"
                iconProps={{ iconName: "Save" }}
                onClick={actions.saveFormData}
                disabled={state.isSubmitting}
              />
              <DefaultButton
                text="Revisão Final"
                iconProps={{ iconName: "ChevronRight" }}
                onClick={actions.goToNextStep}
                primary
              />
            </Stack>
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
