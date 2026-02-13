from rest_framework.routers import DefaultRouter
from .views import HallViewSet

router = DefaultRouter()
router.register('halls', HallViewSet)

urlpatterns = router.urls
