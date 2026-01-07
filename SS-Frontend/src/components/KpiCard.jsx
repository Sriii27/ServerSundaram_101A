import React from 'react';
import { cn } from '../lib/utils';


export function KpiCard({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 group hover:border-white/20 hover:translate-y-[-2px]",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
            <Icon className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-sans font-bold text-white tracking-tight leading-none">{value}</span>
        {trend && (
          <span className="text-xs text-emerald-500/80 font-medium flex items-center gap-1">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}