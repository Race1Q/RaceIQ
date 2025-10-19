import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# --- 1. CONNECT TO DATABASE AND FETCH DATA ---
def fetch_data():
    """Connects to Supabase and fetches data from the ML view."""
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
    """Creates the final features for the model, avoiding data leakage."""
    df['race_date'] = pd.to_datetime(df['race_date'])
    df['date_of_birth'] = pd.to_datetime(df['date_of_birth'])

    df['podium_finish'] = df['final_position'].apply(lambda x: 1 if x is not None and x <= 3 else 0)
    df['driver_age'] = (df['race_date'] - df['date_of_birth']).dt.days / 365.25

    df = df.sort_values(by=['driver_id', 'race_date'])
    
    df['avg_points_last_5_races'] = df.groupby('driver_id')['points_earned'].transform(
        lambda x: x.shift(1).rolling(5, min_periods=1).mean()
    )

    df = df.sort_values(by=['driver_id', 'circuit_id', 'race_date'])
    df['avg_finish_pos_at_circuit'] = df.groupby(['driver_id', 'circuit_id'])['final_position'].transform(
        lambda x: x.shift(1).expanding().mean()
    )
    
    constructor_points_per_race = df.groupby(['race_id', 'constructor_id'])['points_earned'].sum().reset_index()
    df = pd.merge(df, constructor_points_per_race.rename(columns={'points_earned': 'constructor_points_in_race'}), on=['race_id', 'constructor_id'], how='left')
    
    df = df.sort_values(by=['constructor_id', 'race_date'])
    df['avg_constructor_points_last_5_races'] = df.groupby('constructor_id')['constructor_points_in_race'].transform(
        lambda x: x.shift(1).rolling(5, min_periods=1).mean()
    )

    df.fillna(0, inplace=True)
    
    print("Feature engineering complete!")
    return df

# --- 3. TRAIN THE FINAL MODEL ON ALL DATA ---
def train_and_save_model(df: pd.DataFrame):
    """Trains a RandomForestClassifier on all available data and saves it."""
    
    features = [
        'driver_standings_position_before_race',
        'driver_points_before_race',
        'constructor_standings_position_before_race',
        'constructor_points_before_race',
        'driver_age',
        'avg_points_last_5_races',
        'avg_finish_pos_at_circuit',
        'avg_constructor_points_last_5_races'
    ]
    target = 'podium_finish'

    # Use all available data for training the final model
    X = df[features]
    y = df[target]

    print(f"Training final model with {len(X)} samples from all available data...")
    
    model = RandomForestClassifier(
        n_estimators=100, 
        random_state=42, 
        class_weight='balanced',
        n_jobs=-1
    )
    model.fit(X, y)

    # --- FOOLPROOF SAVE LOGIC ---
    # Get the absolute path to the directory where this training script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Define the path for the model file within that same directory
    model_path = os.path.join(script_dir, 'f1_podium_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"\nFinal model trained on all data and saved to '{model_path}'")


# --- MAIN EXECUTION ---
if __name__ == '__main__':
    raw_data_df = fetch_data()
    featured_df = engineer_features(raw_data_df)
    train_and_save_model(featured_df)
