import * as React from "react";
import styles from "./ProgressIndicator.module.scss";
import { IProgressIndicatorProps } from "./IProgressIndicatorProps";

export const ProgressIndicator: React.FC<IProgressIndicatorProps> = ({
  label,
  description,
  percentComplete = 0,
  color = "#2196f3",
  showLabel = true,
  size = "medium",
  className,
}) => {
  const barHeight = size === "large" ? 16 : size === "small" ? 6 : 10;
  return (
    <div className={`${styles.progressIndicator} ${className || ""}`}>
      {showLabel && label && <div className={styles.label}>{label}</div>}
      <div className={styles.barContainer} style={{ height: barHeight }}>
        <div
          className={styles.bar}
          style={{
            width: `${Math.round(percentComplete * 100)}%`,
            background: color,
            height: barHeight,
          }}
        />
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {showLabel && (
        <div className={styles.percent}>
          {Math.round(percentComplete * 100)}%
        </div>
      )}
    </div>
  );
};
