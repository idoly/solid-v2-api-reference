const iconBase =
  "grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[5px] border-[1.5px] border-[#cbd4cd] bg-surface p-0 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-[#7f9f48] hover:bg-[#edf4e5] hover:shadow-[0_4px_12px_rgba(70,95,45,.2)] active:translate-y-0 active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#719a2e] dark:border-[#3f4742] dark:bg-surface-dark dark:text-[#dce4de] dark:hover:border-[#c8d0cb] dark:hover:bg-[#c8d0cb] dark:hover:text-[#171b18] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.5)]";

const actionBase =
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded border-[1.5px] font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#719a2e]";
const actionPrimary =
  "border-[#222923] bg-[#222923] text-white hover:border-[#506b22] hover:bg-[#506b22] hover:shadow-[0_5px_14px_rgba(57,78,36,.26)] disabled:cursor-wait disabled:opacity-60 dark:border-[#a5ce62] dark:bg-[#a5ce62] dark:text-[#172013] dark:hover:border-[#d2f49d] dark:hover:bg-[#d2f49d] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.45)]";

const badgeBase = "inline-flex items-center font-mono";

export const iconButton = iconBase;
export const mobileIconButton = `${iconBase} hidden max-mobile:grid`;

export const actionButton = {
  primary: `${actionBase} ${actionPrimary} min-h-[42px] gap-2 px-[15px] text-[13px]`,
  secondary: `${actionBase} min-h-[42px] gap-2 border-[#cbd4cd] bg-surface px-[15px] text-[13px] text-[#4d5951] hover:border-[#8e9c91] hover:bg-[#edf4e5] hover:shadow-[0_4px_12px_rgba(70,95,45,.16)] dark:border-[#465149] dark:bg-surface-dark dark:text-[#d4ddd6] dark:hover:border-[#c8d0cb] dark:hover:bg-[#c8d0cb] dark:hover:text-[#171b18] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.48)]`,
  compact: `${actionBase} ${actionPrimary} min-h-[38px] gap-[7px] px-[15px] text-[13px]`,
  source: `${actionBase} gap-1.5 border-[#c9d5cf] bg-[#f4f8f6] px-2.5 py-2 text-xs text-[#42675f] hover:border-[#82b8ae] hover:bg-[#e9f5f2] hover:shadow-[0_4px_12px_rgba(70,95,45,.16)] dark:border-[#465149] dark:bg-[#20241f] dark:text-[#b8dc80] dark:hover:border-[#c8d0cb] dark:hover:bg-[#c8d0cb] dark:hover:text-[#171b18] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.5)]`,
} as const;

export const statusBadge = {
  api: `${badgeBase} rounded-[3px] border border-[#a9d15e] bg-[#f0f8e1] px-2 py-[5px] text-[11px] font-medium text-[#5c7e1b] dark:border-[#5e783c] dark:bg-[#20261d] dark:text-[#b2d67b]`,
  internal: `${badgeBase} rounded-[3px] bg-[#fff0c9] px-1.5 py-[3px] text-[9px] font-bold text-[#805b1d] uppercase dark:bg-[#3b301b] dark:text-[#e5c77f]`,
  deprecated: `${badgeBase} rounded-[3px] bg-[#fde2dc] px-1.5 py-[3px] text-[9px] font-bold text-[#9a3f32] uppercase dark:bg-[#3b211e] dark:text-[#efa093]`,
  parameter: `${badgeBase} rounded-[3px] bg-[#edf1e9] px-[5px] py-0.5 text-[9px] text-[#66705f] dark:bg-[#2b332d] dark:text-[#adb8b0]`,
} as const;
