import styles from "./classes.module.css";

export const iconButton = styles.iconButton;
export const primaryIconButton = styles.primaryIconButton;
export const mobileIconButton = styles.mobileIconButton;

export const actionButton = {
  primary: styles.primary,
  secondary: styles.secondary,
  source: styles.source,
} as const;

export const statusBadge = {
  api: styles.api,
  internal: styles.internal,
  deprecated: styles.deprecated,
  parameter: styles.parameter,
} as const;
