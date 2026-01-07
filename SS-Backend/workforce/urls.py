from django.urls import path
from .views import employee_ai_summary, seed_data_atomic
from .views import get_teams
from .views import get_thresholds
from .views import dashboard_summary, dashboard_scatter, dashboard_leaderboard
from .views import employee_breakdown
from .views import metrics_distribution, metrics_weights
    

urlpatterns = [
    path("v1/teams", get_teams),
    path("v1/config/thresholds", get_thresholds),

    path("v1/dashboard/summary", dashboard_summary),
    path("v1/dashboard/scatter", dashboard_scatter),
    path("v1/dashboard/leaderboard", dashboard_leaderboard),

    path("v1/employees/<int:id>/breakdown", employee_breakdown),

    path("v1/metrics/weights",metrics_weights),
    path("v1/metrics/distribution", metrics_distribution),
    path("ai/employee-summary/<int:employee_id>/",employee_ai_summary,name="employee_ai_summary"
    ),
]
