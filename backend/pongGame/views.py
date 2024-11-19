from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import GameHistory
from .models import GameStats
from rest_framework.response import Response
from rest_framework import status
from .serializers import GameHistorySerializer
from .serializers import GameStatsSerializer
# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def game_over(request):
    data = request.data
    user = request.user
    opponent = data['opponent']
    user_score = data['user_score']
    opponent_score = data['opponent_score']
    if user_score > opponent_score:
        is_winner = True;
        user.gamestats.games_won += 1
    else:
        is_winner = False;
        user.gamestats.games_lost += 1
    user.gamestats.games_played += 1
    user.gamestats.win_rate = user.gamestats.games_won / user.gamestats.games_played
    user.gamestats.game_history = GameHistory.objects.create(user=user, opponent=opponent, user_score=user_score, opponent_score=opponent_score, is_winner=is_winner)
    user.gamestats.save()
    return Response(status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_game_history(request):
    data = request.data
    user = data['username']
    user = User.objects.get(username=user)
    game_history = GameHistory.objects.filter(user=user)
    game_history_serializer = GameHistorySerializer(game_history, many=True)
    return Response(game_history_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_game_stats(request):
    data = request.data
    user = data['username']
    user = User.objects.get(username=user)
    game_stats = GameStats.objects.filter(user=user)
    game_stats_serializer = GameStatsSerializer(game_stats, many=True)
    return Response(game_stats_serializer.data, status=status.HTTP_200_OK)