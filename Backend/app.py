
# ==========================================
# FRAUDGUARD - MAIN FLASK APPLICATION
# ==========================================

from flask import Flask, jsonify
from flask_cors import CORS

# Import existing routes
from Backend.routes.prediction import prediction_bp
from Backend.routes.transactions import transactions_bp

# Import admin authentication route
from Backend.routes.auth import auth_bp


# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)


# ==========================================
# ENABLE FRONTEND-BACKEND COMMUNICATION
# ==========================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500"
            ]
        }
    },
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"]
)


# ==========================================
# REGISTER API ROUTES
# ==========================================

# Fraud prediction
app.register_blueprint(prediction_bp)

# Transaction management
app.register_blueprint(transactions_bp)

# Administrator authentication
app.register_blueprint(auth_bp)


# ==========================================
# HOME API
# ==========================================

@app.route("/")
def home():

    return jsonify({

        "success": True,

        "message": "FraudGuard Backend is running!"

    })


# ==========================================
# API TEST
# ==========================================

@app.route("/api/test")
def test():

    return jsonify({

        "success": True,

        "message": "FraudGuard API is working!"

    })


# ==========================================
# APPLICATION STATUS
# ==========================================

@app.route("/api/status")
def status():

    return jsonify({

        "success": True,

        "application": "FraudGuard",

        "status": "Running",

        "authentication": "Enabled",

        "prediction": "Enabled",

        "transactions": "Enabled"

    })


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    print("--------------------------------------")
    print("       FRAUDGUARD BACKEND")
    print("--------------------------------------")
    print("Prediction API: Enabled")
    print("Transactions API: Enabled")
    print("Admin Authentication: Enabled")
    print("--------------------------------------")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
