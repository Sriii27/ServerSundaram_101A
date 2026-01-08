import math
from django.db.models import Sum
from django.utils.timezone import now

from workforce.models import (
    Activity,
    PullRequest,
    Issue,
    Document,
    DocumentOutcome,
    MeetingOutcome,
    MentorshipSession,
    Contribution
)

# --------------------------------------------------
# CONFIGURATION (easy to tune)
# --------------------------------------------------

SEVERITY_WEIGHT = {
    "critical": 5,
    "major": 4,
    "minor": 2,
    "low": 1,
}

COMPLEXITY_WEIGHT = {
    "high": 4,
    "medium": 2,
    "low": 1,
}

MEETING_OUTCOME_WEIGHT = {
    "APPROVED": 4,
    "FOLLOW_UP": 3,
    "ACTION_ITEMS": 2,
    "COMPLETED": 1,
}

ACTIVITY_SCORE_CAP = 30
FINAL_IMPACT_CAP = 100


# --------------------------------------------------
# ACTIVITY SCORE (QUANTITY – CAPPED)
# --------------------------------------------------

def calculate_activity_score(employee_id: int) -> float:
    """
    Measures volume but applies logarithmic damping.
    Prevents spammy behavior from dominating.
    """

    activity_sum = (
        Activity.objects
        .filter(employee_id=employee_id)
        .aggregate(total=Sum("count"))["total"]
        or 0
    )

    pr_count = PullRequest.objects.filter(
        employee_id=employee_id
    ).count()

    issues_resolved = Issue.objects.filter(
        employee_id=employee_id,
        status="CLOSED"
    ).count()

    score = (
        math.log1p(activity_sum)
        + 0.5 * math.log1p(pr_count)
        + 0.3 * math.log1p(issues_resolved)
    )

    return round(min(score, ACTIVITY_SCORE_CAP), 2)


# --------------------------------------------------
# CONTRIBUTION IMPACT (QUALITY – CORE LOGIC)
# --------------------------------------------------

def _calculate_contribution_impact(employee_id: int) -> float:
    """
    Values CRITICAL bugfixes higher than features using context multipliers.
    """

    impact = 0.0

    contributions = Contribution.objects.filter(employee_id=employee_id)

    for c in contributions:
        severity = c.severity.lower()
        complexity = c.complexity.lower()
        ctype = c.contribution_type.lower()

        base_score = (
            SEVERITY_WEIGHT.get(severity, 1)
            * COMPLEXITY_WEIGHT.get(complexity, 1)
        )

        multiplier = 1.0

        # 🐞 BUG FIX LOGIC (risk reduction)
        if "bug" in ctype:
            multiplier = 1.5

            if severity == "critical":
                multiplier += 0.3

            # Fast resolution bonus (linked issue)
            linked_issue = Issue.objects.filter(
                employee_id=employee_id,
                severity__in=["CRITICAL", "MAJOR"]
            ).order_by("created_at").first()

            if linked_issue and linked_issue.resolution_time_hours <= 24:
                multiplier += 0.3

        # 🚀 FEATURE LOGIC (long-term value)
        elif "feature" in ctype:
            multiplier = 1.2

            has_doc = Document.objects.filter(
                owner_employee_id=employee_id,
                document_type__in=["RFC", "Design Doc"],
                status="APPROVED"
            ).exists()

            if has_doc:
                multiplier += 0.2

            has_design_review = MeetingOutcome.objects.filter(
                owner_employee_id=employee_id,
                related_entity__in=["ARCHITECTURE", "DOCUMENT"]
            ).exists()

            if has_design_review:
                multiplier += 0.3

        impact += base_score * multiplier

    return impact


# --------------------------------------------------
# DOCUMENT + MEETING + MENTORSHIP IMPACT
# --------------------------------------------------

def _calculate_influence_impact(employee_id: int) -> float:
    impact = 0.0

    # 📄 Documents
    docs = Document.objects.filter(
        owner_employee_id=employee_id,
        status="APPROVED"
    )

    for d in docs:
        impact += {
            "RFC": 10,
            "Design Doc": 12,
            "Architecture": 15,
            "Postmortem": 8
        }.get(d.document_type, 0)

        if d.scope and d.scope.lower() in ("platform", "architecture"):
            impact += 2

    # 🏛 Meetings
    meetings = MeetingOutcome.objects.filter(
        owner_employee_id=employee_id
    )

    for m in meetings:
        impact += MEETING_OUTCOME_WEIGHT.get(m.outcome_type, 0)
        if m.related_entity in ("ARCHITECTURE", "DOCUMENT"):
            impact += 2

    # 🎓 Mentorship
    mentorships = MentorshipSession.objects.filter(
        mentor_employee_id=employee_id
    )

    for s in mentorships:
        impact += 5
        if any(
            k in s.outcome.lower()
            for k in ("design", "architecture", "scalable")
        ):
            impact += 2

    return impact

def calculate_impact_score(employee_id: int) -> float:
    """
    Total QUALITY-driven impact score.
    """

    contribution_impact = _calculate_contribution_impact(employee_id)
    influence_impact = _calculate_influence_impact(employee_id)

    total = contribution_impact + influence_impact

    return round(min(total, FINAL_IMPACT_CAP), 2)

# --------------------------------------------------
# FINAL IMPACT SCORE
# --------------------------------------------------

def calculate_final_score(employee_id: int) -> dict:
    """
    Combines activity + impact and classifies Silent Architect.
    """

    activity_score = calculate_activity_score(employee_id)
    impact_score = calculate_impact_score(employee_id)

    final_score = round(
        (0.75 * impact_score) + (0.25 * activity_score),
        2
    )

    silent_architect = (
        impact_score >= 65 and activity_score <= 15
    )

    return {
        "employee_id": employee_id,
        "activity_score": activity_score,
        "impact_score": impact_score,
        "final_score": final_score,
        "silent_architect": silent_architect,
        "calculated_at": now(),
    }
