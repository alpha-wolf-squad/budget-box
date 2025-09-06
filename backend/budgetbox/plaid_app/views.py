import plaid
from django.contrib.auth import get_user_model
from django.shortcuts import render
from django.utils import timezone
from plaid.api import plaid_api
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from rest_framework import permissions
from rest_framework import status as s
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from budgetbox_project.decorators import clerk_auth_required
from budgetbox_project.settings import PLAID_CLIENT_ID, PLAID_SANDBOX_KEY
from clerk_app.models import BudgetBoxUser

from .models import (BankAccount, Transaction, create_bank_account_from_plaid,
                     create_transaction_from_plaid,
                     delete_transaction_from_plaid,
                     update_transaction_from_plaid)

from datetime import datetime, timedelta  # Import datetime and timedelta
# Create your views here.

User = get_user_model()

configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SANDBOX_KEY,
    },
)
api_client = plaid.ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)


class CreateLinkToken(APIView):

    @clerk_auth_required
    def post(self, request):
        try:
            # Get or create Django user from Clerk user ID
            user, created = User.objects.get_or_create(
                clerk_user_id=request.clerk_user_id,
                defaults={
                    "email": f"{request.clerk_user_id}@example.com"
                },  # Temp email
            )

            # Create Link token request
            link_request = LinkTokenCreateRequest(
                products=[Products("transactions")],  # What data we want
                client_name="BudgetBox",
                country_codes=[CountryCode("US")],
                language="en",
                user=LinkTokenCreateRequestUser(client_user_id=str(user.id)),
            )

            # Get Link token from Plaid
            response = plaid_client.link_token_create(link_request)
            link_token = response["link_token"]

            return Response(
                {"link_token": link_token, "message": "Link token created successfully"}
            )

        except Exception as e:
            return Response({"error": str(e)}, status=s.HTTP_400_BAD_REQUEST)


class ExchangePublicToken(APIView):
    @clerk_auth_required
    def post(self, request):
        try:
            public_token = request.data.get("public_token")

            if not public_token:
                return Response(
                    {"error": "public_token is required"}, status=s.HTTP_400_BAD_REQUEST
                )

            # Exchange public token for access token
            exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = plaid_client.item_public_token_exchange(exchange_request)
            access_token = response["access_token"]
            item_id = response['item_id']

            accounts_request = AccountsGetRequest(access_token=access_token)
            accounts_response = plaid_client.accounts_get(accounts_request)
            accounts_data = accounts_response['accounts']

            institution_name = accounts_response.get('item', {}).get('institution_name', 'Unknown Bank')

            # Get user
            user = User.objects.get(clerk_user_id=request.clerk_user_id)

            # Lists to collect results
            created_accounts = []
            existing_accounts = []

            for account_data in accounts_data:
                account_data['item_id'] = item_id
                
                existing_account = BankAccount.objects.filter(
                    plaid_account_id=account_data['account_id']
                ).first()
                
                if not existing_account:
                    bank_account = create_bank_account_from_plaid(
                        user, account_data, access_token, institution_name
                    )
                    
                    # Add to created list
                    created_accounts.append({
                        'id': bank_account.id,
                        'account_name': bank_account.account_name,
                        'account_type': str(bank_account.account_type),
                        'account_subtype': str(bank_account.account_subtype),
                        'mask': bank_account.mask,
                        'institution_name': bank_account.institution_name
                    })
                else:
                    # Add to existing list
                    existing_accounts.append({
                        'id': existing_account.id,
                        'account_name': existing_account.account_name,
                        'message': 'Already connected'
                    })

            return Response({
                'message': f'Successfully processed {len(accounts_data)} accounts',
                'created_accounts': created_accounts,
                'existing_accounts': existing_accounts,
                'total_new': len(created_accounts),
                'total_existing': len(existing_accounts)
            })
        
        except Exception as e:
            import traceback
            print(f"Full error traceback:")
            print(traceback.format_exc())
            return Response({
                'error': str(e)
            }, status=s.HTTP_400_BAD_REQUEST)

