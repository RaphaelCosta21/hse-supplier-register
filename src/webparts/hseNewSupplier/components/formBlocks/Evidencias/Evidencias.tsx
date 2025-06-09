import * as React from "react";
import {
  Stack,
  Text,
  MessageBar,
  MessageBarType,
  Separator,
  Icon,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import { HSEFileUpload } from "../../common/HSEFileUploadSharePoint";
import { REQUIRED_EVIDENCES } from "../../../utils/formConstants";
import styles from "./Evidencias.module.scss";

export const Evidencias: React.FC = () => {
  const { state } = useHSEForm();

  const calculateEvidencesProgress = (): number => {
    const totalRequired = REQUIRED_EVIDENCES.filter(
      (evidence) => evidence.isRequired
    ).length;
    const completed = REQUIRED_EVIDENCES.filter(
      (evidence) =>
        evidence.isRequired && state.attachments[evidence.category]?.length > 0
    ).length;
    return Math.round((completed / totalRequired) * 100);
  };

  const renderEvidenceItem = (
    evidence: (typeof REQUIRED_EVIDENCES)[0]
  ): JSX.Element => {
    const attachments = state.attachments[evidence.category] || [];
    const hasAttachment = attachments.length > 0;

    return (
      <div key={evidence.id} className={styles.evidenceItem}>
        <div className={styles.evidenceHeader}>
          <div className={styles.evidenceInfo}>
            <Icon
              iconName={hasAttachment ? "CheckMark" : "Document"}
              className={
                hasAttachment ? styles.completedIcon : styles.pendingIcon
              }
            />
            <div>
              <Text variant="mediumPlus" className={styles.evidenceName}>
                {evidence.id}. {evidence.name}
                {evidence.isRequired && (
                  <span className={styles.required}>*</span>
                )}
              </Text>
              <Text variant="small" className={styles.evidenceDescription}>
                {evidence.description}
              </Text>
            </div>
          </div>
          {hasAttachment && <div className={styles.statusBadge}>✓ Anexado</div>}
        </div>{" "}
        <HSEFileUpload
          label={evidence.name}
          category={evidence.category}
          subcategory="evidencias"
          required={evidence.isRequired}
          accept=".pdf,.docx,.xlsx,.jpg,.png"
          maxFileSize={50}
          allowMultiple={true}
          helpText={`${
            evidence.isRequired ? "Obrigatório" : "Opcional"
          } - Formatos aceitos: PDF, Word, Excel, Imagens`}
        />
      </div>
    );
  };

  return (
    <div className={styles.evidencias}>
      <Stack tokens={{ childrenGap: 20 }}>
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            Evidências Documentais
          </Text>
          <div className={styles.progressBadge}>
            {calculateEvidencesProgress()}% concluído
          </div>
        </div>
        <MessageBar messageBarType={MessageBarType.warning}>
          {" "}
          Todos os documentos marcados com (*) são obrigatórios. Certifique-se
          de anexar as evidências documentais que comprovem as respostas
          &quot;SIM&quot; fornecidas na seção anterior.
        </MessageBar>
        <Separator />{" "}
        <div className={styles.evidencesList}>
          {/* Primeira coluna - Primeira metade dos documentos */}
          {REQUIRED_EVIDENCES.slice(
            0,
            Math.ceil(REQUIRED_EVIDENCES.length / 2)
          ).map(renderEvidenceItem)}
          {/* Segunda coluna - Segunda metade dos documentos */}
          {REQUIRED_EVIDENCES.slice(
            Math.ceil(REQUIRED_EVIDENCES.length / 2)
          ).map(renderEvidenceItem)}
        </div>
      </Stack>
    </div>
  );
};
