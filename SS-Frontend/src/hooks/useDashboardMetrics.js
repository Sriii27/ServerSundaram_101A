import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { calculateDisparity, isSilentArchitect } from '../utils/metrics/disparity';

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

                // ENRICH DATA: Calculate Disparity & Re-evaluate Silent Architect Status
                const enrichedEmployees = scatterData.map(emp => {
                    return {
                        ...emp,
                        disparityScore: calculateDisparity(emp.impactScore, emp.activityScore),
                        isSilentArchitect: isSilentArchitect(emp) // Override/Set based on strict frontend rules
                    };
                });

                // Get Top 5 by Disparity (High Impact, Low Activity)
                const topDisparity = [...enrichedEmployees]
                    .sort((a, b) => b.disparityScore - a.disparityScore)
                    .slice(0, 5);

                setMetrics({
                    employees: enrichedEmployees,
                    summary: {
                        avgImpact: summaryData.avgImpactScore,
                        avgActivity: summaryData.avgActivityScore,
                        silentCount: enrichedEmployees.filter(e => e.isSilentArchitect).length, // Recount based on new rule
                        totalEmployees: summaryData.totalEmployees
                    },
                    leaderboard: [...enrichedEmployees].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5),
                    disparityList: topDisparity
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
