import React from 'react';
import { X, Star, Zap, Activity, Info } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

export function EmployeeDrawer({ isOpen, onClose, employee }) {
    if (!isOpen || !employee) return null;

    const data = employee.impactBreakdown || [];

    // Determine top contribution for insight text
    const topContribution = [...data].sort((a, b) => b.score - a.score)[0];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-lg bg-[#1E293B] border-l border-slate-700 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 sm:duration-300 ease-out">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-[#1E293B] z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{employee.name}</h2>
                        <div className="flex items-center gap-3 text-slate-400 mt-1.5 text-sm">
                            <span className="font-medium text-slate-300">{employee.role}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>{employee.team}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                    {/* Main Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <Zap className="w-4 h-4" /> Impact Score
                            </div>
                            <div className="text-4xl font-mono font-bold text-white tracking-tight">{employee.impactScore}</div>
                            <div className="text-xs text-emerald-500/70 mt-1 font-medium">Top 5% in {employee.team}</div>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                                <Activity className="w-4 h-4" /> Activity Score
                            </div>
                            <div className="text-4xl font-mono font-bold text-white tracking-tight">{employee.activityScore}</div>
                            <div className="text-xs text-blue-500/70 mt-1 font-medium">Based on 30-day avg</div>
                        </div>
                    </div>

                    {/* Quick Insight */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> AI Insight
                        </h3>
                        <p className="text-slate-300 text-sm italic leading-relaxed relative z-10">
                            "{employee.name}'s primary impact driver is <strong className="text-white font-medium">{topContribution?.metric}</strong>.
                            {employee.silentArchitect
                                ? " Their high-value output despite lower visibility classifies them as a Silent Architect."
                                : " Their output aligns well with their visibility levels."}
                            "
                        </p>
                    </div>

                    {/* Composition Chart */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Impact Breakdown</h3>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Weighted Metrics
                            </div>
                        </div>
                        <div className="h-[260px] bg-slate-950/50 rounded-2xl border border-slate-800/80 p-4 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="score"
                                        nameKey="metric"
                                        stroke="none"
                                        cornerRadius={4}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                            const RADIAN = Math.PI / 180;
                                            const radius = outerRadius * 1.4;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                            return (
                                                <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="bold">
                                                    {`${data[index].metric} (${(percent * 100).toFixed(0)}%)`}
                                                </text>
                                            );
                                        }}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#cbd5e1' }}
                                        cursor={false}
                                    />

                                    {/* Center Text */}
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                        <tspan x="50%" dy="-0.5em" fontSize="28" fill="white" fontWeight="bold" fontFamily="monospace">{employee.impactScore}</tspan>
                                        <tspan x="50%" dy="1.6em" fontSize="11" fill="#64748b" fontWeight="500" letterSpacing="0.05em">TOTAL</tspan>
                                    </text>

                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Contribution List */}
                    <div>
                        <div className="space-y-3">
                            {data.map((item, index) => (
                                <div key={item.metric} className="group bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 hover:bg-slate-800/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full ring-2 ring-opacity-20 ring-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="font-semibold text-white text-sm">{item.metric}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            </div>
                                            <span className="font-mono text-emerald-400 font-bold text-sm w-6 text-right">{item.score}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-5 leading-normal group-hover:text-slate-300 transition-colors">
                                        {item.description}
                                    </p>

                                    {item.stats && (
                                        <div className="ml-5 mt-3 pt-3 border-t border-white/5 flex items-center justify-between group-hover/stats">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                                {item.stats.label}
                                            </span>
                                            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                {item.stats.count}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
