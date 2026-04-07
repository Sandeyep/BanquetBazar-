import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier

print("Loading dataset...")
df = pd.read_csv('banquet_halls_only.csv')

print("Preprocessing dataset...")
# Minimal cleaning
df = df.dropna(subset=['name'])
df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.0)
df['int_price'] = pd.to_numeric(df['int_price'], errors='coerce').fillna(1500)
df['capacity'] = pd.to_numeric(df['capacity'], errors='coerce').fillna(200)
df['event_types'] = df['event_types'].fillna('')
df['city'] = df['city'].str.lower().fillna('')

# Manual One-Hot Encoding
print("Encoding features...")
event_dummies = pd.get_dummies(df['event_types'], prefix='event')
city_dummies = pd.get_dummies(df['city'], prefix='city')

X = pd.concat([
    df[['capacity', 'int_price', 'rating']],
    event_dummies,
    city_dummies
], axis=1)
y = df['name']

print(f"Training on {X.shape[0]} samples with {X.shape[1]} features...")
clf = RandomForestClassifier(n_estimators=50, max_depth=30, random_state=42)
clf.fit(X, y)

print("Saving model and metadata...")
model_data = {
    'model': clf,
    'features': X.columns.tolist(),
    'classes': clf.classes_.tolist()
}

with open('rf_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("Model successfully trained and saved without complex sklearn objects!")
