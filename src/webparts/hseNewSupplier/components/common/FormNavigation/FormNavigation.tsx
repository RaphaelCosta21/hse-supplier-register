import * as React from "react";
import { PrimaryButton, Stack } from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import styles from "./FormNavigation.module.scss";

interface FormNavigationProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  onSubmit,
  isSubmitting = false,
  isLastStep = false,
}): JSX.Element => {
  const { actions } = useHSEForm();

  const handleSubmit = async (): Promise<void> => {
    if (onSubmit) {
      await onSubmit();
    } else {
      await actions.submitForm();
    }
  };

  // Só renderiza algo se for a última etapa
  if (!isLastStep) {
    return <></>;
  }

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 10 }}
      className={styles.formNavigation}
      horizontalAlign="center"
    >
      <PrimaryButton
        text="Submeter Formulário"
        iconProps={{ iconName: "Send" }}
        onClick={handleSubmit}
        disabled={isSubmitting}
      />
    </Stack>
  );
};
