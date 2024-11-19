from django.urls import path
from .views import game_over, get_game_history, get_game_stats
urlpatterns = [
    path('game_over/', game_over, name='game_over'),
    path('get_game_history/', get_game_history, name='get_game_history'),
    path('get_game_stats/', get_game_stats, name='get_game_stats'),
]