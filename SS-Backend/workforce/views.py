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
from workforce.services.ai import employee_prompt, generate_ai_summary
from workforce.services.employee_analytics import get_employee_facts
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



# --- Configuration ---

TEAM_METRIC_CONFIG = {
    "Engineering": {
        "weights": {
            "codeReview": 0.25,
            "bugFix": 0.25,
            "architecture": 0.25,
            "featureDelivery": 0.25
        },
        "silentArchitectThreshold": { "impact": 65, "activity": 60 }
    },
    "Product": {
        "weights": {
            "featureDefinition": 0.35,
            "roadmapDelivery": 0.30,
            "stakeholderAlignment": 0.20,
            "archDecisions": 0.15
        },
        "silentArchitectThreshold": { "impact": 65, "activity": 50 }
    },
    "Design": {
        "weights": {
            "uxImprovement": 0.40,
            "visualDelivery": 0.30,
            "designSystem": 0.20,
            "accessibility": 0.10
        },
        "silentArchitectThreshold": { "impact": 65, "activity": 45 }
    },
    "Marketing": {
        "weights": {
            "campaignImpact": 0.35,
            "leadInfluence": 0.30,
            "conversionLift": 0.20,
            "brandAssets": 0.15
        },
        "silentArchitectThreshold": { "impact": 65, "activity": 50 }
    },
    "Default": {
        "weights": {
            "codeReview": 0.25,
            "bugFix": 0.25,
            "architecture": 0.25,
            "featureDelivery": 0.25
        },
        "silentArchitectThreshold": { "impact": 65, "activity": 60 }
    }
}

def get_team_config(team_name):
    for key, config in TEAM_METRIC_CONFIG.items():
        if key in team_name:
            return config
    return TEAM_METRIC_CONFIG["Default"]

def map_to_metric(team_name, category, type_name):
    t = team_name.lower()
    
    # --- ENGINEERING ---
    if 'engineer' in t:
        if category == 'activity':
            if type_name == 'Code Review': return 'codeReview'
            if type_name == 'RFC Review': return 'architecture'
        if category == 'contribution':
            if type_name == 'Bug Fix': return 'bugFix'
            if type_name == 'Refactor': return 'architecture'
            if type_name == 'Feature': return 'featureDelivery'

    # --- PRODUCT ---
    elif 'product' in t:
        if category == 'activity':
            if type_name in ['Mentoring', 'Tech Talk']: return 'stakeholderAlignment'
        if category == 'contribution':
            if type_name == 'Documentation': return 'featureDefinition'
            if type_name == 'Refactor': return 'archDecisions'
            if type_name == 'Feature': return 'roadmapDelivery'

    # --- DESIGN ---
    elif 'design' in t:
        if category == 'activity':
            if type_name == 'Design Review': return 'visualDelivery'
        if category == 'contribution':
            if type_name == 'Optimization': return 'uxImprovement'
            if type_name == 'Feature': return 'visualDelivery'
            if type_name == 'Refactor': return 'designSystem'
            if type_name == 'Test': return 'accessibility'

    # --- MARKETING ---
    elif 'marketing' in t:
        if category == 'activity':
            if type_name == 'Tech Talk': return 'leadInfluence'
        if category == 'contribution':
            if type_name == 'Feature': return 'campaignImpact'
            if type_name == 'Optimization': return 'conversionLift'
            if type_name == 'Documentation': return 'brandAssets'

    return None

def camel_case_to_title(text):
    import re
    return re.sub(r'([A-Z])', r' \1', text).title().strip()

from django.db.models import Count, Sum

