from django.shortcuts import render

# Create your views here.

def custom_login_view(request):
    return render(request, "Login_page.html")

def dashboard(request):
    return render(request, "Dashboard.html")
