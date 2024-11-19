import { getCSRFToken } from "../utils/getCsrfToken.js";
import { alertSystem } from "./alertSystem.js";

export function createTwoFAModal(mode_selector) {
  const modal = document.createElement("div");
  modal.innerHTML = `
         <div class="modal fade" id="2faModal" tabindex="-1" aria-labelledby="2faModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="2faModalLabel">2FA Code</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <input type="text" class="form-control" id="2faCode" placeholder="Enter your 2FA code" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" id="2faSubmit">Submit</button>
                </div>
              </div>
            </div>
          </div>`;
  document.body.appendChild(modal);
  if (mode_selector === 1)
    document
      .getElementById("2faSubmit")
      .addEventListener("click", handle2faSubmit);
  else
    document
      .getElementById("2faSubmit")
      .addEventListener("click", handleTwoFAOauth);
  new bootstrap.Modal(document.getElementById("2faModal")).show();
}

async function handle2faSubmit() {
  const code = document.getElementById("2faCode").value;
  const csrfToken = getCSRFToken();

  await fetch("https://127.0.0.1/two-factor/token-after-2fa/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/json",
    },
    credentials: "include", // If you're using session-based authentication
    body: JSON.stringify({
      otp_token: code,
      user: localStorage.getItem("username"),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("2FA verification failed");
      }
      return response.json();
    })
    .then((data) => {
      // Store tokens after successful 2FA verification
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_secret", data.secret_key);
      window.location.hash = "home"; // Redirect to the homepage
    })
    .catch((error) => {
      console.error("Error during 2FA verification:", error);
      alertSystem.showAlert("Invalid 2FA code, please try again.");
    })
    .finally(() => {
      window.location.reload();
    });
}

async function handleTwoFAOauth() {
  const code = document.getElementById("2faCode").value;
  const oauth_code = localStorage.getItem("oauth_access_token");
  const csrfToken = getCSRFToken();

  await fetch("https://127.0.0.1/auth-work/oauth_after_2fa/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/json",
    },
    credentials: "include", // If you're using session-based authentication
    body: JSON.stringify({
      otp_token: code,
      oauth_access_token: oauth_code,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("2FA verification failed");
      }
      return response.json();
    })
    .then((data) => {
      // Store tokens after successful 2FA verification
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_secret", data.secret_key);
      window.history.replaceState({}, document.title, "/");
      window.location.hash = "home"; // Redirect to the homepage
    })
    .catch((error) => {
      console.error("Error during 2FA verification:", error);
      alertSystem.showAlert("Invalid 2FA code, please try again.");
    })
    .finally(() => {
      window.location.reload();
    });
}
