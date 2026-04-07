import json
from rest_framework import serializers
from .models import Hall, HallImage

class HallImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallImage
        fields = ['id', 'image', 'created_at']

class HallSerializer(serializers.ModelSerializer):
    images = HallImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Hall
        fields = '__all__'

    def to_internal_value(self, data):
        # Determine the type of data we're dealing with (likely a QueryDict or dict)
        if hasattr(data, 'dict'):
            # Convert QueryDict to a standard dict for easier modification
            mutable_data = data.dict()
        else:
            # Create a shallow copy if it's already a dict or similar
            mutable_data = dict(data)
            
        for field in ['event_types', 'menu']:
            if field in mutable_data:
                value = mutable_data[field]
                if isinstance(value, str) and value.strip():
                    # Only attempt to parse if it specifically looks like JSON (starts with [ or {)
                    trimmed_value = value.strip()
                    if trimmed_value.startswith(('[', '{')):
                        try:
                            # Parse the JSON string into its native Python structure
                            mutable_data[field] = json.loads(trimmed_value)
                        except (ValueError, json.JSONDecodeError):
                            # If parsing failing, fallback and let DRF handle validation
                            pass

        return super().to_internal_value(mutable_data)
