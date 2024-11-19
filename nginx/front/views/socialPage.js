import { fetchFriendList } from '../functions/socialPage/fetchFriendList.js';
import { fetchFriendRequests } from '../functions/socialPage/fetchFriendRequests.js';
import { loadProfile } from '../functions/socialPage/loadProfile.js';
import { getSelectedLanguage } from './homePage.js';

export function loadSocialPage(appElement) {

  const currentLang = getSelectedLanguage();

  appElement.innerHTML = `
        <div id="every">
        <div id="profile-card">
          <div id="status-card">
          <div id="alert-container"></div>
            <img id="profile-picture" src="" alt="Profile Picture" class="profile-picture">
            <div id="bottom-card">
              <div id="btns">
              <button id="edit-button">${currentLang.social.edit_profile}</button>
              <button id="add-friend-btn">${currentLang.social.add_friend}</button>
              <button id="block-btn">${currentLang.social.block}</button>
              <button id="remove-block">${currentLang.social.unblock}</button>
              <button id="remove-friend-btn">${currentLang.social.remove_friend}</button>
              </div>
              <div id="status-indicator" class="status-indicator online"></div>
              <h2 id="username">${currentLang.social.username}</h2>
              <div id="name-stuff">
              <p id="name-surname">${currentLang.social.name_surname}</p>
              <p id="email">${currentLang.social.email}</p>
              <p id="bio" class="text-muted"></p>
              </div>
              <div id="stats">
                <canvas id="matchStatsChart" width="400" height="200"></canvas>
                <p id="win-loss-ratio">${currentLang.social.win_loss_ratio}</p>
                <p id="matches-won">${currentLang.social.matches_won}</p>
                <p id="matches-lost">${currentLang.social.matches_lost}</p>
              </div>
            </div>
          </div>
          <div id="match-history">
            <ul class="list-group" id="match-history-list">
              <!-- Match history will be loaded here -->
            </ul>
          </div>
        </div>
        <div class="card text-center">
          <div>
            <button id="friend-list-btn" class="btn btn-primary">${currentLang.social.friend_list}</button>
            <button id="friend-requests-btn" class="btn btn-secondary">${currentLang.social.friend_requests}</button>
          </div>
          <div id="friend-content">
            <ul id="friend-list" class="list-group list-group-flush">
              <!-- Friend list will be loaded here -->
            </ul>
            <ul id="friend-requests-list" class="list-group list-group-flush" style="display: none;">
              <!-- Friend requests will be loaded here -->
            </ul>
          </div>
          <div class="card-footer text-muted">© 42</div>
          </div>
      </div>
      <link rel="stylesheet" href="styles/socialPage.css"
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      `;
  // Load profile on initial page load
  loadProfile();
  // Sayfa yüklendiğinde friend request'leri al
  fetchFriendRequests();
  // Sayfa yüklendiğinde friend list'leri al
  fetchFriendList();

  const friendListBtn = document.getElementById("friend-list-btn");
  const friendRequestsBtn = document.getElementById("friend-requests-btn");
  const friendList = document.getElementById("friend-list");
  const friendRequestsList = document.getElementById("friend-requests-list");

  // Event listeners to toggle between friend list and friend requests
  friendListBtn.addEventListener("click", () => {
    friendList.style.display = "block";
    friendRequestsList.style.display = "none";
    friendRequestsBtn.classList.remove("btn-primary");
    friendRequestsBtn.classList.add("btn-secondary");
    friendListBtn.classList.remove("btn-secondary");
    friendListBtn.classList.add("btn-primary");
  });

  friendRequestsBtn.addEventListener("click", () => {
    friendRequestsList.style.display = "block";
    friendList.style.display = "none";
    friendListBtn.classList.remove("btn-primary");
    friendListBtn.classList.add("btn-secondary");
    friendRequestsBtn.classList.remove("btn-secondary");
    friendRequestsBtn.classList.add("btn-primary");
  });
}
