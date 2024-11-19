import requests
from django.core.files.base import ContentFile

def save_profile_picture(user, image_url):
    try:

        # Create a file-like object from the response content
        # Use the username to create a unique filename
        filename = f"{user.username}_profile_picture.jpg"
        if image_url is not None:
            # Download the image from the URL
            response = requests.get(image_url)
            response.raise_for_status()  # Check for HTTP errors
            image_content = ContentFile(response.content, name=filename)
            # Save the image to the user's profile_picture field
            user.profile.profile_picture.save(filename, image_content)
            user.profile.save()
        else:
            image_content = ContentFile(open('media/default_pictures/default_picture.png', 'rb').read(), name='default_picture.png')
            # Save the image to the user's profile_picture field
            user.profile.profile_picture.save(filename, image_content)
            user.profile.save()
        
    except requests.RequestException as e:
        print(f"Error downloading image: {e}")
    except Exception as e:
        print(f"Error saving image: {e}")
