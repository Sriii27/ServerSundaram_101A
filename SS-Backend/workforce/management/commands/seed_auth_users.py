from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Seeds the database with authentication users (manager and employee)'

    def handle(self, *args, **kwargs):
        users = [
            {'username': 'manager1', 'password': 'manager123', 'is_staff': True},
            {'username': 'employee1', 'password': 'employee123', 'is_staff': False},
        ]

        for user_data in users:
            username = user_data['username']
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    password=user_data['password']
                )
                user.is_staff = user_data['is_staff']
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully created user: {username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {username}'))
