from django.shortcuts import render
import os
from django.conf import settings
from .metadata_about_dataset import dictionary_of_dataframes, dictionary_of_columns, get_name
import plotly.express as px
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .metadata_about_models import crops, regions_for_production_yield, regions_for_production_yield_with_climate_index, regions_for_climate_index, get_crop, get_region
import pandas as pd
import numpy as np
import pickle
import warnings
from sklearn.exceptions import InconsistentVersionWarning

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
def fetch_columns(request):
    try:
        data = request.data
        category = data.get("category")

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

        return JsonResponse({"success": True, "axes_values": axes_values})

    except Exception as e:
        print("There's an issue!")
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@api_view(["POST"])
def generate_plot(request):
    """API to generate Plotly visualizations based on user input"""
    try:
        data = request.data

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
    try:
        data = request.data
        category = data.get("category")

        crops_list = []
        regions_list = []
        
        if (category == "trade"):
            crops_list = crops
            regions_list = []
        elif category == "productionAndYield":
            crops_list = crops
            regions_list = regions_for_production_yield
        elif category == "productionAndYieldWithClimateIndex":
            crops_list = crops
            regions_list = regions_for_production_yield_with_climate_index
        else:
            crops_list = []
            regions_list = regions_for_climate_index
        
        return JsonResponse({"success": True, "crops": crops_list, "regions": regions_list})
    
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})

import warnings
from sklearn.exceptions import InconsistentVersionWarning

@api_view(["POST"])
def generate_prediction(request):
    try:
        data = request.data
        print("Data received:", data)
        category = [data.get("type")]
        prediction = None
        
        if category[0] == "trade":
            category.append(data.get("tradeType"))
            trade_type = data.get("tradeType").lower()[:-1]
            crop = get_crop(int(data.get("cropId")))
            production = int(data.get("production"))
            file_name = f'{crop}_{trade_type}_model.pkl'
            model_path = os.path.join(settings.BASE_DIR, 'EcoCrop', 'pickle_files', 'import_and_export', file_name)
            print(model_path)
            with open(model_path, 'rb') as file:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", InconsistentVersionWarning)
                    model = pickle.load(file)
                prediction = model.predict([[production]]).tolist() # Convert ndarray to list

        if category[0] == "productionAndYield":
            category.append(data.get("productionType"))
            production_type = data.get("productionType").lower()
            crop = get_crop(int(data.get("cropId")))
            region = get_region(category[0], int(data.get("regionId")))
            area = int(data.get("area"))
            file_name = f'{crop}_{region}_{production_type}_model.pkl'
            model_path = os.path.join(settings.BASE_DIR, 'EcoCrop', 'pickle_files', 'production_and_yield', file_name)
            print(model_path)
            with open(model_path, 'rb') as file:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", InconsistentVersionWarning)
                    model = pickle.load(file)
                prediction = model.predict([[area]]).tolist()
                print(prediction)

        if category[0] == "productionAndYieldWithClimateIndex":
            category.append(data.get("productionType"))
            production_type = data.get("productionType").lower()
            crop = get_crop(int(data.get("cropId")))
            region = get_region(category[0], int(data.get("regionId")))
            area = int(data.get("area"))
            climate_index = int(data.get("climateIndex"))
            file_name = f'{crop}1_{region}_{production_type}_model.pkl'
            model_path = os.path.join(settings.BASE_DIR, 'EcoCrop', 'pickle_files', 'production_and_yield_with_climate', file_name)
            print(model_path)
            with open(model_path, 'rb') as file:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", InconsistentVersionWarning)
                    model = pickle.load(file)
                prediction = model.predict([[climate_index, 0, area, climate_index, 0, area]]).tolist()
                print(prediction)

        if category[0] == "climateIndex":
            category.append(None)
            df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Climate Data - Original sheet")
            region = get_region(category[0], int(data.get("regionId")))
            forecast_period = int(data.get("months"))
            # Dynamic target column for the selected region
            target_column = f"{region}_Climate_Index"
            
            # Check if the region and required columns exist
            required_features = [
                f"{region}_Combined_temperature_normalized",
                f"{region}_shortwave_radiation_normalized",
                f"{region}_precipitation_hours_normalized",
                f"{region}_fao_evapotranspiration_normalized",
            ]

            # Subset data for the region
            year_month = df['year_month']  # Extract the year_month column

            # Create the X DataFrame using only the specified features
            X = df[required_features]
            y = df[target_column]  # Target variable

            # Sort the data chronologically by year_month
            data_sorted = pd.DataFrame({'year_month': year_month, 'y': y})
            for col in X.columns:
                data_sorted[col] = X[col]
            data_sorted = data_sorted.sort_values(by='year_month', ascending=True)

            # Use all data up to February 2025 for training
            train_data = data_sorted[data_sorted['year_month'] <= '2025-02']
            
            # Generate future dates starting from March 2025
            last_date = pd.to_datetime('2025-02')
            future_dates = pd.date_range(start=last_date + pd.DateOffset(months=1), 
                                        periods=forecast_period, 
                                        freq='ME')  # Changed from 'M' to 'ME'
            
            # Create future feature data using seasonal patterns
            # Get the last 12 months of data for each feature
            last_year_data = train_data.tail(12)
            
            # Create future features by repeating the seasonal pattern
            future_features = pd.DataFrame()
            for feature in required_features:
                # Get the seasonal pattern from last year
                seasonal_pattern = last_year_data[feature].values
                # Repeat the pattern for the forecast period
                repeated_pattern = np.tile(seasonal_pattern, forecast_period // 12 + 1)[:forecast_period]
                future_features[feature] = repeated_pattern

            file_name = f'{region}_climate_index_model.pkl'
            model_path = os.path.join(settings.BASE_DIR, 'EcoCrop', 'pickle_files', 'climate_index', file_name)
            print(model_path)
            with open(model_path, 'rb') as file:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", InconsistentVersionWarning)
                    model = pickle.load(file)
                future_predictions = model.predict(future_features)
        
                # Ensure predictions are within 0-1 range
                future_predictions = np.clip(future_predictions, 0, 1)
                
                prediction = []
                for date, value in zip(future_dates, future_predictions):
                    # Format the date as 'YYYY-MM-DD'
                    formatted_date = date.strftime('%Y-%m-%d')
                    
                    # Round the value to 3 decimal places
                    rounded_value = round(float(value), 3)
                    
                    prediction.append([formatted_date, rounded_value])
                print(prediction)
        print(prediction)
        
        return JsonResponse({"success": True, "category": category, "prediction": prediction})
    
    except Exception as e:
        print("Here")
        return JsonResponse({"success": False, "error": str(e)})