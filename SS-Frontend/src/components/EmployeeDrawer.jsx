import React from 'react';
import { X, Star, Zap, Activity } from 'lucide-react';
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
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <span>{employee.role}</span>
                            <span>&bull;</span>
                            <span>{employee.team}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Main Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-medium">
                                <Zap className="w-4 h-4" /> Impact Score
                            </div>
                            <div className="text-3xl font-mono font-bold text-white">{employee.impactScore}</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-medium">
                                <Activity className="w-4 h-4" /> Activity Score
                            </div>
                            <div className="text-3xl font-mono font-bold text-white">{employee.activityScore}</div>
                        </div>
                    </div>

                    {/* Quick Insight */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" /> Automated Insight
                        </h3>
                        <p className="text-slate-300 text-sm italic">
                            "{employee.name}'s primary impact driver is <strong className="text-white">{topContribution?.metric}</strong>.
                            {employee.silentArchitect
                                ? " High value output despite lower visibility classifies them as a Silent Architect."
                                : " Their output aligns well with their visibility levels."}
                            "
                        </p>
                    </div>

                    {/* Composition Chart */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Impact Composition</h3>
                        <div className="h-[250px] bg-slate-950/30 rounded-xl border border-slate-800 p-4 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="score"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                        itemStyle={{ color: '#cbd5e1' }}
                                    />

                                    {/* Center Text */}
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                        <tspan x="50%" dy="-0.5em" fontSize="24" fill="white" fontWeight="bold">{employee.impactScore}</tspan>
                                        <tspan x="50%" dy="1.5em" fontSize="12" fill="#94a3b8">Total</tspan>
                                    </text>

                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Contribution List */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contribution Details</h3>
                        <div className="space-y-3">
                            {data.map((item, index) => (
                                <div key={item.metric} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="font-medium text-white">{item.metric}</span>
                                        </div>
                                        <span className="font-mono text-emerald-400 font-bold">{item.score}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 pl-4">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
