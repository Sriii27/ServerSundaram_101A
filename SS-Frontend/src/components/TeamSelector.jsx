import React from 'react';
import { ChevronDown } from 'lucide-react';

export function TeamSelector({ teams, selectedTeam, onSelect }) {
  return (
    <div className="relative inline-block text-left">
      <div className="relative">
        <select
          value={selectedTeam}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none w-full bg-slate-900 border border-slate-700 hover:border-slate-500 text-white py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          {teams.map((team) => (
            <option key={team} value={team} className="bg-slate-900 text-white">
              {team}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}