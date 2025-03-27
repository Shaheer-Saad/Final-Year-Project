from django.shortcuts import render
import os
from .metadata_about_dataset import (
    dictionary_of_dataframes,
    dictionary_of_columns,
    get_name,
)
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
        columns = list(dictionary_of_columns[get_name(df)].keys())

        if category in ["Economy", "Economy with Climate Index"]:
            x_axis = ["Duration"]
            y_axis = [
                df["Crop"].unique().tolist(),
                [
                    column
                    for column in columns
                    if (column not in x_axis) and (column != "Crop")
                ],
            ]
            z_axis = y_axis
        elif category == "Climate":
            x_axis = ["Month of Year"]
            y_axis = [column for column in columns if column not in x_axis]
            z_axis = y_axis
        elif category in [
            "Production and Yield",
            "Cultivated Area and Production",
            "Cultivated Area and Yield",
            "Production with Climate Index",
            "Yield with Climate Index",
        ]:
            x_axis = ["Crops"]
            y_axis = [column for column in columns if column not in x_axis]
            z_axis = y_axis

        axes_values = [x_axis, y_axis, z_axis]

        # Debugging output
        print(f"Columns for {category}: {axes_values}")

        return JsonResponse({"success": True, "axes_values": axes_values})
        # return JsonResponse({"success": True, "columns": columns})

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
