import { getCSRFToken } from "../../utils/getCsrfToken.js";
import { sendStatusOfflineAndClose } from "../../utils/webSocket.js";

export function setupProfilePage() {
  const token = localStorage.getItem("access_token");
  const csrfToken = getCSRFToken();

  initializeEventListeners(token, csrfToken);
  loadProfileData(token, csrfToken);
}

function initializeEventListeners(token, csrfToken) {
  document.getElementById("enable-2fa-button").addEventListener("click", () => enable2FA(token, csrfToken));
  document.getElementById("next-step").addEventListener("click", handleNextStep);
  document.getElementById("previous-step").addEventListener("click", handlePreviousStep);
  document.getElementById("sign-out-button").addEventListener("click", signOut);
  document.getElementById("change-picture").addEventListener("click", () => document.getElementById("upload-picture").click());
  document.getElementById("upload-picture").addEventListener("change", () => updateProfilePicture(token));
  document.getElementById("profile-form").addEventListener("submit", (event) => updateProfile(event, token));
}

async function loadProfileData(token, csrfToken) {
  try {
    const response = await fetch("https://127.0.0.1/user-manage/user_info/", {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    displayProfileData(data);
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

function displayProfileData(data) {
  document.getElementById("username").value = data.user.username;
  document.getElementById("email").value = data.user.email;
  document.getElementById("bio").value = data.profile.bio;
  document.getElementById("phone_number").value = data.profile.phone_number;
  document.getElementById("profile-picture").src = data.profile.profile_picture;
  update2FAStatus(data.profile.two_factor_auth);
  updateOnlineStatus(data.profile.online_status);
}

function update2FAStatus(isEnabled) {
  const enable2FAButton = document.getElementById("enable-2fa-button");
  if (isEnabled) {
    enable2FAButton.style.background = "green";
    enable2FAButton.style.color = "white";
    enable2FAButton.style.border = "none";
    enable2FAButton.innerHTML = "2FA Enabled";
    enable2FAButton.disabled = true;
  }
}

function updateOnlineStatus(isOnline) {
  document.getElementById("status-indicator").style.backgroundColor = isOnline ? "green" : "grey";
}

async function enable2FA(token, csrfToken) {
  try {
    const response = await fetch("https://127.0.0.1/two-factor/generate-qr/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById("qrcode-image").src = url;
    const qrModal = new bootstrap.Modal(document.getElementById("qrcodeModal"));
    qrModal.show();
  } catch (error) {
    console.error("2FA activation error:", error);
  }
}

function handleNextStep() {
  const qrStep = document.getElementById("qr-step");
  const codeStep = document.getElementById("code-step");
  const previousStepButton = document.getElementById("previous-step");
  const nextStepButton = document.getElementById("next-step");

  if (qrStep.style.display !== "none") {
    qrStep.style.display = "none";
    codeStep.style.display = "block";
    previousStepButton.style.display = "inline-block";
    nextStepButton.innerHTML = "Onayla";
  } else {
    submit2FACode();
  }
}

async function submit2FACode() {
  const code = document.getElementById("2fa-code").value;
  const loadingAnimation = document.getElementById("loading-animation");
  loadingAnimation.style.display = "block";
  const token = localStorage.getItem("access_token");

  try {
    await fetch("https://127.0.0.1/two-factor/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify({ otp_token: code }),
    });
  } catch (error) {
    console.error("Verification error:", error);
  } finally {
    loadingAnimation.style.display = "none";
    console.log("Verification successful");
    window.location.reload();
  }
}

function handlePreviousStep() {
  document.getElementById("qr-step").style.display = "block";
  document.getElementById("code-step").style.display = "none";
  document.getElementById("previous-step").style.display = "none";
  document.getElementById("next-step").innerHTML = "İleri";
}

async function updateProfile(event, token) {
  event.preventDefault();
  const formData = new FormData(document.getElementById("profile-form"));

  try {
    const response = await fetch("https://127.0.0.1/user-manage/update_user_info/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    console.log("Profile updated:", data);
    window.location.reload();
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

async function updateProfilePicture(token) {
  const pictureInput = document.getElementById("upload-picture");
  const file = pictureInput.files[0];
  const formData = new FormData();
  formData.append("profile_picture", file);

  try {
    const response = await fetch("https://127.0.0.1/user-manage/update_profile_picture/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    console.log("Profile picture updated:", data);
    window.location.reload();
  } catch (error) {
    console.error("Error updating profile picture:", error);
  }
}

async function signOut() {
  await sendStatusOfflineAndClose();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "#login";
}
