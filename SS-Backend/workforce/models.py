from django.db import models

class Meta:
    db_table = "employees"
    indexes = [
        models.Index(fields=["team"]),
    ]


class Team(models.Model):
    team_id = models.AutoField(primary_key=True)
    team_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.team_name


class Employee(models.Model):
    employee_id = models.AutoField(primary_key=True)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        db_column="team_id",
        related_name="employees"
    )
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "employees"

    def __str__(self):
        return self.name


class Contribution(models.Model):
    contribution_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        db_column="employee_id",
        related_name="contributions"
    )
    contribution_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20)
    complexity = models.CharField(max_length=20)
    lines_changed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "contributions"


class PullRequest(models.Model):
    pr_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        db_column="employee_id",
        related_name="pull_requests"
    )
    pr_state = models.CharField(max_length=20)
    complexity = models.CharField(max_length=20)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pull_requests"


class Issue(models.Model):
    issue_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        db_column="employee_id",
        related_name="issues"
    )
    severity = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    resolution_time_hours = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "issues"


class Activity(models.Model):
    activity_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        db_column="employee_id",
        related_name="activities"
    )
    activity_type = models.CharField(max_length=50)
    count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "activities"


class ScoreConfiguration(models.Model):
    metric_name = models.CharField(max_length=100, primary_key=True)
    weight = models.IntegerField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "score_configurations"


class ImpactScore(models.Model):
    score_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        db_column="employee_id",
        related_name="impact_scores"
    )
    impact_score = models.DecimalField(max_digits=6, decimal_places=2)
    activity_score = models.DecimalField(max_digits=6, decimal_places=2)
    silent_architect = models.BooleanField(default=False)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "impact_scores"
