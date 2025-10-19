import joblib
import os
import sys

def main():
    """
    Loads the F1 model and prints the feature names it was trained on.
    """
    try:
        # Get the absolute path to the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'f1_podium_model.pkl')
        
        print(f"--- F1 Model Diagnostic ---")
        print(f"Attempting to load model from: {model_path}")
        
        if not os.path.exists(model_path):
            print("\n[ERROR] Model file 'f1_podium_model.pkl' not found at this location.")
            sys.exit(1)

        model = joblib.load(model_path)
        
        # For scikit-learn models, feature names are stored in `feature_names_in_`
        if hasattr(model, 'feature_names_in_'):
            print("\n[SUCCESS] Model loaded. Features the model was trained on:")
            for feature in model.feature_names_in_:
                print(f"  - {feature}")
        else:
            print("\n[WARNING] Model loaded, but could not retrieve feature names.")

    except Exception as e:
        print(f"\n[ERROR] An error occurred while loading the model: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()