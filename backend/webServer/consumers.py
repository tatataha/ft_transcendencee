# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404
from webServer.models import room_table
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    @sync_to_async
    def get_room_secret(self, room_name):
        room = get_object_or_404(room_table, room_id=room_name)
        return room.secret_key

        # Eski mesajları belirli odaya göre getir
    @sync_to_async
    def get_old_messages(self, room_name):
        messages = Message.objects.filter(room_id=room_name).order_by('timestamp')
        return [{'user': msg.user.username, 'content': msg.content, 'timestamp': msg.timestamp.isoformat()} for msg in messages]

    # Mesajı veritabanına kaydet
    @sync_to_async
    def save_message(self, user, message, room_name):
        Message.objects.create(
            user=user,
            content=message,
            room_id=room_name  # Mesajı odaya göre kaydet
        )
    @sync_to_async
    def get_user(self, username):
        try:
            return User.objects.get(username=username)
        except ObjectDoesNotExist:
            return None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"
        self.secret_key = self.scope['url_route']['kwargs']['secret_key']

        room_secret = await self.get_room_secret(self.room_name)
        if not room_secret:
            await self.close()
            return

        if self.secret_key == room_secret.split('_')[0] or self.secret_key == room_secret.split('_')[1]:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            
            # Bağlandığında eski mesajları getir ve WebSocket'e gönder
            old_messages = await self.get_old_messages(self.room_name)
            await self.send(text_data=json.dumps({
                'old_messages': old_messages
            }))
            

        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Mesaj alındığında
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user_text = text_data_json['user']
        user = await self.get_user(user_text)

        # Mesajı grup kanalına gönder
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': user.username,
            }
        )

        # Mesajı kaydet
        await self.save_message(user, message, self.room_name)

    async def chat_message(self, event):
        message = event['message']
        user = event['user']

        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
        }))



class setStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    # Fetch the user asynchronously
    @sync_to_async
    def get_user(self, username):
        try:
            return User.objects.get(username=username)
        except ObjectDoesNotExist:
            return None

    # Save the user's profile asynchronously
    @sync_to_async
    def set_user_online_status(self, user, status):
        user.profile.online_status = status
        user.profile.save()

    async def receive(self, text_data):
        print(text_data)
        text_data_json = json.loads(text_data)
        username = text_data_json.get('user')
        status = text_data_json.get('status')
        status_bool = True if status == 'online' else False

        if username:
            # Fetch user asynchronously
            user = await self.get_user(username)
            if user:
                print(user)  # This will print the user if found
                # Update the user's profile status asynchronously
                await self.set_user_online_status(user, status_bool)
            else:
                print(f"User with username '{username}' does not exist.")
        else:
            print("No username provided.")

    async def disconnect(self, close_code):
        self.close()