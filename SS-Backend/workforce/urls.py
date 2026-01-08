from django.urls import path
from .views import seed_data_atomic, login_view, employee_ai_summary
from .views import get_teams
from .views import get_thresholds
from .views import dashboard_summary, dashboard_scatter, dashboard_leaderboard
from .views import employee_breakdown
from .views import metrics_distribution, metrics_weights, get_metric_config
from .views import EmployeeScoreAPIView
from .views import (
    get_raw_employees,
    get_raw_contributions,
    get_raw_activities,
    get_raw_issues
)
    

urlpatterns = [
    path("v1/teams", get_teams),
    path("v1/config/thresholds", get_thresholds),

    path("v1/dashboard/summary", dashboard_summary),
    path("v1/dashboard/scatter", dashboard_scatter),
    path("v1/dashboard/leaderboard", dashboard_leaderboard),

    path("v1/employees/<int:id>/breakdown", employee_breakdown),

    path("v1/config/metrics", get_metric_config),
    path("v1/metrics/distribution", metrics_distribution),
    path("v1/seed", seed_data_atomic),
    path("v1/ai/employee-summary/<int:employee_id>/",employee_ai_summary,name="employee_ai_summary"),
    path("v1/auth/login/", login_view),

    # Raw Data for Frontend Calculation
    path("v1/employees/raw", get_raw_employees),
    path("v1/contributions/raw", get_raw_contributions),
    path("v1/activities/raw", get_raw_activities),
    path("v1/issues/raw", get_raw_issues),
    
    # Scoring Engine API
    path("v1/employees/<int:employee_id>/score/", EmployeeScoreAPIView.as_view(), name="employee-score")
]