def calculate_realtime_metrics(team_name_filter=None):
    """
    Computes scores efficiently using Django Aggregations (Bulk Fetch).
    Eliminates N+1 query problem.
    """
    # 1. Base Query
    employees = Employee.objects.all().select_related('team')
    if team_name_filter and team_name_filter != "All Teams":
        employees = employees.filter(team__team_name__iexact=team_name_filter)

    if not employees.exists():
        return []

    # 2. Bulk Annotation for All Metrics
    emp_ids = list(employees.values_list('pk', flat=True))
    
    # Bulk Activity Fetch
    activities = Activity.objects.filter(employee_id__in=emp_ids).values(
        'employee_id', 'activity_type'
    ).annotate(total=Sum('count'))

    # Bulk Contribution Fetch
    contributions = Contribution.objects.filter(employee_id__in=emp_ids).values(
        'employee_id', 'contribution_type'
    ).annotate(count=Count('pk'))

    # Structure data for fast lookup
    data_map = { 
        id: { 'activity': {}, 'contribution': {}, 'total_activity': 0 } 
        for id in emp_ids 
    }

    for act in activities:
        eid = act['employee_id']
        atype = act['activity_type']
        count = act['total']
        data_map[eid]['activity'][atype] = count
        data_map[eid]['total_activity'] += count

    for cont in contributions:
        eid = cont['employee_id']
        ctype = cont['contribution_type']
        count = cont['count']
        data_map[eid]['contribution'][ctype] = count

    # 3. Process & Score in Python
    results = []
    
    # Group employees by team for scope-based normalization
    employees_by_team = {}
    for emp in employees:
        tname = emp.team.team_name
        if tname not in employees_by_team: employees_by_team[tname] = []
        employees_by_team[tname].append(emp)

    for tname, team_emps in employees_by_team.items():
        config = get_team_config(tname)
        weights = config["weights"]
        thresholds = config["silentArchitectThreshold"]
        
        # Init Maxes for this team
        local_maxes = { k: 1 for k in weights.keys() }
        local_maxes['total_activity'] = 1

        # Calc raw MAPPED values for each employee
        emp_processed_data = []

        for emp in team_emps:
            raw_data = data_map[emp.pk]
            mapped_values = { k: 0 for k in weights.keys() }
            
            # Map Activities
            for atype, count in raw_data['activity'].items():
                mkey = map_to_metric(tname, 'activity', atype)
                if mkey and mkey in weights:
                    mapped_values[mkey] += count
            
            # Map Contributions
            for ctype, count in raw_data['contribution'].items():
                mkey = map_to_metric(tname, 'contribution', ctype)
                if mkey and mkey in weights:
                    mapped_values[mkey] += count

            # Update Maxes
            local_maxes['total_activity'] = max(local_maxes['total_activity'], raw_data['total_activity'])
            for k, v in mapped_values.items():
                local_maxes[k] = max(local_maxes[k], v)

            emp_processed_data.append({
                "emp": emp,
                "mapped": mapped_values,
                "raw_total_activity": raw_data['total_activity']
            })

        # Second Pass: Normalize & Finalize
        for item in emp_processed_data:
            emp = item['emp']
            mapped = item['mapped']
            
            impact_score = 0
            breakdown_list = []

            for k, weight in weights.items():
                val = mapped[k]
                max_val = local_maxes[k]
                
                # Formula
                c_score = (val / max_val) * (weight * 100)
                impact_score += c_score
                
                # Tooltip
                breakdown_list.append({
                    "metric": camel_case_to_title(k),
                    "score": round(min(100, (val / max_val) * 100), 1),
                    "stats": { "count": val, "label": camel_case_to_title(k) }
                })
            
            breakdown_list.sort(key=lambda x: x["score"], reverse=True)
            impact_score = round(min(100, max(0, impact_score)), 1)
            
            # Activity Score
            act_score = round(min(100, (item['raw_total_activity'] / local_maxes['total_activity']) * 100), 1)

            is_silent = (impact_score >= thresholds['impact'] and act_score <= thresholds['activity'])

            results.append({
                "id": emp.pk,
                "name": emp.name,
                "role": emp.role,
                "team": tname,
                "impactScore": impact_score,
                "activityScore": act_score,
                "silentArchitect": is_silent,
                "impactBreakdown": breakdown_list
            })

    return results



