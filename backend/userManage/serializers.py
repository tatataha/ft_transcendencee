from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile , Social

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Profile
        fields = ['bio', 'phone_number', 'two_factor_auth', 'two_factor_auth_secret', 'profile_picture', 'online_status', 'lang_pref']

class SocialSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Social
        fields = ['friendList', 'friendRequest', 'friendRequestSent', 'blockedUsers', 'secret_key']
