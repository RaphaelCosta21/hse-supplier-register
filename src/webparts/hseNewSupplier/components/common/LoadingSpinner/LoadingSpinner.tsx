import * as React from "react";
import styles from "./LoadingSpinner.module.scss";
import { Spinner, SpinnerSize } from "@fluentui/react";

interface LoadingSpinnerProps {
  label?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = "Carregando...",
  size = "medium",
  className,
}) => {
  let spinnerSize: SpinnerSize = SpinnerSize.medium;
  if (size === "small") spinnerSize = SpinnerSize.small;
  if (size === "large") spinnerSize = SpinnerSize.large;

  return (
    <div className={`${styles.loadingSpinner} ${className || ""}`}>
      <Spinner size={spinnerSize} label={label} />
    </div>
  );
};
