from django.db import models
from django.contrib.auth.models import User

class room_table(models.Model):
    room_id = models.CharField(max_length=100)
    secret_key = models.CharField(max_length=100)
    def __str__(self):
        return f'{self.room_id} Room'
    
class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    room_id = models.CharField(max_length=255, default="")  # Mesajın ait olduğu oda
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"