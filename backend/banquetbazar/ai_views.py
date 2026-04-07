# Re-loading model to pick up changes
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from halls.models import Hall

# Explicit imports to help joblib deserialization
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import sklearn.compose._column_transformer
if not hasattr(sklearn.compose._column_transformer, 'ColumnTransformer'):
    sklearn.compose._column_transformer.ColumnTransformer = ColumnTransformer

# Calculate paths based on BASE_DIR (which is the backend/ directory)
# So BASE_DIR.parent is the BanquetBazar- repository root.
BASE_DIR = settings.BASE_DIR
REPO_ROOT = BASE_DIR.parent
RF_MODEL_PATH = REPO_ROOT / 'Aiml' / 'randomforestclassifer' / 'rf_model.pkl'
COST_DATASET_PATH = REPO_ROOT / 'Aiml' / 'costestimation' / 'CostEstimation_Dataset.csv'

# Global caches for lazy loading
_rf_model = None
_cost_estimator = None

def get_rf_model_data():
    """Lazily load the simplified model dictionary"""
    global _rf_model
    if _rf_model is None:
        if not RF_MODEL_PATH.exists():
            raise FileNotFoundError(f"RF Model not found at {RF_MODEL_PATH}")
        with open(RF_MODEL_PATH, 'rb') as f:
            _rf_model = pickle.load(f)
    return _rf_model

def train_model_from_data(df):
    """Refined training logic used by both the script and the Sync API"""
    # Preprocessing
    df = df.dropna(subset=['name'])
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.0)
    df['int_price'] = pd.to_numeric(df['int_price'], errors='coerce').fillna(1500)
    df['capacity'] = pd.to_numeric(df['capacity'], errors='coerce').fillna(200)
    df['event_types'] = df['event_types'].fillna('')
    df['city'] = df['city'].str.lower().fillna('')

    # Augment data slightly for better mapping if small
    if len(df) < 100:
        df = pd.concat([df]*5, ignore_index=True)

    # Manual One-Hot Encoding
    event_dummies = pd.get_dummies(df['event_types'], prefix='event')
    city_dummies = pd.get_dummies(df['city'], prefix='city')

    X = pd.concat([
        df[['capacity', 'int_price', 'rating']],
        event_dummies,
        city_dummies
    ], axis=1)
    y = df['name']

    clf = RandomForestClassifier(n_estimators=50, max_depth=30, random_state=42)
    clf.fit(X, y)

    model_data = {
        'model': clf,
        'features': X.columns.tolist(),
        'classes': clf.classes_.tolist()
    }
    
    with open(RF_MODEL_PATH, 'wb') as f:
        pickle.dump(model_data, f)
    
    global _rf_model
    _rf_model = model_data # Update cache
    return model_data

def get_cost_estimator():
    """Lazily load the Cost Estimator dataset and logic"""
    global _cost_estimator
    if _cost_estimator is None:
        if not COST_DATASET_PATH.exists():
            raise FileNotFoundError(f"Cost Dataset not found at {COST_DATASET_PATH}")
        
        # We define a lightweight class wrapper for the logic here so we don't have to import the standalone script directly
        class CostEstimatorAI:
            def __init__(self, dataset_path):
                self.df = pd.read_csv(dataset_path)
                self.df['name_lower'] = self.df['name'].str.lower()
                
            def estimate_cost(self, venue_name, guests, needs_decoration=False, needs_makeup=False, needs_dj=False, needs_photography=False):
                # Try to get from database first for most accurate data
                db_hall = Hall.objects.filter(name__icontains=venue_name).first()
                
                if db_hall:
                    cost_per_plate = int(db_hall.price_per_plate)
                    base_rental = int(db_hall.price)
                    base_cost = (cost_per_plate * guests) + base_rental
                    
                    breakdown = {
                        "venue_name": db_hall.name,
                        "base_cost": base_cost,
                        "hall_rental": base_rental,
                        "cost_per_plate": cost_per_plate,
                        "guests": guests,
                        "extras": {}
                    }
                    
                    if needs_decoration:
                        breakdown['extras']['decoration'] = int(db_hall.decoration_price)
                    if needs_makeup:
                        breakdown['extras']['makeup_artist'] = int(db_hall.makeup_price)
                    if needs_dj:
                        breakdown['extras']['dj'] = int(db_hall.dj_price)
                    if needs_photography:
                        breakdown['extras']['photography'] = int(db_hall.photography_price)
                        
                    breakdown['total_estimated_cost'] = base_cost + sum(breakdown['extras'].values())
                    return breakdown

                # Fallback to CSV if not in DB (for older data or training sets)
                venue_data = self.df[self.df['name_lower'].str.contains(venue_name.lower(), na=False)]
                
                if venue_data.empty:
                    return {"error": f"Venue matching '{venue_name}' not found."}
                    
                venue = venue_data.iloc[0]
                cost_per_plate = int(venue['cost_per_plate'])
                base_cost = cost_per_plate * guests
                
                extra_services_cost = 0
                breakdown = {
                    "venue_name": venue['name'],
                    "base_cost": base_cost,
                    "cost_per_plate": cost_per_plate,
                    "guests": guests,
                    "extras": {}
                }
                
                if needs_decoration:
                    dec = int(venue['decoration'])
                    extra_services_cost += dec
                    breakdown['extras']['decoration'] = dec
                if needs_makeup:
                    mk = int(venue['makeup_artist'])
                    extra_services_cost += mk
                    breakdown['extras']['makeup_artist'] = mk
                if needs_dj:
                    dj = int(venue['dj'])
                    extra_services_cost += dj
                    breakdown['extras']['dj'] = dj
                if needs_photography:
                    pho = int(venue['photography'])
                    extra_services_cost += pho
                    breakdown['extras']['photography'] = pho
                    
                breakdown['total_estimated_cost'] = base_cost + extra_services_cost
                return breakdown
                
        _cost_estimator = CostEstimatorAI(COST_DATASET_PATH)
    return _cost_estimator

