import { createTwoFAModal } from "../../utils/twoFAModule.js";
import { alertSystem } from "../../utils/alertSystem.js";

export async function handleLogin(event) {
  event.preventDefault(); // Prevent default form submission
  const username = document.getElementById("form-input-user").value;
  const password = document.getElementById("form-input-pass").value;
  localStorage.clear();
  localStorage.setItem("username", username);

  await fetch("https://127.0.0.1/auth-work/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (response.status === 401) {
        createTwoFAModal(1); // Create 2FA modal if 2FA is enabled
        return;
      } else if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then((data) => {
      if (data) {
        // Store tokens
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_secret", data.secret_key);
        localStorage.setItem("language", data.lang_pref);
        window.location.hash = "home"; // Redirect on successful login
      }
    })
    .catch((error) => {
      alertSystem.showAlert("Invalid credentials, please try again.", "danger");
      console.error("Error during login:", error);
      document.getElementById("loginError").textContent =
        "Invalid credentials, please try again.";
    });
}
