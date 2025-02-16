from django.shortcuts import render
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView

# Create your views here.

# class GoogleLoginView(OAuth2LoginView):
#     adapter_class = GoogleOAuth2Adapter

def custom_login_view(request):
    return render(request, "Login_page.html")
