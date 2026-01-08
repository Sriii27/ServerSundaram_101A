# Scoring Engine Equations Documentation

## Overview
The scoring engine calculates employee performance scores using a combination of activity (quantity) and impact (quality) metrics.

---

## 1. Activity Score (Quantity - Capped at 30)

**Formula:**
```
Activity Score = min(
    log₁₀(1 + total_activities) 
    + 0.5 × log₁₀(1 + pull_requests_count)
    + 0.3 × log₁₀(1 + issues_resolved_count),
    30
)
```

**Components:**
- `total_activities`: Sum of all activity counts for the employee
- `pull_requests_count`: Total number of pull requests
- `issues_resolved_count`: Total number of issues with status="CLOSED"

**Why Logarithmic?**
- Prevents spammy behavior from dominating
- Rewards consistent activity over time
- Caps maximum score at 30

---

## 2. Impact Score (Quality - Capped at 100)

**Formula:**
```
Impact Score = min(
    Contribution Impact + Influence Impact,
    100
)
```

### 2.1 Contribution Impact

**Formula:**
```
Contribution Impact = Σ (Base Score × Multiplier)
```

**Base Score:**
```
Base Score = SEVERITY_WEIGHT × COMPLEXITY_WEIGHT
```

**Severity Weights:**
- Critical: 5
- Major: 4
- Minor: 2
- Low: 1

**Complexity Weights:**
- High: 4
- Medium: 2
- Low: 1

**Multipliers:**

**Bug Fixes:**
```
Multiplier = 1.5
+ 0.3 (if severity = "critical")
+ 0.3 (if linked issue resolved within 24 hours)
```

**Features:**
```
Multiplier = 1.2
+ 0.2 (if has approved RFC/Design Doc)
+ 0.3 (if has architecture/design review)
```

### 2.2 Influence Impact

**Documents:**
```
Impact += {
    "RFC": 10,
    "Design Doc": 12,
    "Architecture": 15,
    "Postmortem": 8
}
+ 2 (if scope is "platform" or "architecture")
```

**Meetings:**
```
Impact += MEETING_OUTCOME_WEIGHT[outcome_type]
+ 2 (if related_entity is "ARCHITECTURE" or "DOCUMENT")
```

**Meeting Outcome Weights:**
- APPROVED: 4
- FOLLOW_UP: 3
- ACTION_ITEMS: 2
- COMPLETED: 1

**Mentorship:**
```
Impact += 5 (base)
+ 2 (if outcome contains "design", "architecture", or "scalable")
```

---

## 3. Final Score

**Formula:**
```
Final Score = (0.75 × Impact Score) + (0.25 × Activity Score)
```

**Weighting:**
- 75% Impact (Quality)
- 25% Activity (Quantity)

---

## 4. Silent Architect Classification

**Condition:**
```
Silent Architect = (Impact Score ≥ 65) AND (Activity Score ≤ 15)
```

**Meaning:**
- High impact (≥65) with low visible activity (≤15)
- Represents employees who deliver high value with minimal visibility

---

## API Endpoint

**URL:** `/api/v1/employees/<employee_id>/score/`

**Response:**
```json
{
  "employeeId": 1,
  "activityScore": 25.5,
  "impactScore": 78.3,
  "finalScore": 65.1,
  "silentArchitect": true
}
```

---

## Summary of Key Formulas

1. **Activity Score** = `log₁₀(activities) + 0.5×log₁₀(PRs) + 0.3×log₁₀(issues)` (capped at 30)
2. **Contribution Impact** = `Σ(severity×complexity×multiplier)`
3. **Influence Impact** = `Documents + Meetings + Mentorship`
4. **Impact Score** = `Contribution Impact + Influence Impact` (capped at 100)
5. **Final Score** = `0.75×Impact + 0.25×Activity`
6. **Silent Architect** = `Impact ≥ 65 AND Activity ≤ 15`
