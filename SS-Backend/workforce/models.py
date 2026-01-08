from django.db import models
import uuid
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

class Document(models.Model):
    document_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.TextField()
    document_type = models.CharField(max_length=100)
    owner_employee = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="owner_employee_id",
        related_name="documents"
    )
    status = models.CharField(max_length=50)
    scope = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        db_table = "documents"
        managed = False
        
        
class DocumentOutcome(models.Model):
    outcome_id = models.UUIDField(primary_key=True)
    document = models.ForeignKey(
        Document,
        on_delete=models.DO_NOTHING,
        db_column="document_id",
        related_name="outcomes"
    )
    outcome_type = models.CharField(max_length=50)
    contribution = models.ForeignKey(
        Contribution,
        on_delete=models.DO_NOTHING,
        db_column="contribution_id",
        null=True,
        blank=True
    )
    validated_by = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="validated_by",
        related_name="+"
    )
    created_at = models.DateTimeField()

    class Meta:
        db_table = "document_outcomes"
        managed = False



class MeetingOutcome(models.Model):
    outcome_id = models.UUIDField(primary_key=True)
    meeting_id = models.UUIDField()
    outcome_type = models.CharField(max_length=50)
    related_entity = models.CharField(max_length=50)
    owner_employee = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="owner_employee_id",
        related_name="meeting_outcomes"
    )
    validated_by = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="validated_by",
        related_name="+"
    )
    created_at = models.DateTimeField()

    class Meta:
        db_table = "meeting_outcomes"
        managed = False



class MentorshipSession(models.Model):
    session_id = models.UUIDField(primary_key=True)
    mentor_employee = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="mentor_employee_id",
        related_name="mentorships_given"
    )
    mentee_employee = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="mentee_employee_id",
        related_name="mentorships_received"
    )
    topic = models.TextField()
    outcome = models.TextField()
    session_date = models.DateTimeField()
    validated_by = models.ForeignKey(
        Employee,
        on_delete=models.DO_NOTHING,
        db_column="validated_by",
        related_name="+"
    )
    created_at = models.DateTimeField()

    class Meta:
        db_table = "mentorship_sessions"
        managed = False
