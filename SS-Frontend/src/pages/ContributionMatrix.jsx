import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TeamSelector } from '../components/TeamSelector';
import { Loader2, Grid3x3, TrendingUp, Code, Filter, Download, Search } from 'lucide-react';

export default function ContributionMatrix() {
    const [selectedTeam, setSelectedTeam] = useState('All Teams');
    const [teams, setTeams] = useState([]);
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('count'); // 'count', 'lines', 'severity', 'complexity'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('total'); // 'total', 'name', 'team'

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

    // Fetch matrix data when team changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        console.log('Fetching contribution matrix for team:', selectedTeam);
        
        api.getContributionMatrix(selectedTeam)
            .then(data => {
                console.log('Contribution matrix loaded successfully:', data);
                setMatrixData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load contribution matrix", err);
                setError(err.message || 'Failed to load contribution matrix. Please check the console for details.');
                setLoading(false);
            });
    }, [selectedTeam]);

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
                    <p className="text-red-400 font-medium">Failed to load contribution matrix.</p>
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

    if (!matrixData) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Contribution Matrix</h1>
                        <p className="text-zinc-400 text-sm">Detailed breakdown of contributions by type and employee.</p>
                    </div>
                    <TeamSelector
                        teams={teams}
                        selectedTeam={selectedTeam}
                        onSelect={setSelectedTeam}
                    />
                </div>
                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-12 text-center">
                    <p className="text-zinc-500">Loading contribution data...</p>
                </div>
            </div>
        );
    }

    const { matrix = [], contribution_types = [] } = matrixData;
    
    if (!matrix || matrix.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Contribution Matrix</h1>
                        <p className="text-zinc-400 text-sm">Detailed breakdown of contributions by type and employee.</p>
                    </div>
                    <TeamSelector
                        teams={teams}
                        selectedTeam={selectedTeam}
                        onSelect={setSelectedTeam}
                    />
                </div>
                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-12 text-center">
                    <p className="text-zinc-500">No contribution data available for the selected team.</p>
                </div>
            </div>
        );
    }

    // Filter and sort employees
    let filteredMatrix = [...matrix];
    
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredMatrix = filteredMatrix.filter(emp =>
            emp.employee_name.toLowerCase().includes(q) ||
            emp.employee_role.toLowerCase().includes(q) ||
            emp.team_name.toLowerCase().includes(q)
        );
    }

    // Sort employees
    filteredMatrix.sort((a, b) => {
        switch (sortBy) {
            case 'total':
                return b.total_contributions - a.total_contributions;
            case 'name':
                return a.employee_name.localeCompare(b.employee_name);
            case 'team':
                return a.team_name.localeCompare(b.team_name);
            default:
                return 0;
        }
    });

    // Helper function to get cell value based on view mode
    const getCellValue = (employee, contributionType) => {
        const typeData = employee.by_type[contributionType] || {
            count: 0,
            total_lines: 0,
            by_severity: { MINOR: 0, MAJOR: 0, CRITICAL: 0 },
            by_complexity: { LOW: 0, MEDIUM: 0, HIGH: 0 }
        };

        switch (viewMode) {
            case 'count':
                return typeData.count;
            case 'lines':
                return typeData.total_lines;
            case 'severity':
                return {
                    MINOR: typeData.by_severity.MINOR,
                    MAJOR: typeData.by_severity.MAJOR,
                    CRITICAL: typeData.by_severity.CRITICAL
                };
            case 'complexity':
                return {
                    LOW: typeData.by_complexity.LOW,
                    MEDIUM: typeData.by_complexity.MEDIUM,
                    HIGH: typeData.by_complexity.HIGH
                };
            default:
                return typeData.count;
        }
    };

    // Helper function to get cell color intensity
    const getCellIntensity = (value) => {
        if (typeof value === 'object') {
            const total = Object.values(value).reduce((a, b) => a + b, 0);
            if (total === 0) return 'bg-zinc-900/30';
            const max = Math.max(...Object.values(value));
            if (max === 0) return 'bg-zinc-900/30';
            const intensity = Math.min(1, max / 10);
            return intensity > 0.7 ? 'bg-sky-500/40' : intensity > 0.4 ? 'bg-sky-500/25' : 'bg-sky-500/10';
        }
        
        if (value === 0) return 'bg-zinc-900/30';
        const maxValue = Math.max(...filteredMatrix.map(emp => {
            const val = getCellValue(emp, contribution_types[0]);
            return typeof val === 'object' ? Object.values(val).reduce((a, b) => a + b, 0) : val;
        }));
        if (maxValue === 0) return 'bg-zinc-900/30';
        const intensity = value / maxValue;
        return intensity > 0.7 ? 'bg-sky-500/40' : intensity > 0.4 ? 'bg-sky-500/25' : 'bg-sky-500/10';
    };

    // Calculate totals for each contribution type
    const typeTotals = {};
    contribution_types.forEach(type => {
        typeTotals[type] = filteredMatrix.reduce((sum, emp) => {
            const val = getCellValue(emp, type);
            return sum + (typeof val === 'object' ? Object.values(val).reduce((a, b) => a + b, 0) : val);
        }, 0);
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Grid3x3 className="w-6 h-6 text-sky-500" />
                        Contribution Matrix
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Detailed breakdown of contributions by type and employee.</p>
                </div>
                <TeamSelector
                    teams={teams}
                    selectedTeam={selectedTeam}
                    onSelect={setSelectedTeam}
                />
            </div>

            {/* Controls Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#09090B] border border-zinc-800 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search employees, roles, or teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        <option value="count">Count</option>
                        <option value="lines">Lines Changed</option>
                        <option value="severity">By Severity</option>
                        <option value="complexity">By Complexity</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        <option value="total">Sort by Total</option>
                        <option value="name">Sort by Name</option>
                        <option value="team">Sort by Team</option>
                    </select>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-800/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider sticky left-0 bg-zinc-800/50 z-20 border-r border-zinc-700">
                                    Employee
                                </th>
                                {contribution_types.map(type => (
                                    <th
                                        key={type}
                                        className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider min-w-[120px]"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="truncate max-w-[100px]">{type}</span>
                                            <span className="text-[10px] text-zinc-500 font-normal">
                                                {viewMode === 'count' && `(${typeTotals[type]})`}
                                                {viewMode === 'lines' && `(${typeTotals[type]} lines)`}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider border-l border-zinc-700">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredMatrix.map((employee) => (
                                <tr key={employee.employee_id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-4 py-3 sticky left-0 bg-[#09090B] z-10 border-r border-zinc-700 group-hover:bg-zinc-800/50">
                                        <div className="flex flex-col">
                                            <div className="font-medium text-zinc-200 group-hover:text-sky-400 transition-colors">
                                                {employee.employee_name}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-0.5">
                                                {employee.employee_role} • {employee.team_name}
                                            </div>
                                        </div>
                                    </td>
                                    {contribution_types.map(type => {
                                        const value = getCellValue(employee, type);
                                        const intensity = getCellIntensity(value);
                                        
                                        return (
                                            <td
                                                key={type}
                                                className={`px-4 py-3 text-center ${intensity} transition-colors`}
                                                title={`${type}: ${typeof value === 'object' ? JSON.stringify(value) : value}`}
                                            >
                                                {typeof value === 'object' ? (
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        {Object.entries(value).map(([key, val]) => (
                                                            val > 0 && (
                                                                <div key={key} className="flex items-center justify-center gap-1">
                                                                    <span className={`w-2 h-2 rounded-full ${
                                                                        key === 'CRITICAL' || key === 'HIGH' ? 'bg-red-500' :
                                                                        key === 'MAJOR' || key === 'MEDIUM' ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                                    }`}></span>
                                                                    <span className="text-zinc-300">{val}</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-zinc-200">
                                                        {value > 0 ? value : '-'}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-center border-l border-zinc-700">
                                        <div className="flex flex-col items-center">
                                            <span className="font-mono font-bold text-sky-400">
                                                {employee.total_contributions}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {employee.total_lines_changed.toLocaleString()} lines
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400">View Mode:</span>
                        <span className="text-zinc-200 font-medium capitalize">{viewMode}</span>
                    </div>
                    {(viewMode === 'severity' || viewMode === 'complexity') && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-zinc-400">High/Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span className="text-zinc-400">Medium/Major</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-zinc-400">Low/Minor</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-zinc-400">Total Employees:</span>
                        <span className="text-zinc-200 font-medium">{filteredMatrix.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
