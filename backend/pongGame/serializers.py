from rest_framework import serializers
from .models import GameHistory, GameStats

class GameHistorySerializer(serializers.ModelSerializer):
    class Meta(object):
        model = GameHistory 
        fields = ['user', 'opponent', 'user_score', 'opponent_score', 'is_winner', 'date']

class GameStatsSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = GameStats
        fields = ['user', 'games_played', 'games_won', 'games_lost', 'win_rate', 'game_history']
