
// ========================================
// FraudGuard - Reports Management
// ========================================

let reportData = null;

let fraudChartInstance = null;
let locationChartInstance = null;
let typeChartInstance = null;
let deviceChartInstance = null;

const REPORTS_API = "http://127.0.0.1:5000/api/reports";


// ========================================
// Chart Theme Configuration
// ========================================

const chartColors = {
    cyan: "#18c8d8",
    purple: "#7167f9",
    red: "#ff5d6c",
    green: "#25d69a",
    yellow: "#f5bd4f",
    blue: "#4299e1"
};

const chartPalette = [
    chartColors.cyan,
    chartColors.purple,
    chartColors.red,
    chartColors.green,
    chartColors.yellow,
    chartColors.blue
];

Chart.defaults.color = "#b9c9dc";
Chart.defaults.font.family = "'Segoe UI', Arial, sans-serif";
Chart.defaults.font.size = 12;

Chart.defaults.plugins.legend.labels.color = "#dce7f3";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 18;


// ========================================
// Common Chart Options
// ========================================

function getBarChartOptions() {

    return {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                labels: {
                    color: "#dce7f3"
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "#9aacc1"
                },

                grid: {
                    color: "rgba(255,255,255,0.05)"
                },

                border: {
                    color: "rgba(255,255,255,0.1)"
                }
            },

            y: {
                beginAtZero: true,

                ticks: {
                    color: "#9aacc1",
                    precision: 0
                },

                grid: {
                    color: "rgba(255,255,255,0.08)"
                },

                border: {
                    color: "rgba(255,255,255,0.1)"
                }
            }
        }
    };

}

function getPieChartOptions() {

    return {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "bottom",

                labels: {
                    color: "#dce7f3",
                    padding: 18
                }
            }
        }
    };

}


// ========================================
// Load Report Data
// ========================================

async function loadReports() {

    try {

        const response = await fetch(REPORTS_API);

        const data = await response.json();

        if (!response.ok || data.success !== true) {

            throw new Error(
                data.message ||
                data.error ||
                "Unable to load report data."
            );

        }

        reportData = data;

        updateReportSummary(data);

        createFraudChart(data);

        createLocationChart(data);

        createTypeChart(data);

        createDeviceChart(data);

        console.log("FraudGuard Reports Loaded Successfully");

    }

    catch (error) {

        console.error("Reports API Error:", error);

        showReportError(error.message);

    }

}


// ========================================
// Update Report Summary
// ========================================

function updateReportSummary(data) {

    document.getElementById("reportTotal").textContent =
        Number(data.total_transactions || 0).toLocaleString("en-IN");

    document.getElementById("reportFraud").textContent =
        Number(data.fraud_count || 0).toLocaleString("en-IN");

    document.getElementById("reportSafe").textContent =
        Number(data.safe_count || 0).toLocaleString("en-IN");

    document.getElementById("reportPercentage").textContent =
        Number(data.fraud_percentage || 0).toFixed(2) + "%";

    document.getElementById("reportAmount").textContent =
        Number(data.fraud_amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

}


// ========================================
// Fraud vs Safe Transactions Chart
// ========================================

function createFraudChart(data) {

    const canvas = document.getElementById("reportFraudChart");

    if (fraudChartInstance) {
        fraudChartInstance.destroy();
    }

    fraudChartInstance = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Fraud Transactions",
                "Safe Transactions"
            ],

            datasets: [{

                data: [
                    Number(data.fraud_count || 0),
                    Number(data.safe_count || 0)
                ],

                backgroundColor: [
                    chartColors.red,
                    chartColors.green
                ],

                borderColor: "#101e30",
                borderWidth: 4,
                hoverOffset: 8

            }]

        },

        options: {
            ...getPieChartOptions(),

            cutout: "65%"
        }

    });

}


// ========================================
// Fraud by Location Chart
// ========================================

