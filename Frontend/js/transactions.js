
// ========================================
// FraudGuard - Transactions Management
// ========================================

let allTransactions = [];

const TRANSACTIONS_API = "http://127.0.0.1:5000/api/transactions";


// ========================================
// Load Transactions
// ========================================

async function loadTransactions() {

    const table = document.getElementById("transactionTable");
    const count = document.getElementById("transactionCount");

    if (!table || !count) {
        console.error("Transaction table or count element not found.");
        return;
    }

    try {

        table.innerHTML = `
            <tr>
                <td colspan="9">Loading transactions...</td>
            </tr>
        `;

        count.textContent = "Loading...";

        // Get admin authentication token
        const token = sessionStorage.getItem("fraudguard_token");

        const headers = {
            "Content-Type": "application/json"
        };

        // Include token when available
        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }

        // Request transactions from Flask backend
        const response = await fetch(TRANSACTIONS_API, {
            method: "GET",
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    "Your admin session is invalid or expired. Please log in again."
                );
            }

            throw new Error(
                data.message ||
                data.error ||
                "Unable to load transactions."
            );
        }

        if (
            data.success === true &&
            Array.isArray(data.transactions)
        ) {

            allTransactions = data.transactions;

            displayTransactions(allTransactions);

        } else {

            allTransactions = [];

            showError(
                data.error || "No transaction data received from the server."
            );

        }

    } catch (error) {

        console.error("Transaction API Error:", error);

        showError(
            error.message || "Unable to connect to the backend."
        );

    }

}


// ========================================
// Display Transactions
// ========================================

function displayTransactions(transactions) {

    const table = document.getElementById("transactionTable");
    const count = document.getElementById("transactionCount");

    if (!table || !count) return;

    table.innerHTML = "";

    count.textContent = `${transactions.length} Transactions`;

    if (!transactions || transactions.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 9;
        cell.textContent = "No transactions found.";

        row.appendChild(cell);
        table.appendChild(row);

        return;
    }

    transactions.forEach(transaction => {

        const row = document.createElement("tr");

        const isFraud = Number(transaction.is_fraud) === 1;

        const status = isFraud ? "🚨 FRAUD" : "✅ SAFE";

        const amount = Number(transaction.amount);

        const formattedAmount = Number.isFinite(amount)
            ? amount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            })
            : "₹0.00";

        const values = [
            transaction.transaction_id ?? "-",
            formattedAmount,
            transaction.transaction_type ?? "-",
            transaction.location ?? "-",
            transaction.device_type ?? "-",
            transaction.transaction_time ?? "-",
            transaction.previous_transactions ?? 0,
            transaction.failed_attempts ?? 0,
            status
        ];

        values.forEach((value, index) => {

            const cell = document.createElement("td");

            cell.textContent = String(value);

            if (index === 8) {

                cell.className = isFraud
                    ? "fraud-status status-fraud"
                    : "safe-status status-safe";

            }

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}


// ========================================
// Search and Status Filter
// ========================================

function filterTransactions() {

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    if (!searchInput || !statusFilter) return;

    const search = searchInput.value.trim().toLowerCase();

    const status = statusFilter.value;

    const filtered = allTransactions.filter(transaction => {

        const text = Object.values(transaction)
            .join(" ")
            .toLowerCase();

        const matchesSearch = text.includes(search);

        let matchesStatus = true;

        if (status === "fraud") {

            matchesStatus =
                Number(transaction.is_fraud) === 1;

        } else if (status === "safe") {

            matchesStatus =
                Number(transaction.is_fraud) === 0;

        }

        return matchesSearch && matchesStatus;

    });

    displayTransactions(filtered);

}


// ========================================
// Display Error
// ========================================

function showError(message) {

    const table = document.getElementById("transactionTable");
    const count = document.getElementById("transactionCount");

    if (!table || !count) return;

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
// Initialize Transactions Page
// ========================================

function initializeTransactionsPage() {

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) {
        searchInput.addEventListener("input", filterTransactions);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", filterTransactions);
    }

    // Load transactions immediately
    loadTransactions();

}


// ========================================
// Start Script
// ========================================

// Handles both normal and dynamically loaded scripts.

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeTransactionsPage
    );

} else {

    initializeTransactionsPage();

}
