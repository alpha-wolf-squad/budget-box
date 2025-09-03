from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clerk_app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='budgetboxuser',
            name='plaid_access_token',
        ),
    ]
