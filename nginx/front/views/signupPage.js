import { loadDefaultProfilePicture, previewProfilePicture } from "../functions/signupPage/profilePictureFuncs.js";
import { handleFormSubmit } from "../functions/signupPage/handleFormSubmit.js";

import tr_lang from '../languages/tr_lang.js';
import en_lang from '../languages/en_lang.js';
import fr_lang from '../languages/fr_lang.js';

const languages = {
  tr: tr_lang,
  en: en_lang,
  fr: fr_lang,
};

export function getSelectedLanguage() {
  const storedLanguage = localStorage.getItem("language");
  return languages[storedLanguage] || tr_lang;
}

const currentLang = getSelectedLanguage();


export function loadSignupPage(appElement) {
  // Signup page HTML içeriği
  const signupPageHtml = `
  <style>
      .profile_picture {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 50%;
      }
      .profile_picture-container {
        text-align: center;
        margin-bottom: 20px;
      }
	#language-selector {
		position: fixed;
		top: 20px;
		right: 300px;
		font-size: 14px;
		color: #333;
		z-index: 1000;
		}
    #alert-container {
      z-index: 1100; /* Yüksek bir z-index verin */
      position: fixed;
      top: 0;
      right: 0;
      padding: 10px;
    }
      #language-selector select {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
    </style>
    <div class="container">
    <div id="alert-container"></div>
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-10">
          <div class="card mt-5 p-4 shadow">
            <h3 class="text-center mb-4">${currentLang.signup.title}</h3>
            <form id="signupForm" enctype="multipart/form-data">
              <div class="profile_picture-container">
                <img id="profile_picture" src="public/default.png" alt="Profile Picture" class="profile_picture">
              </div>
              <div class="mb-3 text-center">
                <button type="button" class="btn btn-secondary" id="changePictureBtn">${currentLang.signup.change_picture_button}</button>
                <input class="form-control" type="file" id="profilePictureInput" accept="image/*" style="display: none;">
              </div>
              <div class="mb-3">
                <label for="username" class="form-label" id="username_t">${currentLang.signup.username}</label>
                <input type="text" class="form-control" id="username" required>
              </div>
              <div class="mb-3">
                <label for="first_name" class="form-label" id="first_name_t">${currentLang.signup.first_name}</label>
                <input type="text" class="form-control" id="first_name" required>
              </div>
              <div class="mb-3">
                <label for="last_name" class="form-label" id="last_name_t">${currentLang.signup.last_name}</label>
                <input type="text" class="form-control" id="last_name" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label" id="email_t">${currentLang.signup.email}</label>
                <input type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label" id="password_t">${currentLang.signup.password}</label>
                <input type="password" class="form-control" id="password" required>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" id="submit_t">${currentLang.signup.submit}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Language Selector -->
    <div id="language-selector">
      <label for="language">${currentLang.navigation.langselect}</label>
      <select id="language">
        <option value="tr" ${currentLang === languages.tr ? "selected" : ""}>Türkçe</option>
        <option value="en" ${currentLang === languages.en ? "selected" : ""}>English</option>
        <option value="fr" ${currentLang === languages.fr ? "selected" : ""}>Français</option>
      </select>
    </div>
    `;

  appElement.innerHTML = signupPageHtml;

  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePictureElement = document.getElementById("profile_picture");
  const changePictureBtn = document.getElementById("changePictureBtn");

  // Varsayılan profil resmini yükle
  loadDefaultProfilePicture(profilePictureElement);

  // Profil resmi değiştirme butonuna tıklayınca dosya seçiciyi aç
  changePictureBtn.addEventListener("click", () => profilePictureInput.click());

  // Seçilen profil resmini önizle
  profilePictureInput.addEventListener("change", () => previewProfilePicture(profilePictureInput, profilePictureElement));

  // Form gönderme işlemini yönet
  document.getElementById("signupForm").addEventListener("submit", (e) => handleFormSubmit(e, profilePictureInput));

  const languageSelector = document.getElementById("language");
  languageSelector.addEventListener("change", async (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem("language", selectedLanguage);
    window.location.reload();
  });
}
