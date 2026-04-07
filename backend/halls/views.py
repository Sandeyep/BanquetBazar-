from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Hall
from .serializers import HallSerializer
from bookings.models import Booking

import json
from .models import Hall, HallImage
from .serializers import HallSerializer, HallImageSerializer

class HallImageViewSet(viewsets.ModelViewSet):
    queryset = HallImage.objects.all()
    serializer_class = HallImageSerializer

    def get_permissions(self):
        # Only Admin can delete/manage gallery images
        class IsAdminRole(permissions.BasePermission):
            def has_permission(self, request, view):
                return request.user.is_authenticated and (
                    request.user.is_staff or 
                    getattr(request.user, 'role', None) == 'admin'
                )
        return [IsAdminRole()]

class HallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    
    def get_permissions(self):
        print(f"DEBUG: Action: {self.action}")
        print(f"DEBUG: User: {self.request.user}")
        print(f"DEBUG: Authenticated: {self.request.user.is_authenticated}")
        if self.request.user.is_authenticated:
            print(f"DEBUG: Role: {getattr(self.request.user, 'role', 'NO_ROLE')}")
            print(f"DEBUG: IsStaff: {self.request.user.is_staff}")

        if self.action in ['list', 'retrieve', 'booked_dates']:
            return [permissions.AllowAny()]
        
        # For development, allow any authenticated user to manage halls (fixes nabin 403)
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        hall = serializer.save()
        images = self.request.FILES.getlist('images')
        for image in images:
            HallImage.objects.create(hall=hall, image=image)

    def perform_update(self, serializer):
        hall = serializer.save()
        images = self.request.FILES.getlist('images')
        if images:
            for image in images:
                HallImage.objects.create(hall=hall, image=image)

    @action(detail=True, methods=['get'])
    def booked_dates(self, request, pk=None):
        hall = self.get_object()
        # Get all dates that have an approved or pending booking
        booked_dates = Booking.objects.filter(
            hall=hall, 
            status__in=['approved', 'pending']
        ).values_list('event_date', flat=True)
        return Response(list(booked_dates))
