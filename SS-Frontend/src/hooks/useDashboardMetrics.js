import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useDashboardMetrics(teamFilter) {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch pre-calculated data from Backend
                const [scatterData, summaryData] = await Promise.all([
                    api.getDashboardScatter(teamFilter),
                    api.getDashboardSummary(teamFilter)
                ]);

                setMetrics({
                    employees: scatterData,
                    summary: {
                        avgImpact: summaryData.avgImpactScore,
                        avgActivity: summaryData.avgActivityScore,
                        silentCount: summaryData.silentArchitectCount,
                        totalEmployees: summaryData.totalEmployees
                    },
                    leaderboard: [...scatterData].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5)
                });
            } catch (err) {
                console.error("Failed to fetch dashboard metrics", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamFilter]);

    return { metrics, loading, error };
}
