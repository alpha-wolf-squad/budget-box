from django.conf import settings
from django.db import models


# Create your models here.
class BankAccount(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bank_accounts"
    )

    plaid_account_id = models.CharField(max_length=255, unique=True)
    plaid_access_token = models.CharField(max_length=255, unique=True, null=True)
    # plaid_transaction_id = models.CharField(max_length=255, unique=True)
    plaid_item_id = models.CharField(max_length=255, blank=True, unique=True)

    account_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50)
    account_subtype = models.CharField(max_length=50)
    mask = models.CharField(
        max_length=10, blank=True
    )  # last 4 digits of account number

    institution_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    # NOTE: Based off of Plaid's documentation, a cursor represents the last update requested by the user.  We must store this for future syncs. Without this, we cannot ensure we don't duplicate transactions
    sync_cursor = models.TextField(blank=True, null=True)  # Stores Plaid's sync cursor
    last_synced = models.DateTimeField(blank=True, null=True)  # Track when last synced
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["institution_name", "account_name"]

    def __str__(self):
        return f"{self.institution_name} {self.account_name} (*{self.mask})"

class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    bank_account = models.ForeignKey(
        BankAccount, on_delete=models.CASCADE, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant_name = models.CharField(max_length=255)

    # Use authorized_date as primary field (more accurate than posted date)
    authorized_date = models.DateField()
    # Keep date_paid for reference but not required
    date_paid = models.DateField(blank=True, null=True)

    category = models.CharField(max_length=100, blank=True, default="Uncategorized")
    
    # CRITICAL: plaid_transaction_id is the primary key for sync operations
    # This is how Plaid tracks added/modified/removed transactions in sync responses
    plaid_transaction_id = models.CharField(max_length=255, unique=True)
    
    # Store account_id for reference but sync uses plaid_transaction_id for tracking
    plaid_account_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Track when transaction was last modified

    class Meta:
        ordering = ["-authorized_date"]
        # I removed complex constraints and let Plaid's sync handle deduplication via transaction_id
        indexes = [
            models.Index(fields=['user', 'authorized_date']),
            models.Index(fields=['plaid_account_id']),
        ]

    def __str__(self):
        return f"{self.merchant_name} - {self.amount}"


def create_bank_account_from_plaid(
    user, account_data, access_token, institution_name="Unknown Bank"
):
    bank_account = BankAccount.objects.create(
        user=user,
        plaid_account_id=account_data["account_id"],
        plaid_access_token=access_token,
        plaid_item_id=account_data.get("item_id", ""),
        account_name=account_data["name"],
        account_type=account_data["type"],
        account_subtype=account_data["subtype"],
        mask=account_data.get("mask", ""),
        institution_name=institution_name,
    )
    print(bank_account, "INFO")
    return bank_account


def create_transaction_from_plaid(user, bank_account, transaction_data):
    """
    Create transaction from Plaid data - designed for TransactionsSyncRequest
    
    The sync endpoint provides transaction_id as the stable identifier,
    so we use get_or_create with plaid_transaction_id as the lookup field.
    """
    merchant_name = (
        transaction_data.get("merchant_name")
        or transaction_data.get("name")
        or "Unknown Merchant"
    )
    pfc = transaction_data.get("personal_finance_category", {})
    category = pfc.get("primary", "Uncategorized")

    # Use authorized_date as primary, fall back to date if authorized_date is None
    authorized_date = transaction_data.get("authorized_date") or transaction_data.get("date")
    date_paid = transaction_data.get("date")  # Keep for reference

    # Use get_or_create with plaid_transaction_id - this is Plaid's recommended approach
    transaction, created = Transaction.objects.get_or_create(
        plaid_transaction_id=transaction_data["transaction_id"],
        defaults={
            "user": user,
            "bank_account": bank_account,
            "amount": abs(transaction_data["amount"]),
            "merchant_name": merchant_name,
            "authorized_date": authorized_date,
            "date_paid": date_paid,
            "plaid_account_id": transaction_data.get("account_id", ""),
            "category": category,
        }
    )
    
    return transaction, created


def update_transaction_from_plaid(transaction, transaction_data):
    """
    Update existing transaction with modified data from Plaid sync
    
    This is called for transactions in the 'modified' array from sync response
    """
    merchant_name = (
        transaction_data.get("merchant_name")
        or transaction_data.get("name") 
        or "Unknown Merchant"
    )
    pfc = transaction_data.get("personal_finance_category", {})
    category = pfc.get("primary", "Uncategorized")
    
    authorized_date = transaction_data.get("authorized_date") or transaction_data.get("date")
    date_paid = transaction_data.get("date")
    
    # Update fields that might have changed
    transaction.amount = abs(transaction_data["amount"])
    transaction.merchant_name = merchant_name
    transaction.authorized_date = authorized_date
    transaction.date_paid = date_paid
    transaction.category = category
    transaction.plaid_account_id = transaction_data.get("account_id", "")
    
    transaction.save()
    return transaction


def delete_transaction_from_plaid(transaction_id):
    """
    Delete transaction based on Plaid transaction_id
    
    This is called for transactions in the 'removed' array from sync response
    """
    try:
        transaction = Transaction.objects.get(plaid_transaction_id=transaction_id)
        transaction.delete()
        return True
    except Transaction.DoesNotExist:
        # Transaction doesn't exist in our database, which is fine
        return False

