import joblib
import pandas as pd
import json
import sys

# --- 1. LOAD THE PRE-TRAINED MODEL ---
# The model is loaded once when the script starts.
try:
    model = joblib.load('f1_podium_model.pkl')
except FileNotFoundError:
    # Send a clear error message back to Node.js
    print(json.dumps({"error": "Model file not found. Please train the model first."}))
    sys.exit(1)

# --- 2. GET INPUT DATA FROM NODE.JS ---
# The features are passed as a single JSON string argument from python-shell
try:
    # sys.argv[1] is the first argument passed to the script
    input_data_json = sys.argv[1]
    input_data = json.loads(input_data_json)
except IndexError:
    print(json.dumps({"error": "No input data provided."}))
    sys.exit(1)
except json.JSONDecodeError:
    print(json.dumps({"error": "Invalid JSON format for input data."}))
    sys.exit(1)


# --- 3. MAKE PREDICTION ---
# The model expects the data in a specific order, same as training.
# We create a DataFrame from the input dictionary.
try:
    # Ensure the feature order is the same as when the model was trained
    feature_order = [
        'grid_position',
        'driver_standings_position_before_race',
        'driver_points_before_race',
        'constructor_standings_position_before_race',
        'driver_age',
        'avg_points_last_5_races'
        'avg_finish_pos_at_circuit'  # The new feature added during training
    ]
    
    # Create a DataFrame with a single row for prediction
    prediction_df = pd.DataFrame([input_data], columns=feature_order)

    # Predict the probability of a podium finish (class 1)
    # model.predict_proba returns probabilities for [class 0, class 1]
    podium_probability = model.predict_proba(prediction_df)[0][1]

    # --- 4. SEND RESULT BACK TO NODE.JS ---
    # Print the final result as a JSON string. Node.js will capture this.
    result = {
        "success": True,
        "podium_probability": round(podium_probability, 4) # Round to 4 decimal places
    }
    print(json.dumps(result))

except Exception as e:
    # Catch any other potential errors during prediction
    error_result = {
        "error": f"An error occurred during prediction: {str(e)}"
    }
    print(json.dumps(error_result))
    sys.exit(1)