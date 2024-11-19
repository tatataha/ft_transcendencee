import  { createTwoFAModal } from "./twoFAModule.js";

// Function to check if the user is authenticated
export async function isUserAuthenticated() {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  // If no access token is available, the user is not authenticated
  if (!access_token) return false;

  try {
    // Verify the access token
    const verifyResponse = await fetch("https://127.0.0.1/auth-work/token/verify/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({ token: access_token }),
    });

    // If access token verification fails, attempt to refresh the token
    if (!verifyResponse.ok) {
      if (!refresh_token) throw new Error("Refresh token missing");

      const refreshResponse = await fetch("https://127.0.0.1/auth-work/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refresh_token }),
      });

      if (!refreshResponse.ok) {
        // If refreshing fails, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.hash = "login";
        throw new Error("Token refresh failed");
      }

      // Parse new tokens and store them in local storage
      const refreshData = await refreshResponse.json();
      localStorage.setItem("access_token", refreshData.access);
      if (refreshData.refresh) localStorage.setItem("refresh_token", refreshData.refresh); // Update refresh token if rotated
    }

    return true; // Token is valid or successfully refreshed
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

// Function to authenticate user with OAuth and retrieve tokens
export async function getOauthUser() {
  const oauthAccessToken = localStorage.getItem("oauth_access_token");

  if (!oauthAccessToken) {
    console.error("OAuth access token missing");
    return;
  }

  try {
    const response = await fetch("https://127.0.0.1/auth-work/login_with_oauth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oauth_access_token: oauthAccessToken }),
    });

    if(response.status === 401) {
      // If 2FA is enabled, create a 2FA modal
      createTwoFAModal(2);
      return;
    }
    else if (!response.ok) throw new Error("Error getting user data");

    // Store tokens and user info if successful
    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("user_secret", data.secret_key);
    localStorage.setItem("language", data.lang_pref);

    // Clear URL parameters and redirect to home
    window.history.replaceState({}, document.title, "/");
    window.location.hash = "home";
  } catch (error) {
    console.error("Error during login:", error);
  }
}
