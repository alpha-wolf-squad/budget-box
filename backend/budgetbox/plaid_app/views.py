from datetime import datetime, timedelta  # Import datetime and timedelta

import plaid
from django.contrib.auth import get_user_model
from django.shortcuts import render
from django.utils import timezone
from plaid.api import plaid_api
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import \
    ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import \
    LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_refresh_request import TransactionsRefreshRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from rest_framework import permissions
from rest_framework import status as s
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from budgetbox_project.decorators import clerk_auth_required
from budgetbox_project.settings import PLAID_CLIENT_ID, PLAID_SANDBOX_KEY
from clerk_app.models import BudgetBoxUser
from entries.models import Budget, ExpenseStream

from .models import (BankAccount, Transaction, create_bank_account_from_plaid,
                     create_transaction_from_plaid,
                     delete_transaction_from_plaid,
                     update_transaction_from_plaid)
from .serializers import (TransactionApprovalSerializer, TransactionSerializer,
                          TransactionUpdateSerializer)

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

class Transactions(APIView):
   """
   Handle all CRUD operations for transactions
   GET: List transactions with optional filtering
   POST: Approve transaction and create ExpenseStream entry
   PUT: Update transaction details
   DELETE: Remove transaction
   """
   
   @clerk_auth_required
   def get(self, request):
       """Get user's transactions with optional filtering"""
       try:
           user = User.objects.get(clerk_user_id=request.clerk_user_id)
           
           # NOTE: Extract query parameters for filtering transactions
           limit = int(request.query_params.get('limit', 10))  # Default to 10
           category = request.query_params.get('category')
           date_from = request.query_params.get('date_from')
           date_to = request.query_params.get('date_to')
           
           # NOTE: Start with user's transactions and apply filters
           transactions = user.transactions.all()
           
           if category:
               transactions = transactions.filter(category__icontains=category)
           
           if date_from:
               transactions = transactions.filter(authorized_date__gte=date_from)
           
           if date_to:
               transactions = transactions.filter(authorized_date__lte=date_to)
           
           transactions = transactions[:limit]
           
           # NOTE: Serialize and return transaction data
           serializer = TransactionSerializer(transactions, many=True)
           
           return Response({
               "transactions": serializer.data,
               "count": len(serializer.data)
           })
           
       except User.DoesNotExist:
           return Response(
               {"error": "User not found"}, 
               status=s.HTTP_404_NOT_FOUND
           )
       except Exception as e:
           return Response(
               {"error": str(e)}, 
               status=s.HTTP_400_BAD_REQUEST
           )

   @clerk_auth_required
   def post(self, request):
       """Approve a transaction and create an ExpenseStream entry"""
       try:
           user = User.objects.get(clerk_user_id=request.clerk_user_id)
           
           # NOTE: Validate request data for transaction approval
           serializer = TransactionApprovalSerializer(data=request.data)
           if not serializer.is_valid():
               print(f"Validation failed. Errors: {serializer.errors}")
               print(f"Request data: {request.data}")
               return Response(
                   {"error": serializer.errors}, 
                   status=s.HTTP_400_BAD_REQUEST
               )
           
           # NOTE: Extract validated data
           validated_data = serializer.validated_data
           transaction_id = validated_data['transaction_id']
           description = validated_data.get('description', '')
           recurrence = validated_data.get('recurrence', False)
           
           # NOTE: Get transaction and verify user ownership
           try:
               transaction = Transaction.objects.get(id=transaction_id, user=user)
           except Transaction.DoesNotExist:
               return Response(
                   {"error": "Transaction not found or access denied"}, 
                   status=s.HTTP_404_NOT_FOUND
               )
           
           # NOTE: Create or get budget for transaction's month
           transaction_date = transaction.authorized_date or transaction.date_paid
           if not transaction_date:
               return Response(
                   {"error": "Transaction has no valid date"}, 
                   status=s.HTTP_400_BAD_REQUEST
               )
           
           budget_date = transaction_date.replace(day=1)
           budget, created = Budget.objects.get_or_create(
               budget_box_user=user,
               date=budget_date
           )
           
           # NOTE: Create ExpenseStream entry from transaction data
           expense_amount = -abs(transaction.amount)
           
           expense_stream = ExpenseStream.objects.create(
               budget=budget,
               merchant_name=transaction.merchant_name,
               description=description if description else transaction.merchant_name,
               amount=expense_amount,
               category=transaction.category,
               recurrence=recurrence
           )
           
           return Response({
               "message": "Transaction approved and added to budget successfully",
               "expense_stream": {
                   "id": expense_stream.id,
                   "merchant_name": expense_stream.merchant_name,
                   "description": expense_stream.description,
                   "amount": str(expense_stream.amount),
                   "category": expense_stream.category,
                   "recurrence": expense_stream.recurrence,
                   "budget_month": budget_date.strftime('%Y-%m')
               },
               "original_transaction": {
                   "id": transaction.id,
                   "merchant_name": transaction.merchant_name,
                   "amount": str(transaction.amount),
                   "date": str(transaction_date)
               }
           }, status=s.HTTP_201_CREATED)
           
       except User.DoesNotExist:
           return Response(
               {"error": "User not found"}, 
               status=s.HTTP_404_NOT_FOUND
           )
       except Exception as e:
           return Response(
               {"error": str(e)}, 
               status=s.HTTP_400_BAD_REQUEST
           )

   @clerk_auth_required
   def put(self, request):
       """Update a transaction"""
       try:
           user = User.objects.get(clerk_user_id=request.clerk_user_id)
           transaction_id = request.data.get('id')
           
           if not transaction_id:
               return Response(
                   {"error": "Transaction ID is required"}, 
                   status=s.HTTP_400_BAD_REQUEST
               )
           
           # NOTE: Get transaction and verify user ownership
           try:
               transaction = Transaction.objects.get(id=transaction_id, user=user)
           except Transaction.DoesNotExist:
               return Response(
                   {"error": "Transaction not found or access denied"}, 
                   status=s.HTTP_404_NOT_FOUND
               )
           
           # NOTE: Validate and apply updates to transaction
           serializer = TransactionUpdateSerializer(
               transaction, 
               data=request.data, 
               partial=True
           )
           
           if serializer.is_valid():
               serializer.save()
               
               response_serializer = TransactionSerializer(transaction)
               return Response({
                   "message": "Transaction updated successfully",
                   "transaction": response_serializer.data
               })
           
           return Response(
               {"error": serializer.errors}, 
               status=s.HTTP_400_BAD_REQUEST
           )
           
       except User.DoesNotExist:
           return Response(
               {"error": "User not found"}, 
               status=s.HTTP_404_NOT_FOUND
           )
       except Exception as e:
           return Response(
               {"error": str(e)}, 
               status=s.HTTP_400_BAD_REQUEST
           )

   @clerk_auth_required
   def delete(self, request):
       """Delete a transaction"""
       try:
           user = User.objects.get(clerk_user_id=request.clerk_user_id)
           transaction_id = request.data.get('id')
           
           if not transaction_id:
               return Response(
                   {"error": "Transaction ID is required"}, 
                   status=s.HTTP_400_BAD_REQUEST
               )
           
           # NOTE: Get transaction and verify user ownership
           try:
               transaction = Transaction.objects.get(id=transaction_id, user=user)
           except Transaction.DoesNotExist:
               return Response(
                   {"error": "Transaction not found or access denied"}, 
                   status=s.HTTP_404_NOT_FOUND
               )
           
           # NOTE: Store transaction info before deletion for response
           transaction_info = {
               "id": transaction.id,
               "merchant_name": transaction.merchant_name,
               "amount": str(transaction.amount)
           }
           
           transaction.delete()
           
           return Response({
               "message": "Transaction deleted successfully",
               "deleted_transaction": transaction_info
           }, status=s.HTTP_204_NO_CONTENT)
           
       except User.DoesNotExist:
           return Response(
               {"error": "User not found"}, 
               status=s.HTTP_404_NOT_FOUND
           )
       except Exception as e:
           return Response(
               {"error": str(e)}, 
               status=s.HTTP_400_BAD_REQUEST
           )

