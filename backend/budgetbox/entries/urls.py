from django.urls import path
from .views import GetEntries


urlpatterns = [
    path('', GetEntries.as_view(), name='get_entries'),
]