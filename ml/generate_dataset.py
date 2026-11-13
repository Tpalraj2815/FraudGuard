import pandas as pd
import numpy as np

# Make the same data every time we run the program
np.random.seed(42)

# Number of transactions
normal_count = 900
fraud_count = 300

# ==========================================
# NORMAL TRANSACTIONS
# ==========================================

normal_amount = np.random.uniform(100, 10000, normal_count)

normal_type = np.random.choice(
    ["UPI", "Online", "POS", "ATM", "Bank Transfer"],
    normal_count
)

normal_location = np.random.choice(
    ["Tirupati", "Hyderabad", "Bengaluru", "Chennai",
     "Vijayawada", "Visakhapatnam"],
    normal_count
)

normal_device = np.random.choice(
    ["Mobile", "Laptop", "Tablet", "ATM", "POS"],
    normal_count
)

normal_hour = np.random.choice(
    range(7, 23),
    normal_count
)

normal_previous = np.random.randint(
    5, 50,
    normal_count
)

normal_failed = np.random.choice(
    [0, 1],
    normal_count,
    p=[0.90, 0.10]
)


# ==========================================
# FRAUD TRANSACTIONS
# ==========================================

fraud_amount = np.random.uniform(
    50000, 200000,
    fraud_count
)

fraud_type = np.random.choice(
    ["Online", "Bank Transfer", "UPI"],
    fraud_count
)

fraud_location = np.random.choice(
    ["Mumbai", "Delhi", "Unknown", "Foreign"],
    fraud_count
)

fraud_device = np.random.choice(
    ["Unknown", "Laptop"],
    fraud_count
)

fraud_hour = np.random.choice(
    [0, 1, 2, 3, 4, 5],
    fraud_count
)

fraud_previous = np.random.randint(
    0, 3,
    fraud_count
)

fraud_failed = np.random.choice(
    [2, 3, 4, 5],
    fraud_count
)


# ==========================================
# CREATE DATAFRAMES
# ==========================================

normal_data = pd.DataFrame({
    "amount": normal_amount,
    "transaction_type": normal_type,
    "location": normal_location,
    "device_type": normal_device,
    "transaction_hour": normal_hour,
    "previous_transactions": normal_previous,
    "failed_attempts": normal_failed,
    "is_fraud": 0
})


fraud_data = pd.DataFrame({
    "amount": fraud_amount,
    "transaction_type": fraud_type,
    "location": fraud_location,
    "device_type": fraud_device,
    "transaction_hour": fraud_hour,
    "previous_transactions": fraud_previous,
    "failed_attempts": fraud_failed,
    "is_fraud": 1
})


# ==========================================
# COMBINE DATA
# ==========================================

data = pd.concat(
    [normal_data, fraud_data],
    ignore_index=True
)


# ==========================================
# ADD TRANSACTION ID
# ==========================================

data.insert(
    0,
    "transaction_id",
    [f"TX{str(i).zfill(5)}"
     for i in range(1, len(data) + 1)]
)


# ==========================================
# CREATE TRANSACTION TIME
# ==========================================

data["transaction_time"] = data["transaction_hour"].apply(
    lambda hour: f"{hour:02d}:{np.random.randint(0, 60):02d}"
)


# Put transaction_time in a better position
columns = [
    "transaction_id",
    "amount",
    "transaction_type",
    "location",
    "device_type",
    "transaction_time",
    "previous_transactions",
    "failed_attempts",
    "is_fraud"
]

data = data[columns]


# ==========================================
# SHUFFLE DATA
# ==========================================

data = data.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# ==========================================
# SAVE DATASET
# ==========================================

data.to_csv(
    "dataset/transactions.csv",
    index=False
)


# ==========================================
# DISPLAY INFORMATION
# ==========================================

print("================================")
print("DATASET CREATED SUCCESSFULLY")
print("================================")

print("Total transactions:", len(data))

print("\nTransaction distribution:")
print(data["is_fraud"].value_counts())

print("\nDataset saved to:")
print("dataset/transactions.csv")

print("\nFirst 5 transactions:")
print(data.head())