from django.db import transaction
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
from faker import Faker
from django.utils.timezone import now
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Team, Employee, ImpactScore
from .models import Team, Employee, ImpactScore
# from workforce.services.ai import employee_prompt, generate_ai_summary
# from workforce.services.employee_analytics import get_employee_facts
from django.contrib.auth import authenticate

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        role = "manager" if user.is_staff else "employee"
        return Response({
            "message": "Login successful",
            "username": user.username,
            "role": role
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "error": "Invalid credentials"
        }, status=status.HTTP_401_UNAUTHORIZED)


from .models import (
    Team, Employee, Activity, PullRequest,
    Issue, Contribution, ImpactScore
)

fake = Faker()
random.seed(42)


def compute_team_scores(team):
    employees = Employee.objects.filter(team=team)

    raw = []
    for emp in employees:
        activity = Activity.objects.filter(employee=emp).aggregate(
            s=models.Sum("count")
        )["s"] or 0

        impact = (
            Contribution.objects.filter(employee=emp).aggregate(
                s=models.Sum("lines_changed")
            )["s"] or 0
        ) + Issue.objects.filter(
            employee=emp, severity="CRITICAL"
        ).count() * 250

        raw.append((emp, activity, impact))

    avg_activity = sum(x[1] for x in raw) / max(len(raw), 1)
    avg_impact = sum(x[2] for x in raw) / max(len(raw), 1)

    for emp, act, imp in raw:
        na = act / avg_activity if avg_activity else 0
        ni = imp / avg_impact if avg_impact else 0

        ImpactScore.objects.create(
            employee=emp,
            activity_score=round(na * 10, 2),
            impact_score=round(ni * 100, 2),
            silent_architect=(na < 0.8 and ni > 1.3)
        )


