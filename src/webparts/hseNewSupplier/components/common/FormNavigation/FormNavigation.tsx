import * as React from "react";
import { PrimaryButton, Stack } from "@fluentui/react";
import styles from "./FormNavigation.module.scss";

interface FormNavigationProps {
  onSave?: () => void;
  showSave?: boolean;
  isSubmitting?: boolean;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  onSave,
  showSave = true,
  isSubmitting = false,
}) => (
  <Stack
    horizontal
    tokens={{ childrenGap: 10 }}
    className={styles.formNavigation}
    horizontalAlign="center"
  >
    {showSave && (
      <PrimaryButton
        text="Salvar Progresso"
        iconProps={{ iconName: "Save" }}
        onClick={onSave}
        disabled={isSubmitting}
      />
    )}
  </Stack>
);
