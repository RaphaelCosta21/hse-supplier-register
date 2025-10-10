import * as React from "react";
import { Checkbox, ICheckboxProps, Icon, Text, Stack } from "@fluentui/react";
import styles from "./CorrectionCheckbox.module.scss";

export interface ICorrectionCheckboxProps {
  fieldPath: string;
  fieldName: string;
  isChecked: boolean;
  onChange: (fieldPath: string, isChecked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const CorrectionCheckbox: React.FC<ICorrectionCheckboxProps> = ({
  fieldPath,
  fieldName,
  isChecked,
  onChange,
  disabled = false,
  className,
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleChange = React.useCallback(
    (
      ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
      checked?: boolean
    ) => {
      if (disabled) return;

      const newChecked = !!checked;

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      // Call parent onChange
      onChange(fieldPath, newChecked);
    },
    [fieldPath, onChange, disabled]
  );

  const checkboxProps: ICheckboxProps = {
    checked: isChecked,
    onChange: handleChange,
    disabled,
    className: `${styles.correctionCheckbox} ${className || ""} ${
      isAnimating ? styles.animating : ""
    }`,
  };

  return (
    <Stack
      horizontal
      verticalAlign="center"
      className={styles.checkboxContainer}
    >
      <div className={styles.checkboxWrapper}>
        <Checkbox {...checkboxProps} />
      </div>

      <div className={styles.labelContainer}>
        <Text variant="medium" className={styles.fieldLabel}>
          {fieldName}
        </Text>
        {isChecked && (
          <div className={styles.correctedBadge}>
            <Icon iconName="CheckMark" className={styles.badgeIcon} />
            <Text variant="xSmall" className={styles.badgeText}>
              Corrigido
            </Text>
          </div>
        )}
      </div>
    </Stack>
  );
};
