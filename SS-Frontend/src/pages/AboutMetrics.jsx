import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { ArrowLeft, Info, CheckCircle2, Shield, EyeOff, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

const ChartCard = ({ title, icon: Icon, colorClass, children, caption }) => (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-6">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{caption}</p>
            </div>
        </div>
        <div className="flex-1 min-h-[250px] relative">
            {children}
        </div>
    </section>
);

export default function AboutMetrics() {
    const [fairnessData, setFairnessData] = useState([]);
    const [distData, setDistData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getAggregatedTeamStats(),
            api.getScoreDistributions()
        ]).then(([fairRes, distRes]) => {
            setFairnessData(fairRes.data);
            setDistData(distRes.data);
            setLoading(false);
        });
    }, []);

    // Static Data for Composition Chart
    const compositionData = [
        { name: 'Feature Delivery', value: 40 },
        { name: 'Code Review', value: 30 },
        { name: 'Critical Fixes', value: 20 },
        { name: 'Architecture', value: 10 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-slate-50 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-4">Metrics & Methodology</h1>
                    <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                        ImpactLens uses a fair, transparency-first approach to workforce evaluation.
                        We distinguish between <strong>Activity</strong> (visibility) and <strong>Impact</strong> (value).
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* 1. Impact Composition */}
                    <ChartCard
                        title="How Impact is Calculated"
                        icon={CheckCircle2}
                        colorClass="bg-emerald-500 text-emerald-500"
                        caption="Impact Score is a weighted composite."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={compositionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {compositionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 2. Activity vs Impact */}
                    <ChartCard
                        title="Activity vs. Impact"
                        icon={EyeOff}
                        colorClass="bg-blue-500 text-blue-500"
                        caption="High activity ≠ High value. We expose the gap."
                    >
                        {loading ? <div className="h-full flex items-center justify-center text-slate-500">Loading...</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                    <Legend />
                                    <Bar dataKey="activity" name="Activity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="impact" name="Impact" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* 3. Silent Architect Logic */}
                    <ChartCard
                        title="Silent Architect Zone"
                        icon={Star}
                        colorClass="bg-amber-500 text-amber-500"
                        caption="Identifying high-value, low-visibility talent."
                    >
                        <div className="absolute inset-4 border-l-2 border-b-2 border-slate-700">
                            {/* Quadrant Lines */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-slate-700 border-dashed"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-px border-t border-slate-700 border-dashed"></div>

                            {/* Highlight Zone */}
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                <div className="text-center">
                                    <Star className="w-5 h-5 text-amber-500 mb-1 mx-auto" />
                                    <span className="text-amber-500 font-bold text-xs tracking-widest uppercase">Target Zone</span>
                                </div>
                            </div>

                            <span className="absolute -left-6 top-1/2 -rotate-90 text-xs text-slate-500">Impact</span>
                            <span className="absolute bottom-[-20px] left-1/2 text-xs text-slate-500">Activity</span>
                        </div>
                    </ChartCard>

                    {/* 4. Fairness */}
                    <ChartCard
                        title="Team Fairness"
                        icon={Shield}
                        colorClass="bg-purple-500 text-purple-500"
                        caption="Aggregated comparison protects individuals."
                    >
                        {loading ? <div className="h-full flex items-center justify-center text-slate-500">Loading...</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fairnessData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                    <Legend />
                                    <Bar dataKey="avgImpact" name="Avg Impact" fill="#10b981" barSize={15} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="avgActivity" name="Avg Activity" fill="#3b82f6" barSize={15} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* 5. Ethics (Full Width) */}
                    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" /> Ethical Guidelines
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-sm text-slate-400">
                                <span className="block text-white font-medium mb-1">No Surveillance</span>
                                No screen recording or mouse tracking.
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-sm text-slate-400">
                                <span className="block text-white font-medium mb-1">Outcome Focused</span>
                                Measuring shipped value, not hours online.
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-sm text-slate-400">
                                <span className="block text-white font-medium mb-1">Team Context</span>
                                Scores are relative to team constraints.
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-sm text-slate-400">
                                <span className="block text-white font-medium mb-1">Privacy First</span>
                                Individual scores private to direct managers.
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
