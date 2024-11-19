import { startChatSocket } from "../../utils/chatFunction.js";
import { getSelectedLanguage } from "../../views/homePage.js";

const	currentLang = getSelectedLanguage();

export async function fetchFriendList() {
  try {
    const response = await fetch(
      "https://127.0.0.1/user-manage/get_friends/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const friends = await response.json();
    const friendList = document.getElementById("friend-list");
    friendList.innerHTML = ""; // Clear existing list items before appending

    friends.forEach((friend) => {
      const listItem = document.createElement("li");
      const uniqueId = friend.id; // Unique ID for each friend

      listItem.innerHTML = `
        <div class="friend-list-item">
          <img src="${friend.profile_picture}" alt="profile" class="rounded-circle" width="49" height="49"">
          <div id="status-friend-${uniqueId}" class="small-status-friend ${friend.online_status ? 'online' : 'offline'}"></div>
          <h6 class="mb-0">${friend.first_name} ${friend.last_name}</h6>
          <button id="message-btn-${uniqueId}" class="btn btn-primary btn-sm">${currentLang.social.chat}</button>
        </div>
      `;

      friendList.appendChild(listItem);

/*       // Add event listener for the Remove button
      listItem.querySelector(`#remove-btn-${uniqueId}`).addEventListener("click", () => {
        removeFriend(friend.username);
      }); */

      // Add event listener for the Message button
      listItem.querySelector(`#message-btn-${uniqueId}`).addEventListener("click", () => {
        startChatSocket(friend.id, localStorage.getItem("user_id"), friend.username);
        console.log("Chat started!", friend.id, localStorage.getItem("user_id"));
      });

      // Set the online status
      const statusIndicator = listItem.querySelector(`#status-friend-${uniqueId}`);
      statusIndicator.classList.toggle("online", friend.online_status);
      statusIndicator.classList.toggle("offline", !friend.online_status);
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
  }
}

// Function to remove a friend
export async function removeFriend(username) {
  try {
    await fetch("https://127.0.0.1/user-manage/remove_friend/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friend_username: username }),
    });
    console.log("Friend removed!");
    location.reload();
  } catch (error) {
    console.error("Error removing friend:", error);
  }
}