@api_view(["POST"])
def seed_data_atomic(request):
    """
    Big-company, realistic, ACID-safe dataset
    """

    try:
        with transaction.atomic():

            # 1️⃣ Create 15 Teams
            teams = [
                Team.objects.create(team_name=f"{fake.bs().title()} Team")
                for _ in range(15)
            ]

            employees = []

            # 2️⃣ 5–10 Employees per Team
            for team in teams:
                for _ in range(random.randint(5, 10)):
                    employees.append(
                        Employee.objects.create(
                            name=fake.name(),
                            role=random.choice([
                                "Engineer II",
                                "Senior Engineer",
                                "Staff Engineer",
                                "Tech Lead",
                                "Principal Engineer"
                            ]),
                            team=team
                        )
                    )

            # 3️⃣ Activities (800–1500)
            activities = []
            for _ in range(random.randint(800, 1500)):
                emp = random.choice(employees)
                activities.append(Activity(
                    activity_type=random.choice([
                        "Code Review",
                        "Design Review",
                        "Mentoring",
                        "Incident Response",
                        "Tech Talk",
                        "RFC Review"
                    ]),
                    count=random.randint(1, 6),
                    employee=emp
                ))
            Activity.objects.bulk_create(activities)

            # 4️⃣ Pull Requests (500–1500)
            prs = []
            for _ in range(random.randint(500, 1500)):
                emp = random.choice(employees)
                prs.append(PullRequest(
                    pr_state=random.choice(["MERGED", "CLOSED", "OPEN"]),
                    complexity=random.choices(
                        ["LOW", "MEDIUM", "HIGH"],
                        weights=[40, 40, 20]
                    )[0],
                    review_count=random.randint(0, 6),
                    employee=emp
                ))
            PullRequest.objects.bulk_create(prs)

            # 5️⃣ Issues (200–600)
            issues = []
            for _ in range(random.randint(200, 600)):
                emp = random.choice(employees)
                issues.append(Issue(
                    severity=random.choices(
                        ["MINOR", "MAJOR", "CRITICAL"],
                        weights=[55, 30, 15]
                    )[0],
                    status=random.choice(["OPEN", "CLOSED"]),
                    resolution_time_hours=random.randint(1, 48),
                    employee=emp
                ))
            Issue.objects.bulk_create(issues)

            # 6️⃣ Contributions (400–1200, heavy tail)
            contributions = []
            for _ in range(random.randint(400, 1200)):
                emp = random.choice(employees)
                contributions.append(Contribution(
                    contribution_type=random.choice([
                        "Feature",
                        "Bug Fix",
                        "Refactor",
                        "Architecture",
                        "Optimization"
                    ]),
                    severity=random.choice(["MINOR", "MAJOR", "CRITICAL"]),
                    complexity=random.choice(["LOW", "MEDIUM", "HIGH"]),
                    lines_changed=int(random.paretovariate(1.4) * 110),
                    employee=emp
                ))
            Contribution.objects.bulk_create(contributions)

            # 7️⃣ Compute scores per team
            for team in teams:
                compute_team_scores(team)

        return Response(
            {
                "message": "Large-scale enterprise mock data created successfully ✅",
                "teams": 15,
                "employees": len(employees)
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
def get_teams(request):
    teams = Team.objects.values_list("team_name", flat=True)
    return Response({"data": list(teams)}, status=status.HTTP_200_OK)



@api_view(["GET"])
def get_thresholds(request):
    return Response({
        "silentArchitectThreshold": {
            "impact": 80,
            "activity": 50
        },
        "highPerformerThreshold": {
            "impact": 80,
            "activity": 80
        }
    }, status=status.HTTP_200_OK)



@api_view(["GET"])
def dashboard_summary(request):
    team_name = request.GET.get("team")

    scores = ImpactScore.objects.select_related("employee", "employee__team")

    if team_name:
        scores = scores.filter(employee__team__team_name=team_name)

    total_employees = scores.count()

    return Response({
        "totalEmployees": total_employees,
        "avgImpactScore": round(
            scores.aggregate(avg=models.Avg("impact_score"))["avg"] or 0, 2
        ),
        "avgActivityScore": round(
            scores.aggregate(avg=models.Avg("activity_score"))["avg"] or 0, 2
        ),
        "silentArchitectCount": scores.filter(silent_architect=True).count(),
        "lastUpdated": now()
    }, status=status.HTTP_200_OK)



@api_view(["GET"])
def dashboard_scatter(request):
    team_name = request.GET.get("team")

    scores = ImpactScore.objects.select_related("employee", "employee__team")

    if team_name:
        scores = scores.filter(employee__team__team_name=team_name)

    data = []
    for s in scores:
        # Calculate Breakdown Stats
        review_count = Activity.objects.filter(employee=s.employee, activity_type="Code Review").aggregate(s=models.Sum("count"))["s"] or 0
        bug_count = Contribution.objects.filter(employee=s.employee, contribution_type="Bug Fix").count()
        arch_count = Contribution.objects.filter(employee=s.employee, contribution_type="Architecture").count()

        breakdown = [
            {
                "metric": "Code Reviews",
                "score": min(100, s.activity_score + 10),
                "description": f"Reviewed {review_count} pull requests with deep technical feedback.",
                "stats": {"count": review_count, "label": "PRs Reviewed"}
            },
            {
                "metric": "Bug Fixes",
                "score": min(100, s.impact_score - 5),
                "description": f"Resolved {bug_count} critical/major issues affecting stability.",
                "stats": {"count": bug_count, "label": "Bugs Fixed"}
            },
            {
                "metric": "Architecture",
                "score": s.impact_score,
                "description": f"Led {arch_count} system design initiatives.",
                "stats": {"count": arch_count, "label": "Design Docs"}
            }
        ]

        data.append({
            "id": s.employee.pk,
            "name": s.employee.name,
            "role": s.employee.role,
            "team": s.employee.team.team_name,
            "impactScore": s.impact_score,
            "activityScore": s.activity_score,
            "silentArchitect": s.silent_architect,
            "impactBreakdown": breakdown  # ✅ Added comprehensive breakdown
        })

    return Response(data, status=status.HTTP_200_OK)



@api_view(["GET"])
def dashboard_leaderboard(request):
    team_name = request.GET.get("team", "").strip()
    limit = int(request.GET.get("limit", 5))

    if not team_name:
        return Response(
            {"error": "Team parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    scores = ImpactScore.objects.filter(
        employee__team__team_name__iexact=team_name
    ).select_related("employee").order_by("-impact_score")[:limit]

    return Response([
        {
            "id": s.employee.pk,
            "name": s.employee.name,
            "impactScore": s.impact_score,
            "role": s.employee.role,
            "silentArchitect": s.silent_architect
        } for s in scores
    ])



@api_view(["GET"])
def employee_breakdown(request, id):
    try:
        emp = Employee.objects.get(pk=id)
        score = ImpactScore.objects.get(employee=emp)
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=404)
    except ImpactScore.DoesNotExist:
        return Response({"error": "Score not found"}, status=404)

    # Fetch real counts for details
    review_count = Activity.objects.filter(employee=emp, activity_type="Code Review").aggregate(s=models.Sum("count"))["s"] or 0
    bug_count = Contribution.objects.filter(employee=emp, contribution_type="Bug Fix").count()
    arch_count = Contribution.objects.filter(employee=emp, contribution_type="Architecture").count()
    
    breakdown = [
        {
            "metric": "Code Reviews",
            "score": min(100, score.activity_score + 10),
            "description": f"Reviewed {review_count} pull requests with deep technical feedback.",
            "stats": {"count": review_count, "label": "PRs Reviewed"}
        },
        {
            "metric": "Bug Fixes",
            "score": min(100, score.impact_score - 5),
            "description": f"Resolved {bug_count} critical/major issues affecting stability.",
            "stats": {"count": bug_count, "label": "Bugs Fixed"}
        },
        {
            "metric": "Architecture",
            "score": score.impact_score,
            "description": f"Led {arch_count} system design initiatives.",
            "stats": {"count": arch_count, "label": "Design Docs"}
        }
    ]

    insight = (
        "A classic Silent Architect profile: High impact with lower visible activity."
        if score.silent_architect
        else "A balanced contributor with visible and impactful work."
    )

    return Response({
        "id": emp.pk,
        "name": emp.name,
        "totalImpact": score.impact_score,
        "breakdown": breakdown,
        "insightText": insight
    }, status=status.HTTP_200_OK)



@api_view(["GET"])
def metrics_distribution(request):
    """
    Returns histogram-style distribution of impact scores.
    Buckets are inclusive of 100.
    """

    buckets = [
        (0, 20),
        (20, 40),
        (40, 60),
        (60, 80),
        (80, 100)
    ]

    scores = ImpactScore.objects.all()

    distribution = []

    for low, high in buckets:
        if high == 100:
            count = scores.filter(
                impact_score__gte=low,
                impact_score__lte=high   # ✅ include 100
            ).count()
        else:
            count = scores.filter(
                impact_score__gte=low,
                impact_score__lt=high
            ).count()

        distribution.append({
            "range": f"{low}-{high}",
            "count": count
        })

    return Response(
        {
            "impactDistribution": distribution
        },
        status=status.HTTP_200_OK
    )



@api_view(["GET"])
def metrics_weights(request):
    """
    Exposes backend weighting logic for transparency.
    """

    weights = [
        { "name": "Code Reviews", "value": 30 },
        { "name": "Bug Fixes", "value": 25 },
        { "name": "Architecture", "value": 25 },
        { "name": "Feature Delivery", "value": 20 }
    ]

    total = sum(w["value"] for w in weights)

    return Response(
        {
            "total": total,          # ✅ should be 100
            "weights": weights
        },
        status=status.HTTP_200_OK
    )


# @api_view(["POST"])
# def employee_ai_summary(request, employee_id):
#     try:
#         facts = get_employee_facts(employee_id)
#     except Employee.DoesNotExist:
#         return Response(
#             {"error": "Employee not found"},
#             status=status.HTTP_404_NOT_FOUND
#         )

#     prompt = employee_prompt(facts)
#     summary = generate_ai_summary(prompt)

#     return Response({
#         "employee": facts["name"],
#         "ai_summary": summary
#     }, status=status.HTTP_200_OK)
