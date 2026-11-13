import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. LOAD DATASET
# ==========================================

data = pd.read_csv("dataset/transactions.csv")

print("Dataset loaded successfully!")
print("Number of transactions:", len(data))

print("\nFraud distribution:")
print(data["is_fraud"].value_counts())


# ==========================================
# 2. SELECT FEATURES
# ==========================================

features = [
    "amount",
    "transaction_type",
    "location",
    "device_type",
    "transaction_time",
    "previous_transactions",
    "failed_attempts"
]

X = data[features].copy()
y = data["is_fraud"]


# ==========================================
# 3. CONVERT TIME INTO HOUR
# ==========================================

X["transaction_hour"] = (
    X["transaction_time"]
    .str.split(":")
    .str[0]
    .astype(int)
)

X = X.drop(columns=["transaction_time"])


# ==========================================
# 4. COLUMNS
# ==========================================

categorical_columns = [
    "transaction_type",
    "location",
    "device_type"
]

numerical_columns = [
    "amount",
    "transaction_hour",
    "previous_transactions",
    "failed_attempts"
]


# ==========================================
# 5. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns
        ),
        (
            "numerical",
            "passthrough",
            numerical_columns
        )
    ]
)


# ==========================================
# 6. RANDOM FOREST MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced_subsample",
    min_samples_leaf=2,
    max_features="sqrt"
)


# ==========================================
# 7. CREATE PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ==========================================
# 8. SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==========================================
# 9. TRAIN MODEL
# ==========================================

print("\nTraining improved model...")

pipeline.fit(X_train, y_train)

print("Training completed!")


# ==========================================
# 10. PREDICTION
# ==========================================

y_pred = pipeline.predict(X_test)


# ==========================================
# 11. MODEL EVALUATION
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print("\n================================")
print("IMPROVED MODEL RESULTS")
print("================================")

print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(
    y_test,
    y_pred,
    zero_division=0
))


# ==========================================
# 12. SAVE MODEL
# ==========================================

joblib.dump(
    pipeline,
    "Backend/models/fraud_model.pkl"
)

print("\n================================")
print("SUCCESS!")
print("================================")

print("Improved model saved successfully:")
print("Backend/models/fraud_model.pkl")