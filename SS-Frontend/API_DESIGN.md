# ImpactLens API Design Specification

This document outlines the REST API endpoints required to power the ImpactLens frontend. 
The design prioritizes **privacy**, **fairness**, and **backend-driven scoring logic**, ensuring the frontend remains a lightweight visualization layer.

---

## 1. Core Metadata APIs

### `GET /api/v1/teams`
**Purpose**: Retrieve the list of all engineering teams available for filtering.
**Query Params**: None
**Consumer**: `TeamSelector` component
**Example Response**:
```json
{
  "data": ["Engineering", "Product", "Design", "Marketing"]
}
```

### `GET /api/v1/config/thresholds`
**Purpose**: Fetch configuration for visual thresholds (e.g., what constitutes a "Silent Architect"). Useful for dynamic frontend explanations.
**Query Params**: None
**Consumer**: `AboutMetrics.jsx`, `ImpactActivityScatter` (quadrant lines)
**Example Response**:
```json
{
  "silentArchitectThreshold": { "impact": 80, "activity": 50 },
  "highPerformerThreshold": { "impact": 80, "activity": 80 }
}
```

---

## 2. Dashboard APIs

### `GET /api/v1/dashboard/summary`
**Purpose**: Fetch aggregated KPIs for the Organization or a specific Team.
**Query Params**: 
- `team` (optional): Filter by team name (e.g., `?team=Engineering`). If omitted, returns Org-level stats.
**Consumer**: `Dashboard.jsx` (KPI Cards)
**Example Response**:
```json
{
  "totalEmployees": 42,
  "avgImpactScore": 78.5,
  "avgActivityScore": 65.2,
  "silentArchitectCount": 5,
  "lastUpdated": "2024-03-15T10:00:00Z"
}
```

### `GET /api/v1/dashboard/scatter`
**Purpose**: Retrieve anonymized or named data points for the Impact vs. Activity scatter plot.
**Query Params**: 
- `team` (optional): Filter by team.
**Consumer**: `ImpactActivityScatter.jsx`
**Example Response**:
```json
[
  {
    "id": 101,
    "name": "Alex Johnson",
    "role": "Senior Dev",
    "team": "Engineering",
    "impactScore": 92,
    "activityScore": 45,
    "silentArchitect": true
  },
  ...
]
```

### `GET /api/v1/dashboard/leaderboard`
**Purpose**: Get top contributors sorted by Impact Score. **Strictly limited** to within-team comparisons if a team is selected.
**Query Params**: 
- `team` (required): Team for which to show the leaderboard.
- `limit` (optional): Number of records (default 5).
**Consumer**: `Dashboard.jsx` (Leaderboard Table)
**Example Response**:
```json
[
  {
    "id": 101,
    "name": "Alex Johnson",
    "impactScore": 92,
    "role": "Senior Dev",
    "silentArchitect": true
  },
  ...
]
```

---

## 3. Employee APIs (Individual View)

### `GET /api/v1/employees/:id/breakdown`
**Purpose**: Retrieve the detailed composition of an employee's Impact Score.
**Query Params**: None
**Consumer**: `EmployeeDrawer.jsx`
**Example Response**:
```json
{
  "id": 101,
  "name": "Alex Johnson",
  "totalImpact": 92,
  "breakdown": [
    {
      "metric": "Code Reviews",
      "score": 95,
      "description": "Consistently reviews complex PRs, catching critical security flaws."
    },
    {
      "metric": "Bug Fixes",
      "score": 88,
      "description": "Fixed 3 high-priority production incidents this sprint."
    },
    {
      "metric": "Architecture",
      "score": 90,
      "description": "Designed the new scalable event bus system."
    }
  ],
  "insightText": "A classic Silent Architect profile: High impact through critical reviews and design, despite lower volume."
}
```

---

## 4. Metrics & Methodology APIs

### `GET /api/v1/metrics/distribution`
**Purpose**: Get histogram data showing how the organization is distributed across Impact and Activity scores. Used to visualize fairness and normality.
**Query Params**: None
**Consumer**: `AboutMetrics.jsx` (Distribution Charts)
**Example Response**:
```json
{
  "impactDistribution": [
    { "range": "0-20", "count": 2 },
    { "range": "20-40", "count": 5 },
    { "range": "40-60", "count": 15 },
    { "range": "60-80", "count": 12 },
    { "range": "80-100", "count": 8 }
  ]
}
```

### `GET /api/v1/metrics/weights`
**Purpose**: Expose the current weighting logic used by the backend to calculate Impact Score. Promotes transparency.
**Query Params**: None
**Consumer**: `AboutMetrics.jsx` (Pie Chart)
**Example Response**:
```json
[
  { "name": "Code Reviews", "value": 30 },
  { "name": "Bug Fixes", "value": 25 },
  { "name": "Architecture", "value": 25 },
  { "name": "Feature Delivery", "value": 20 }
]
```

---

## 5. Security & Fairness Constraints (Backend Logic)

1.  **No Raw Activity Logs**: The API never exposes raw git commits or login times. Only aggregated "Activity Scores" are sent.
2.  **Context-Aware Scoring**: The backend calculates `impactScore` relative to team expectations (e.g., a Senior Dev has different baselines than a Junior), but the API simply returns the final normalized score (0-100).
3.  **Cross-Team Blocking**: The `/leaderboard` endpoint should return an error or empty list if `team=All` to prevent unfair cross-department comparisons.
