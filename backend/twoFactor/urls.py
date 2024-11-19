from django.urls import path
from .views import generate_qr_code, verify_otp, token_after_2fa

urlpatterns = [
    path('generate-qr/', generate_qr_code, name='generate_qr'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('token-after-2fa/', token_after_2fa, name='token_after_2fa'),
]