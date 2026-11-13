// ========================================
// FraudGuard Login
// ========================================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const username =
            document.getElementById(
                "username"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        const message =
            document.getElementById(
                "loginMessage"
            );


        // Demo credentials

        if (
            username === "admin" &&
            password === "admin123"
        ) {

            // Save login session

            localStorage.setItem(
                "fraudguardLoggedIn",
                "true"
            );


            localStorage.setItem(
                "fraudguardUser",
                username
            );


            message.innerHTML =
                "✅ Login successful!";


            // Open dashboard

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                500
            );

        }

        else {

            message.innerHTML =
                "❌ Invalid username or password.";

        }

    }
);