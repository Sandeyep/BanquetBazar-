import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banquetbazar.settings')
django.setup()

from halls.models import Hall
from services.models import Service
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_booking_logic():
    print("Setting up test data...")
    try:
        # Create User
        user, created = User.objects.get_or_create(username="testuser", email="test@example.com")
        if created:
            user.set_password("password")
            user.save()

        # Create Halls
        hall1 = Hall.objects.create(name="Small Hall", price=Decimal("100.00"), capacity=50, location="Loc A", description="Desc")
        hall2 = Hall.objects.create(name="Big Hall", price=Decimal("200.00"), capacity=200, location="Loc B", description="Desc")

        # Create Service
        service = Service.objects.create(name="Catering", price=Decimal("50.00"), description="Food", is_available=True)

        print("\n--- Test 1: Create Booking ---")
        # Test creation via Serializer
        data = {
            "hall": hall1.id,
            "event_date": "2023-12-25",
            "guest_count": 40,
            "services": [service.id]
        }
        
        # Mock request with user
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user
        
        serializer = BookingSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            print(f"Booking created. Total Cost: {booking.total_cost}")
            expected_cost = hall1.price + service.price
            if booking.total_cost != expected_cost:
                print(f"ERROR: Expected cost {expected_cost}, got {booking.total_cost}")
            else:
                print("Cost calculation correct.")
        else:
            print("Serializer errors:", serializer.errors)
            return

        print("\n--- Test 2: Update Booking (Change Hall) ---")
        # Change hall to hall2 (more expensive)
        update_data = {
            "hall": hall2.id
        }
        serializer = BookingSerializer(booking, data=update_data, partial=True, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            print(f"Booking updated. New Hall: {booking.hall.name}")
            print(f"Total Cost: {booking.total_cost}")
            
            expected_new_cost = hall2.price + service.price
            if booking.total_cost == expected_new_cost:
                print("SUCCESS: Cost updated correctly.")
            else:
                print(f"FAILURE: Cost NOT updated. Expected {expected_new_cost}, got {booking.total_cost}")
        else:
            print("Update errors:", serializer.errors)

        print("\n--- Test 3: Capacity Validation ---")
        # Try to book with guests > capacity
        bad_data = {
            "hall": hall1.id,
            "event_date": "2023-12-26",
            "guest_count": 60, # Capacity is 50
            "services": []
        }
        serializer = BookingSerializer(data=bad_data, context={'request': request})
        if serializer.is_valid():
            print("FAILURE: Serializer accepted guest_count > capacity")
        else:
            print("SUCCESS: Serializer rejected guest_count > capacity")
            print("Errors:", serializer.errors)

        # Cleanup
        print("\nCleaning up...")
        Booking.objects.all().delete()
        Hall.objects.all().delete()
        Service.objects.all().delete()
        # User.objects.filter(username="testuser").delete() # Keep user usually

    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_booking_logic()
