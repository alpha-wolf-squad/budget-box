# entries/urls.py
from django.urls import path

from .views import AddExpenseStream, AddIncomeStream, GetBudget, UpdateExpenseStream

urlpatterns = [
    path("budget/", GetBudget.as_view(), name="getbudget"),
    path("income-stream/", AddIncomeStream.as_view(), name="addincomestream"),
    path("expense-stream/", AddExpenseStream.as_view(), name="addexpensestream"),
    path(
        "partial-expense-stream/",
        UpdateExpenseStream.as_view(),
        name="updateexpensestream",
    ),
]
