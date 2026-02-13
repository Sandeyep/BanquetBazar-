from django.urls import path
from .views import register_view, user_profile

urlpatterns = [
    path('register/', register_view, name='register'),
    path('profile/', user_profile, name='profile'),
]
