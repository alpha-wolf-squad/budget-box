# entries/models.py
from decimal import Decimal

from django.conf import settings
from django.db import models

# from clerk_app.models import BudgetBoxUser


class Budget(models.Model):
    budget_box_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="budgets", on_delete=models.CASCADE
    )
    # store the FIRST day of the month for uniqueness
    date = models.DateField()

    class Meta:
        unique_together = ("budget_box_user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.budget_box_user.email} - {self.date.strftime('%Y-%m')}"


class ExpenseStream(models.Model):
    budget = models.ForeignKey(
        Budget, related_name="expenses", on_delete=models.CASCADE
    )

    merchant_name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    # amount is negative for expenses, positive for income
    amount = models.DecimalField(
        max_digits=20, decimal_places=2, default=Decimal("0.00")
    )
    # category defines "income" or "expense"
    category = models.CharField(max_length=100)
    # whether it's a recurring payment or not
    recurrence = models.BooleanField(default=False, blank=True)

    def __str__(self):
        return f"{self.merchant_name}: ${self.amount}"
