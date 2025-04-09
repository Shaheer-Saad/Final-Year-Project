from django.urls import path
from . import views

urlpatterns = [
    path('', views.login, name = 'Login_page'),
    path('Dashboard', views.dashboard, name = 'Dashboard'),
    path('Visualizations_page', views.visualizations, name = 'Visualizations_page'),
    path('Predictions_page', views.predictions, name = 'Predictions_page'),
    path('API/Fetch_columns', views.fetch_columns, name = 'Fetch_columns'),
    path('API/Generate_plot', views.generate_plot, name = 'Generate_plot'),
    path('API/Fetch_crops_and_regions', views.fetch_crops_and_regions, name = "Fetch_crops_and_regions")
]