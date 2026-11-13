
// ========================================
// FraudGuard - Fraud Alerts Management
// ========================================

let fraudTransactions = [];

const ALERTS_API = "http://127.0.0.1:5000/api/transactions";


// ========================================
// Load Fraud Transactions
// ========================================

async function loadFraudAlerts() {

    const table = document.getElementById("alertTable");
    const count = document.getElementById("alertCount");

    try {

        table.innerHTML = `
            <tr>
                <td colspan="9">Loading fraud alerts...</td>
            </tr>
        `;

        count.textContent = "Loading...";

        const response = await fetch(ALERTS_API);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                "Unable to load fraud transactions."
            );
        }

        if (
            data.success !== true ||
            !Array.isArray(data.transactions)
        ) {
            throw new Error(
                data.error ||
                "Invalid transaction data received from the server."
            );
        }

        // Keep only fraudulent transactions
        fraudTransactions = data.transactions.filter(
            transaction =>
                Number(transaction.is_fraud) === 1
        );

        // Update summary cards
        updateSummary();

        // Display all fraud alerts
        displayAlerts(fraudTransactions);

    } catch (error) {

        console.error("Fraud Alert Error:", error);

        showAlertError(
            error.message ||
            "Unable to connect to the backend."
        );

    }

}


// ========================================
// Update Summary Cards
// ========================================

function updateSummary() {

    const fraudCount = fraudTransactions.length;

    // Total suspicious amount
    const totalAmount = fraudTransactions.reduce(
        (total, transaction) => {

            const amount = Number(transaction.amount);

            return total + (
                Number.isFinite(amount) ? amount : 0
            );

        },
        0
    );

    document.getElementById("fraudCount").textContent =
        fraudCount.toLocaleString("en-IN");

    document.getElementById("fraudAmount").textContent =
        totalAmount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });


    // ========================================
    // Find Top Fraud Location
    // ========================================

    const locationCounts = {};

    fraudTransactions.forEach(transaction => {

        const location =
            String(transaction.location || "Unknown");

        locationCounts[location] =
            (locationCounts[location] || 0) + 1;

    });

    let topLocation = "-";
    let highestCount = 0;

    for (const location in locationCounts) {

        if (locationCounts[location] > highestCount) {

            highestCount = locationCounts[location];
            topLocation = location;

        }

    }

    document.getElementById("topLocation").textContent =
        topLocation;


    // ========================================
    // High Risk Calculation
    // ========================================

    let highRisk = 0;

    fraudTransactions.forEach(transaction => {

        const amount = Number(transaction.amount) || 0;
        const failed = Number(transaction.failed_attempts) || 0;
        const previous = Number(transaction.previous_transactions);

        // Keep the original project's risk conditions
        if (
            amount >= 50000 ||
            failed >= 3 ||
            previous <= 2
        ) {

            highRisk++;

        }

    });

    document.getElementById("highRiskCount").textContent =
        highRisk.toLocaleString("en-IN");

}


// ========================================
// Calculate Transaction Risk
// ========================================

function calculateRisk(transaction) {

    const amount = Number(transaction.amount) || 0;
    const failed = Number(transaction.failed_attempts) || 0;
    const previous = Number(transaction.previous_transactions);

    if (
        amount >= 50000 ||
        failed >= 3 ||
        previous <= 2
    ) {

        return "HIGH";

    }

    return "MEDIUM";

}


// ========================================
// Display Fraud Alerts
// ========================================

function displayAlerts(transactions) {

    const table = document.getElementById("alertTable");
    const count = document.getElementById("alertCount");

    table.innerHTML = "";

    count.textContent =
        `${transactions.length.toLocaleString("en-IN")} Fraud Alerts`;

    if (!transactions || transactions.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 9;
        cell.textContent = "✅ No fraud transactions found.";

        row.appendChild(cell);
        table.appendChild(row);

        return;

    }

    transactions.forEach(transaction => {

        const row = document.createElement("tr");

        const amount = Number(transaction.amount) || 0;
        const previous = Number(transaction.previous_transactions) || 0;
        const failed = Number(transaction.failed_attempts) || 0;

        const risk = calculateRisk(transaction);

        const formattedAmount = amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

        // Transaction details
        const values = [
            transaction.transaction_id ?? "-",
            formattedAmount,
            transaction.transaction_type ?? "-",
            transaction.location ?? "Unknown",
            transaction.device_type ?? "-",
            transaction.transaction_time ?? "-",
            previous,
            failed,
            risk === "HIGH" ? "🚨 HIGH" : "⚠️ MEDIUM"
        ];

        values.forEach((value, index) => {

            const cell = document.createElement("td");

            // Safely display transaction data
            cell.textContent = String(value);

            // Risk styling
            if (index === 8) {

                cell.className = risk === "HIGH"
                    ? "high-risk status-fraud"
                    : "medium-risk";

            }

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}


// ========================================
// Search Fraud Alerts
// ========================================

const alertSearch = document.getElementById("alertSearch");

alertSearch.addEventListener("input", function () {

    const search = this.value.trim().toLowerCase();

    const filtered = fraudTransactions.filter(transaction => {

        const transactionText = Object.values(transaction)
            .join(" ")
            .toLowerCase();

        return transactionText.includes(search);

    });

    displayAlerts(filtered);

});


// ========================================
// Display Error
// ========================================

function showAlertError(message) {

    const table = document.getElementById("alertTable");
    const count = document.getElementById("alertCount");

    table.innerHTML = "";

    count.textContent = "Unavailable";

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 9;
    cell.textContent = "❌ " + message;

    row.appendChild(cell);
    table.appendChild(row);

}


// ========================================
// Start Fraud Alerts Page
// ========================================

loadFraudAlerts();
