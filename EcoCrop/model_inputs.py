import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Step 1: Load the dataset
data = pd.read_excel("fyp_dataset.xlsx", sheet_name="Climate Data - Original sheet")

# Step 2: Train and Evaluate Function for Climate Index
def train_and_evaluate_climate_index(region):
    # Dynamic target column for the selected region
    target_column = f"{region}_Climate_Index"

    # Check if the region and required columns exist
    required_features = [
        f"{region}_Combined_temperature_normalized",
        f"{region}_shortwave_radiation_normalized",
        f"{region}_precipitation_hours_normalized",
        f"{region}_fao_evapotranspiration_normalized",
    ]

    missing_cols = [col for col in required_features + [target_column] if col not in data.columns]
    if missing_cols:
        print(f"Missing columns for region '{region}': {missing_cols}")
        return

    print(f"Target Variable: {target_column}")

    # Subset data for the region
    year_month = data['year_month']  # Extract the year_month column

    # Create the X DataFrame using only the specified features
    X = data[required_features]
    y = data[target_column]  # Target variable

    # Sort the data chronologically by year_month
    data_sorted = pd.DataFrame({'year_month': year_month, 'y': y})
    for col in X.columns:
        data_sorted[col] = X[col]
    data_sorted = data_sorted.sort_values(by='year_month', ascending=True)

    # Redefine X, y, and year_month after sorting
    X = data_sorted[required_features]
    y = data_sorted['y']
    year_month = data_sorted['year_month']

    # Train-test split without shuffling (chronological order)
    X_train, X_test, y_train, y_test, year_train, year_test = train_test_split(
        X, y, year_month, test_size=0.2, shuffle=False
    )

    return X_test
