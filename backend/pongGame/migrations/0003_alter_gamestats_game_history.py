# Generated by Django 3.2.25 on 2024-11-16 15:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pongGame', '0002_alter_gamestats_game_history'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamestats',
            name='game_history',
            field=models.OneToOneField(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='pongGame.gamehistory'),
        ),
    ]