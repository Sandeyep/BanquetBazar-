import pandas as pd
import json

df = pd.read_csv('BanquetBazar.csv')

info = df.head(3).to_dict(orient='records')

with open('dataset_sample.json', 'w', encoding='utf-8') as f:
    json.dump(info, f, indent=4, ensure_ascii=False)
