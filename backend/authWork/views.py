from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import requests
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os as uos
import pyotp

from .utils.savePP import save_profile_picture

# JWT Kütüphanesi
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        user.email = request.data['email']
        user.first_name = request.data['first_name']
        user.last_name = request.data['last_name']
        user.set_password(request.data['password'])
        user.save()
        user.profile.phone_number = request.data.get('phone_number')
        user.profile.save()
        user.social.secret_key = uos.urandom(16).hex()
        user.social.save()
        new_pp = request.FILES.get('profile_picture')

        if new_pp:
            # Save the new profile picture to the user's profile
            user.profile.profile_picture.save(f"{user.username}_profile_picture.jpg", new_pp)
            user.profile.save()
        else:
            save_profile_picture(user, request.data.get('profile_picture'))
        # JWT Token oluştur
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh_token': str(refresh),
            'access_token': str(refresh.access_token),
            'secret_key': user.social.secret_key,
            'user_id': user.id,
            'lang_pref': user.profile.lang_pref,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response("User not found", status=status.HTTP_404_NOT_FOUND)
    #check if 2fa enabled
    if user.profile.two_factor_auth:
        return Response("Two factor is enabled for this account", status=status.HTTP_401_UNAUTHORIZED)


    # JWT Token oluştur
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh_token': str(refresh),
        'access_token': str(refresh.access_token),
        'secret_key': user.social.secret_key,
        'user_id': user.id,
        'lang_pref': user.profile.lang_pref,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_oauth(request):
    oauth_access_token = request.data.get('oauth_access_token')

    if not oauth_access_token:
        return Response({"error": "OAuth access token is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Add "Bearer " prefix to the access token
    response = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={"Authorization": f"Bearer {oauth_access_token}"}
    )

    if response.status_code == 200:
        user_data = response.json()
        username = user_data['login']

        # Create or get the user
        user, created = User.objects.get_or_create(username=username)
        if user:
            user.delete()
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_unusable_password()
            user.email = user_data['email']
            user.first_name = user_data['first_name']
            user.last_name = user_data['last_name']
            user.save()
            save_profile_picture(user, user_data['image'].get('link'))
            if user_data['phone'] != "hidden":
                user.profile.phone_number = user_data['phone']
            user.profile.save()
            user.social.secret_key = uos.urandom(16).hex()
            user.social.save()

            #check if 2fa enabled
        if user.profile.two_factor_auth:
            return Response({
                "error": "Two-factor authentication is enabled for this user",
                "username": username
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'username': str(username),
            'secret_key': user.social.secret_key,
            'user_id': user.id,
            'lang_pref': user.profile.lang_pref,
        }, status=status.HTTP_200_OK)

    # Return the error message from the 42 API
    return Response({"error": "Failed to authenticate with 42 API"}, status=response.status_code)

@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_after_2fa(request):
    oauth_access_token = request.data.get('oauth_access_token')

    if not oauth_access_token:
        return Response({"error": "OAuth access token is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Add "Bearer " prefix to the access token
    response = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={"Authorization": f"Bearer {oauth_access_token}"}
    )

    if response.status_code == 200:
        user_data = response.json()
        username = user_data['login']

        # Create or get the user
        user = get_object_or_404(User, username=username)
        # Issue JWT tokens after successful OTP verification
        token = request.data['otp_token']
        totp = pyotp.TOTP(user.profile.two_factor_auth_secret)

        if totp.verify(token):
            # Generate JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'username': str(username),
                'secret_key': user.social.secret_key,
                'user_id': user.id,
                'lang_pref': user.profile.lang_pref,
            }, status=status.HTTP_200_OK)
            refresh = RefreshToken.for_user(user)
        return Response("Invalid OTP, please try again!", status=400)
    # Return the error message from the 42 API
    return Response({"error": "Failed to authenticate with 42 API"}, status=response.status_code)



@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response("Token verified!")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token_custom(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        new_access_token = str(token.access_token)
        return Response({"access": new_access_token}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
@permission_classes([AllowAny])
def exchange_token(request):
    code = request.data.get('code')

    if not code:
        return JsonResponse({'error': 'Authorization code is required'}, status=400)

    # OAuth sağlayıcısına access token almak için istek yap
    token_url = "https://api.intra.42.fr/oauth/token"
    client_id = settings.OAUTH_CLIENT_ID
    client_secret = settings.OAUTH_CLIENT_SECRET
    redirect_uri = "https://127.0.0.1"

    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri
    }

    response = requests.post(token_url, data=data)

    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens['access_token']
        refresh_token = tokens['refresh_token']

        return JsonResponse({
            'access_token': access_token,
            'refresh_token': refresh_token
        })
    else:
        return Response(response.json(), status=response.status_code)
