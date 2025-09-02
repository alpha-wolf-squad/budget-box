# entries/serializers.py
from rest_framework import serializers

from .models import Budget, ExpenseStream


class Budget_serializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"


class ExpanseStream_serializer(serializers.ModelSerializer):  
    class Meta:
        model = ExpenseStream
        fields = "__all__"
