from functools import wraps
from django.http import JsonResponse
from django.conf import settings
import clerk
from rest_framework.response import Response
from rest_framework import status

# Initialize Clerk
clerk.api_key = settings.CLERK_SECRET_KEY


def clerk_auth_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):
        # Get token from Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header.startswith("Bearer "):
            return Response(
                {"error": "Authorization token required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = auth_header.split(" ")[1]

        try:
            # Verify the session token with Clerk
            session = clerk.sessions.verify_session(token)

            # Add user info to request
            request.clerk_user_id = session.user_id
            request.clerk_session = session

            return view_func(self, request, *args, **kwargs)

        except Exception as e:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    return _wrapped_view