class RefreshTransactions(APIView):
    @clerk_auth_required
    def get(self, request):
        try:
            print("Starting RefreshTransactions - forcing Plaid data refresh")
            user = User.objects.get(clerk_user_id=request.clerk_user_id)
            print(f"User retrieved: {user}")

            bank_accounts = user.bank_accounts.filter(is_active=True)
            print(f"Active bank accounts found: {bank_accounts.count()}")

            if not bank_accounts.exists():
                print("No bank accounts linked")
                return Response(
                    {"error": "No bank account linked. Please link an account first."}, 
                    status=s.HTTP_400_BAD_REQUEST
                )
            
            all_new_transactions = []
            refresh_errors = []

            for bank_account in bank_accounts:
                print(f"\nProcessing bank account: {bank_account.account_name}")
                
                if not bank_account.plaid_access_token:
                    print(f"Skipping {bank_account.account_name} - no access token")
                    continue

                try:
                    # Step 1: Force Plaid to refresh the account data
                    print(f"Forcing Plaid refresh for {bank_account.account_name}")
                    refresh_request = TransactionsRefreshRequest(
                        access_token=bank_account.plaid_access_token
                    )
                    plaid_client.transactions_refresh(refresh_request)
                    print("Plaid refresh request sent successfully")
                    
                    # Step 2: Wait a moment for Plaid to process the refresh
                    # print("Waiting 3 seconds for Plaid to process refresh...")
                    # import time
                    # time.sleep(3)
                    
                    # Step 3: Sync the updated data using transactions/sync
                    cursor = bank_account.sync_cursor or ""
                    print(f"Starting sync with cursor: {cursor or 'None (first sync)'}")
                    
                    added = []
                    modified = []
                    removed = []
                    has_more = True
                    page_count = 0

                    # Paginate through all sync updates
                    while has_more:
                        page_count += 1
                        print(f"Fetching sync page {page_count}")
                        
                        sync_request = TransactionsSyncRequest(
                            access_token=bank_account.plaid_access_token,
                            cursor=cursor,
                            count=500
                        )
                        
                        response = plaid_client.transactions_sync(sync_request)
                        
                        page_added = response.get('added', [])
                        page_modified = response.get('modified', [])
                        page_removed = response.get('removed', [])
                        
                        print(f"Page {page_count} results:")
                        print(f"   Added: {len(page_added)} transactions")
                        print(f"   Modified: {len(page_modified)} transactions")
                        print(f"   Removed: {len(page_removed)} transactions")
                        
                        added.extend(page_added)
                        modified.extend(page_modified)
                        removed.extend(page_removed)
                        
                        has_more = response.get('has_more', False)
                        cursor = response.get('next_cursor')
                        
                        print(f"Has more pages: {has_more}")

                    print(f"Sync pagination complete for {bank_account.account_name}")
                    print(f"Total results: {len(added)} added, {len(modified)} modified, {len(removed)} removed")

                    # Step 4: Process ADDED transactions (these are the "new" ones for the response)
                    print(f"Processing {len(added)} added transactions...")
                    for i, transaction_data in enumerate(added, 1):
                        print(f"   Processing added transaction {i}/{len(added)}: {transaction_data.get('transaction_id')}")
                        
                        transaction, created = create_transaction_from_plaid(
                            user, bank_account, transaction_data
                        )
                        
                        if created:
                            print(f"   Created new transaction: {transaction.merchant_name} - ${transaction.amount}")
                            all_new_transactions.append({
                                "id": transaction.id,
                                "merchant_name": transaction.merchant_name,
                                "amount": str(transaction.amount),
                                "authorized_date": str(transaction.authorized_date),
                                "date_paid": str(transaction.date_paid) if transaction.date_paid else None,
                                "category": transaction.category,
                                "account": bank_account.account_name,
                                "is_new": True
                            })
                        else:
                            print(f"   Transaction already existed: {transaction.merchant_name}")

                    # Step 5: Process MODIFIED transactions (update existing records)
                    print(f"Processing {len(modified)} modified transactions...")
                    for i, transaction_data in enumerate(modified, 1):
                        print(f"   Processing modified transaction {i}/{len(modified)}: {transaction_data.get('transaction_id')}")
                        
                        existing_transaction = Transaction.objects.filter(
                            plaid_transaction_id=transaction_data['transaction_id']
                        ).first()
                        
                        if existing_transaction:
                            print(f"   Updating existing transaction: {existing_transaction.merchant_name}")
                            update_transaction_from_plaid(existing_transaction, transaction_data)
                        else:
                            print(f"   Modified transaction not found in database: {transaction_data['transaction_id']}")

                    # Step 6: Process REMOVED transactions (delete from database)
                    print(f"Processing {len(removed)} removed transactions...")
                    for i, removed_data in enumerate(removed, 1):
                        print(f"   Processing removed transaction {i}/{len(removed)}: {removed_data.get('transaction_id')}")
                        delete_transaction_from_plaid(removed_data['transaction_id'])

                    # Step 7: Save the updated cursor and timestamp
                    print(f"Saving updated sync cursor for {bank_account.account_name}")
                    bank_account.sync_cursor = cursor
                    bank_account.last_synced = timezone.now()
                    bank_account.save()
                    print(f"Cursor saved successfully")

                except Exception as account_error:
                    error_msg = f"Error refreshing {bank_account.account_name}: {str(account_error)}"
                    print(error_msg)
                    refresh_errors.append(error_msg)
                    continue

            # Sort new transactions by date
            print(f"Sorting {len(all_new_transactions)} new transactions by date...")
            all_new_transactions.sort(key=lambda x: x.get("date_paid") or x.get("authorized_date"), reverse=True)

            print(f"\nREFRESH SUMMARY:")
            print(f"   Bank accounts processed: {bank_accounts.count()}")
            print(f"   New transactions found: {len(all_new_transactions)}")
            print(f"   Accounts with errors: {len(refresh_errors)}")
            
            if refresh_errors:
                print("   Errors encountered:")
                for error in refresh_errors:
                    print(f"      - {error}")

            response_data = {
                "message": f"Refresh complete. Found {len(all_new_transactions)} new transactions.",
                "transactions": all_new_transactions,
                "count": len(all_new_transactions)
            }
            
            # Include errors in response if any occurred
            if refresh_errors:
                response_data["warnings"] = refresh_errors

            return Response(response_data)
        
        except Exception as e:
            print(f"CRITICAL ERROR in RefreshTransactions:")
            print(f"   Error type: {type(e).__name__}")
            print(f"   Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=s.HTTP_400_BAD_REQUEST)
