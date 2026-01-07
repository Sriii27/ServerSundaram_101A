import { employees as rawEmployees, teams as rawTeams } from '../data/mockData';

const DELAY_MS = 800; // Simulate network latency

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Centralized Business Logic
const isSilentArchitect = (impact, activity) => impact >= 85 && activity <= 50;

const processEmployees = (data) => {
    return data.map(emp => ({
        ...emp,
        silentArchitect: isSilentArchitect(emp.impactScore, emp.activityScore)
    }));
};

export const api = {
    /**
     * Fetch available teams
     */
    async getTeams() {
        await delay(DELAY_MS / 2); // Faster than data fetch
        return {
            data: rawTeams,
            meta: { count: rawTeams.length }
        };
    },

    /**
     * Fetch complete dashboard dataset for a specific team view
     * Returns employees, current view metrics, and org-wide comparison stats
     */
    async getDashboardData(teamFilter = 'All Teams') {
        await delay(DELAY_MS);

        try {
            // 1. Process all data (Simulating database processing)
            const allProcessed = processEmployees(rawEmployees);

            // 2. Calculate Organization-wide Stats (for comparisons)
            const orgTotalImpact = allProcessed.reduce((acc, curr) => acc + curr.impactScore, 0);
            const orgAvgImpact = allProcessed.length > 0
                ? Math.round(orgTotalImpact / allProcessed.length)
                : 0;

            // 3. Filter for requested view
            const isAllTeams = teamFilter === 'All Teams';
            const filteredList = isAllTeams
                ? allProcessed
                : allProcessed.filter(e => e.team === teamFilter);

            // 4. Calculate Metrics for Current View
            const total = filteredList.length;
            const metrics = total === 0
                ? { avgImpact: 0, avgActivity: 0, silentCount: 0, total: 0 }
                : {
                    avgImpact: Math.round(filteredList.reduce((acc, curr) => acc + curr.impactScore, 0) / total),
                    avgActivity: Math.round(filteredList.reduce((acc, curr) => acc + curr.activityScore, 0) / total),
                    silentCount: filteredList.filter(e => e.silentArchitect).length,
                    total
                };

            return {
                data: {
                    employees: filteredList,
                    metrics,
                    orgStats: {
                        avgImpact: orgAvgImpact
                    }
                },
                meta: {
                    filter: teamFilter,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error("Mock API Error:", error);
            throw new Error("Failed to fetch dashboard data");
        }
    },

    /**
     * Fetch details for a single employee
     */
    async getEmployeeDetails(id) {
        await delay(DELAY_MS / 2);
        const emp = rawEmployees.find(e => e.id === id);
        if (!emp) throw new Error("Employee not found");

        return {
            data: {
                ...emp,
                silentArchitect: isSilentArchitect(emp.impactScore, emp.activityScore)
            }
        };
    },

    /**
     * Fetch aggregated stats for the "Fairness" chart
     */
    async getAggregatedTeamStats() {
        await delay(DELAY_MS / 2);
        const teams = rawTeams.filter(t => t !== 'All Teams');
        const allProcessed = processEmployees(rawEmployees);

        const data = teams.map(teamName => {
            const teamEmps = allProcessed.filter(e => e.team === teamName);
            if (teamEmps.length === 0) return { name: teamName, avgImpact: 0, avgActivity: 0 };

            const totalImp = teamEmps.reduce((s, c) => s + c.impactScore, 0);
            const totalAct = teamEmps.reduce((s, c) => s + c.activityScore, 0);

            return {
                name: teamName,
                avgImpact: Math.round(totalImp / teamEmps.length),
                avgActivity: Math.round(totalAct / teamEmps.length)
            };
        });

        return { data };
    },

    /**
     * Fetch distribution data for the histogram
     */
    async getScoreDistributions() {
        await delay(DELAY_MS / 2);
        const allProcessed = processEmployees(rawEmployees);

        // Buckets: 0-20, 21-40, 41-60, 61-80, 81-100
        const buckets = [
            { range: '0-20', activity: 0, impact: 0 },
            { range: '21-40', activity: 0, impact: 0 },
            { range: '41-60', activity: 0, impact: 0 },
            { range: '61-80', activity: 0, impact: 0 },
            { range: '81-100', activity: 0, impact: 0 },
        ];

        allProcessed.forEach(e => {
            const actIdx = Math.min(Math.floor(e.activityScore / 20.001), 4);
            const impIdx = Math.min(Math.floor(e.impactScore / 20.001), 4);
            buckets[actIdx].activity++;
            buckets[impIdx].impact++;
        });

        return { data: buckets };
    }
};
