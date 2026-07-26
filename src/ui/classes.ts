const iconBase =
  "grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[5px] border border-[#cbd4cd] bg-surface p-0 transition-colors hover:border-[#96a299] hover:bg-surface-muted dark:border-[#39423c] dark:bg-surface-dark dark:text-[#dce4de] dark:hover:border-[#59665d] dark:hover:bg-[#252d27]";

const actionBase = "inline-flex cursor-pointer items-center justify-center rounded border font-semibold";
const actionPrimary =
  "border-[#222923] bg-[#222923] text-white hover:border-[#506b22] hover:bg-[#506b22] disabled:cursor-wait disabled:opacity-60 dark:border-[#a5ce62] dark:bg-[#a5ce62] dark:text-[#172013] dark:hover:border-[#b9df7c] dark:hover:bg-[#b9df7c]";

const badgeBase = "inline-flex items-center font-mono";

export const iconButton = iconBase;
export const mobileIconButton = `${iconBase} hidden max-mobile:grid`;

export const actionButton = {
  primary: `${actionBase} ${actionPrimary} min-h-[42px] gap-2 px-[15px] text-[13px]`,
  secondary: `${actionBase} min-h-[42px] gap-2 border-[#cbd4cd] bg-surface px-[15px] text-[13px] text-[#4d5951] hover:border-[#9eaaa1] hover:bg-surface-muted dark:border-[#465149] dark:bg-surface-dark dark:text-[#d4ddd6] dark:hover:border-[#657268] dark:hover:bg-[#252d27]`,
  compact: `${actionBase} ${actionPrimary} min-h-[38px] gap-[7px] px-[15px] text-[13px]`,
  source: `${actionBase} gap-1.5 border-[#c9d5cf] bg-[#f4f8f6] px-2.5 py-2 text-xs text-[#42675f] hover:border-[#82b8ae] hover:bg-[#e9f5f2] dark:border-[#3e5c55] dark:bg-[#1b2925] dark:text-[#9bc9bf] dark:hover:border-[#578178] dark:hover:bg-[#20342f]`,
} as const;

export const statusBadge = {
  api: `${badgeBase} rounded-[3px] border border-[#a9d15e] bg-[#f0f8e1] px-2 py-[5px] text-[11px] font-medium text-[#5c7e1b] dark:border-[#5e783c] dark:bg-[#222c1b] dark:text-[#b2d67b]`,
  internal: `${badgeBase} rounded-[3px] bg-[#fff0c9] px-1.5 py-[3px] text-[9px] font-bold text-[#805b1d] uppercase dark:bg-[#3b301b] dark:text-[#e5c77f]`,
  deprecated: `${badgeBase} rounded-[3px] bg-[#fde2dc] px-1.5 py-[3px] text-[9px] font-bold text-[#9a3f32] uppercase dark:bg-[#3b211e] dark:text-[#efa093]`,
  parameter: `${badgeBase} rounded-[3px] bg-[#edf1e9] px-[5px] py-0.5 text-[9px] text-[#66705f] dark:bg-[#2b332d] dark:text-[#adb8b0]`,
} as const;
