from django.shortcuts import render

# Create your views here.
import pyotp
import qrcode
from io import BytesIO
from django.http import HttpResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def token_after_2fa(request):
    print(request.data)
    user = get_object_or_404(User, username=request.data['user'])  # We assume the username is stored and passed correctly after login
    # Issue JWT tokens after successful OTP verification
    token = request.data['otp_token']
    totp = pyotp.TOTP(user.profile.two_factor_auth_secret)
    
    if totp.verify(token):
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "secret_key": user.social.secret_key,
        }, status=200)
    return Response("Invalid OTP, please try again!", status=400)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_qr_code(request):
    # Kullanıcıya özgü gizli anahtarı oluşturun
    secret = pyotp.random_base32()
    
    # Kullanıcı kimliği ve uygulama adı
    user = request.user
    user_id = user.email
    user.profile.two_factor_auth_secret = secret
    user.profile.save()
    app_name = "Transcendence"  # Uygulama adınızı buraya yazın
    
    # OTP URI oluşturun
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user_id, issuer_name=app_name)
    
    # QR kodu oluşturun
    qr = qrcode.make(otp_uri)
    
    # QR kodunu bellek içi bir bayt akışına kaydedin
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    
    # QR kodunu HttpResponse ile geri döndürün
    return HttpResponse(buffer, content_type="image/png")


@api_view(['POST'])
def verify_otp(request):
    user = request.user
    token = request.data['otp_token']
    totp = pyotp.TOTP(user.profile.two_factor_auth_secret)
    
    if totp.verify(token):
        if user.profile.two_factor_auth is False:
            user.profile.two_factor_auth = True
            user.profile.save()
        return HttpResponse("Two-factor authentication enabled successfully!", status=200)
    return HttpResponse("Invalid OTP, please try again!", status=400)
