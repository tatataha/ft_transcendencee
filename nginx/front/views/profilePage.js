import { setupProfilePage } from '../functions/profilePage/setupProfilePage.js';
import	{ getSelectedLanguage } from './homePage.js';

const appElement = document.getElementById('app');

export function loadProfilePage(appElement) {
  const currentLang = getSelectedLanguage();
  appElement.innerHTML = `
        <style>
        .card {
          background: linear-gradient(220deg, #8D5DFE, #4D3488);
          border-radius: 15px;
          border: none;
          color: white;
          margin-bottom: 20px;
        }
      </style>
      <div class="container mt-5">
        <h1 class="text-center mb-4">${currentLang.profile.title}</h1>
        <div class="card p-4">
          <div class="text-center mb-3 position-relative">
            <img id="profile-picture" src="" class="rounded-circle" alt="${currentLang.profile.picture_alt}" style="width: 150px; height: 150px; object-fit: cover;">
            <span id="status-indicator" class="position-absolute bottom-0 end-0 translate-middle p-2 border border-light rounded-circle" style="background-color: grey; width: 15px; height: 15px;"></span>
            <div class="mt-2">
              <button id="change-picture" class="btn btn-primary">${currentLang.profile.change_picture}</button>
              <input type="file" id="upload-picture" style="display: none;">
            </div>
          </div> 
          <form id="profile-form">
            <div class="mb-3">
              <label for="username" class="form-label">${currentLang.profile.username_label}:</label>
              <input type="text" id="username" class="form-control" name="username" readonly>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">${currentLang.profile.email_label}:</label>
              <input type="email" id="email" class="form-control" name="email">
            </div>
            <div class="mb-3">
              <label for="bio" class="form-label">${currentLang.profile.bio_label}:</label>
              <textarea id="bio" class="form-control" name="bio"></textarea>
            </div>
            <div class="mb-3">
              <label for="phone_number" class="form-label">${currentLang.profile.phone_label}:</label>
              <input type="tel" id="phone_number" class="form-control" name="phone_number" pattern="[0-9]{4}[0-9]{3}[0-9]{4}" placeholder="0542-031-4242">
            </div>
            <button type="submit" id="save-button" class="btn btn-success">${currentLang.profile.save_changes}</button>
          </form>
          <button id="enable-2fa-button" class="btn btn-warning mt-3">${currentLang.profile.enable_2fa}</button>
          <button id="sign-out-button" class="btn btn-danger mt-3">${currentLang.profile.sign_out}</button>
        </div>
      </div>
      <div class="modal" id="qrcodeModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${currentLang.profile.two_factor_auth}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <div id="qr-step">
                <img id="qrcode-image" alt="${currentLang.profile.qr_code}" class="img-fluid mb-3">
                <p>${currentLang.profile.qr_instruction}</p>
              </div>
              <div id="code-step" style="display: none;">
                <input type="text" id="2fa-code" class="form-control mb-3" placeholder="${currentLang.profile.two_factor_code_placeholder}">
                <div id="loading-animation" style="display: none;">${currentLang.profile.loading}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="previous-step" style="display: none;">${currentLang.profile.previous}</button>
              <button type="button" class="btn btn-primary" id="next-step">${currentLang.profile.next}</button>
            </div>
          </div>
        </div>
      </div>
  `;

  setupProfilePage();
}