function createLocationChart(data) {

    const canvas = document.getElementById("locationChart");

    if (locationChartInstance) {
        locationChartInstance.destroy();
    }

    const locationData = data.fraud_by_location || {};

    const locations = Object.keys(locationData);

    const values = Object.values(locationData).map(Number);

    locationChartInstance = new Chart(canvas, {

        type: "bar",

        data: {

            labels: locations,

            datasets: [{

                label: "Fraud Transactions",

                data: values,

                backgroundColor: chartColors.cyan,

                borderRadius: 6,

                borderSkipped: false

            }]

        },

        options: getBarChartOptions()

    });

}


// ========================================
// Fraud by Transaction Type Chart
// ========================================

function createTypeChart(data) {

    const canvas = document.getElementById("typeChart");

    if (typeChartInstance) {
        typeChartInstance.destroy();
    }

    const typeData = data.fraud_by_type || {};

    const types = Object.keys(typeData);

    const values = Object.values(typeData).map(Number);

    typeChartInstance = new Chart(canvas, {

        type: "pie",

        data: {

            labels: types,

            datasets: [{

                data: values,

                backgroundColor: chartPalette,

                borderColor: "#101e30",

                borderWidth: 3,

                hoverOffset: 8

            }]

        },

        options: getPieChartOptions()

    });

}


// ========================================
// Fraud by Device Chart
// ========================================

function createDeviceChart(data) {

    const canvas = document.getElementById("deviceChart");

    if (deviceChartInstance) {
        deviceChartInstance.destroy();
    }

    const deviceData = data.fraud_by_device || {};

    const devices = Object.keys(deviceData);

    const values = Object.values(deviceData).map(Number);

    deviceChartInstance = new Chart(canvas, {

        type: "bar",

        data: {

            labels: devices,

            datasets: [{

                label: "Fraud Transactions",

                data: values,

                backgroundColor: chartColors.purple,

                borderRadius: 6,

                borderSkipped: false

            }]

        },

        options: getBarChartOptions()

    });

}


// ========================================
// Generate Report
// ========================================

function generateReport() {

    if (!reportData) {

        alert("Report data is not loaded yet. Please try again.");

        return;

    }

    const generatedDate = new Date().toLocaleString("en-IN");

    const reportText = `
==================================================
          FRAUDGUARD FRAUD DETECTION REPORT
==================================================

Generated Date:
${generatedDate}

--------------------------------------------------
                  TRANSACTION SUMMARY
--------------------------------------------------

Total Transactions:
${Number(reportData.total_transactions || 0).toLocaleString("en-IN")}

Fraud Transactions:
${Number(reportData.fraud_count || 0).toLocaleString("en-IN")}

Safe Transactions:
${Number(reportData.safe_count || 0).toLocaleString("en-IN")}

Fraud Percentage:
${Number(reportData.fraud_percentage || 0).toFixed(2)}%

--------------------------------------------------
                  FRAUD AMOUNT
--------------------------------------------------

Total Fraud Amount:
${Number(reportData.fraud_amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
})}

--------------------------------------------------
              FRAUD BY LOCATION
--------------------------------------------------

${Object.entries(reportData.fraud_by_location || {})
    .map(([location, count]) => `${location}: ${count}`)
    .join("\n") || "No location data available."}

--------------------------------------------------
           FRAUD BY TRANSACTION TYPE
--------------------------------------------------

${Object.entries(reportData.fraud_by_type || {})
    .map(([type, count]) => `${type}: ${count}`)
    .join("\n") || "No transaction type data available."}

--------------------------------------------------
                 FRAUD BY DEVICE
--------------------------------------------------

${Object.entries(reportData.fraud_by_device || {})
    .map(([device, count]) => `${device}: ${count}`)
    .join("\n") || "No device data available."}

==================================================

Generated by FraudGuard
Fraud Detection and Monitoring System

Note: This report is based on the available
transaction dataset and machine learning analysis.

==================================================
`;

    const blob = new Blob(
        [reportText],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "FraudGuard_Fraud_Detection_Report.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

}


// ========================================
// Display Report Error
// ========================================

function showReportError(message) {

    const summaryIds = [
        "reportTotal",
        "reportFraud",
        "reportSafe",
        "reportPercentage",
        "reportAmount"
    ];

    summaryIds.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = "Unavailable";
        }

    });

    console.error("FraudGuard Report:", message);

}


// ========================================
// Start Reports Page
// ========================================

loadReports();
