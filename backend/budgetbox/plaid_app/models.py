from django.db import models
from django.conf import settings

# Create your models here.
class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
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

def create_transaction_from_plaid(user, transaction_data):

    merchant_name = (
        transaction_data.get('merchant_name') or
        transaction_data.get('name') or
        'Unknown Merchant'
    )

    pfc = transaction_data.get('personal_finance_category', {})
    category = pfc.get('primary', 'Uncategorized')

    transaction = Transaction.objects.create(
        user=user,
        plaid_transaction_id=transaction_data['transaction_id'],
        amount=abs(transaction_data['amount']),
        merchant_name=merchant_name,
        date_paid=transaction_data['date'],
        category=category,
    )

    return transaction