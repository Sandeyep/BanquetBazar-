import requests

url = "http://127.0.0.1:8000/api/ai/recommend-hall/"
payload = {
    "event_types": "Wedding",
    "city": "Delhi",
    "capacity": 200,
    "int_price": 1500,
    "rating": 4.5
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
