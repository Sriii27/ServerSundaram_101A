import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { SilentArchitectBadge } from './SilentArchitectBadge';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gap = data.gap;
    const percentage = ((gap / data.impactScore) * 100).toFixed(1);
    
    return (
      <div className="bg-[#09090B] border border-zinc-800 p-4 rounded-xl shadow-xl min-w-[220px] z-50">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <span className="font-bold text-white text-base">{data.name}</span>
          {data.silentArchitect && <SilentArchitectBadge className="scale-75 origin-left" />}
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Impact:</span>
            <span className="font-mono font-bold text-emerald-400">{data.impactScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Activity:</span>
            <span className="font-mono font-bold text-blue-400">{data.activityScore}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-zinc-300 font-semibold">Gap:</span>
            <span className={`font-mono font-bold text-lg ${gap > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {gap > 0 ? '+' : ''}{gap.toFixed(1)}
            </span>
          </div>
          <div className="text-zinc-500 text-[10px] mt-1">
            {gap > 0 ? `${percentage}% higher impact than perceived` : 'Impact matches activity'}
          </div>
          {data.silentArchitect && (
            <div className="mt-2 pt-2 border-t border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase">
              ⭐ Silent Architect
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function DisparityGapChart({ data, onBarClick }) {
  // Calculate gap (impact - activity) for each employee
  const gapData = data
    .map(emp => ({
      ...emp,
      gap: emp.impactScore - emp.activityScore,
      name: emp.name.length > 18 ? emp.name.substring(0, 18) + '...' : emp.name
    }))
    .sort((a, b) => b.gap - a.gap); // Sort by gap descending

  const maxGap = Math.max(...gapData.map(d => Math.abs(d.gap)));
  const silentArchitects = gapData.filter(d => d.silentArchitect);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={gapData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            type="number"
            domain={[-maxGap * 1.1, maxGap * 1.1]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="#334155"
            label={{ value: 'Disparity Gap (Impact - Activity)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="#334155"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />
          
          <Bar
            dataKey="gap"
            name="Impact - Activity Gap"
            radius={[0, 4, 4, 0]}
            onClick={onBarClick}
            className="cursor-pointer hover:opacity-80"
          >
            {gapData.map((entry, index) => {
              const isSilent = entry.silentArchitect;
              const isPositive = entry.gap > 0;
              
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    isSilent
                      ? '#f59e0b' // Amber for silent architects
                      : isPositive
                      ? '#10b981' // Green for positive gap
                      : '#64748b' // Gray for negative/zero gap
                  }
                  stroke={isSilent ? '#fff' : 'none'}
                  strokeWidth={isSilent ? 2 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>Silent Architects ({silentArchitects.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>Positive Gap</span>
          </div>
        </div>
        <div className="text-zinc-500">
          Avg Gap: {((gapData.reduce((sum, d) => sum + d.gap, 0) / gapData.length) || 0).toFixed(1)}
        </div>
      </div>
    </div>
  );
}
