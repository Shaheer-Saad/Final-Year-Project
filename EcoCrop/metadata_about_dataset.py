import pandas as pd

climate_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Climate Data")
economy_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Economy Data")
economy_with_climate_index_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="Economy with Climate Index")
production_with_climate_index_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="production|climate index")
yield_with_climate_index_df = pd.read_excel("fyp_dataset.xlsx", sheet_name="yield|climate index")
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

dictionary_of_columns = {
    "climate_df": {
        "Month of Year": {"name": "year_month"},
        "Climate Index of Sindh": {"name": "Sindh_Climate_Index"},
        "Climate Index of Punjab": {"name": "Punjab_Climate_Index"},
        "Climate Index of Khyber Pakhtunkhwa": {"name": "Kpk_Climate_Index"},
        "Climate Index of Balochistan": {"name": "Balochistan_Climate_Index"},
    },
    "economy_df": {
        "Duration": {"name": "year_range"},
        "Crop": {"name": "Crop"},
        "Cultivated Area in Punjab": {
            "name": "Punjab Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Punjab": {
            "name": "Punjab Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Punjab": {
            "name": "Punjab Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Cultivated Area in Sindh": {
            "name": "Sindh Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Sindh": {
            "name": "Sindh Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Sindh": {
            "name": "Sindh Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Cultivated Area in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Cultivated Area in Balochistan": {
            "name": "Balochistan Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Balochistan": {
            "name": "Balochistan Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Balochistan": {
            "name": "Balochistan Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Cultivated Area in Pakistan": {
            "name": "Pakistan Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Pakistan": {
            "name": "Pakistan Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Pakistan": {
            "name": "Pakistan Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Quantity of Export": {
            "name": "Export Quantity",
            "unit": "tons",
            "scale": "x1000",
        },
        "Export Earnings": {
            "name": "Export Value",
            "unit": "PKR",
            "scale": "xMillions",
        },
        "Quantity of Import": {
            "name": "Import Quantity",
            "unit": "tons",
            "scale": "x1000",
        },
        "Cost of Import": {"name": "Import Value", "unit": "PKR", "scale": "xMillions"},
    },
    "economy_with_climate_index_df": {
        "Duration": {"name": "year_range"},
        "Crop": {"name": "Crop"},
        "Cultivated Area in Punjab": {
            "name": "Punjab Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Punjab": {
            "name": "Punjab Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Punjab": {
            "name": "Punjab Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Climate Index of Punjab": {"name": "Punjab_Climate_Index"},
        "Cultivated Area in Sindh": {
            "name": "Sindh Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Sindh": {
            "name": "Sindh Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Sindh": {
            "name": "Sindh Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Climate Index of Sindh": {"name": "Sindh_Climate_Index"},
        "Cultivated Area in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Climate Index of Khyber Pakhtunkhwa": {
            "name": "Khyber Pakhtoonkhaw_Climate_Index"
        },
        "Cultivated Area in Balochistan": {
            "name": "Balochistan Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Balochistan": {
            "name": "Balochistan Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Balochistan": {
            "name": "Balochistan Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Climate Index of Balochistan": {"name": "Balochistan_Climate_Index"},
        "Cultivated Area in Pakistan": {
            "name": "Pakistan Area",
            "unit": "acres",
            "scale": "x1000",
        },
        "Production in Pakistan": {
            "name": "Pakistan Production",
            "unit": "tons",
            "scale": "x1000",
        },
        "Yield in Pakistan": {
            "name": "Pakistan Yield",
            "unit": "kilograms/acre",
            "scale": "x40",
        },
        "Quantity of Export": {
            "name": "Export Quantity",
            "unit": "tons",
            "scale": "x1000",
        },
        "Export Earnings": {
            "name": "Export Value",
            "unit": "PKR",
            "scale": "xMillions",
        },
        "Quantity of Import": {
            "name": "Import Quantity",
            "unit": "tons",
            "scale": "x1000",
        },
        "Cost of Import": {"name": "Import Value", "unit": "PKR", "scale": "xMillions"},
    },
    "production_with_climate_index_df": {
        "Crops": {"name": "Crops"},
        "Correlation for Sindh": {"name": "Sindh_correlation"},
        "Correlation for Punjab": {"name": "Punjab_correlation"},
        "Correlation for Khyber PakhtunKhwa": {"name": "Kpk_correlation"},
        "Correlation for Balochistan": {"name": "Balochistan_correlation"},
    },
    "yield_with_climate_index_df": {
        "Crops": {"name": "Crops"},
        "Correlation for Sindh": {"name": "Sindh_correlation"},
        "Correlation for Punjab": {"name": "Punjab_correlation"},
        "Correlation for Khyber PakhtunKhwa": {"name": "Kpk_correlation"},
        "Correlation for Balochistan": {"name": "Balochistan_correlation"},
    },
    "production_yield_df": {
        "Crops": {"name": "Crops"},
        "Correlation for Sindh": {"name": "Sindh_correlation"},
        "Correlation for Punjab": {"name": "Punjab_correlation"},
        "Correlation for Khyber PakhtunKhwa": {"name": "Kpk_correlation"},
        "Correlation for Balochistan": {"name": "Balochistan_correlation"},
        "Correlation for Pakistan": {"name": "Pakistan_correlation"},
    },
    "area_and_production_df": {
        "Crops": {"name": "Crops"},
        "Correlation for Sindh": {"name": "Sindh_correlation"},
        "Correlation for Punjab": {"name": "Punjab_correlation"},
        "Correlation for Khyber PakhtunKhwa": {"name": "Kpk_correlation"},
        "Correlation for Balochistan": {"name": "Balochistan_correlation"},
        "Correlation for Pakistan": {"name": "Pakistan_correlation"},
    },
    "area_and_yield_df": {
        "Crops": {"name": "Crops"},
        "Correlation for Sindh": {"name": "Sindh_correlation"},
        "Correlation for Punjab": {"name": "Punjab_correlation"},
        "Correlation for Khyber PakhtunKhwa": {"name": "Kpk_correlation"},
        "Correlation for Balochistan": {"name": "Balochistan_correlation"},
        "Correlation for Pakistan": {"name": "Pakistan_correlation"},
    },
}

def get_name(var):
    for name, value in globals().items():
        if value is var:
            return name
