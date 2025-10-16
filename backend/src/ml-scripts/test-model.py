# File: test-model.py
import joblib
import pandas as pd

# 1. Load the pre-trained model
try:
    model = joblib.load('f1_podium_model.pkl')
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Model file 'f1_podium_model.pkl' not found.")
    exit()

# 2. Define sample feature data, now including the new track-specific feature
sample_driver_data = [
    {
        "driverId": "VER",
        "grid_position": 1,
        "driver_standings_position_before_race": 1,
        "driver_points_before_race": 350,
        "constructor_standings_position_before_race": 1,
        "driver_age": 28.1,
        "avg_points_last_5_races": 22.8,
        "avg_finish_pos_at_circuit": 2.5 # ADDED: Strong historical average at this track
    },
    {
        "driverId": "ALB",
        "grid_position": 14,
        "driver_standings_position_before_race": 12,
        "driver_points_before_race": 27,
        "constructor_standings_position_before_race": 7,
        "driver_age": 28.5,
        "avg_points_last_5_races": 1.2,
        "avg_finish_pos_at_circuit": 11.0 # ADDED: Weaker historical average at this track
    }
]

# 3. Define the exact order of features the model was trained on
feature_order = [
    'grid_position',
    'driver_standings_position_before_race',
    'driver_points_before_race',
    'constructor_standings_position_before_race',
    'driver_age',
    'avg_points_last_5_races',
    'avg_finish_pos_at_circuit' # ADDED: The new feature is now in the list
]

print("\n--- Testing Predictions ---")

# 4. Loop through each driver and make a prediction
for driver in sample_driver_data:
    prediction_df = pd.DataFrame([driver], columns=feature_order)

    podium_probability = model.predict_proba(prediction_df)[0][1]

    print(f"Driver: {driver['driverId']}")
    print(f"   Podium Probability: {podium_probability:.2%}")