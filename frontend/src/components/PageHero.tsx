import React from 'react';
import { HERO_BG, HERO_GRID_STYLE } from '../theme';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, badge }) => (
  <section
    className="relative overflow-hidden px-5 py-8 text-white"
    style={{ background: HERO_BG }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.08]"
      style={HERO_GRID_STYLE}
    />
    <div className="relative z-10">
      {badge && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
            {badge}
          </span>
        </div>
      )}
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-sm text-sm font-medium text-slate-300">{subtitle}</p>
      )}
    </div>
  </section>
);

export default PageHero;
