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

    def __str__(self):
        return self.name
