import joblib
import pandas as pd
import json
import sys

def main():
    """
    Main function to load the model, process input, and make predictions.
    """
    # --- 1. LOAD THE PRE-TRAINED MODEL ---
    try:
        model = joblib.load('f1_podium_model.pkl')
    except FileNotFoundError:
        print_json_error("Model file not found. Please train the model first.")
        sys.exit(1)

    # --- 2. GET INPUT DATA FROM NODE.JS ---
    try:
        if len(sys.argv) < 2:
            raise IndexError("No input data provided.")
        input_data_json = sys.argv[1]
        # This will be a list of dictionaries, one for each driver
        input_data_list = json.loads(input_data_json)
        if not isinstance(input_data_list, list) or not input_data_list:
            raise ValueError("Input data must be a non-empty list of drivers.")
    except IndexError as e:
        print_json_error(str(e))
        sys.exit(1)
    except json.JSONDecodeError:
        print_json_error("Invalid JSON format for input data.")
        sys.exit(1)
    except ValueError as e:
        print_json_error(str(e))
        sys.exit(1)

    # --- 3. MAKE PREDICTIONS ---
    try:
        # Define the feature order to match the model's training
        # This MUST be identical to the 'features' list in the training script
        feature_order = [
            'driver_standings_position_before_race',
            'driver_points_before_race',
            'constructor_standings_position_before_race',
            'constructor_points_before_race',
            'driver_age',
            'avg_points_last_5_races',
            'avg_finish_pos_at_circuit',
            'avg_constructor_points_last_5_races'
        ]
        
        # Create a DataFrame from the list of driver data
        prediction_df = pd.DataFrame(input_data_list)
        
        # Keep the driver_id for the final output
        driver_ids = prediction_df['driver_id']

        # Ensure the DataFrame columns are in the correct order for the model
        # FIX: Added .copy() to prevent the SettingWithCopyWarning
        prediction_df_ordered = prediction_df[feature_order].copy()
        
        # Fill any potential NaN values, just in case
        prediction_df_ordered.fillna(0, inplace=True)

        # Predict the probability of a podium finish for all drivers at once
        podium_probabilities = model.predict_proba(prediction_df_ordered)[:, 1]

        # --- 4. FORMAT AND SEND RESULTS BACK TO NODE.JS ---
        results = []
        for driver_id, prob in zip(driver_ids, podium_probabilities):
            results.append({
                "driver_id": int(driver_id), # Ensure driver_id is an integer
                "podium_probability": round(float(prob), 4)
            })

        # Sort drivers by their podium probability in descending order
        results.sort(key=lambda x: x['podium_probability'], reverse=True)

        print(json.dumps({"success": True, "predictions": results}))

    except KeyError as e:
        print_json_error(f"Missing feature in input data: {str(e)}. Ensure all required features are provided.")
        sys.exit(1)
    except Exception as e:
        print_json_error(f"An error occurred during prediction: {str(e)}")
        sys.exit(1)

def print_json_error(message):
    """Prints a standardized JSON error message."""
    print(json.dumps({"error": message}))

if __name__ == '__main__':
    main()