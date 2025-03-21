from django.shortcuts import render
import os
import pandas as pd
import plotly.express as px
from django.http import HttpRequest, JsonResponse
from rest_framework.decorators import api_view

print("Looking for file in:", os.getcwd())

# Create your views here.


def login(request):
    return render(request, "Login_page.html")


def dashboard(request):
    return render(request, "Dashboard.html")


def visualizations(request):
    return render(request, "Visualizations_page.html")


def predictions(request):
    return render(request, "Predictions_page.html")


climate_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Climate Data")
economy_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Economy Data")
economy_with_climate_index_df = pd.read_excel(
    "fyp_dataset.xlsx", sheet_name="Economy with Climate Index"
)
production_with_climate_index_df = pd.read_excel(
    "fyp_dataset.xlsx", sheet_name="production|climate index"
)
yield_with_climate_index_df = pd.read_excel(
    "fyp_dataset.xlsx", sheet_name="yield|climate index"
)
production_yield_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="production|yield")
area_and_production_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Area|production")
area_and_yield_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Yield|Area")
others_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="remaining data")

dictionary_of_dataframes = {
    "Climate": climate_df,
    "Economy": economy_df,
    "Economy with Climate Index": economy_with_climate_index_df,
    "Production with Climate Index": production_with_climate_index_df,
    "Yield with Climate Index": yield_with_climate_index_df,
    "Production and Yield": production_yield_df,
    "Cultivated Area and Production": area_and_production_df,
    "Cultivated Area and Yield": area_and_yield_df,
}


@api_view(["POST"])
def fetch_columns(request: HttpRequest):
    try:
        data = request.data
        category = data.get("category")

        # Debugging category value
        print(f"Received category: {category}")

        if not category:
            return JsonResponse(
                {"success": False, "message": "No category provided!"}, status=400
            )

        df = dictionary_of_dataframes[category]
        columns = df.columns.tolist()

        # Debugging output
        print(f"Columns for {category}: {columns}")

        return JsonResponse({"success": True, "columns": columns})

    except Exception as e:
        print("There's an issue!")
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@api_view(["POST"])
def generate_plot(request):
    """API to generate Plotly visualizations based on user input"""
    try:
        data = request.data

        # Extract user selections
        category = data.get("category")
        visualization_type = data.get("visType")
        x_axis = data.get("xAxis")
        y_axis = data.get("yAxis")
        z_axis = data.get("zAxis") if "zAxis" in data else None

        print(
            f"Received data:\nCategory: {category}\nVisualization type: {visualization_type}\nX-axis: {x_axis}\nY-axis: {y_axis}\nZ-axis: {z_axis}"
        )

        df = dictionary_of_dataframes[category]

        # Generate the plot based on the selected type
        if visualization_type == "bar":
            fig = px.bar(df, x=x_axis, y=y_axis, title=f"{category} - Bar Chart")
        elif visualization_type == "line":
            fig = px.line(df, x=x_axis, y=y_axis, title=f"{category} - Line Chart")
        elif visualization_type == "scatter":
            fig = px.scatter(df, x=x_axis, y=y_axis, title=f"{category} - Scatter Plot")
        elif visualization_type == "histogram":
            fig = px.histogram(df, x=x_axis, y=y_axis, title=f"{category} - Histogram")
        elif visualization_type == "3d" and z_axis:
            fig = px.scatter_3d(
                df, x=x_axis, y=y_axis, z=z_axis, title=f"{category} - 3D Plot"
            )

        # Convert plotly figure to HTML
        plot_html = fig.to_html(full_html=False)

        return JsonResponse({"success": True, "plot_html": plot_html})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})
