from django.db import models

class Hall(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField()
    location = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='halls/', null=True, blank=True)
    EVENT_TYPES = [
        ('Wedding', 'Wedding'),
        ('Corporate', 'Corporate'),
        ('Birthday', 'Birthday'),
        ('Social', 'Social Gathering'),
        ('Other', 'Other'),
    ]
    # Keep old field for backward compatibility
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, default='Wedding', blank=True, null=True)
    # New field for multiple event types (stores as JSON array)
    event_types = models.JSONField(default=list, blank=True, null=True)
    google_maps_link = models.URLField(max_length=1000, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.0)
    
    # Cost Estimation Fields
    price_per_plate = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    decoration_price = models.DecimalField(max_digits=10, decimal_places=2, default=10000)
    makeup_price = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    dj_price = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    photography_price = models.DecimalField(max_digits=10, decimal_places=2, default=10000)
    menu = models.JSONField(default=dict, blank=True, null=True) 
    # Example structure: {"Starters": ["Paneer Tikka", "Chicken 65"], "Main Course": ["Veg Biryani"]}

    def __str__(self):
        return self.name

class HallImage(models.Model):
    hall = models.ForeignKey(Hall, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='halls/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.hall.name}"
