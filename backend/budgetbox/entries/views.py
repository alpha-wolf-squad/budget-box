from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import permissions
from rest_framework import status as s
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .decorators import clerk_auth_required
from .models import EntryFields

# Create your views here.
User = get_user_model()


class GetEntries(APIView):

    @clerk_auth_required
    def get(self, request):
        print("hello from backend")
        # clerk_user_id = request.clerk_user_id
        #
        # user, created = User.objects.get_or_create(
        #     clerk_user_id=clerk_user_id,
        #     defaults={'email': f'user_{clerk_user_id}@example.com'}
        # )
        #
        # entries = EntryFields.objects.filter(user=user)
        #
        # entries_data = []
        # for entry in entries:
        #     entries_data.append({
        #         "amount": entry.amount,
        #         "description": entry.description,
        #         "merchant_name": entry.merchant_name,
        #         "category": entry.category,
        #         "date_paid": entry.date_paid,
        #     })
        #
        # return Response({"entries": entries_data})

    @clerk_auth_required
    def post(self, request):
        clerk_user_id = request.clerk_user_id
        user, created = User.objects.get_or_create(clerk_user_id=clerk_user_id)

        entry_data = request.data
        entry = EntryFields.objects.create(user=user, **entry_data)

        return Response({"message": "Entry created"}, status=s.HTTP_201_CREATED)

    @clerk_auth_required
    def delete(self, request):
        clerk_user_id = request.clerk_user_id
        user = User.objects.filter.delete(clerk_user_id=clerk_user_id)

