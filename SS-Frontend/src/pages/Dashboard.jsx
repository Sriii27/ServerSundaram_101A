import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'; // Hook for frontend calc
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
            setSelectedTeam(availableTeams[0]);
          }
        } else {
          setTeams(availableTeams);
        }
      })
      .catch(err => console.error("Failed to load teams", err));
  }, []);

  // 2. Use Frontend Metrics Calculation Hook
  // This replaces backend aggregation. The hook fetches raw data once and re-calculates on filter change.
  const { metrics, loading, error } = useDashboardMetrics(selectedTeam);

  // Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
          <p className="text-zinc-400 font-medium animate-pulse">Calculating workforce metrics...</p>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-[#09090B] rounded-xl border border-red-900/50">
          <p className="text-red-400 font-medium">Failed to load ecosystem data.</p>
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

  // Destructure calculated metrics
  const { employees: filteredEmployees, summary, leaderboard } = metrics;
  const isAllTeams = selectedTeam === 'All Teams';

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <EmployeeDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={filteredEmployees.find(e => e.id === selectedEmployee)}
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Workforce Ecosystem
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Real-time performance analytics & impact tracking</p>
        </div>

        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Team Impact"
          value={summary.avgImpact}
          icon={Zap}
          trend={isAllTeams ? "+2.4%" : "+5.1%"} // Simulated trends for demo
          trendUp={true}
          description="Average impact score"
        />
        <KpiCard
          title="Team Activity"
          value={summary.avgActivity}
          icon={Activity}
          trend={isAllTeams ? "-1.2%" : "+0.8%"}
          trendUp={!isAllTeams}
          description="Average activity score"
        />
        <KpiCard
          title="Silent Architects"
          value={summary.silentCount}
          icon={Users}
          description="High impact, low visibility"
          highlight={true}
        />
        <KpiCard
          title="Total Workforce"
          value={summary.totalEmployees}
          icon={Users}
          description="Active contributors"
        />
      </div>

      {/* Main Content Grid: Scatter Plot + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Interactive Scatter Plot */}
        <div className="lg:col-span-2 bg-[#09090B] border border-zinc-800/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" />
                Impact vs. Activity
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Identifying hidden high-performers. Top-left quadrant represents <span className="text-amber-500 font-medium">Silent Architects</span>.
              </p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ImpactActivityScatter
              data={filteredEmployees}
              onPointClick={(id) => setSelectedEmployee(id)}
            />
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="lg:col-span-1 bg-[#09090B] border border-zinc-800/50 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top Contributors
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Highest impact scores across the team.
            </p>
          </div>

          <div className="flex-grow overflow-auto">
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800/50">
                  <thead className="bg-[#09090B] sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider w-[70%]">
                        Contributor Profile
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider w-[30%]">
                        Impact Score
                      </th>
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
                          onClick={() => setSelectedEmployee(emp.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className={`
                                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5
                                ${idx === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  idx === 1 ? 'bg-zinc-700/50 text-zinc-300' :
                                    idx === 2 ? 'bg-amber-900/20 text-amber-700' : 'bg-zinc-800 text-zinc-500'}
                              `}>
                                #{idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-zinc-200 group-hover:text-white transition-colors flex flex-wrap items-center gap-2">
                                  <span className="whitespace-normal break-words leading-tight">{emp.name}</span>
                                  {emp.silentArchitect && <SilentArchitectBadge size="sm" />}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5 whitespace-normal break-words leading-tight">
                                  {emp.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right align-top pt-5">
                            <span className="font-mono font-bold text-sky-400 group-hover:text-sky-300 transition-colors text-sm">
                              {emp.impactScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

              </div>
            </>
          </div >

        </div >
      </div >
    </div >
  );
}
