import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { TeamSelector } from '../components/TeamSelector';
import { ImpactActivityScatter } from '../components/ImpactActivityScatter';
import { Activity, Zap, Users, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import { SilentArchitectBadge } from '../components/SilentArchitectBadge';
import { EmployeeDrawer } from '../components/EmployeeDrawer';

export default function Dashboard() {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [teams, setTeams] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Teams on Mount and Handle Role
  useEffect(() => {
    api.getTeams()
      .then(res => {
        let availableTeams = res.data;
        const role = localStorage.getItem('user_role');

        // If employee, remove "All Teams" and default to the first actual team
        if (role === 'employee') {
          availableTeams = availableTeams.filter(t => t !== 'All Teams');
          setTeams(availableTeams);
          if (availableTeams.length > 0) {
            setSelectedTeam(availableTeams[0]); // Default to their specific team (simulated)
          }
        } else {
          setTeams(availableTeams);
        }
      })
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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
          <p className="text-zinc-400 font-medium animate-pulse">Synchronizing ecosystem data...</p>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-[#09090B] rounded-xl border border-red-900/50">
          <p className="text-red-400 font-medium">{error}</p>
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

  // Destructure for cleaner access
  const { employees: filteredEmployees, metrics: kpis, orgStats } = dashboardData;
  const isAllTeams = selectedTeam === 'All Teams';

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <EmployeeDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />

      <div className="space-y-8">

        {/* Dashboard Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Executive Overview</h2>
            <p className="text-slate-400 text-sm">Real-time workforce performance metrics.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#1E293B] p-1 rounded-lg border border-slate-700">
              <TeamSelector
                teams={teams}
                selectedTeam={selectedTeam}
                onSelect={setSelectedTeam}
              />
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Avg Impact Score"
            value={kpis.avgImpact}
            icon={Zap}
            trend={isAllTeams ? "Organization Average" : `Team Avg (Org: ${orgStats.avgImpact})`}
            className="border-emerald-500/20 bg-[#09090B] hover:border-emerald-500/30"
          />
          <KpiCard
            title="Avg Activity Score"
            value={kpis.avgActivity}
            icon={Activity}
            className="border-sky-500/20 bg-[#09090B] hover:border-sky-500/30"
          />
          <KpiCard
            title="Silent Architects"
            value={kpis.silentCount}
            icon={Star}
            className="border-amber-500/20 bg-[#09090B] hover:border-amber-500/30"
          />
          <KpiCard
            title="Total Contributors"
            value={kpis.total}
            icon={Users}
            className="border-zinc-700 bg-[#09090B]"
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

            <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Star className="w-24 h-24 text-amber-500 rotate-12" />
              </div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2 relative z-10 text-lg">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Contextual Insight
              </h3>
              <div className="space-y-4 relative z-10 text-zinc-300 leading-relaxed text-base">
                <p>
                  <strong className="text-white">{kpis.silentCount} contributors</strong> in this view are identified as
                  <span className="text-amber-400 font-bold"> Silent Architects</span>.
                  These individuals drive high business value through architectural decisions, mentorship, or critical fixes, despite lower visible activity output.
                </p>
                {!isAllTeams && (
                  <p className="border-t border-zinc-700 pt-4 mt-2 text-zinc-400">
                    The <span className="text-sky-400 font-medium">{selectedTeam}</span> team's average impact ({kpis.avgImpact}) is
                    <strong className={kpis.avgImpact >= orgStats.avgImpact ? "text-sky-400" : "text-amber-400"}>
                      {kpis.avgImpact >= orgStats.avgImpact ? " higher " : " lower "}
                    </strong>
                    than the Organization average ({orgStats.avgImpact}).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Top Contributors List */}
          <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[650px] shadow-sm">
            <div className="p-6 border-b border-zinc-800 bg-[#09090B] flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">Top Contributors</h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Ranked by Impact Score</p>
              </div>
              {!isAllTeams && <span className="px-2.5 py-1 bg-zinc-800 rounded text-[10px] text-sky-400 font-bold uppercase tracking-wider border border-zinc-700">{selectedTeam}</span>}
            </div>

            {isAllTeams ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 bg-[#09090B]">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-zinc-300">Select a specific team</p>
                <p className="text-xs mt-1 text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                  Individual rankings are hidden at the organization level to prevent unfair cross-functional comparisons.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-zinc-700">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-zinc-800 text-zinc-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3 font-medium">Employee</th>
                        <th className="px-6 py-3 text-right font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle">
                      {[...filteredEmployees]
                        .sort((a, b) => b.impactScore - a.impactScore)
                        .slice(0, 8)
                        .map((emp, idx) => (
                          <tr
                            key={emp.id}
                            className="group even:bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors cursor-pointer border-b border-zinc-800/50 last:border-0"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-zinc-500 font-bold w-4 text-center">{idx + 1}</span>
                                <div>
                                  <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{emp.name}</div>
                                  <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                                    {emp.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end gap-1">
                                <div className="font-mono font-bold text-sky-400 text-lg leading-none">{emp.impactScore}</div>
                                {emp.silentArchitect && <SilentArchitectBadge className="scale-75 origin-right" />}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {filteredEmployees.length > 8 && (
                    <div className="text-center py-4 text-xs text-zinc-500 italic">
                      + {filteredEmployees.length - 8} more contributors
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-[#09090B] text-center">
                  <button className="text-xs text-zinc-400 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors uppercase tracking-wider group">
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
