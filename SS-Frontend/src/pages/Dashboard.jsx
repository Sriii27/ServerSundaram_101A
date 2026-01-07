import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { TeamSelector } from '../components/TeamSelector';
import { ImpactActivityScatter } from '../components/ImpactActivityScatter';
import { Activity, Zap, Users, Star, ArrowUpRight, Loader2, Info } from 'lucide-react';
import { SilentArchitectBadge } from '../components/SilentArchitectBadge';
import { Link } from 'react-router-dom';
import { EmployeeDrawer } from '../components/EmployeeDrawer';

export default function Dashboard() {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [teams, setTeams] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Teams on Mount
  useEffect(() => {
    api.getTeams()
      .then(res => setTeams(res.data))
      .catch(err => console.error("Failed to load teams", err));
  }, []);

  // 2. Fetch Dashboard Data when Team Changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api.getDashboardData(selectedTeam)
      .then(response => {
        if (mounted) {
          setDashboardData(response.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError("Failed to load dashboard data. Please try again.");
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [selectedTeam]);

  // Loading State UI
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Loading ecosystem data...</p>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-slate-900 rounded-xl border border-red-900/50">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Destructure for cleaner access
  const { employees: filteredEmployees, metrics: kpis, orgStats } = dashboardData;
  const isAllTeams = selectedTeam === 'All Teams';

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-50 font-sans">
      <EmployeeDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
              Team Contribution Overview
            </h1>
            <div className="flex items-center gap-4 text-slate-400">
              <p>Employee comparisons are shown within teams to ensure fair evaluation.</p>
              <span className="text-slate-700">|</span>
              <Link to="/metrics" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                <Info className="w-4 h-4" /> Methodology & Metrics
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onSelect={setSelectedTeam}
            />
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
              Viewing: <span className="text-white">{selectedTeam} {isAllTeams && '(Aggregated)'}</span>
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Avg Impact Score"
            value={kpis.avgImpact}
            icon={Zap}
            trend={isAllTeams ? "Org Avg" : "Team Avg"}
            className="border-emerald-500/20"
          />
          <KpiCard
            title="Avg Activity Score"
            value={kpis.avgActivity}
            icon={Activity}
            className="border-blue-500/20"
          />
          <KpiCard
            title="Silent Architects"
            value={kpis.silentCount}
            icon={Star}
            className="border-amber-500/20 bg-amber-500/5"
          />
          <KpiCard
            title="Total Employees"
            value={kpis.total}
            icon={Users}
            className="border-slate-800"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Chart Section (span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <ImpactActivityScatter
              data={filteredEmployees}
              selectedTeam={selectedTeam}
              onNodeClick={setSelectedEmployee}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Insight
              </h3>
              <div className="space-y-4">
                <p className="text-slate-300">
                  <strong className="text-white">{kpis.silentCount} contributors</strong> in this view are
                  <span className="text-amber-500 font-medium"> Silent Architects</span> (High Impact, Low Activity).
                  Ensure their contributions are recognized despite lower visibility.
                </p>
                {!isAllTeams && (
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-slate-400 text-sm">
                      <span className="text-emerald-400 font-medium">{selectedTeam}</span> avg impact ({kpis.avgImpact}) is
                      <strong className={kpis.avgImpact >= orgStats.avgImpact ? "text-emerald-400" : "text-amber-400"}>
                        {kpis.avgImpact >= orgStats.avgImpact ? " higher " : " lower "}
                      </strong>
                      than the Organization average ({orgStats.avgImpact}).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Top Contributors List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">Top Impact Contributors</h3>
              {!isAllTeams && <span className="text-xs text-slate-500 uppercase">{selectedTeam}</span>}
            </div>

            {isAllTeams ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm">Select a specific team to view individual rankings.</p>
                <p className="text-xs mt-2 text-slate-600">Cross-team individual comparison is disabled.</p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-2">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2 text-right">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[...filteredEmployees]
                        .sort((a, b) => b.impactScore - a.impactScore)
                        .slice(0, 5)
                        .map(emp => (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <td className="px-3 py-3">
                              <div className="font-medium text-white">{emp.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                {emp.role}
                                {emp.silentArchitect && <SilentArchitectBadge className="scale-75 origin-left px-1.5 py-0" />}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-medium text-emerald-400">
                              {emp.impactScore}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                  <button className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors">
                    Full Team Report <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
