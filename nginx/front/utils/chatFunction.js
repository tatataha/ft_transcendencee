let activeChatSocket = null; // Track the active WebSocket connection

import { getSelectedLanguage } from "../views/homePage.js";

const currentLang = getSelectedLanguage();


export async function startChatSocket(friend_id, user_id, friend_username) {
  // Close existing chat box if it is already open
  let existingChatBox = document.getElementById("chatBox");
  if (existingChatBox) {
    existingChatBox.remove();
  }

  // Close any previous WebSocket connection
  if (activeChatSocket) {
    activeChatSocket.close();
    activeChatSocket = null;
  }

  // Locate the parent container
  const parentContainer = document.getElementById("every");

  // Create a new chat box
  const chatBox = document.createElement("div");
  chatBox.id = "chatBox";

  chatBox.innerHTML = `
        <div style="padding: 25px; background-color: #8D5DFE; color: white; border-radius: 30px; display:flex; flex-direction: row; justify-content: space-between; align-items: center;">
        <p style="margin: 0px; font-size: 16px;">${friend_username}</p>
        <button id="closeChatButton" style="float: right; background: transparent; border: none; color: white;">&times;</button>
      </div>
      <div id="chatMessages"></div>
      <div style="display: flex; flex-direction: row; margin-bottom: 14px; justify-content: space-between; align-items: center;">
        <input type="text" id="messageInput" placeholder="Type..." style="background-color: #BAA0F6; border: hidden; border-radius: 15px; height: 60px; width: 78%; font-size: 14px; padding-left: 18px;"/>
        <button id="sendMessageButton" style="background-color: #BAA0F6; border: none; color: white; border-radius: 15px; height: 60px; width: 20%; font-size: 14px;">${currentLang.social.chat_send}</button>
      </div>
    `;

  // Append the chat box to the parent container between the friend list and profile card
  parentContainer.insertBefore(chatBox, parentContainer.children[1]); // Adjust index as needed

  try {
    // Await the WebSocket connection
    activeChatSocket = await initializeChatSocket(friend_id, user_id);

    activeChatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const chatMessages = document.getElementById("chatMessages");

      // Append old messages if present
      if (data.old_messages) {
        data.old_messages.forEach((msg) => {
          appendMessage(chatMessages, msg.user, msg.content);
        });
      }

      // Append the new message
      if (data.message) {
        appendMessage(chatMessages, data.user, data.message);
      }
      chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    };

    document
      .getElementById("messageInput")
      .addEventListener("keydown", function (event) {
        // Enter tuşuna basıldığında
        if (event.key === "Enter") {
          event.preventDefault(); // Formun varsayılan submit işlemini engeller
          document.getElementById("sendMessageButton").click(); // Gönderme butonunu tetikler
        }
      });

    document.getElementById("sendMessageButton").onclick = function () {
      const messageInputDom = document.getElementById("messageInput");
      const message = messageInputDom.value.trim(); // Trim whitespace

      if (message) {
        // Only send if there's a non-empty message
        activeChatSocket.send(
          JSON.stringify({
            message,
            user: localStorage.getItem("username"),
          })
        );
        messageInputDom.value = ""; // Clear input field
      }
    };
  } catch (error) {
    console.error("Failed to establish WebSocket connection", error);
  }

  // Handle close button
  document.getElementById("closeChatButton").onclick = function () {
    if (activeChatSocket) {
      activeChatSocket.close();
      activeChatSocket = null;
    }
    chatBox.remove();
  };
}

// Helper function to append messages to chat
function appendMessage(chatContainer, username, message) {

  const messageElement = document.createElement("div");
  const isUserMessage = username === localStorage.getItem("username");

  if (message === "#invite") {
    // Special handling for #invite messages
    messageElement.classList.add("message-bubble", "game-invite");
    messageElement.innerHTML = `
      <p>Game Invitation</p>
      <button class="accept-invite-button">Accept Invitation</button>
    `;
  } else {
    // Regular message handling
    messageElement.classList.add(
      "message-bubble",
      isUserMessage ? "user-message" : "friend-message"
    );
    messageElement.innerHTML = `${message}`;
  }

  chatContainer.appendChild(messageElement);

  // Attach event listener to the invitation button (if applicable)
  if (message === "#invite") {
    const inviteButton = messageElement.querySelector(".accept-invite-button");
    inviteButton.onclick = function () {
      window.location.hash = "game_ai";
      window.location.reload();
    };
  }
}

// CSS styles for message bubbles
const styleElement = document.createElement("style");
styleElement.innerHTML = `
  #chatMessages {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .message-bubble {
    padding: 10px;
    margin: 5px;
    border-radius: 30px;
    max-width: 75%;
    min-width: 25%;
    display: inline-block;
    word-wrap: break-word;1
  }
  .user-message {
    background-color: #8D5DFE;
    color: white;
    align-self: flex-end;
    text-align: center;
    margin-left: auto;
    font-size: 14px;
  }
  .friend-message {
    background-color: #A29FFA;
    color: white;
    align-self: flex-start;
    text-align: center;
    margin-right: auto;
    font-size: 14px;
  }
  .game-invite {
    background-color: #4CAF50; /* Green for game invite */
    color: white;
    align-self: flex-start;
    text-align: center;
    margin-right: auto;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.accept-invite-button {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: white;
  color: #4CAF50;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
}
.accept-invite-button:hover {
  background-color: #45a049; /* Darker green on hover */
  color: white;
}

`;
document.head.appendChild(styleElement);

// Function to initialize WebSocket
export async function initializeChatSocket(friend_id, user_id) {
  if (friend_id < user_id) {
    [friend_id, user_id] = [user_id, friend_id];
  }
  const roomName = `${friend_id}_${user_id}`;
  const secretKey = localStorage.getItem("user_secret");
  const chatSocket = new WebSocket(
    `wss://127.0.0.1/ws/chat/${roomName}/${secretKey}/`
  );

  // Return a promise that resolves when WebSocket is connected
  return new Promise((resolve, reject) => {
    chatSocket.onopen = function () {
      console.log("WebSocket connection established");
      resolve(chatSocket);
    };

    chatSocket.onerror = function (e) {
      console.error("WebSocket connection error");
      reject(e);
    };
  });
}