@api_view(["POST"])
def seed_data_atomic(request):
    """
    Big-company, realistic, ACID-safe dataset
    """
    try:
        with transaction.atomic():
            # 1. Create 10 Teams
            teams = [
                Team.objects.create(team_name=f"{fake.bs().title()} Team")
                for _ in range(10)
            ]

            employees = []

            # 2. Employees
            for team in teams:
                for _ in range(random.randint(6, 12)):
                    employees.append(
                        Employee.objects.create(
                            name=fake.name(),
                            role=random.choice(["Engineer II", "Senior Engineer", "Staff Engineer", "Product Manager", "Designer"]),
                            team=team
                        )
                    )

            # 3. Activities & Contributions
            activities_list = []
            contributions_list = []
            issues_list = []

            for emp in employees:
                # Generate random activities
                for _ in range(random.randint(50, 200)):
                    activities_list.append(Activity(
                        activity_type=random.choice(["Code Review", "Design Review", "Mentoring", "Tech Talk", "RFC Review"]),
                        count=random.randint(1, 3),
                        employee=emp
                    ))
                
                # Generate contributions
                for _ in range(random.randint(20, 80)):
                    contributions_list.append(Contribution(
                        contribution_type=random.choice(["Feature", "Bug Fix", "Refactor", "Architecture", "Optimization", "Documentation", "Test"]),
                        severity=random.choice(["MINOR", "MAJOR", "CRITICAL"]),
                        complexity=random.choice(["LOW", "MEDIUM", "HIGH"]),
                        lines_changed=random.randint(10, 500),
                        employee=emp
                    ))

                # Generate Issues
                if random.random() > 0.7:
                     issues_list.append(Issue(
                        severity=random.choice(["MAJOR", "CRITICAL"]),
                        status=random.choice(["OPEN", "CLOSED"]),
                        resolution_time_hours=random.randint(1, 48),
                        employee=emp
                     ))

            Activity.objects.bulk_create(activities_list)
            Contribution.objects.bulk_create(contributions_list)
            Issue.objects.bulk_create(issues_list)

        return Response({"message": "Seeding complete"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_teams(request):
    teams = Team.objects.values_list("team_name", flat=True)
    return Response({"data": list(teams)}, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_thresholds(request):
    # Return defaults for now, though frontend might use config/metrics instead
    return Response({
        "silentArchitectThreshold": { "impact": 65, "activity": 60 },
        "highPerformerThreshold": { "impact": 80, "activity": 80 }
    }, status=status.HTTP_200_OK)

@api_view(["GET"])
def dashboard_summary(request):
    team_name = request.GET.get("team")
    data = calculate_realtime_metrics(team_name)
    
    if not data:
        return Response({
            "totalEmployees": 0,
            "avgImpactScore": 0,
            "avgActivityScore": 0,
            "silentArchitectCount": 0,
            "lastUpdated": now()
        })

    total_emp = len(data)
    avg_imp = sum(d["impactScore"] for d in data) / total_emp
    avg_act = sum(d["activityScore"] for d in data) / total_emp
    silent_count = sum(1 for d in data if d["silentArchitect"])

    return Response({
        "totalEmployees": total_emp,
        "avgImpactScore": round(avg_imp, 2),
        "avgActivityScore": round(avg_act, 2),
        "silentArchitectCount": silent_count,
        "lastUpdated": now()
    }, status=status.HTTP_200_OK)

@api_view(["GET"])
def dashboard_scatter(request):
    team_name = request.GET.get("team")
    data = calculate_realtime_metrics(team_name)
    return Response(data, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_metric_config(request):
    return Response(TEAM_METRIC_CONFIG, status=status.HTTP_200_OK)


@api_view(["GET"])
def dashboard_leaderboard(request):
    team_name = request.GET.get("team", "").strip()
    limit = int(request.GET.get("limit", 5))

    if not team_name:
         return Response(
            {"error": "Team parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Calculate fresh for this team
    data = calculate_realtime_metrics(team_name)
    
    # Sort by Impact Score Descending
    sorted_data = sorted(data, key=lambda x: x["impact_score"], reverse=True)[:limit]

    return Response([
        {
            "id": d["employee"].pk,
            "name": d["employee"].name,
            "impactScore": d["impact_score"],
            "role": d["employee"].role,
            "silentArchitect": d["silent_architect"]
        } for d in sorted_data
    ])


@api_view(["GET"])
def employee_breakdown(request, id):
    try:
        emp = Employee.objects.get(pk=id)
        # We need to calc metrics just for this emp's team to get the relative score
        team_metrics = calculate_realtime_metrics(emp.team.team_name)
        
        # Find our employee in the results
        emp_metric = next((x for x in team_metrics if x["employee"].pk == emp.pk), None)
        
        if not emp_metric:
             return Response({"error": "Metrics unavailable"}, status=404)
             
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=404)

    # Fetch details
    review_count = Activity.objects.filter(employee=emp, activity_type="Code Review").aggregate(s=models.Sum("count"))["s"] or 0
    bug_count = Contribution.objects.filter(employee=emp, contribution_type="Bug Fix").count()
    arch_count = Contribution.objects.filter(employee=emp, contribution_type="Architecture").count()
    
    breakdown = [
        {
            "metric": "Code Reviews",
            "score": min(100, emp_metric["activity_score"] + 10),
            "description": f"Reviewed {review_count} pull requests with deep technical feedback.",
            "stats": {"count": review_count, "label": "PRs Reviewed"}
        },
        {
            "metric": "Bug Fixes",
            "score": min(100, emp_metric["impact_score"] - 5),
            "description": f"Resolved {bug_count} critical/major issues affecting stability.",
            "stats": {"count": bug_count, "label": "Bugs Fixed"}
        },
        {
            "metric": "Architecture",
            "score": emp_metric["impact_score"],
            "description": f"Led {arch_count} system design initiatives.",
            "stats": {"count": arch_count, "label": "Design Docs"}
        }
    ]

    insight = (
        "A classic Silent Architect profile: High impact with lower visible activity."
        if emp_metric["silent_architect"]
        else "A balanced contributor with visible and impactful work."
    )

    return Response({
        "id": emp.pk,
        "name": emp.name,
        "totalImpact": emp_metric["impact_score"],
        "breakdown": breakdown,
        "insightText": insight
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
def metrics_distribution(request):
    """
    Returns histogram-style distribution of impact scores.
    """
    # Calculate all fresh
    data = calculate_realtime_metrics() # All teams

    buckets = [
        (0, 20),
        (20, 40),
        (40, 60),
        (60, 80),
        (80, 100)
    ]

    distribution = []

    for low, high in buckets:
        # Count stats in range
        if high == 100:
            count = sum(1 for d in data if low <= d["impact_score"] <= high)
        else:
            count = sum(1 for d in data if low <= d["impact_score"] < high)
            
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


@api_view(["POST"])
def employee_ai_summary(request, employee_id):
    try:
        facts = get_employee_facts(employee_id)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    prompt = employee_prompt(facts)
    summary = generate_ai_summary(prompt)

    return Response({
        "employee": facts["name"],
        "ai_summary": summary
    }, status=status.HTTP_200_OK)


# --- Raw Data Endpoints for Frontend-Driven Metrics ---

@api_view(["GET"])
def get_raw_employees(request):
    """Returns raw employee list for frontend calculation"""
    employees = Employee.objects.select_related("team").all()
    data = [
        {
            "id": e.pk,
            "name": e.name,
            "role": e.role,
            "team": e.team.team_name
        }
        for e in employees
    ]
    return Response({"employees": data}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_raw_contributions(request):
    """Returns all raw contributions for frontend calculation"""
    # Optimized to return only needed fields
    contributions = Contribution.objects.all().values(
        "employee_id", "contribution_type", "lines_changed", "severity"
    )
    return Response({"contributions": list(contributions)}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_raw_activities(request):
    """Returns all raw activities for frontend calculation"""
    activities = Activity.objects.all().values(
        "employee_id", "activity_type", "count"
    )
    return Response({"activities": list(activities)}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_raw_issues(request):
    """Returns all raw issues for frontend calculation"""
    issues = Issue.objects.all().values(
        "employee_id", "severity", "status"
    )
    return Response({"issues": list(issues)}, status=status.HTTP_200_OK)
