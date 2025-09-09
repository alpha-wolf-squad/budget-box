from django.urls import path

from .views import (
    CreateLinkToken,
    ExchangePublicToken,
    GetTransactions,
    RefreshTransactions,
    Transactions,
)

# api/plaid/

urlpatterns = [
    path("create-link-token/", CreateLinkToken.as_view(), name="create_link_token"),
    path(
        "exchange-public-token/",
        ExchangePublicToken.as_view(),
        name="exchange_public_token",
    ),
    path("get-transactions/", GetTransactions.as_view(), name="get_transactions"),
    path(
        "transactions/", Transactions.as_view(), name="transactions"
    ),  # All CRUD operations
    path(
        "refresh-transactions/",
        RefreshTransactions.as_view(),
        name="refresh_transactions",
    ),
]
