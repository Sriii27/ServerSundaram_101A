import React from 'react';
import { cn } from '../lib/utils';


export function KpiCard({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-[#09090B] border border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-700 transition-all duration-200 group hover:translate-y-[-2px]",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors">
            <Icon className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
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