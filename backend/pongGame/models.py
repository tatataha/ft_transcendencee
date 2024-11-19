from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class GameHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    opponent = models.CharField(max_length=100)
    user_score = models.IntegerField()
    opponent_score = models.IntegerField()
    is_winner = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

class GameStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0)
    game_history = models.OneToOneField(GameHistory, on_delete=models.CASCADE, null=True, blank=True, default=None)