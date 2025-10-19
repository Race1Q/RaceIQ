import joblib
import pandas as pd
import json
import sys
import traceback
import os

def run_predictions():
    # --- 1. LOAD MODEL (Robust Path) ---
    try:
        # --- THIS IS THE FIX ---
        # Get the directory where the script itself is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Construct the full path to the model file
        model_path = os.path.join(script_dir, 'f1_podium_model.pkl')
        print(f"Attempting to load model from: {model_path}", file=sys.stderr) # DEBUG PRINT
        # ----------------------
        model = joblib.load(model_path) # Load using the full path
        print("Model loaded successfully.", file=sys.stderr) # DEBUG PRINT
    except FileNotFoundError:
        # Use the calculated path in the error message
        print_json_error(f"Model file 'f1_podium_model.pkl' not found at expected location: {model_path}")
        sys.exit(1)
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        print_json_error(f"Error loading model: Type={error_type}, Msg={error_msg}, Traceback={error_traceback}")
        sys.exit(1)

    # --- 2. GET INPUT DATA ---
    try:
        if len(sys.argv) < 2:
            raise IndexError("No input data provided.")
        input_data_json = sys.argv[1]
        input_data_list = json.loads(input_data_json)
        if not isinstance(input_data_list, list) or not input_data_list:
            raise ValueError("Input data must be a non-empty list of drivers.")
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        print_json_error(f"Error processing input data: Type={error_type}, Msg={error_msg}, Traceback={error_traceback}")
        sys.exit(1)

    # --- 3. MAKE PREDICTIONS ---
    try:
        feature_order = [ # Ensure this matches training!
            'driver_standings_position_before_race', 'driver_points_before_race',
            'constructor_standings_position_before_race', 'constructor_points_before_race',
            'driver_age', 'avg_points_last_5_races', 'avg_finish_pos_at_circuit',
            'avg_constructor_points_last_5_races'
        ]

        prediction_df = pd.DataFrame(input_data_list)
        driver_ids = prediction_df['driver_id']

        # Check DataFrame right before prediction
        # print("--- DataFrame Info ---", file=sys.stderr)
        # prediction_df[feature_order].info(buf=sys.stderr) # Print info to stderr
        # print("--- DataFrame Head ---", file=sys.stderr)
        # print(prediction_df[feature_order].head().to_string(), file=sys.stderr) # Print head to stderr

        prediction_df_ordered = prediction_df[feature_order].copy()
        prediction_df_ordered.fillna(0, inplace=True)

        # Explicitly check data types
        # print("--- DataFrame dtypes before prediction ---", file=sys.stderr)
        # print(prediction_df_ordered.dtypes, file=sys.stderr)

        podium_probabilities = model.predict_proba(prediction_df_ordered)[:, 1]

        results = []
        for driver_id, prob in zip(driver_ids, podium_probabilities):
            results.append({
                "driver_id": int(driver_id),
                "podium_probability": round(float(prob), 4)
            })

        results.sort(key=lambda x: x['podium_probability'], reverse=True)

        # SUCCESS! Print final JSON to stdout
        print(json.dumps({"success": True, "predictions": results}))

    except KeyError as e:
        print_json_error(f"Missing feature in input data: {str(e)}. Required: {feature_order}")
        sys.exit(1)
    # Generic exception MUST be caught by the outer block now

def print_json_error(message):
    """Prints a standardized JSON error message TO STDOUT."""
    # NestJS/python-shell reads stdout for results, stderr for errors
    print(json.dumps({"success": False, "error": message}))

if __name__ == '__main__':
    try:
        run_predictions()
    except Exception as e:
        # --- CATCH ALL ERRORS AND PRINT TO STDERR ---
        error_type = type(e).__name__
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        # Print the detailed error to stderr so NestJS captures it
        print(f"PYTHON SCRIPT CRASHED:\nType={error_type}\nMsg={error_msg}\nTraceback={error_traceback}", file=sys.stderr)
        # Also print the JSON error format to stdout in case NestJS reads that
        print_json_error(f"Script crashed: Type={error_type}, Msg={error_msg}")
        sys.exit(1) # Crucial: exit with a non-zero code