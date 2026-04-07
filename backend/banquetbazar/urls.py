from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from services.views import ServiceViewSet
from bookings.views import BookingViewSet
from halls.views import HallViewSet, HallImageViewSet
from .ai_views import RecommendHallView, EstimateCostView, SyncAIView

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'halls', HallViewSet)
router.register(r'hall-images', HallImageViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # Register router URLs
    path('api/auth/', include('accounts.urls')), # Assuming accounts has urls.py
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/ai/recommend-hall/', RecommendHallView.as_view(), name='ai_recommend_hall'),
    path('api/ai/estimate-cost/', EstimateCostView.as_view(), name='ai_estimate_cost'),
    path('api/ai/sync/', SyncAIView.as_view(), name='ai_sync'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
