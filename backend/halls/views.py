from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Hall
from .serializers import HallSerializer
from bookings.models import Booking

class HallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    
    def get_permissions(self):
        # Allow anyone to view list/details
        # Only Admin can create/update/delete
        if self.action in ['list', 'retrieve', 'booked_dates']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['get'])
    def booked_dates(self, request, pk=None):
        hall = self.get_object()
        # Get all dates that have an approved or pending booking
        booked_dates = Booking.objects.filter(
            hall=hall, 
            status__in=['approved', 'pending']
        ).values_list('event_date', flat=True)
        return Response(list(booked_dates))
