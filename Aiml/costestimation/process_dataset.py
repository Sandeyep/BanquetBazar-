import pandas as pd
import numpy as np

# Load original dataset
df = pd.read_csv('BanquetBazar.csv')

# Select only needed columns for cost estimation
needed_cols = ['name', 'category', 'rating', 'city', 'int_price']
df_clean = df[needed_cols].copy()

# Rename int_price to cost_per_plate for clarity
df_clean.rename(columns={'int_price': 'cost_per_plate'}, inplace=True)

# Generate prices for extra services
# We can make them somewhat proportional to the cost_per_plate to be realistic
np.random.seed(42)

# Decoration cost: Base 20000 + 50 * cost_per_plate + random noise
df_clean['decoration'] = 20000 + (df_clean['cost_per_plate'] * 50) + np.random.randint(-5000, 10000, size=len(df_clean))

# Makeup artist: Base 5000 + 10 * cost_per_plate + random noise
df_clean['makeup_artist'] = 5000 + (df_clean['cost_per_plate'] * 10) + np.random.randint(-2000, 5000, size=len(df_clean))

# DJ cost: Base 10000 + random noise
df_clean['dj'] = 10000 + np.random.randint(-2000, 5000, size=len(df_clean))

# Photography: Base 15000 + 20 * cost_per_plate + random noise
df_clean['photography'] = 15000 + (df_clean['cost_per_plate'] * 20) + np.random.randint(-5000, 10000, size=len(df_clean))

# Round values to nearest hundred
df_clean['decoration'] = df_clean['decoration'].round(-2)
df_clean['makeup_artist'] = df_clean['makeup_artist'].round(-2)
df_clean['dj'] = df_clean['dj'].round(-2)
df_clean['photography'] = df_clean['photography'].round(-2)

# Save the cleaned and updated dataset
output_file = 'CostEstimation_Dataset.csv'
df_clean.to_csv(output_file, index=False)
print(f"Cleaned dataset saved to {output_file}")
print("Columns in new dataset:", df_clean.columns.tolist())
