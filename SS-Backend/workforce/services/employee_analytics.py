from workforce.models import (
    Employee, Contribution, PullRequest,
    Issue, Activity, ImpactScore
)

def get_employee_facts(employee_id):
    employee = Employee.objects.get(employee_id=employee_id)

    facts = {
        "name": employee.name,
        "role": employee.role,
        "team": employee.team.team_name,
        "active": employee.is_active,

        "contributions": Contribution.objects.filter(employee=employee).count(),
        "prs_merged": PullRequest.objects.filter(
            employee=employee, pr_state="MERGED"
        ).count(),
        "issues_closed": Issue.objects.filter(
            employee=employee, status="CLOSED"
        ).count(),
        "activities": Activity.objects.filter(employee=employee).count(),

        "impact_score": ImpactScore.objects.filter(employee=employee)
            .values_list("impact_score", flat=True)
            .first()
    }

    return facts
