import React from 'react';
import { cardPad } from '../theme';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => (
  <div className="px-5 py-8">
    <div className={`${cardPad} shadow-md`}>
      <h2 className="font-display text-center text-xl font-bold text-slate-900">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-slate-600">{subtitle}</p>
      )}
      <div className={subtitle ? 'mt-6' : 'mt-5'}>{children}</div>
    </div>
  </div>
);

export default AuthCard;
