import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { SilentArchitectBadge } from './SilentArchitectBadge';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gap = data.impactScore - data.activityScore;
    
    return (
      <div className="bg-[#09090B] border border-zinc-800 p-4 rounded-xl shadow-xl min-w-[200px] z-50">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <span className="font-bold text-white text-base">{data.name}</span>
          {data.silentArchitect && <SilentArchitectBadge className="scale-75 origin-left" />}
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Impact Score:</span>
            <span className="font-mono font-bold text-emerald-400">{data.impactScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Activity Score:</span>
            <span className="font-mono font-bold text-blue-400">{data.activityScore}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-zinc-300 font-semibold">Disparity Gap:</span>
            <span className={`font-mono font-bold ${gap > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {gap > 0 ? '+' : ''}{gap.toFixed(1)}
            </span>
          </div>
          {data.silentArchitect && (
            <div className="mt-2 pt-2 border-t border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase">
              Silent Architect - High Impact, Low Visibility
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function GapBarChart({ data, onBarClick }) {
  // Sort by disparity gap (impact - activity) descending
  const sortedData = [...data]
    .map(emp => ({
      ...emp,
      gap: emp.impactScore - emp.activityScore,
      name: emp.name.length > 15 ? emp.name.substring(0, 15) + '...' : emp.name
    }))
    .sort((a, b) => b.gap - a.gap);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="#334155"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#64748b' }}
            stroke="#334155"
            label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
            iconType="rect"
          />
          <Bar
            dataKey="activityScore"
            name="Perceived Activity"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            onClick={onBarClick}
            className="cursor-pointer hover:opacity-80"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`activity-${index}`}
                fill={entry.silentArchitect ? '#f59e0b' : '#3b82f6'}
                stroke={entry.silentArchitect ? '#fff' : 'none'}
                strokeWidth={entry.silentArchitect ? 2 : 0}
              />
            ))}
          </Bar>
          <Bar
            dataKey="impactScore"
            name="Actual Impact"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            onClick={onBarClick}
            className="cursor-pointer hover:opacity-80"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`impact-${index}`}
                fill={entry.silentArchitect ? '#f59e0b' : '#10b981'}
                stroke={entry.silentArchitect ? '#fff' : 'none'}
                strokeWidth={entry.silentArchitect ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
