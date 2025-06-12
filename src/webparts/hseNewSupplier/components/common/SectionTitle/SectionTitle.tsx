import * as React from "react";
import { Text, Icon } from "@fluentui/react";
import styles from "./SectionTitle.module.scss";

export interface ISectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
}

export const SectionTitle: React.FC<ISectionTitleProps> = ({
  title,
  subtitle,
  icon,
  variant = "primary",
  className = "",
}) => {
  return (
    <div
      className={`${styles.sectionTitleContainer} ${styles[variant]} ${className}`}
    >
      <div className={styles.titleContent}>
        {icon && (
          <div className={styles.iconContainer}>
            <Icon iconName={icon} className={styles.titleIcon} />
          </div>
        )}
        <div className={styles.textContent}>
          <Text variant="xxLarge" className={styles.mainTitle}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="medium" className={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      <div className={styles.decorativeLine} />
    </div>
  );
};
