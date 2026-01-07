import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { TeamSelector } from '../components/TeamSelector';
import { ImpactActivityScatter } from '../components/ImpactActivityScatter';
import { Activity, Zap, Users, Star, ArrowUpRight, Loader2, Info, ChevronRight, LayoutDashboard } from 'lucide-react';
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
          <p className="text-slate-400 font-medium animate-pulse">Synchronizing ecosystem data...</p>
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
    <div className="min-h-screen p-6 md:p-10 text-slate-50 font-sans selection:bg-emerald-500/30">
      <EmployeeDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />

      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-medium text-sm tracking-wide">
              <LayoutDashboard className="w-4 h-4" />
              <span>Workforce Contribution Monitor</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
              ImpactLens
            </h1>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <p>Performance visibility for modern engineering teams.</p>
              <span className="text-slate-700">|</span>
              <Link to="/metrics" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium group">
                <Info className="w-4 h-4" /> Methodology
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 bg-slate-900/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onSelect={setSelectedTeam}
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Avg Impact Score"
            value={kpis.avgImpact}
            icon={Zap}
            trend={isAllTeams ? "Organization Average" : `Team Avg (Org: ${orgStats.avgImpact})`}
            className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
          />
          <KpiCard
            title="Avg Activity Score"
            value={kpis.avgActivity}
            icon={Activity}
            className="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10"
          />
          <KpiCard
            title="Silent Architects"
            value={kpis.silentCount}
            icon={Star}
            className="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
          />
          <KpiCard
            title="Total Contributors"
            value={kpis.total}
            icon={Users}
            className="border-white/10 bg-slate-900/30"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Chart Section (span 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <ImpactActivityScatter
              data={filteredEmployees}
              selectedTeam={selectedTeam}
              onNodeClick={setSelectedEmployee}
            />

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="w-24 h-24 text-amber-500 rotate-12" />
              </div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2 relative z-10 text-lg">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Contextual Insight
              </h3>
              <div className="space-y-4 relative z-10 text-slate-300 leading-relaxed text-base">
                <p>
                  <strong className="text-white">{kpis.silentCount} contributors</strong> in this view are identified as
                  <span className="text-amber-400 font-bold"> Silent Architects</span>.
                  These individuals drive high business value through architectural decisions, mentorship, or critical fixes, despite lower visible activity output.
                </p>
                {!isAllTeams && (
                  <p className="border-t border-white/5 pt-4 mt-2 text-slate-400">
                    The <span className="text-emerald-400 font-medium">{selectedTeam}</span> team's average impact ({kpis.avgImpact}) is
                    <strong className={kpis.avgImpact >= orgStats.avgImpact ? "text-emerald-400" : "text-amber-400"}>
                      {kpis.avgImpact >= orgStats.avgImpact ? " higher " : " lower "}
                    </strong>
                    than the Organization average ({orgStats.avgImpact}).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Top Contributors List */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-xl">
            <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">Top Contributors</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Ranked by Impact Score</p>
              </div>
              {!isAllTeams && <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{selectedTeam}</span>}
            </div>

            {isAllTeams ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900/50">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-slate-300">Select a specific team</p>
                <p className="text-xs mt-1 text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                  Individual rankings are hidden at the organization level to prevent unfair cross-functional comparisons.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-2 scrollbar-thin scrollbar-thumb-slate-800">
                  <table className="w-full text-sm text-left border-separate border-spacing-y-1">
                    <tbody className="align-middle">
                      {[...filteredEmployees]
                        .sort((a, b) => b.impactScore - a.impactScore)
                        .slice(0, 8)
                        .map((emp, idx) => (
                          <tr
                            key={emp.id}
                            className="group hover:bg-slate-800 transition-all cursor-pointer rounded-lg relative"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <td className="px-4 py-3 rounded-l-lg border-y border-l border-transparent group-hover:border-slate-700/50">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-slate-600 font-bold w-4">{idx + 1}</span>
                                <div>
                                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{emp.name}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                    {emp.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right rounded-r-lg border-y border-r border-transparent group-hover:border-slate-700/50">
                              <div className="flex flex-col items-end gap-1">
                                <div className="font-mono font-bold text-emerald-400 text-lg leading-none">{emp.impactScore}</div>
                                {emp.silentArchitect && <SilentArchitectBadge className="scale-75 origin-right" />}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {filteredEmployees.length > 8 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic">
                      + {filteredEmployees.length - 8} more contributors
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                  <button className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors uppercase tracking-wider group">
                    View Full Report <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
