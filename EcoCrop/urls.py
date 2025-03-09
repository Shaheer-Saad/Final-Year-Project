from django.urls import path
from . import views

urlpatterns = [
    path('', views.custom_login_view, name='Login_page'),
    path('Dashboard', views.dashboard, name='Dashboard')
]