from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    two_factor_auth = models.BooleanField(default=False)
    two_factor_auth_secret = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    online_status = models.BooleanField(default=False)
    lang_pref = models.CharField(max_length=15, blank=False, null=False, default="tr_lang")

    def __str__(self):
        return f'{self.user.username} Profile'

def get_default_profile_picture_path(instance, filename):
    # Dosya adı her zaman sabit olacak
    return 'default_pictures/default_picture.png'

class SiteConfig(models.Model):
    default_profile_picture = models.ImageField(upload_to=get_default_profile_picture_path, blank=True, null=True)

    def __str__(self):
        return "Site Configuration"

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configurations"

class Social(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    friendList = models.ManyToManyField(User, related_name='friendList', blank=True)
    friendRequest = models.ManyToManyField(User, related_name='friendRequest', blank=True)
    friendRequestSent = models.ManyToManyField(User, related_name='friendRequestSent', blank=True)
    blockedUsers = models.ManyToManyField(User, related_name='blockedUsers', blank=True)
    secret_key = models.CharField(max_length=100, blank=True, null=True)
