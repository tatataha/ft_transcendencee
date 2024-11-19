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
  return languages[storedLanguage] || tr_lang; // Varsayılan olarak Türkçe
}

//This has to be in .env file
const auth_url =
  "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6a20b9542dbec1f0ef9b84f8884a864102da1ac637a4890c6422426015a22615&redirect_uri=https%3A%2F%2F127.0.0.1&response_type=code";

import { handleLogin } from "../functions/loginPage/handleLogin.js";

export function loadLoginPage(appElement) {
  const currentLang = getSelectedLanguage();
  appElement.innerHTML = `
          <link rel="stylesheet" href="styles/loginPage.css">
          <style>
          #language-selector {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 14px;
            color: #333;
          }
          #language-selector select {
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          </style>
          <body>
          <div id="container">
            <!-- Language Selector -->
            <div id="language-selector">
            <label for="language">${currentLang.navigation.langselect}</label>
            <select id="language">
              <option value="tr" ${currentLang === languages.tr ? "selected" : ""}>Türkçe</option>
              <option value="en" ${currentLang === languages.en ? "selected" : ""}>English</option>
              <option value="fr" ${currentLang === languages.fr ? "selected" : ""}>Français</option>
            </select>
            </div>

            <!-- Existing Login Form and Content -->
            <div id="background-shapes">
            <div class="shape shape-top-left"></div>
            <div class="shape shape-bottom-left"></div>
            <div class="shape shape-circle-left"></div>
            <div class="shape shape-circle-right"></div>
            </div>
            <form id="loginForm">
            <input id="form-input-user" class="form-input" type="text" placeholder="${currentLang.login.username_placeholder}" required>
            <input type="password" id="form-input-pass" class="form-input" placeholder="${currentLang.login.password_placeholder}" required>
            <button type="submit" id="submit-button">${currentLang.login.login_button}</button>
            </form>
            <div id="rightArea">
            <div id="loginWith">
              <div id="pArea">
              <p id="big-text">${currentLang.login.login_with_42.big_text}</p>
              <p id="small-text">${currentLang.login.login_with_42.small_text}</p>
              </div>
              <button id="loginWith42">${currentLang.login.login_with_42.button_text}</button>
            </div>
            <div id="signupArea">
              <p id="big-text">${currentLang.login.signup_area.big_text}</p>
              <button id="signupButton">${currentLang.login.signup_area.button_text}</button>
            </div>
            </div>
          </div>
          </body>
        `;

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("loginWith42").addEventListener("click", () => {
    window.location.href = auth_url; // Redirect to 42's OAuth page
  });
  document.getElementById("signupButton").addEventListener("click", () => {
    window.location.hash = "signup";
  });

  const languageSelector = document.getElementById("language");
	languageSelector.addEventListener("change", (event) => {
	  const selectedLanguage = event.target.value;
	  localStorage.setItem("language", selectedLanguage);
    window.location.reload();
	});
}
