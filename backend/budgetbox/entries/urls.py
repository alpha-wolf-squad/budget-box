from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import get_entries

router = DefaultRouter()
router.register('entires', )

urlpatterns = [
    path('entries/', get_entries.as_view(), name='get_entries'),
    path('', include(router.urls))
]