export interface IProgressIndicatorProps {
  label?: string;
  description?: string;
  percentComplete?: number; // 0 a 1
  color?: string;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}
