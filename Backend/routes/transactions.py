from flask import Blueprint, jsonify
import pandas as pd

transactions_bp = Blueprint("transactions", __name__)

# Load transaction dataset
DATASET_PATH = "dataset/transactions.csv"


@transactions_bp.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        df = pd.read_csv(DATASET_PATH)

        # Convert dataframe to JSON
        transactions = df.to_dict(orient="records")

        return jsonify({
            "success": True,
            "transactions": transactions
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@transactions_bp.route("/api/dashboard", methods=["GET"])
def dashboard():

    try:
        df = pd.read_csv(DATASET_PATH)

        # Total transactions
        total_transactions = len(df)

        # Fraud transactions
        fraud_transactions = int(
            (df["is_fraud"] == 1).sum()
        )

        # Safe transactions
        safe_transactions = int(
            (df["is_fraud"] == 0).sum()
        )

        # Fraud percentage
        fraud_percentage = round(
            (fraud_transactions / total_transactions) * 100,
            2
        )

        return jsonify({
            "success": True,
            "total_transactions": total_transactions,
            "fraud_transactions": fraud_transactions,
            "safe_transactions": safe_transactions,
            "fraud_percentage": fraud_percentage
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
        # ========================================
# Reports API
# ========================================

@transactions_bp.route("/api/reports", methods=["GET"])
def get_reports():

    try:

        df = pd.read_csv(DATASET_PATH)

        # Basic statistics

        total_transactions = len(df)

        fraud_df = df[df["is_fraud"] == 1]

        safe_df = df[df["is_fraud"] == 0]

        fraud_count = len(fraud_df)

        safe_count = len(safe_df)

        fraud_percentage = round(
            (fraud_count / total_transactions) * 100,
            2
        )

        # Total fraud amount

        fraud_amount = round(
            fraud_df["amount"].sum(),
            2
        )

        # Fraud by location

        fraud_by_location = (
            fraud_df["location"]
            .value_counts()
            .to_dict()
        )

        # Fraud by transaction type

        fraud_by_type = (
            fraud_df["transaction_type"]
            .value_counts()
            .to_dict()
        )

        # Fraud by device

        fraud_by_device = (
            fraud_df["device_type"]
            .value_counts()
            .to_dict()
        )

        return jsonify({

            "success": True,

            "total_transactions":
                total_transactions,

            "fraud_count":
                fraud_count,

            "safe_count":
                safe_count,

            "fraud_percentage":
                fraud_percentage,

            "fraud_amount":
                fraud_amount,

            "fraud_by_location":
                fraud_by_location,

            "fraud_by_type":
                fraud_by_type,

            "fraud_by_device":
                fraud_by_device

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500