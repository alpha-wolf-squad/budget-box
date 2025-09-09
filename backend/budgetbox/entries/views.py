# entries/views.py
from datetime import date, datetime
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s

# FIX: correct import path for the decorator module
from budgetbox_project.decorators import clerk_auth_required

from .models import Budget, ExpenseStream
from .serializers import Budget_serializer, ExpanseStream_serializer


User = get_user_model()


def _first_of_month(d: date) -> date:
    return d.replace(day=1)


def _parse_date_or_current_month(raw):
    """
    Accepts 'YYYY-MM' or 'YYYY-MM-DD' (as str). Defaults to current month.
    Returns first-of-month date.
    """
    if not raw:
        return _first_of_month(now().date())
    if isinstance(raw, date):
        return _first_of_month(raw)
    raw = str(raw)
    for fmt in ("%Y-%m-%d", "%Y-%m"):
        try:
            parsed = datetime.strptime(raw, fmt).date()
            return _first_of_month(parsed)
        except ValueError:
            continue
    # fallback
    return _first_of_month(now().date())


def _get_or_create_user(clerk_user_id: str) -> User:
    # FIX: BudgetBoxUser requires non-null budget_id; provide minimal sane default
    user, _ = User.objects.get_or_create(
        clerk_user_id=clerk_user_id,
        defaults={
            "email": f"user_{clerk_user_id}@example.com",
            "budget_id": clerk_user_id,
        },
    )
    return user


def _get_or_create_budget(user: User, month_date: date) -> Budget:
    return Budget.objects.get_or_create(
        budget_box_user=user,
        date=_first_of_month(month_date)
    )[0]


class GetBudget(APIView):
    @clerk_auth_required
    def get(self, request):
        clerk_user_id = request.clerk_user_id
        user = _get_or_create_user(clerk_user_id)

        # optional ?date=YYYY-MM or YYYY-MM-DD
        month_param = request.query_params.get("date")
        print("DEBUGGING:", month_param)
        month_date = _parse_date_or_current_month(month_param)

        print(f"User ID: {user.id}, Month Date: {month_date}")  # Debugging statement

        budget = _get_or_create_budget(user, month_date)
        streams = budget.expenses.all().order_by("id")

        print(f"Budget ID: {budget.id}, Number of Streams: {streams.count()}")  # Debugging statement

        return Response({
            "budget": Budget_serializer(budget).data,
            "streams": ExpanseStream_serializer(streams, many=True).data,
        }, status=s.HTTP_200_OK)


class AddIncomeStream(APIView):
    @clerk_auth_required
    def post(self, request):
        clerk_user_id = request.clerk_user_id
        user = _get_or_create_user(clerk_user_id)

        month_date = _parse_date_or_current_month(request.data.get("date"))
        budget = _get_or_create_budget(user, month_date)

        merchant_name = request.data.get("merchant_name", "")
        description = request.data.get("description", "")
        amount = request.data.get("amount", 0)

        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({"detail": "Invalid amount"}, status=s.HTTP_400_BAD_REQUEST)

        # force positive for income
        if amount < 0:
            amount = -amount

        stream = ExpenseStream.objects.create(
            budget=budget,
            merchant_name=merchant_name,
            description=description,
            amount=amount,
            category="income",
            # recurrence=bool(request.data.get("recurrence", False)),
        )
        return Response(ExpanseStream_serializer(stream).data, status=s.HTTP_201_CREATED)


class AddExpenseStream(APIView):
    @clerk_auth_required
    def post(self, request):
        clerk_user_id = request.clerk_user_id
        user = _get_or_create_user(clerk_user_id)

        month_date = _parse_date_or_current_month(request.data.get("date"))
        budget = _get_or_create_budget(user, month_date)

        merchant_name = request.data.get("merchant_name", "")
        description = request.data.get("description", "")
        amount = request.data.get("amount", 0)

        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({"detail": "Invalid amount"}, status=s.HTTP_400_BAD_REQUEST)

        # force negative for expense
        if amount > 0:
            amount = -amount

        stream = ExpenseStream.objects.create(
            budget=budget,
            merchant_name=merchant_name,
            description=description,
            amount=amount,
            category="expense",
            # recurrence=bool(request.data.get("recurrence", False)),
        )
        return Response(ExpanseStream_serializer(stream).data, status=s.HTTP_201_CREATED)


class UpdateExpenseStream(APIView):
    @clerk_auth_required
    def put(self, request):
        """
        Payload must include: id
        Optional fields to update: merchant_name, description, amount, category, recurrence
        """
        clerk_user_id = request.clerk_user_id
        user = _get_or_create_user(clerk_user_id)

        stream_id = request.data.get("id")
        if not stream_id:
            return Response({"detail": "Missing 'id' for stream"}, status=s.HTTP_400_BAD_REQUEST)

        try:
            stream = ExpenseStream.objects.select_related("budget", "budget__budget_box_user").get(id=stream_id)
        except ExpenseStream.DoesNotExist:
            return Response({"detail": "Stream not found"}, status=s.HTTP_404_NOT_FOUND)

        if stream.budget.budget_box_user_id != user.id:
            return Response({"detail": "Forbidden"}, status=s.HTTP_403_FORBIDDEN)

        # Update only provided fields
        updatable = ["merchant_name", "description", "amount", "category"]
        for field in updatable:
            if field in request.data:
                if field == "amount":
                    try:
                        val = Decimal(str(request.data["amount"]))
                    except Exception:
                        return Response({"detail": "Invalid amount"}, status=s.HTTP_400_BAD_REQUEST)
                    setattr(stream, field, val)
                # elif field == "recurrence":
                #     setattr(stream, field, bool(request.data["recurrence"]))
                else:
                    setattr(stream, field, request.data[field])

        stream.save(update_fields=updatable)
        return Response(ExpanseStream_serializer(stream).data, status=s.HTTP_200_OK)

