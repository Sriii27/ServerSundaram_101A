import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell } from 'recharts';
import { cn } from '../lib/utils';
import { SilentArchitectBadge } from './SilentArchitectBadge';
import { Star } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Map array to object for easier access in tooltip, handling potential missing data
    const breakdown = (data.impactBreakdown || []).reduce((acc, curr) => {
      acc[curr.metric] = curr.score;
      return acc;
    }, {});

    return (
      <div className="bg-[#09090B] border border-zinc-800 p-4 rounded-xl shadow-xl min-w-[220px] z-50">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <span className="font-bold text-white text-base tracking-tight">{data.name}</span>
          {data.silentArchitect && <SilentArchitectBadge className="scale-75 origin-left" />}
        </div>
        <p className="text-zinc-400 text-xs font-medium mb-3 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{data.role}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
          <span className="text-zinc-300">{data.team}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
            <span className="block text-emerald-400/80 mb-0.5 font-bold uppercase text-[10px]">Impact</span>
            <span className="font-mono text-white text-lg font-bold">{data.impactScore}</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
            <span className="block text-blue-400/80 mb-0.5 font-bold uppercase text-[10px]">Activity</span>
            <span className="font-mono text-white text-lg font-bold">{data.activityScore}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Top Contributions</p>
          {(data.impactBreakdown || []).slice(0, 3).map((item) => (
            <div key={item.metric} className="flex justify-between items-center group">
              <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{item.metric}</span>
              <span className={`font-mono font-medium ${item.score > 80 ? 'text-emerald-400' : 'text-slate-400'}`}>{item.stats.count}</span>
            </div>
          ))}
        </div>

        {data.silentArchitect && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-amber-500 font-bold text-xs bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-xl">
            <Star className="w-3.5 h-3.5 fill-current" /> SILENT ARCHITECT DETECTED
          </div>
        )}
      </div>
    );
  }
  return null;
};

const TEAM_COLORS = {
  "Engineering": "#3b82f6", // Blue
  "Product": "#a855f7",     // Purple
  "Design": "#ec4899",      // Pink
  "Marketing": "#06b6d4",   // Cyan
  "Default": "#64748b"      // Slate
};

export function ImpactActivityScatter({ data, selectedTeam, onNodeClick }) {
  const isAllTeams = selectedTeam === 'All Teams';

  const getFillColor = (entry) => {
    if (entry.silentArchitect) return '#f59e0b'; // Amber for Silent Architects (Priority)
    if (isAllTeams) return TEAM_COLORS[entry.team] || TEAM_COLORS.Default;
    return '#3b82f6'; // Default blue for single team view non-silent
  };

  return (
    <div className="h-[500px] w-full bg-[#09090B] border border-zinc-800 rounded-3xl p-6 shadow-sm relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-semibold text-white">Impact vs. Activity Distribution</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300"></span>
            <span className="text-zinc-300 font-medium">Silent Architect</span>
          </div>
          {isAllTeams ? (
            Object.entries(TEAM_COLORS).filter(([k]) => k !== 'Default').map(([team, color]) => (
              <div key={team} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-zinc-400">{team}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-zinc-400">Contributor</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            type="number"
            dataKey="activityScore"
            name="Activity"
            domain={[0, 100]}
            tick={{ fill: '#64748b' }}
            stroke="#334155"
            label={{ value: 'Perceived Activity Score', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="impactScore"
            name="Impact"
            domain={[0, 100]}
            tick={{ fill: '#64748b' }}
            stroke="#334155"
            label={{ value: 'Actual Impact Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />

          {/* Quadrant Lines (Aligned with Silent Architect Thresholds) */}
          <ReferenceLine x={60} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Activity Threshold', position: 'insideTop', fill: '#475569', fontSize: 10 }} />
          <ReferenceLine y={65} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Impact Threshold', position: 'insideRight', fill: '#475569', fontSize: 10 }} />

          {/* Quadrant Labels */}
          <ReferenceLine y={95} x={95} label={{ value: 'High Performers', position: 'insideTopRight', fill: '#10b981', fontSize: 13, fontWeight: 700 }} stroke="none" />
          <ReferenceLine y={95} x={5} label={{ value: 'Silent Architects', position: 'insideTopLeft', fill: '#fbbf24', fontSize: 13, fontWeight: 700 }} stroke="none" />
          <ReferenceLine y={5} x={95} label={{ value: 'Visible Activity', position: 'insideBottomRight', fill: '#60a5fa', fontSize: 13, fontWeight: 500 }} stroke="none" />
          <ReferenceLine y={5} x={5} label={{ value: 'Low Engagement', position: 'insideBottomLeft', fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} stroke="none" />

          <Scatter name="Employees" data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getFillColor(entry)}
                stroke={entry.silentArchitect ? '#fff' : 'none'}
                strokeWidth={entry.silentArchitect ? 2 : 0}
                r={entry.silentArchitect ? 8 : 6}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => onNodeClick && onNodeClick(entry)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}