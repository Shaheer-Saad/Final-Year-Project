from django.shortcuts import render
import os
from django.conf import settings
from .metadata_about_dataset import dictionary_of_dataframes, dictionary_of_columns, get_name
import plotly.express as px
from django.http import HttpRequest, JsonResponse
from rest_framework.decorators import api_view
import pickle

# print("Looking for file in:", os.getcwd())

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
            return JsonResponse({"success": False, "message": "No category provided!"}, status=400)

        df = dictionary_of_dataframes[category]
        columns = list(dictionary_of_columns[get_name(df)].keys())

        if category in ["Economy", "Economy with Climate Index"]:
            x_axis = ["Duration"]
            y_axis = [df["Crop"].unique().tolist(), [column for column in columns if (column not in x_axis) and (column != "Crop")]]
            z_axis = y_axis
        elif category == "Climate":
            x_axis = ["Month of Year"]
            y_axis = [column for column in columns if column not in x_axis]
            z_axis = y_axis
        elif category in ["Production and Yield", "Cultivated Area and Production", "Cultivated Area and Yield", "Production with Climate Index", "Yield with Climate Index"]:
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

        if visualization_type == "3d":
            if category in ["Economy", "Economy with Climate Index"]:
                crop_for_y_axis = data.get("cropForYAxis")
                crop_for_z_axis = data.get("cropForZAxis")
                other_column_for_y_axis = data.get("otherColumnForYAxis")
                other_column_for_z_axis = data.get("otherColumnForZAxis")
                print(f"Received data:\nCategory: {category}\nVisualization type: {visualization_type}\nX-axis: {x_axis}\nY-axis:\nCrop for Y-axis: {crop_for_y_axis}\nOther Column for Y-Axis: {other_column_for_y_axis}\nZ-Axis:\nCrop for Z-axis: {crop_for_z_axis}\nOther Column for Z-Axis: {other_column_for_z_axis}")
            else:
                general_y_axis = data.get("generalYAxis")
                general_z_axis = data.get("generalZAxis")
                print(f"Received data:\nCategory: {category}\nVisualization type: {visualization_type}\nX-axis: {x_axis}\nY-axis: {general_y_axis}\nZ-Axis: {general_z_axis}")
        else:
            if category in ["Economy", "Economy with Climate Index"]:
                crop_for_y_axis = data.get("cropForYAxis")
                other_column_for_y_axis = data.get("otherColumnForYAxis")
                print(f"Received data:\nCategory: {category}\nVisualization type: {visualization_type}\nX-axis: {x_axis}\nY-axis:\nCrop for Y-axis: {crop_for_y_axis}\nOther Column for Y-Axis: {other_column_for_y_axis}")
            else:
                general_y_axis = data.get("generalYAxis")
                print(f"Received data:\nCategory: {category}\nVisualization type: {visualization_type}\nX-axis: {x_axis}\nY-axis: {general_y_axis}")

        df = dictionary_of_dataframes[category]
        sheet_name = get_name(df)
        sheet = dictionary_of_columns[sheet_name]

        if visualization_type == "3d":
            if category in ["Economy", "Economy with Climate Index"]:
                column_for_x_axis = sheet[x_axis]["name"]
                column_for_y_axis = sheet[other_column_for_y_axis]["name"]
                column_for_z_axis = sheet[other_column_for_z_axis]["name"]
                x_values = df[df["Crop"] == crop_for_y_axis][column_for_x_axis]
                y_values = df[df["Crop"] == crop_for_y_axis][column_for_y_axis]
                z_values = df[df["Crop"] == crop_for_z_axis][column_for_z_axis]
                y_metadata = sheet.get(other_column_for_y_axis, {"unit": "", "scale": ""})
                z_metadata = sheet.get(other_column_for_z_axis, {"unit": "", "scale": ""})
                x_label = f"{x_axis}".strip()
                y_label = f"{other_column_for_y_axis} - {crop_for_y_axis}<br>({y_metadata['scale']} {y_metadata['unit']})".strip()
                z_label = f"{other_column_for_z_axis} - {crop_for_z_axis}<br>({z_metadata['scale']} {z_metadata['unit']})".strip()

                x_indices = list(range(len(x_values)))

                fig = px.scatter_3d(x=x_indices, y=y_values, z=z_values, title=f"{category} - 3D Plot", height = 800)
                
                fig.update_xaxes(type="category")
                fig.update_layout(
                    scene=dict(
                        xaxis=dict(
                            title=x_label,
                            tickvals=x_indices,  # Use numerical indices as tick positions
                            ticktext=x_values,  # Show actual category labels
                        ),
                        yaxis_title=y_label,
                        zaxis_title=z_label,
                        camera=dict(
                            eye=dict(x=1.5, y=1.5, z=1.5)  # Change these values to adjust viewpoint
                        ),
                    ),
                    margin=dict(l=0, r=0, b=0, t=50),  # Maximize plot area
                    autosize=True
                )
            else:
                column_for_x_axis = sheet[x_axis]["name"]
                column_for_y_axis = sheet[general_y_axis]["name"]
                column_for_z_axis = sheet[general_z_axis]["name"]
                x_values = df[column_for_x_axis]
                y_values = df[column_for_y_axis]
                z_values = df[column_for_z_axis]
                x_label = f"{x_axis}".strip()
                y_label = f"{general_y_axis}".strip()
                z_label = f"{general_z_axis}".strip()
                
                fig = px.scatter_3d(x=x_values, y=y_values, z=z_values, title=f"{category} - 3D Plot", width = 1000, height = 800)

                fig.update_layout(
                    scene=dict(
                        xaxis_title=x_label,
                        yaxis_title=y_label,
                        zaxis_title=z_label,
                        camera=dict(
                            eye=dict(x=1.5, y=1.5, z=1.5)  # Change these values to adjust viewpoint
                        ),
                    ),
                    margin=dict(l=0, r=0, b=0, t=50),  # Maximize plot area
                    autosize=True
                )
        else:
            if category in ["Economy", "Economy with Climate Index"]:
                column_for_x_axis = sheet[x_axis]["name"]
                column_for_y_axis = sheet[other_column_for_y_axis]["name"]
                x_values = df[df["Crop"] == crop_for_y_axis][column_for_x_axis]
                print(x_values)
                y_values = df[df["Crop"] == crop_for_y_axis][column_for_y_axis]
                y_metadata = sheet.get(other_column_for_y_axis, {"unit": "", "scale": ""})
                x_label = f"{x_axis}".strip()
                y_label = f"{other_column_for_y_axis} ({y_metadata['scale']} {y_metadata['unit']})".strip()

                x_indices = list(range(len(x_values)))
                print(x_indices)

                if visualization_type == "bar":
                    fig = px.bar(x=x_indices, y=y_values, title=f"{category} - Bar Chart", labels={"x": x_label, "y": y_label})
                elif visualization_type == "line":
                    fig = px.line(x=x_indices, y=y_values, title=f"{category} - Line Chart", labels={"x": x_label, "y": y_label})
                elif visualization_type == "scatter":
                    fig = px.scatter(x=x_indices, y=y_values, title=f"{category} - Scatter Plot", labels={"x": x_label, "y": y_label})
                elif visualization_type == "histogram":
                    fig = px.histogram(x=x_indices, y=y_values, title=f"{category} - Histogram", labels={"x": x_label, "y": y_label})

                fig.update_xaxes(
                        type='category',  # Treat x-values as categories
                        tickangle=-45,    # Rotate labels if needed
                        tickmode='array',  # Use explicit tick values
                        tickvals=x_indices, # Use the actual x values as positions
                        ticktext=x_values # Same values as labels
                    )
            else:
                column_for_x_axis = sheet[x_axis]["name"]
                column_for_y_axis = sheet[general_y_axis]["name"]
                x_values = df[column_for_x_axis]
                y_values = df[column_for_y_axis]
                x_label = f"{x_axis}".strip()
                y_label = f"{general_y_axis}".strip()

                if visualization_type == "bar":
                    fig = px.bar(x=x_values, y=y_values, title=f"{category} - Bar Chart", labels={"x": x_label, "y": y_label})
                elif visualization_type == "line":
                    fig = px.line(x=x_values, y=y_values, title=f"{category} - Line Chart", labels={"x": x_label, "y": y_label})
                elif visualization_type == "scatter":
                    fig = px.scatter(x=x_values, y=y_values, title=f"{category} - Scatter Plot", labels={"x": x_label, "y": y_label})
                elif visualization_type == "histogram":
                    fig = px.histogram(x=x_values, y=y_values, title=f"{category} - Histogram", labels={"x": x_label, "y": y_label})

        # Convert plotly figure to HTML
        fig.update_xaxes(type="category")
        plot_html = fig.to_html(full_html=False)
        print(plot_html)

        return JsonResponse({"success": True, "plot_html": plot_html})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})
    
@api_view(["POST"])
def fetch_crops_and_regions(request):
    data = request.data
    category = data.get("category")
    crops = ["Apple", "Banana", "Cotton", "Dates", "Grapes"]
    if (category == "trade") or (category == "climateIndex"):

import warnings
from sklearn.exceptions import InconsistentVersionWarning
from .model_inputs import train_and_evaluate_climate_index

# def get_predictions():
#     model_path = os.path.join(settings.BASE_DIR, 'EcoCrop', 'pickle_files', 'Sindh_random_forest.pkl')
#     print(model_path)
#     with open(model_path, 'rb') as file:
#         with warnings.catch_warnings():
#             warnings.simplefilter("ignore", InconsistentVersionWarning)
#             model = pickle.load(file)
#         prediction = model.predict(train_and_evaluate_climate_index("Sindh"))
#         print(prediction)

# get_predictions()