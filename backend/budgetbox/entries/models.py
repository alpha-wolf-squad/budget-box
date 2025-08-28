from django.db import models
from django.conf import settings

# Create your models here.

class EntryFields(models.Model):
    amount = models.DecimalField(decimal_places=2, max_digits=20)
    description = models.TextField(blank=True)
    merchant_name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    date_paid = models.DateField(blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='entries')

    def __str__(self):
        return f"{self.merchant_name}{self.amount}"