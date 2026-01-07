from django.contrib import admin
from .models import *

admin.site.register(Team)
admin.site.register(Employee)
admin.site.register(Contribution)
admin.site.register(PullRequest)
admin.site.register(Issue)
admin.site.register(Activity)
admin.site.register(ScoreConfiguration)
admin.site.register(ImpactScore)
