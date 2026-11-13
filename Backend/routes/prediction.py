from flask import Blueprint, request, jsonify
import joblib
import pandas as pd


# Create prediction route
prediction_bp = Blueprint("prediction", __name__)


# Load trained machine learning model
from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "fraud_model.pkl"

model = joblib.load(MODEL_PATH)


@prediction_bp.route("/api/predict", methods=["POST"])
def predict():

    try:

        # Get data sent by the frontend
        data = request.get_json()

        # Get transaction time
        transaction_time = data["transaction_time"]

        # Convert 03:00 into 3
        transaction_hour = int(
            transaction_time.split(":")[0]
        )

        # Create transaction data
        transaction = pd.DataFrame([{
            "amount": float(data["amount"]),
            "transaction_type": data["transaction_type"],
            "location": data["location"],
            "device_type": data["device_type"],
            "transaction_hour": transaction_hour,
            "previous_transactions": int(
                data["previous_transactions"]
            ),
            "failed_attempts": int(
                data["failed_attempts"]
            )
        }])

        # Make prediction
        prediction = model.predict(transaction)[0]

        # Get fraud probability
        probability = model.predict_proba(transaction)[0]

        fraud_probability = probability[1] * 100

        # Decide result
        if prediction == 1:

            result = "FRAUD"
            risk_level = "HIGH"

        else:

            result = "SAFE"

            if fraud_probability >= 30:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

        # Send result back
        return jsonify({
            "success": True,
            "prediction": result,
            "risk_level": risk_level,
            "fraud_probability": round(
                fraud_probability,
                2
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 400