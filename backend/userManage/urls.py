from django.urls import path
from .views import user_info,update_user_info, update_profile_picture, get_sent_friend_requests
from .views import get_default_pp, get_user_profile, send_friend_request, accept_friend_request
from .views import decline_friend_request, get_friend_requests, get_friends, remove_friend, block_user, unblock_user, select_lang_pref

urlpatterns = [
    path('user_info/', user_info, name='user_info'),
    path('update_user_info/', update_user_info, name='update_user_info'),
    path('update_profile_picture/', update_profile_picture, name='update_profile_picture'),
    path('get_default_pp/', get_default_pp, name='get_default_pp'),
    path('get_user_profile/', get_user_profile, name='get_user_profile'),
    path('send_friend_request/', send_friend_request, name='send_friend_request'),
    path('accept_friend_request/', accept_friend_request, name='accept_friend_request'),
    path('decline_friend_request/', decline_friend_request, name='decline_friend_request'),
    path('get_friend_requests/', get_friend_requests, name='get_friend_requests'),
    path('get_friends/', get_friends, name='get_friends'),
    path('remove_friend/', remove_friend, name='remove_friend'),
    path('get_sent_friend_requests/', get_sent_friend_requests, name='get_sent_friend_requests'),
    path('block_user/', block_user, name='block_user'),
    path('unblock_user/', unblock_user, name='unblock_user'),
    path('select_lang_pref/', select_lang_pref, name='select_lang_pref'),
]
