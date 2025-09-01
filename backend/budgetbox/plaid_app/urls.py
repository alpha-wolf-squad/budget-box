from django.urls import path
from .views import CreateLinkToken, ExchangePublicToken, GetTransactions, ListTransactions


urlpatterns = [
    path('create-link-token/', CreateLinkToken.as_view(), name='create_link_token'),
    path('exchange-token/', ExchangePublicToken.as_view(), name='exchange_public_token'),
    path('get-transactions/', GetTransactions.as_view(), name='get_transactions'),
    path('list-transactions/', ListTransactions.as_view(), name='list_transactions'),
]