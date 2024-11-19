import { alertSystem } from "../../utils/alertSystem.js";

// Varsayılan profil resmini yükleme fonksiyonu
export async function loadDefaultProfilePicture(profilePictureElement) {
  try {
    const response = await fetch(
      "https://127.0.0.1/user-manage/get_default_pp/",
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Failed to get default profile picture");

    const blob = await response.blob();
    profilePictureElement.src = URL.createObjectURL(blob);
  } catch (error) {
    alertSystem.showAlert("An error occurred while getting default profile picture: " + error.message);
    console.error("Error getting default profile picture:", error);
  }
}

// Profil resmini önizleme fonksiyonu
export function previewProfilePicture(profilePictureInput, profilePictureElement) {
  const file = profilePictureInput.files[0];
  if (file) {
    profilePictureElement.src = URL.createObjectURL(file);
  }
}
