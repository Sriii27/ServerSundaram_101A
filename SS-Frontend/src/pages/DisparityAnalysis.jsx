import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { TeamSelector } from '../components/TeamSelector';
import { ImpactActivityScatter } from '../components/ImpactActivityScatter';
import { GapBarChart } from '../components/GapBarChart';
import { DisparityGapChart } from '../components/DisparityGapChart';
import { EmployeeDrawer } from '../components/EmployeeDrawer';
import { 
    Loader2, TrendingUp, TrendingDown, Users, Sparkles, 
    BarChart3, Activity, Zap, Filter, Eye, EyeOff 
} from 'lucide-react';
import { SilentArchitectBadge } from '../components/SilentArchitectBadge';

export default function DisparityAnalysis() {
    const [selectedTeam, setSelectedTeam] = useState('All Teams');
    const [teams, setTeams] = useState([]);
    const [viewMode, setViewMode] = useState('scatter'); // 'scatter', 'gap', 'bars'
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Fetch teams on mount
    useEffect(() => {
        api.getTeams()
            .then(res => {
                let availableTeams = res.data;
                const role = localStorage.getItem('user_role');
                if (role === 'employee') {
                    availableTeams = availableTeams.filter(t => t !== 'All Teams');
                    setTeams(availableTeams);
                    if (availableTeams.length > 0) {
                        setSelectedTeam(availableTeams[0]);
                    }
                } else {
                    setTeams(availableTeams);
                }
            })
            .catch(err => console.error("Failed to load teams", err));
    }, []);

    // Use dashboard metrics hook
    const { metrics, loading, error } = useDashboardMetrics(selectedTeam);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4 max-w-md p-6 bg-[#09090B] rounded-xl border border-red-900/50">
                    <p className="text-red-400 font-medium">Failed to load disparity data.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { employees = [], summary } = metrics || {};

    // Calculate disparity statistics
    const silentArchitects = employees.filter(emp => emp.silentArchitect);
    const highDisparity = employees
        .map(emp => ({ ...emp, gap: emp.impactScore - emp.activityScore }))
        .filter(emp => emp.gap > 20)
        .sort((a, b) => b.gap - a.gap);

    const avgGap = employees.length > 0
        ? employees.reduce((sum, emp) => sum + (emp.impactScore - emp.activityScore), 0) / employees.length
        : 0;

    const handleEmployeeClick = (employee) => {
        if (typeof employee === 'object' && employee.id) {
            setSelectedEmployee(employee.id);
        } else if (typeof employee === 'number') {
            setSelectedEmployee(employee);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <EmployeeDrawer
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                employee={employees.find(e => e.id === selectedEmployee)}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-amber-500" />
                        Activity vs Impact Disparity
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">
                        Identifying hidden high-performers: those with high impact but low perceived activity
                    </p>
                </div>
                <TeamSelector
                    teams={teams}
                    selectedTeam={selectedTeam}
                    onSelect={setSelectedTeam}
                />
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400 text-sm">Silent Architects</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-400">{silentArchitects.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {employees.length > 0 ? ((silentArchitects.length / employees.length) * 100).toFixed(1) : 0}% of team
                    </div>
                </div>

                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400 text-sm">Avg Disparity</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className={`text-2xl font-bold ${avgGap > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {avgGap > 0 ? '+' : ''}{avgGap.toFixed(1)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Impact - Activity</div>
                </div>

                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400 text-sm">High Disparity</span>
                        <EyeOff className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-400">{highDisparity.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">Gap &gt; 20 points</div>
                </div>

                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400 text-sm">Total Employees</span>
                        <Users className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="text-2xl font-bold text-sky-400">{employees.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">Active contributors</div>
                </div>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2 p-4 bg-[#09090B] border border-zinc-800 rounded-xl">
                <Filter className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400 text-sm">View:</span>
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => setViewMode('scatter')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            viewMode === 'scatter'
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                    >
                        <Activity className="w-4 h-4 inline mr-2" />
                        Scatter Plot
                    </button>
                    <button
                        onClick={() => setViewMode('gap')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            viewMode === 'gap'
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Gap Analysis
                    </button>
                    <button
                        onClick={() => setViewMode('bars')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            viewMode === 'bars'
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Side-by-Side
                    </button>
                </div>
            </div>

            {/* Main Visualization */}
            <div className="bg-[#09090B] border border-zinc-800/50 rounded-2xl p-6 shadow-sm">
                {viewMode === 'scatter' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                                <Activity className="w-5 h-5 text-sky-500" />
                                Impact vs Activity Scatter Plot
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Each point represents an employee. <span className="text-amber-500 font-medium">Silent Architects</span> appear in the top-left quadrant (high impact, low activity).
                            </p>
                        </div>
                        <div className="h-[500px]">
                            <ImpactActivityScatter
                                data={employees}
                                selectedTeam={selectedTeam}
                                onPointClick={handleEmployeeClick}
                            />
                        </div>
                    </div>
                )}

                {viewMode === 'gap' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-sky-500" />
                                Disparity Gap Analysis
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Horizontal bars show the gap between impact and activity. Positive values indicate <span className="text-amber-500 font-medium">Silent Architects</span>.
                            </p>
                        </div>
                        <div className="h-[600px]">
                            <DisparityGapChart
                                data={employees}
                                onBarClick={handleEmployeeClick}
                            />
                        </div>
                    </div>
                )}

                {viewMode === 'bars' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-sky-500" />
                                Activity vs Impact Comparison
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Side-by-side comparison showing perceived activity (blue) vs actual impact (green). <span className="text-amber-500 font-medium">Silent Architects</span> are highlighted in amber.
                            </p>
                        </div>
                        <div className="h-[600px]">
                            <GapBarChart
                                data={employees}
                                onBarClick={handleEmployeeClick}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Silent Architects List */}
            {silentArchitects.length > 0 && (
                <div className="bg-[#09090B] border border-amber-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-white">Silent Architects</h2>
                        <span className="text-xs text-zinc-500 ml-2">({silentArchitects.length} identified)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {silentArchitects
                            .sort((a, b) => b.impactScore - a.impactScore)
                            .map((emp) => (
                                <div
                                    key={emp.id}
                                    onClick={() => handleEmployeeClick(emp)}
                                    className="bg-zinc-900/50 border border-amber-500/30 rounded-lg p-4 hover:border-amber-500/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white group-hover:text-amber-400 transition-colors">
                                                    {emp.name}
                                                </span>
                                                <SilentArchitectBadge size="sm" />
                                            </div>
                                            <div className="text-xs text-zinc-500">{emp.role} • {emp.team}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                                            <div className="text-[10px] text-emerald-400/80 uppercase font-bold mb-1">Impact</div>
                                            <div className="text-lg font-mono font-bold text-emerald-400">{emp.impactScore}</div>
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                                            <div className="text-[10px] text-blue-400/80 uppercase font-bold mb-1">Activity</div>
                                            <div className="text-lg font-mono font-bold text-blue-400">{emp.activityScore}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-zinc-800">
                                        <div className="text-xs text-zinc-400">
                                            Gap: <span className="text-amber-400 font-bold">+{(emp.impactScore - emp.activityScore).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
