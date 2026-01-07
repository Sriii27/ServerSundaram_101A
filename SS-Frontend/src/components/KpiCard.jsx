import React from 'react';
import { cn } from '../lib/utils';


export function KpiCard({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className="text-xs text-emerald-400 font-medium">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}