from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import UserSerializer, ProfileSerializer
import os
from django.conf import settings
from django.http import FileResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from webServer.models import room_table

# Create your views here.

def is_user_blocked(user, target_user):
    if target_user in user.social.blockedUsers.all() or user in target_user.social.blockedUsers.all():
        return True
    return False

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    userSerializer = UserSerializer(user)
    profileSerializer = ProfileSerializer(user.profile)
    return Response({
        'user': userSerializer.data,
        'profile': profileSerializer.data
    })

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_info(request):
    new_email = request.data.get('email')
    new_phone = request.data.get('phone_number')
    new_bio = request.data.get('bio')

    # Get the user object based on the authenticated user
    user = request.user

    # Update email if provided
    if new_email:
        user.email = new_email
        user.save()  # Save the user object to update the email

    # Update profile fields if provided
    profile = user.profile  # Assuming user has a related profile
    if new_phone:
        profile.phone_number = new_phone
    if new_bio:
        profile.bio = new_bio

    # Save the profile after updating it
    profile.save()

    return Response("User info updated successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    new_pp = request.FILES.get('profile_picture')

    if new_pp:
        user = request.user
        # Save the new profile picture to the user's profile
        user.profile.profile_picture.save(f"{user.username}_profile_picture.jpg", new_pp)
        user.profile.save()

        # You can return the URL of the saved profile picture if needed
        profile_picture_url = user.profile.profile_picture.url

        return Response({
            "message": "Profile picture updated successfully!",
            "profile_picture_url": profile_picture_url
        }, status=200)
    else:
        return Response({"error": "No file uploaded."}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_default_pp(request):
    # Path to the default profile picture
    default_pp_path = os.path.join(settings.MEDIA_ROOT, 'default_pictures/default_picture.png')

    # Open the image file in binary mode and return it as a response
    try:
        return FileResponse(open(default_pp_path, 'rb'), content_type='image/png')
    except FileNotFoundError:
        return Response({"error": "Default profile picture not found"}, status=404)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    self = request.user
    if(request.GET.get('username')):
        user = get_object_or_404(User ,username=request.GET.get('username'))
        if request.user in user.social.blockedUsers.all():
            return Response("Not allowed: User is blocked or has blocked you.", status=403)
    else:
        user = get_object_or_404(User ,username=request.user)

    userSerializer = UserSerializer(user)
    profileSerializer = ProfileSerializer(user.profile)

    if user in self.social.friendList.all():
        is_friend = True
    else:
        is_friend = False

    if user in request.user.social.blockedUsers.all():
        is_blocked = True
    else:
        is_blocked = False

    return Response({
        'user': userSerializer.data,
        'profile': profileSerializer.data,
        'is_friend': is_friend,
        'is_blocked': is_blocked
    })


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    friend_username = request.data.get('friend_username')
    friend = get_object_or_404(User, username=friend_username)
    if is_user_blocked(request.user, friend):
        return Response("Not allowed: User is blocked or has blocked you.", status=403)
    if friend == request.user:
        return Response("You can't send a friend request to yourself!", status=400)
    if friend in request.user.social.friendList.all():
        return Response("You are already friends with this user!", status=400)
    if friend in request.user.social.friendRequest.all():
        return Response("Friend request already sent!", status=400)
    user = request.user
    user.social.friendRequestSent.add(friend)
    user.social.save()
    friend.social.friendRequest.add(user)
    friend.social.save()
    return Response("Friend request sent successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    friend_username = request.data.get('friend_username')
    friend = get_object_or_404(User, username=friend_username)
    user = request.user
    if is_user_blocked(request.user, friend):
        return Response("Not allowed: User is blocked or has blocked you.", status=403)
    if friend not in user.social.friendRequest.all():
        return Response("Friend request not found!", status=404)
    user.social.friendRequest.remove(friend)
    user.social.friendList.add(friend)
    user.social.save()
    friend.social.friendRequestSent.remove(user)
    friend.social.friendList.add(user)
    friend.social.save()
    if(user.id > friend.id):
        room_id = f'{user.id}_{friend.id}'
        room_key = f'{user.social.secret_key}_{friend.social.secret_key}'
    else:
        room_id = f'{friend.id}_{user.id}'
        room_key = f'{friend.social.secret_key}_{user.social.secret_key}'
    room_table(room_id=room_id, secret_key=room_key).save()
    return Response("Friend request accepted successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def decline_friend_request(request):
    friend_username = request.data.get('friend_username')
    friend = get_object_or_404(User, username=friend_username)
    if is_user_blocked(request.user, friend):
        return Response("Not allowed: User is blocked or has blocked you.", status=403)
    user = request.user
    user.social.friendRequest.remove(friend)
    user.social.save()
    friend.social.friendRequestSent.remove(user)
    friend.social.save()
    return Response("Friend request declined successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    friend_username = request.data.get('friend_username')
    friend = get_object_or_404(User, username=friend_username)
    if is_user_blocked(request.user, friend):
        return Response("Not allowed: User is blocked or has blocked you.", status=403)
    user = request.user
    user.social.friendList.remove(friend)
    user.social.save()
    friend.social.friendList.remove(user)
    friend.social.save()
    if(user.id > friend.id):
        room_id = f'{user.id}_{friend.id}'
        room_key = f'{user.social.secret_key}_{friend.social.secret_key}'
    else:
        room_id = f'{friend.id}_{user.id}'
        room_key = f'{friend.social.secret_key}_{user.social.secret_key}'
    room_table.objects.filter(room_id=room_id).delete()
    return Response("Friend removed successfully!", status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_friends(request):
    user = request.user
    blocked_users = user.social.blockedUsers.all()  # Kullanıcının blokladıkları
    blocked_by_users = User.objects.filter(social__blockedUsers=user)  # Kullanıcıyı bloklayanlar

    # Hem bloklanan hem de bloklayan kullanıcıları hariç tut
    friends = user.social.friendList.exclude(id__in=blocked_users).exclude(id__in=blocked_by_users)

    friends_list = []
    for friend in friends:
        friends_list.append({
            'username': friend.username,
            'first_name': friend.first_name,
            'last_name': friend.last_name,
            'email': friend.email,
            'phone_number': friend.profile.phone_number,
            'bio': friend.profile.bio,
            'profile_picture': friend.profile.profile_picture.url,
            'id': friend.id,
            'online_status': friend.profile.online_status,
        })
    return Response(friends_list)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    user = request.user
    blocked_users = user.social.blockedUsers.all()
    blocked_by_users = User.objects.filter(social__blockedUsers=user)

    # Hem bloklanan hem de bloklayan kullanıcıları hariç tut
    friend_requests = user.social.friendRequest.exclude(id__in=blocked_users).exclude(id__in=blocked_by_users)

    friend_requests_list = []
    for friend in friend_requests:
        friend_requests_list.append({
            'username': friend.username,
            'first_name': friend.first_name,
            'last_name': friend.last_name,
            'email': friend.email,
            'phone_number': friend.profile.phone_number,
            'bio': friend.profile.bio,
            'profile_picture': friend.profile.profile_picture.url
        })
    return Response(friend_requests_list)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_sent_friend_requests(request):
    user = request.user
    blocked_users = user.social.blockedUsers.all()
    blocked_by_users = User.objects.filter(social__blockedUsers=user)

    # Hem bloklanan hem de bloklayan kullanıcıları hariç tut
    friend_requests = user.social.friendRequestSent.exclude(id__in=blocked_users).exclude(id__in=blocked_by_users)

    friend_requests_list = []
    for friend in friend_requests:
        friend_requests_list.append({
            'username': friend.username,
            'first_name': friend.first_name,
            'last_name': friend.last_name,
            'email': friend.email,
            'phone_number': friend.profile.phone_number,
            'bio': friend.profile.bio,
            'profile_picture': friend.profile.profile_picture.url
        })
    return Response(friend_requests_list)



@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def block_user(request):
    user_to_block = request.data.get('friend_username')
    user = request.user
    user_to_block = get_object_or_404(User, username=user_to_block)
    user.social.blockedUsers.add(user_to_block)
    user.social.save()
    return Response("User blocked successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    user_to_unblock = request.data.get('friend_username')
    user = request.user
    user_to_unblock = get_object_or_404(User, username=user_to_unblock)
    user.social.blockedUsers.remove(user_to_unblock)
    user.social.save()
    return Response("User unblocked successfully!", status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def select_lang_pref(request):
    user = request.user
    user.profile.lang_pref = request.data.get('lang_pref')
    user.profile.save()
    return Response("Lang pref changed successfuly!", status=200)
