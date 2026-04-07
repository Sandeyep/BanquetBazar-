import os
import django
import sys
import json
from django.test import RequestFactory

# Set up Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banquetbazar.settings')
django.setup()

from banquetbazar.ai_views import RecommendHallView, EstimateCostView

def run_tests():
    factory = RequestFactory()
    print("Testing ML Endpoint Loading...")
    
    # 1. Test RecommendHallView
    print("\n--- Testing RecommendHallView ---")
    payload_1 = {
        "event_types": "wedding",
        "capacity": 500,
        "city": "delhi",
        "int_price": 1500,
        "rating": 4.5
    }
    
    # Needs a mock request
    request = factory.post('/api/ai/recommend-hall/', data=json.dumps(payload_1), content_type='application/json')
    request.data = payload_1 # DRF's APIView populates request.data usually but we can attach it safely here for testing standard view logic
    
    view = RecommendHallView.as_view()
    response = view(request)
    print(f"Status Code: {response.status_code}")
    print(f"Response data: {response.data}")
    
    # 2. Test EstimateCostView
    print("\n--- Testing EstimateCostView ---")
    payload_2 = {
        "venue_name": "Woodapple Residency",
        "guests": 300,
        "needs_decoration": True,
        "needs_dj": True
    }
    
    request_2 = factory.post('/api/ai/estimate-cost/', data=json.dumps(payload_2), content_type='application/json')
    request_2.data = payload_2
    
    view_2 = EstimateCostView.as_view()
    response_2 = view_2(request_2)
    print(f"Status Code: {response_2.status_code}")
    print(f"Response data: {response_2.data}")
    
if __name__ == '__main__':
    run_tests()