class GetTransactions(APIView):
    @clerk_auth_required
    def get(self, request):
        try:
            user = BudgetBoxUser.objects.get(clerk_user_id=request.clerk_user_id)
            bank_accounts = user.bank_accounts.filter(is_active=True)

            if not bank_accounts.exists():
                return Response(
                    {"error": "No bank account linked. Please link an account first."},
                    status=400
                )

            all_created_transactions = []

            for bank_account in bank_accounts:
                if not bank_account.plaid_access_token:
                    continue

                try:
                    cursor = bank_account.sync_cursor or ""
                    
                    # Collect all updates for this account
                    added = []
                    modified = []
                    removed = []
                    has_more = True

                    # Paginate through all updates
                    while has_more:
                        sync_request = TransactionsSyncRequest(
                            access_token=bank_account.plaid_access_token,
                            cursor=cursor,
                            count=500  # Optional: limit per request
                        )
                        
                        response = plaid_client.transactions_sync(sync_request)
                        
                        # Collect all updates from this page
                        added.extend(response.get('added', []))
                        modified.extend(response.get('modified', []))
                        removed.extend(response.get('removed', []))
                        
                        has_more = response.get('has_more', False)
                        cursor = response.get('next_cursor')
                    # Process all added transactions
                    for transaction_data in added:
                        transaction, created = create_transaction_from_plaid(
                            user, bank_account, transaction_data
                        )
                        
                        if created:
                            all_created_transactions.append({
                                "id": transaction.id,
                                "merchant_name": transaction.merchant_name,
                                "amount": str(transaction.amount),
                                "authorized_date": str(transaction.authorized_date),
                                "date_paid": str(transaction.date_paid) if transaction.date_paid else None,
                                "category": transaction.category,
                                "account": bank_account.account_name,
                            })

                    # Process modified transactions
                    for transaction_data in modified:
                        existing_transaction = Transaction.objects.filter(
                            plaid_transaction_id=transaction_data['transaction_id']
                        ).first()
                        
                        if existing_transaction:
                            update_transaction_from_plaid(existing_transaction, transaction_data)

                    # Process removed transactions  
                    for removed_data in removed:
                        delete_transaction_from_plaid(removed_data['transaction_id'])

                    # Save cursor for next sync
                    bank_account.sync_cursor = cursor
                    bank_account.last_synced = timezone.now()
                    bank_account.save()

                except Exception as account_error:
                    print(f"Error syncing account {bank_account.account_name}: {account_error}")
                    continue

            return Response({
                "message": f"Created {len(all_created_transactions)} new transactions",
                "transactions": all_created_transactions,
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=400)

class ListTransactions(APIView):
    @clerk_auth_required
    def get(self, request):
        try:
            user = User.objects.get(clerk_user_id=request.clerk_user_id)
            transactions = user.transactions.all()[:3]  # Last 3 transactions

            transaction_data = []
            for transaction in transactions:
                transaction_data.append(
                    {
                        "id": transaction.id,
                        "merchant_name": transaction.merchant_name,
                        "amount": str(transaction.amount),
                        "authorized_date": str(transaction.authorized_date),  # Primary date field
                        "date_paid": str(transaction.date_paid) if transaction.date_paid else None,  # Optional
                        "category": transaction.category,
                        "created_at": transaction.created_at.isoformat(),
                    }
                )
            
            return Response(
                {"transactions": transaction_data, "count": len(transaction_data)}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=s.HTTP_400_BAD_REQUEST)

class RefreshTransactions(APIView):

    @clerk_auth_required
    def get(self, request):
        try:
            user = User.objects.get(clerk_user_id=request.clerk_user_id)

            bank_accounts = user.bank_accounts.filter(is_active=True)

            if not bank_accounts.exists():
                return Response(
                    {"error": "No bank account linked. Please link an account first."}, status=s.HTTP_400_BAD_REQUEST
                )
            
            start_date = datetime.now() - timedelta(days=7) # new transactions start from one week ago
            end_date = datetime.now() # new transactions end at pull time
            all_new_transactions = []

            for bank_account in bank_accounts:
                if not bank_account.plaid_access_token:
                    continue

                transactions_request = TransactionsGetRequest(
                    access_token=bank_account.plaid_access_token,
                    start_date=start_date(),
                    end_date=end_date(),
                )

                response = plaid_client.transactions_get(transactions_request)
                transactions_data = response["transactions"]

                for transaction_data in transactions_data[:10]:
                    transaction, created = Transaction.objects.get_or_create(
                        plaid_transaction_id=transaction_data["transaction_id"],
                        defaults={
                            "user": user,
                            "bank_account": bank_account,
                            "amount": abs(transaction_data["amount"]),
                            "merchant_name": transaction_data.get("merchant_name") or transaction_data.get("name") or "Unknown Merchant",
                            "date_paid": transaction_data["date"],
                            "category": transaction_data.get("personal_finance_category", {}).get("primary", "Uncategorized")
                        }
                    )

                    all_new_transactions.append({
                        "id": transaction.id,
                        "merchant_name": transaction.merchant_name,
                        "amount": str(transaction.amount),
                        "date_paid": str(transaction.date_paid),
                        "category": transaction.category,
                        "account": bank_account.account_name,
                        "is_new": created # tells frontend if this is new
                    })

            all_new_transactions.sort(key=lambda x: x["date_paid"], reverse=True) # sorts by date paid

            return Response({
                "message": f"Retrieved {len(all_new_transactions)} transactions.",
                "transactions": all_new_transactions,
                "count": len(all_new_transactions)
            })
        
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=400)

            new_transaction_data = []
            for new_transaction in new_transactions:
                new_transaction_data.append(
                    {
                        "id": new_transaction.id,
                        "merchant_name": new_transaction.merchant_name,
                        "amount": str(new_transaction.amount),
                        "date_paid": str(new_transaction.date_paid),
                        "category": new_transaction.category,
                        "created_at": new_transaction.created_at.isoformat(),
                    }
                )

            return Response(
                {"new transactions": new_transaction_data, "count": len(new_transaction_data)}
            )
        
        except Exception as e:
            return Response({"error": str(e)}, status=s.HTTP_400_BAD_REQUEST)