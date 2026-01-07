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
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl ring-1 ring-black/5 min-w-[200px] z-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">{data.name}</span>
          {data.silentArchitect && <SilentArchitectBadge className="scale-75 origin-left" />}
        </div>
        <p className="text-slate-400 text-sm mb-3">{data.role} &bull; <span className="text-slate-300">{data.team}</span></p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs border-b border-slate-800 pb-3">
          <div className="flex justify-between"><span className="text-emerald-400">Impact:</span> <span className="font-mono text-white">{data.impactScore}</span></div>
          <div className="flex justify-between"><span className="text-blue-400">Activity:</span> <span className="font-mono text-white">{data.activityScore}</span></div>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Top Contributions</p>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Bug Fixes</span>
            <span className={`font-mono ${breakdown['Bug Fixes'] > 80 ? 'text-emerald-400' : 'text-slate-300'}`}>{breakdown['Bug Fixes'] || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Code Reviews</span>
            <span className={`font-mono ${breakdown['Code Reviews'] > 80 ? 'text-emerald-400' : 'text-slate-300'}`}>{breakdown['Code Reviews'] || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Architecture</span>
            <span className={`font-mono ${breakdown['Architecture'] > 80 ? 'text-emerald-400' : 'text-slate-300'}`}>{breakdown['Architecture'] || 0}</span>
          </div>
        </div>

        {data.silentArchitect && (
          <div className="mt-3 pt-2 border-t border-amber-500/30 flex items-center gap-2 text-amber-500 font-medium text-xs">
            <Star className="w-3 h-3 fill-current" /> Silent Architect
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
    <div className="h-[500px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-semibold text-white">Impact vs. Activity Distribution</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300"></span>
            <span className="text-slate-300 font-medium">Silent Architect</span>
          </div>
          {isAllTeams ? (
            Object.entries(TEAM_COLORS).filter(([k]) => k !== 'Default').map(([team, color]) => (
              <div key={team} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-slate-400">{team}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-400">Contributor</span>
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

          {/* Quadrant Lines */}
          <ReferenceLine x={50} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />

          {/* Quadrant Labels */}
          <ReferenceLine y={95} x={95} label={{ value: 'High Performers', position: 'insideTopRight', fill: '#10b981', fontSize: 13, fontWeight: 700 }} stroke="none" />
          <ReferenceLine y={95} x={5} label={{ value: 'Hidden Gems', position: 'insideTopLeft', fill: '#fbbf24', fontSize: 13, fontWeight: 700 }} stroke="none" />
          <ReferenceLine y={5} x={95} label={{ value: 'Over-Visible', position: 'insideBottomRight', fill: '#60a5fa', fontSize: 13, fontWeight: 500 }} stroke="none" />
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