from django.apps import AppConfig


class UsermanageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'userManage'

    def ready(self):
        import userManage.signals