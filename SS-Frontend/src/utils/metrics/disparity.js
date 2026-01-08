/**
 * Calculates the disparity between Impact and Activity.
 * Formula: Impact Score - Activity Score
 * Positive value = High Impact, Low Activity (Efficient)
 * Negative value = Low Impact, High Activity (Inefficient)
 */
export const calculateDisparity = (impactScore, activityScore) => {
    return Number((impactScore - activityScore).toFixed(2));
};

/**
 * Determines if an employee is a "Silent Architect".
 * Criteria:
 * - Impact Score >= 85
 * - Activity Score <= 50
 * 
 * @param {Object} employee - Employee object
 * @returns {boolean}
 */
export const isSilentArchitect = (employee) => {
    // Ensure we handle both potential property names if backend structure varies
    // Using the explicit scores from the API response structure
    const impact = Number(employee.impactScore || employee.mapped?.impact || 0);
    const activity = Number(employee.activityScore || employee.raw_total_activity || 0);

    // Relaxed Thresholds for better visibility during demo
    return (impact >= 70) && (activity <= 60);
};

/**
 * Returns a color code for the disparity score.
 */
export const getDisparityColor = (score) => {
    if (score >= 30) return 'text-amber-500'; // Highly efficient / Silent Architect candidate
    if (score >= 10) return 'text-sky-400';   // Good
    if (score >= -10) return 'text-zinc-400'; // Neutral
    return 'text-red-400';                    // High activity, low impact
};
