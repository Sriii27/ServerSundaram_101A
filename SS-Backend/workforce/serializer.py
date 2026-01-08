from rest_framework import serializers


class ImpactScoreSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField()
    activity_score = serializers.FloatField()
    impact_score = serializers.FloatField()
    final_score = serializers.FloatField()
    silent_architect = serializers.BooleanField()
