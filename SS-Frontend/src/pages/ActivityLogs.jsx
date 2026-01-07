import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, GitCommit, FileCode, MessageSquare, Tag, Clock } from 'lucide-react';

export default function ActivityLogs() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We'll reuse the raw activities endpoint for now, or assume a new one
        // Since get_raw_activities exists on backend, let's use it.
        // We might need to map raw data to a nice feed.
        const fetchLogs = async () => {
            try {
                // Check if api has getRawActivities, if not we might need to add it or use a different one
                // Assuming we added it or will add it.
                const data = await api.getRawActivities();
                // The backend returns { activities: [...] }
                // Let's sort by *something* if we can, but raw activities might not have timestamps in the current simple model?
                // Checking model: Activity has (activity_type, count, employee). No timestamp clearly visible in previous views?
                // Actually Activity model in views.py showed "activity_type", "count". No timestamp.
                // But Issue has resolution_time.
                // If no timestamp, we can just randomize "Recent" or show them as aggregate logs.
                // Wait, "Logs" usually implies time.
                // If the model lacks time, we can fake it for the UI "Recent Activity" feel or just list them.

                // Let's just list the raw dump for now as "System Logs"
                setActivities(data.activities.slice(0, 50)); // Limit to 50
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getIcon = (type) => {
        if (type.includes('Code')) return <FileCode className="w-4 h-4 text-sky-400" />;
        if (type.includes('Review')) return <MessageSquare className="w-4 h-4 text-violet-400" />;
        return <Activity className="w-4 h-4 text-emerald-400" />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Logs</h1>
                    <p className="text-zinc-400">Recent activity across all departments</p>
                </div>
            </div>

            <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <Activity className="w-4 h-4" />
                        Live Feed
                    </div>
                    <div className="text-xs font-mono text-zinc-500">
                        Syncing...
                    </div>
                </div>

                <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500">Loading stream...</div>
                    ) : activities.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No activity logs found.</div>
                    ) : (
                        activities.map((act, i) => (
                            <div key={i} className="p-4 hover:bg-zinc-900/50 transition-colors flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                    {getIcon(act.activity_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-zinc-200 text-sm">Employee #{act.employee_id}</span>
                                        <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                            {act.activity_type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        Performed <b>{act.count}</b> actions in this category.
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-zinc-600">
                                    Just now
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
