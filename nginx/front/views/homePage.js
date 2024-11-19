import tr_lang from '../languages/tr_lang.js';
import en_lang from '../languages/en_lang.js';
import fr_lang from '../languages/fr_lang.js';

// Dil haritası
const languages = {
  tr: tr_lang,
  en: en_lang,
  fr: fr_lang,
};

// Kullanıcı tercihine göre dil seç
export function getSelectedLanguage() {
  const storedLanguage = localStorage.getItem("language");
  return languages[storedLanguage] || tr_lang; // Varsayılan olarak Türkçe
}

export function loadHomePage(appElement) {
  let currentLang = getSelectedLanguage();

  const welcomeMessage = currentLang.messages.welcome_back.replace(
    "{username}",
    localStorage.getItem("username")
  );
  // Set up the HTML structure with a container for buttons and a content area
  appElement.innerHTML = `
        <h1>${currentLang.navigation.home}</h1>
        <p>${welcomeMessage}</p>
        <style>
          #language-selector {
            margin-bottom: 15px;
          }
          #button-container {
            display: flex;
            justify-content: center;
            gap: 15px;
          }
          #content-area {
            margin-top: 20px;
          }
          button {
            padding: 8px;
            font-size: 16px;
            cursor: pointer;
            background-color: #D1BFFA;
            border-radius: 15px;
            border: none;
            box-shadow: 0 0 5px gray;
          }
          button:hover {
            background-color: #A370F2;
          }
        </style>
        <div id="language-selector">
          <label for="language">${currentLang.navigation.langselect}</label>
          <select id="language">
            <option value="tr" ${currentLang === tr_lang ? "selected" : ""}>Türkçe</option>
            <option value="en" ${currentLang === en_lang ? "selected" : ""}>English</option>
            <option value="fr" ${currentLang === fr_lang ? "selected" : ""}>Français</option>
          </select>
        </div>
        <div id="button-container">
        <div id="alert-container"></div>
          <button id="game_with_ai_btn">${currentLang.buttons.game_with_ai}</button>
          <button id="local_match_btn">${currentLang.buttons.local_match}</button>
          <button id="game_tournament_btn">${currentLang.buttons.game_tournament}</button>
        </div>
        <div id="content-area">
          <!-- Content for each game will be displayed here -->
        </div>
  `;

  // Dil seçici olay dinleyicisi
  const languageSelector = document.getElementById("language");
  languageSelector.addEventListener("change", async (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem("language", selectedLanguage);
    await fetch("https://127.0.0.1/user-manage/select_lang_pref/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ lang_pref: selectedLanguage }),
    }).then(() => {
      currentLang = getSelectedLanguage();
      window.location.reload();
    });
    window.location.reload();
  });

  // Add event listeners to each button to load the respective game into the content area
  document.getElementById('game_with_ai_btn').addEventListener('click', function () {
    window.location.hash = "game_ai";
    window.location.reload();
  });

  document.getElementById('local_match_btn').addEventListener('click', function () {
    window.location.hash = "local_match";
    window.location.reload();
  });

  document.getElementById('game_tournament_btn').addEventListener('click', function () {
    window.location.hash = "game_tournament";
    window.location.reload();
  });
}
