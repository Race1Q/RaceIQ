import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# --- 1. CONNECT TO DATABASE AND FETCH DATA ---
def fetch_data():
    """Connects to Supabase and fetches data from our new view."""
    load_dotenv()
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_ANON_KEY")
    supabase: Client = create_client(url, key)

    response = supabase.table('race_data_for_ml').select('*').execute()
    
    df = pd.DataFrame(response.data)
    df = df.sort_values(by=['season_year', 'race_date'])
    
    print(f"Data fetched successfully! Found {len(df)} records.")
    return df

# --- 2. FEATURE ENGINEERING ---
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Creates the final features for the model."""
    df['race_date'] = pd.to_datetime(df['race_date'])
    df['date_of_birth'] = pd.to_datetime(df['date_of_birth'])

    df['podium_finish'] = df['final_position'].apply(lambda x: 1 if x <= 3 else 0)
    df['driver_age'] = (df['race_date'] - df['date_of_birth']).dt.days / 365.25

    df = df.sort_values(by=['driver_id', 'race_date'])
    df['avg_points_last_5_races'] = df.groupby('driver_id')['points_earned'].transform(
        lambda x: x.shift(1).rolling(5, min_periods=1).mean()
    )

    ### --- NEW FEATURE: HISTORICAL PERFORMANCE AT CIRCUIT --- ###
    # Sort by driver, then circuit, then date to calculate historical performance correctly
    df = df.sort_values(by=['driver_id', 'circuit_id', 'race_date'])
    
    # Calculate a driver's average finish position at a circuit based on all their *previous* races there
    df['avg_finish_pos_at_circuit'] = df.groupby(['driver_id', 'circuit_id'])['final_position'].transform(
        lambda x: x.shift(1).expanding().mean()
    )
    ### --- END OF NEW FEATURE --- ###

    df.fillna(0, inplace=True)
    
    print("Feature engineering complete!")
    return df


# --- 3. TRAIN THE MODEL ---
def train_and_save_model(df: pd.DataFrame):
    """Splits data, trains a RandomForestClassifier, and saves it."""
    # Define which columns are features (X) and which is the target (y)
    features = [
        'grid_position',
        'driver_standings_position_before_race',
        'driver_points_before_race',
        'constructor_standings_position_before_race',
        'driver_age',
        'avg_points_last_5_races',
        ### --- NEW FEATURE ADDED TO MODEL INPUT --- ###
        'avg_finish_pos_at_circuit'
    ]
    target = 'podium_finish'

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"Training model with {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\nModel Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, 'f1_podium_model.pkl')
    print("\nModel trained and saved as 'f1_podium_model.pkl'")


# --- MAIN EXECUTION ---
if __name__ == '__main__':
    raw_data_df = fetch_data()
    featured_df = engineer_features(raw_data_df)
    train_and_save_model(featured_df)