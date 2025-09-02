# entries/urls.py
from django.urls import path

from .views import GetBudget, AddIncomeStream, AddExpenseStream, UpdateExpenseStream

urlpatterns = [
    path("get-budget/", GetBudget.as_view(), name="getbudget"),
    path("add-income-stream/", AddIncomeStream.as_view(), name="addincomestream"),
    path("add-expense-stream/", AddExpenseStream.as_view(), name="addexpensestream"),
    path("update-expense-stream/", UpdateExpenseStream.as_view(), name="updateexpensestream"),
]
