from functools import wraps

import requests
from clerk_backend_api import Clerk
from django.conf import settings
from django.http import JsonResponse
from jose import jwk, jwt
from jwt import PyJWTError
from rest_framework import status as s
from rest_framework.response import Response

from budgetbox_project.settings import CLERK_ISSUER, CLERK_JWKS_URLS, CLERK_SECRET_KEY

# Initialize Clerk
# Clerk.api_key = settings.CLERK_SECRET_KEY


def get_jwks():
    response = requests.get(CLERK_JWKS_URLS)
    response.raise_for_status()
    return response.json()


def get_public_keys(kid):
    jwks = get_jwks()
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return jwk.construct(key)
    raise ValueError("Invalid Token")


def decode_token(token):
    try:
        headers = jwt.get_unverified_headers(token)
        key_id = headers["kid"]
        public_key = get_public_keys(key_id)
        payload = jwt.decode(
            token,
            public_key.to_pem().decode("utf-8"),
            algorithms=["RS256"],
            audience="clerk",
            issuer=CLERK_ISSUER,
        )
        return payload
    except PyJWTError as e:
        raise ValueError(f"Token verification failed: {str(e)}")


def clerk_auth_required(view_func):
    @wraps(view_func)
    def wrapped_view(self, request, *args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header.startswith("Bearer "):
            return Response(
                {"error": "Authorization token required"},
                status=s.HTTP_401_UNAUTHORIZED,
            )

        token = auth_header.split(" ")[1]

        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return JsonResponse(
                    {"Error": "user_id not found in token."},
                    status=s.HTTP_404_NOT_FOUND,
                )
            # Verify the session token with Clerk
            clerk_sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)
            user_details = clerk_sdk.users.get(user_id=user_id)
            request.clerk_user_id = user_details.id

        except ValueError as e:
            return JsonResponse(
                {"error": {str: e}},
                status=s.HTTP_401_UNAUTHORIZED,
            )
        return view_func(self, request, *args, **kwargs)

    return wrapped_view
