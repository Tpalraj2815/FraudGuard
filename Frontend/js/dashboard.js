
// ==========================================
// FRAUDGUARD - ADMIN DASHBOARD
// ==========================================

// Backend API URLs
const DASHBOARD_API = "http://127.0.0.1:5000/api/dashboard";
const TRANSACTIONS_API = "http://127.0.0.1:5000/api/transactions";

// Chart instances
let transactionChartInstance = null;
let fraudChartInstance = null;


// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboard() {

    try {

        const response = await fetch(DASHBOARD_API);

        if (!response.ok) {
            throw new Error("Dashboard API error: " + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load dashboard statistics."
            );
        }

        // Update statistics cards
        document.getElementById("totalTransactions").textContent =
            Number(data.total_transactions || 0).toLocaleString("en-IN");

        document.getElementById("fraudTransactions").textContent =
            Number(data.fraud_transactions || 0).toLocaleString("en-IN");

        document.getElementById("safeTransactions").textContent =
            Number(data.safe_transactions || 0).toLocaleString("en-IN");

        document.getElementById("fraudPercentage").textContent =
            Number(data.fraud_percentage || 0).toFixed(2) + "%";

        // Update charts
        createCharts(data);

    } catch (error) {

        console.error("Dashboard API Error:", error);

        showDashboardError(
            "Unable to load dashboard statistics. Check that the Flask backend is running."
        );

    }

}


// ==========================================
// DASHBOARD ERROR MESSAGE
// ==========================================

function showDashboardError(message) {

    const total = document.getElementById("totalTransactions");

    if (total) {
        total.textContent = "—";
    }

    const fraud = document.getElementById("fraudTransactions");

    if (fraud) {
        fraud.textContent = "—";
    }

    const safe = document.getElementById("safeTransactions");

    if (safe) {
        safe.textContent = "—";
    }

    const percentage = document.getElementById("fraudPercentage");

    if (percentage) {
        percentage.textContent = "—";
    }

    console.warn(message);

}


// ==========================================
// LOAD RECENT TRANSACTIONS
// ==========================================

async function loadRecentTransactions() {

    const table = document.getElementById("recentTransactions");

    try {

        const response = await fetch(TRANSACTIONS_API);

        if (!response.ok) {
            throw new Error("Transactions API error: " + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load transactions."
            );
        }

        const transactions = Array.isArray(data.transactions)
            ? data.transactions
            : [];

        // Get the latest 8 transactions
        const latestTransactions = transactions.slice(-8).reverse();

        // Clear previous table rows
        table.replaceChildren();

        // Show message if there are no transactions
        if (latestTransactions.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "No transactions available.";
            cell.style.textAlign = "center";
            cell.style.color = "#9aacc1";

            row.appendChild(cell);
            table.appendChild(row);

            return;
        }

        // Display transactions
        latestTransactions.forEach(function (transaction) {

            const row = document.createElement("tr");

            const transactionId =
                transaction.transaction_id ?? transaction.id ?? "N/A";

            const amount = Number(transaction.amount);

            const formattedAmount = Number.isFinite(amount)
                ? "₹" + amount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                })
                : "N/A";

            const transactionType =
                transaction.transaction_type ?? "N/A";

            const location =
                transaction.location ?? "N/A";

            const device =
                transaction.device_type ?? "N/A";

            const isFraud =
                String(transaction.is_fraud) === "1" ||
                String(transaction.is_fraud).toLowerCase() === "true";

            const status = isFraud ? "🚨 FRAUD" : "✅ SAFE";

            // Create table cells safely
            const values = [
                transactionId,
                formattedAmount,
                transactionType,
                location,
                device,
                status
            ];

            values.forEach(function (value, index) {

                const cell = document.createElement("td");

                cell.textContent = value;

                // Status styling
                if (index === 5) {

                    const badge = document.createElement("span");

                    badge.className = isFraud
                        ? "status-badge status-fraud"
                        : "status-badge status-safe";

                    badge.textContent = status;

                    cell.replaceChildren(badge);
                }

                row.appendChild(cell);

            });

            table.appendChild(row);

        });

    } catch (error) {

        console.error("Transaction API Error:", error);

        table.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Unable to load transactions. Please check the backend.";
        cell.style.textAlign = "center";
        cell.style.color = "#ff7884";

        row.appendChild(cell);
        table.appendChild(row);

    }

}


