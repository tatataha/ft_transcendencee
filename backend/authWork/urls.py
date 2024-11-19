from django.urls import path
from .views import (
    signup,
    login,
    test_token,
    refresh_token_custom,
    exchange_token,
    login_with_oauth,
    oauth_after_2fa,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('login_with_oauth/', login_with_oauth, name='login_with_oauth'),
    path('test_token/', test_token, name='test_token'),
    path('refresh_token/', refresh_token_custom, name='refresh_token'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('exchange_token/', exchange_token, name='exchange_token'),
    path('oauth_after_2fa/', oauth_after_2fa, name='oauth_after_2fa'),
]