class RecommendHallView(APIView):
    """
    API View to recommend a hall based on event features using Random Forest.
    Expected POST body keys: event_types, capacity, city, int_price, rating
    """
    def post(self, request, *args, **kwargs):
        data = request.data
        
        try:
            model_data = get_rf_model_data()
            model = model_data['model']
            features = model_data['features']
            
            # Manual Preprocessing
            input_df = pd.DataFrame(columns=features)
            input_df.loc[0] = 0.0 # Initialize all features to zero
            
            # Numeric values
            input_df['capacity'] = float(data.get('capacity', 200))
            input_df['int_price'] = float(data.get('int_price', 1500))
            input_df['rating'] = float(data.get('rating', 4.5))
            
            # Categorical: event_types
            event = data.get('event_types', '')
            event_col = f"event_{event}"
            if event_col in features:
                input_df[event_col] = 1.0
            
            # Categorical: city
            city = str(data.get('city', '')).lower()
            city_col = f"city_{city}"
            if city_col in features:
                input_df[city_col] = 1.0
            
            # Ensure no NaNs before passing to model
            input_df = input_df.fillna(0.0)

            # Predict Top 3
            probabilities = model.predict_proba(input_df)[0]
            classes = model.classes_
            top_3_indices = np.argsort(probabilities)[-3:][::-1]
            recommended_halls = [classes[i] for i in top_3_indices]
            
            return Response({
                "recommended_halls": recommended_halls
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SyncAIView(APIView):
    """
    Export database halls to CSV and re-train the AI model
    """
    def post(self, request):
        try:
            halls = Hall.objects.all()
            if not halls.exists():
                return Response({"error": "No halls found in database to sync."}, status=status.HTTP_400_BAD_REQUEST)
            
            data = []
            for h in halls:
                # Format event types from JSON list to comma string
                e_types = ", ".join(h.event_types) if isinstance(h.event_types, list) else str(h.event_type or "")
                
                data.append({
                    'name': h.name,
                    'capacity': h.capacity,
                    'city': h.location.lower(),
                    'int_price': int(h.price),
                    'rating': float(h.rating),
                    'event_types': e_types,
                    'cost_per_plate': int(h.price_per_plate),
                    'decoration': int(h.decoration_price),
                    'makeup_artist': int(h.makeup_price),
                    'dj': int(h.dj_price),
                    'photography': int(h.photography_price),
                })
            
            df = pd.DataFrame(data)
            
            # Save to the CSV (so the Aiml folder stays updated)
            CSV_PATH = RF_MODEL_PATH.parent / 'banquet_halls_only.csv'
            df.to_csv(CSV_PATH, index=False)
            
            # Re-train
            train_model_from_data(df)
            
            return Response({
                "message": f"AI model successfully synchronized with {len(halls)} halls.",
                "total_halls": len(halls)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EstimateCostView(APIView):
    """
    API View to estimate the cost of an event.
    Expected POST body keys: venue_name, guests, needs_decoration, needs_makeup, needs_dj, needs_photography
    """
    def post(self, request, *args, **kwargs):
        data = request.data
        
        venue_name = data.get('venue_name')
        if not venue_name:
            return Response({"error": "venue_name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            guests = int(data.get('guests', 100))
        except ValueError:
            return Response({"error": "guests must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Parse boolean flags
        needs_decoration = str(data.get('needs_decoration', 'false')).lower() in ['true', '1']
        needs_makeup = str(data.get('needs_makeup', 'false')).lower() in ['true', '1']
        needs_dj = str(data.get('needs_dj', 'false')).lower() in ['true', '1']
        needs_photography = str(data.get('needs_photography', 'false')).lower() in ['true', '1']
        
        try:
            estimator = get_cost_estimator()
            result = estimator.estimate_cost(
                venue_name=venue_name,
                guests=guests,
                needs_decoration=needs_decoration,
                needs_makeup=needs_makeup,
                needs_dj=needs_dj,
                needs_photography=needs_photography
            )
            
            if "error" in result:
                return Response(result, status=status.HTTP_404_NOT_FOUND)
                
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