// ==========================================
// CREATE DASHBOARD CHARTS
// ==========================================

function createCharts(data) {

    const transactionCanvas =
        document.getElementById("transactionChart");

    const fraudCanvas =
        document.getElementById("fraudChart");

    if (!transactionCanvas || !fraudCanvas) {
        console.error("Dashboard chart elements were not found.");
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const totalTransactions =
        Number(data.total_transactions || 0);

    const fraudTransactions =
        Number(data.fraud_transactions || 0);

    const safeTransactions =
        Number(data.safe_transactions || 0);


    // --------------------------------------
    // DESTROY OLD CHARTS BEFORE REFRESHING
    // --------------------------------------

    if (transactionChartInstance) {
        transactionChartInstance.destroy();
    }

    if (fraudChartInstance) {
        fraudChartInstance.destroy();
    }


    // ======================================
    // 1. TRANSACTION OVERVIEW BAR CHART
    // ======================================

    transactionChartInstance = new Chart(
        transactionCanvas,
        {

            type: "bar",

            data: {

                labels: [
                    "Total Transactions",
                    "Fraud Transactions",
                    "Safe Transactions"
                ],

                datasets: [

                    {
                        label: "Number of Transactions",

                        data: [
                            totalTransactions,
                            fraudTransactions,
                            safeTransactions
                        ],

                        backgroundColor: [
                            "rgba(24, 200, 216, 0.75)",
                            "rgba(255, 93, 108, 0.75)",
                            "rgba(37, 214, 154, 0.75)"
                        ],

                        borderColor: [
                            "#18c8d8",
                            "#ff5d6c",
                            "#25d69a"
                        ],

                        borderWidth: 1,
                        borderRadius: 7,
                        maxBarThickness: 65

                    }

                ]

            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: true
                    }

                },

                scales: {

                    x: {
                        ticks: {
                            color: "#9aacc1",
                            font: {
                                size: 10
                            }
                        },

                        grid: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,

                        ticks: {
                            color: "#9aacc1",
                            precision: 0
                        },

                        grid: {
                            color: "rgba(255,255,255,0.07)"
                        }
                    }

                }

            }

        }
    );


    // ======================================
    // 2. FRAUD VS SAFE DOUGHNUT CHART
    // ======================================

    fraudChartInstance = new Chart(
        fraudCanvas,
        {

            type: "doughnut",

            data: {

                labels: [
                    "Fraud Transactions",
                    "Safe Transactions"
                ],

                datasets: [

                    {
                        data: [
                            fraudTransactions,
                            safeTransactions
                        ],

                        backgroundColor: [
                            "#ff5d6c",
                            "#25d69a"
                        ],

                        borderColor: "#101e30",
                        borderWidth: 4,
                        hoverOffset: 8

                    }

                ]

            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        display: true,

                        position: "bottom",

                        labels: {
                            color: "#c3d0df",
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: "circle"
                        }

                    },

                    tooltip: {
                        enabled: true
                    }

                }

            }

        }
    );

}


// ==========================================
// REFRESH DASHBOARD
// ==========================================

async function refreshDashboard() {

    await Promise.all([
        loadDashboard(),
        loadRecentTransactions()
    ]);

}


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("FraudGuard Dashboard Started");

    refreshDashboard();

});


// ==========================================
// AUTO REFRESH EVERY 30 SECONDS
// ==========================================

setInterval(function () {

    refreshDashboard();

}, 30000);
