import { alertSystem } from "../../utils/alertSystem.js";

// Form gönderme işlemini yönetme fonksiyonu
export async function handleFormSubmit(event, profilePictureInput) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("username", document.getElementById("username").value);
  formData.append("first_name", document.getElementById("first_name").value);
  formData.append("last_name", document.getElementById("last_name").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("password", document.getElementById("password").value);

  if (profilePictureInput.files[0]) {
    formData.append("profile_picture", profilePictureInput.files[0]);
  }

  try {
    const response = await fetch("https://127.0.0.1/auth-work/signup/", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json(); // Hata detaylarını al
      const errorMessage = errorData.username ? errorData.username[0] : "An unknown error occurred.";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Signup successful!");
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("username", formData.get("username"));
    localStorage.setItem("language", data.lang_pref);
    window.location.hash = "home";
  } catch (error) {
    console.error("Error during signup:", error);
    alertSystem.showAlert("An error occurred during signup: " + error.message);
  }
}
