from django.contrib import admin
from .models import Profile, SiteConfig, Social

class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ['default_profile_picture']

admin.site.register(Profile)
admin.site.register(Social)
admin.site.register(SiteConfig, SiteConfigAdmin)