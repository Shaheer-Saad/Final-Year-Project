import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
# import matplotlib.pyplot as plt

# Read the economy sheet from the Excel file
df_economy = pd.read_excel('fyp_dataset.xlsx', sheet_name='Economy with Climate Index')

def prepare_data(crop_type, region):
    production_col = f'{region} Production'
    yield_col = f'{region} Yield'
    climate_col = f'{region}_Climate_Index'
    area_col = f'{region} Area'
    
    if not all(col in df_economy.columns for col in [production_col, yield_col, climate_col, area_col]):
        return None, None, None, None, None, None
    
    filtered_data = df_economy[df_economy['Crop'] == crop_type].copy()
    
    if filtered_data.empty:
        return None, None, None, None, None, None
    
    filtered_data.loc[:, 'climate_change'] = filtered_data[climate_col].diff()
    filtered_data.loc[:, 'climate_trend'] = filtered_data[climate_col].rolling(window=3).mean()
    filtered_data.loc[:, 'area_change'] = filtered_data[area_col].diff()
    filtered_data.loc[:, 'area_trend'] = filtered_data[area_col].rolling(window=3).mean()
    filtered_data.loc[:, 'production_trend'] = filtered_data[production_col].rolling(window=3).mean()
    filtered_data.loc[:, 'yield_trend'] = filtered_data[yield_col].rolling(window=3).mean()
    
    filtered_data = filtered_data.dropna()
    
    X = filtered_data[[climate_col, 'climate_change', 'climate_trend', 
                      area_col, 'area_change', 'area_trend']].values
    y_production = filtered_data[production_col].values
    y_yield = filtered_data[yield_col].values
    years = filtered_data['year_range'].values
    
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    return X, y_production, y_yield, years, scaler, filtered_data

# def evaluate_and_visualize_model(X_train, X_test, y_train, y_test, model, title, years_train, years_test):
    model.fit(X_train, y_train)
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    # Calculate R² values
    r2_train = r2_score(y_train, y_pred_train)
    r2_test = r2_score(y_test, y_pred_test)
    
    # Print actual vs predicted values for training set
    print(f"\nTraining Set - Actual vs Predicted Values for {title}:")
    comparison_df_train = pd.DataFrame({
        'Year': years_train,
        'Actual': y_train,
        'Predicted': y_pred_train,
        'Difference': y_train - y_pred_train
    })
    comparison_df_train = comparison_df_train.round(2)
    print(comparison_df_train.to_string(index=False))
    print(f"R² (Train): {r2_train:.2f}")
    
    # Print actual vs predicted values for test set
    print(f"\nTest Set - Actual vs Predicted Values for {title}:")
    comparison_df_test = pd.DataFrame({
        'Year': years_test,
        'Actual': y_test,
        'Predicted': y_pred_test,
        'Difference': y_test - y_pred_test
    })
    comparison_df_test = comparison_df_test.round(2)
    print(comparison_df_test.to_string(index=False))
    print(f"R² (Test): {r2_test:.2f}")
    
    # Plotting
    plt.figure(figsize=(12, 6))
    plt.plot(years_train, y_train, 'b-', label='Actual Values (Train)', marker='o')
    plt.plot(years_train, y_pred_train, 'r--', label='Predicted Values (Train)', marker='s')
    plt.plot(years_test, y_test, 'g-', label='Actual Values (Test)', marker='o')
    plt.plot(years_test, y_pred_test, 'y--', label='Predicted Values (Test)', marker='s')
    plt.title(f'{title} - Actual vs Predicted Values')
    plt.xlabel('Year')
    plt.ylabel(title)
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# def train_models(crop_type, region, predict_type='both'):
    X, y_production, y_yield, years, scaler, filtered_data = prepare_data(crop_type, region)
    
    if X is None:
        return None, None, None
    
    production_model = None
    yield_model = None
    
    # Train and evaluate models based on user selection
    print("\nModel Performance Evaluation:")
    
    X_train, X_test, y_production_train, y_production_test = train_test_split(X, y_production, test_size=0.2, random_state=42)
    X_train, X_test, y_yield_train, y_yield_test = train_test_split(X, y_yield, test_size=0.2, random_state=42)
    
    years_train, years_test = train_test_split(years, test_size=0.2, random_state=42)
    
    if predict_type.lower() in ['both', 'production']:
        production_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        # evaluate_and_visualize_model(X_train, X_test, y_production_train, y_production_test, production_model, f'{crop_type} Production in {region}', years_train, years_test)
    
    if predict_type.lower() in ['both', 'yield']:
        yield_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        # evaluate_and_visualize_model(X_train, X_test, y_yield_train, y_yield_test, yield_model, f'{crop_type} Yield in {region}', years_train, years_test)
    
    return production_model, yield_model, scaler

def predict_future(start_year, end_year, crop_type, region, predict_type='both'):
    production_model, yield_model, scaler = train_models(crop_type, region, predict_type)
    
    if (predict_type.lower() in ['both', 'production'] and production_model is None) or \
       (predict_type.lower() in ['both', 'yield'] and yield_model is None):
        return None
    
    predictions = []
    
    for year in range(start_year, end_year + 1):
        # Prompt user for climate index and area
        current_climate = float(input(f"Enter Climate Index for {year}: "))
        current_area = float(input(f"Enter Area for {year}: "))
        
        features = np.array([[
            current_climate,
            0,  # No change calculation needed
            current_climate,  # Use current value for trend
            current_area,
            0,  # No change calculation needed
            current_area  # Use current value for trend
        ]])
        
        features_scaled = scaler.transform(features)
        
    #     prediction_dict = {
    #         'Year': f"{year}-{str(year+1-2000).zfill(2)}",
    #         'Climate_Index': round(current_climate, 2),
    #         'Area': round(current_area, 2)
    #     }
        
    #     if predict_type.lower() in ['both', 'production'] and production_model is not None:
    #         pred_production = production_model.predict(features_scaled)[0]
    #         prediction_dict['Predicted_Production'] = round(pred_production, 2)
        
    #     if predict_type.lower() in ['both', 'yield'] and yield_model is not None:
    #         pred_yield = yield_model.predict(features_scaled)[0]
    #         prediction_dict['Predicted_Yield'] = round(pred_yield, 2)
        
    #     predictions.append(prediction_dict)
    
    # predictions_df = pd.DataFrame(predictions)
    # return predictions_df

print("\nAvailable crops: rice, wheat, cotton, sugarcane")
crop_type = input("Enter crop type: ").lower()
print("\nAvailable regions: Punjab, Sindh, KPK, Balochistan")
region = input("Enter region: ")
start_year = int(input("\nEnter start year: "))
end_year = int(input("Enter end year: "))
print("\nWhat would you like to predict?")
print("1. Production only")
print("2. Yield only")
print("3. Both Production and Yield")
choice = input("Enter your choice (1/2/3): ")

predict_type = {
    '1': 'production',
    '2': 'yield',
    '3': 'both'
}.get(choice, 'both')

predictions = predict_future(start_year, end_year, crop_type, region, predict_type)
if predictions is not None:
    print(f"\nPredictions for {crop_type} in {region} ({start_year}-{end_year}):")
    print(predictions)
else:
    print(f"\nNo data available for {crop_type} in {region}")