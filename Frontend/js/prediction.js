const form = document.getElementById("predictionForm");

const resultBox = document.getElementById("result");


form.addEventListener("submit", async function(event) {

    event.preventDefault();


    // Get values from the form

    const amount =
        document.getElementById("amount").value;

    const transaction_type =
        document.getElementById("transaction_type").value;

    const location =
        document.getElementById("location").value;

    const device_type =
        document.getElementById("device_type").value;

    const transaction_time =
        document.getElementById("transaction_time").value;

    const previous_transactions =
        document.getElementById("previous_transactions").value;

    const failed_attempts =
        document.getElementById("failed_attempts").value;


    // Show checking message

    resultBox.innerHTML = `
        <h3>Checking transaction...</h3>
        <p>Please wait.</p>
    `;


    try {

        // Send transaction to Flask backend

        const response = await fetch(
            "http://127.0.0.1:5000/api/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    amount: amount,

                    transaction_type:
                        transaction_type,

                    location: location,

                    device_type:
                        device_type,

                    transaction_time:
                        transaction_time,

                    previous_transactions:
                        previous_transactions,

                    failed_attempts:
                        failed_attempts

                })
            }
        );


        const data = await response.json();


        // Check result

        if (data.success) {

            if (data.prediction === "FRAUD") {

                resultBox.innerHTML = `

                    <h2>🚨 FRAUD DETECTED</h2>

                    <p>
                        <strong>Risk Level:</strong>
                        ${data.risk_level}
                    </p>

                    <p>
                        <strong>Fraud Probability:</strong>
                        ${data.fraud_probability}%
                    </p>

                    <p>
                        This transaction appears
                        suspicious.
                    </p>

                `;

            } else {

                resultBox.innerHTML = `

                    <h2>✅ TRANSACTION SAFE</h2>

                    <p>
                        <strong>Risk Level:</strong>
                        ${data.risk_level}
                    </p>

                    <p>
                        <strong>Fraud Probability:</strong>
                        ${data.fraud_probability}%
                    </p>

                    <p>
                        This transaction appears
                        to be normal.
                    </p>

                `;

            }

        } else {

            resultBox.innerHTML = `

                <h3>Error</h3>

                <p>
                    ${data.error}
                </p>

            `;

        }

    } catch (error) {

        resultBox.innerHTML = `

            <h3>Backend Connection Error</h3>

            <p>
                Make sure the Flask server
                is running.
            </p>

        `;

        console.error(error);

    }

});