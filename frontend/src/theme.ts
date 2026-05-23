export const HERO_BG =
  'linear-gradient(180deg, #0b1220 0%, #111827 45%, #0f172a 100%)';

import type { CSSProperties } from 'react';

export const HERO_GRID_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
};

export const pageBg = 'min-h-full bg-slate-50';

export const card =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

export const cardPad = `${card} p-4`;

export const input =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500';

export const label = 'block text-sm font-medium text-slate-700 mb-1';

export const btnPrimary =
  'flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-500 text-[15px] font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50';

export const btnOutline =
  'flex min-h-[48px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-[15px] font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50';

export const linkAccent = 'font-semibold text-emerald-600 hover:text-emerald-700';

export const spinner =
  'inline-block h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500';

export const alertError =
  'mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700';

export const alertSuccess =
  'mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800';
