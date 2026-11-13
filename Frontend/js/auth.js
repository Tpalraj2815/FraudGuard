
// ==========================================
// FRAUDGUARD - ADMIN AUTHENTICATION
// ==========================================

// Backend authentication API
const AUTH_API = "http://127.0.0.1:5000/api";

// ==========================================
// GET ADMIN TOKEN
// ==========================================

function getAdminToken() {

    return sessionStorage.getItem("fraudguard_token");

}


// ==========================================
// CLEAR ADMIN SESSION
// ==========================================

function clearAdminSession() {

    sessionStorage.removeItem("fraudguard_token");

    sessionStorage.removeItem("fraudguard_user");

    // Remove old login information if present
    localStorage.removeItem("fraudguardLoggedIn");

    localStorage.removeItem("fraudguardUser");

}


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

async function checkLogin() {

    const token = getAdminToken();

    // No token means the admin is not logged in
    if (!token) {

        clearAdminSession();

        window.location.replace("login.html");

        return false;

    }

    try {

        const response = await fetch(
            AUTH_API + "/admin/me",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        // Check whether the backend confirms the admin session
        if (!response.ok || data.success !== true) {

            clearAdminSession();

            window.location.replace("login.html");

            return false;

        }

        // Save updated admin information
        if (data.admin) {

            sessionStorage.setItem(
                "fraudguard_user",
                JSON.stringify(data.admin)
            );

        }

        console.log("FraudGuard Admin Authentication Successful");

        return true;

    } catch (error) {

        console.error("Authentication Error:", error);

        alert(
            "Cannot connect to the FraudGuard backend. Please start the Flask server and try again."
        );

        // Do not clear the token for a temporary connection failure
        return false;

    }

}


// ==========================================
// ADMIN LOGOUT
// ==========================================

async function logout() {

    const token = getAdminToken();

    try {

        if (token) {

            await fetch(
                AUTH_API + "/logout",
                {
                    method: "POST",

                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

        }

    } catch (error) {

        console.error("Logout API Error:", error);

    } finally {

        clearAdminSession();

        window.location.replace("login.html");

    }

}
