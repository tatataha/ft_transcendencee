# Generated by Django 3.2.25 on 2024-11-14 06:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import userManage.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('default_profile_picture', models.ImageField(blank=True, null=True, upload_to=userManage.models.get_default_profile_picture_path)),
            ],
            options={
                'verbose_name': 'Site Configuration',
                'verbose_name_plural': 'Site Configurations',
            },
        ),
        migrations.CreateModel(
            name='Social',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('secret_key', models.CharField(blank=True, max_length=100, null=True)),
                ('blockedUsers', models.ManyToManyField(blank=True, related_name='blockedUsers', to=settings.AUTH_USER_MODEL)),
                ('friendList', models.ManyToManyField(blank=True, related_name='friendList', to=settings.AUTH_USER_MODEL)),
                ('friendRequest', models.ManyToManyField(blank=True, related_name='friendRequest', to=settings.AUTH_USER_MODEL)),
                ('friendRequestSent', models.ManyToManyField(blank=True, related_name='friendRequestSent', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bio', models.TextField(blank=True, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True)),
                ('two_factor_auth', models.BooleanField(default=False)),
                ('two_factor_auth_secret', models.CharField(blank=True, max_length=100)),
                ('profile_picture', models.ImageField(blank=True, null=True, upload_to='profile_pictures/')),
                ('online_status', models.BooleanField(default=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
