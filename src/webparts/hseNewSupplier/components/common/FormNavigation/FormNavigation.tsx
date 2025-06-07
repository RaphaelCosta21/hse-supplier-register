import * as React from "react";
import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import styles from "./FormNavigation.module.scss";

interface FormNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onSave?: () => void;
  disableNext?: boolean;
  disablePrevious?: boolean;
  showSave?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  onPrevious,
  onNext,
  onSave,
  disableNext,
  disablePrevious,
  showSave = true,
  isSubmitting = false,
  nextLabel = "Próxima Etapa",
  previousLabel = "Etapa Anterior",
}) => (
  <Stack
    horizontal
    tokens={{ childrenGap: 10 }}
    className={styles.formNavigation}
  >
    <DefaultButton
      text={previousLabel}
      iconProps={{ iconName: "ChevronLeft" }}
      onClick={onPrevious}
      disabled={disablePrevious || isSubmitting}
    />
    {showSave && (
      <DefaultButton
        text="Salvar Progresso"
        iconProps={{ iconName: "Save" }}
        onClick={onSave}
        disabled={isSubmitting}
      />
    )}
    <PrimaryButton
      text={nextLabel}
      iconProps={{ iconName: "ChevronRight" }}
      onClick={onNext}
      disabled={disableNext || isSubmitting}
    />
  </Stack>
);
