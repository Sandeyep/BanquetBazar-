from rest_framework import serializers
from .models import Booking
from accounts.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    hall_name = serializers.ReadOnlyField(source='hall.name')
    user_username = serializers.ReadOnlyField(source='user.username')
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_cost', 'created_at', 'hall_name', 'user_username', 'user_details')

    def validate(self, attrs):
        hall = attrs.get('hall')
        guest_count = attrs.get('guest_count')

        if self.instance:
            hall = hall or self.instance.hall
            guest_count = guest_count or self.instance.guest_count
        
        if hall and guest_count:
            if guest_count > hall.capacity:
                raise serializers.ValidationError({"guest_count": f"Guest count ({guest_count}) exceeds hall capacity ({hall.capacity})"})
        return attrs

    def create(self, validated_data):
        # user is passed in validated_data by perform_create, but we also get it from context just in case
        user = self.context['request'].user
        # Remove user from validated_data to avoid "multiple values" error if it's already there
        validated_data.pop('user', None) 
        
        services = validated_data.pop('services', [])
        booking = Booking.objects.create(user=user, **validated_data)
        booking.services.set(services)
        
        # Calculate total cost
        self._calculate_total_cost(booking)
        return booking

    def update(self, instance, validated_data):
        services = validated_data.pop('services', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if services is not None:
            instance.services.set(services)
            
        self._calculate_total_cost(instance)
        return instance

    def _calculate_total_cost(self, booking):
        hall_price = booking.hall.price
        services_price = sum(service.price for service in booking.services.all())
        booking.total_cost = hall_price + services_price
        booking.save()
