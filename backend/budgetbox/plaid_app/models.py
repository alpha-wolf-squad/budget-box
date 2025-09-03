#plaid_app/models.py
from django.db import models
from django.conf import settings

# Create your models here.
class BankAccount(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bank_accounts'
    )

    plaid_account_id = models.CharField(max_length=255, unique=True)
    plaid_access_token = models.CharField(max_length=255, unique=True, null=True)
    # plaid_transaction_id = models.CharField(max_length=255, unique=True)
    plaid_item_id = models.CharField(max_length=255, blank=True)

    account_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50)
    account_subtype = models.CharField(max_length=50)
    mask = models.CharField(max_length=10, blank=True) # last 4 digits of account number

    institution_name = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['institution_name', 'account_name']

    def __str__(self):
        return f"{self.institution_name} {self.account_name} (*{self.mask})"

class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.CASCADE,
        related_name='transactions',
        default=1
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant_name = models.CharField(max_length=255)
    date_paid = models.DateField()
    category = models.CharField(max_length=100, blank=True, default='Uncategorized')

    # prevents duplicate transactions
    plaid_transaction_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_paid']

    def __str__(self):
        return f"{self.merchant_name} - {self.amount}"
    
def create_bank_account_from_plaid(user, account_data, access_token, institution_name='Unknown Bank'):

    bank_account = BankAccount.objects.create(
        user=user,
        plaid_account_id=account_data['account_id'],
        plaid_access_token=access_token,
        plaid_item_id=account_data.get('item_id', ''),
        account_name=account_data['name'],
        account_type=account_data['type'],
        account_subtype=account_data['subtype'],
        mask=account_data.get('mask', ''),
        institution_name=institution_name
    )
    print(bank_account, "INFO")
    return bank_account

def create_transaction_from_plaid(user, bank_account, transaction_data):

    merchant_name = (
        transaction_data.get('merchant_name') or
        transaction_data.get('name') or
        'Unknown Merchant'
    )

    pfc = transaction_data.get('personal_finance_category', {})
    category = pfc.get('primary', 'Uncategorized')

    transaction = Transaction.objects.create(
        user=user,
        bank_account=bank_account,
        plaid_transaction_id=transaction_data['transaction_id'],
        amount=abs(transaction_data['amount']),
        merchant_name=merchant_name,
        date_paid=transaction_data['date'],
        category=category,
    )

    return transaction