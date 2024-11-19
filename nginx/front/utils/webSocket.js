let chatSocket;

export async function webSocket() {
  chatSocket = new WebSocket(`wss://127.0.0.1/ws/status/`);

  // Wait for WebSocket connection to open
  try {
    await new Promise((resolve, reject) => {
      chatSocket.onopen = () => {
        console.log("WebSocket connection established");
        resolve();
      };
      chatSocket.onerror = (error) => {
        console.error("WebSocket connection error", error);
        reject(error);
      };
    });

    // Once connected, set up event handlers and send initial message
    chatSocket.onclose = () => {
      console.error("Chat socket closed unexpectedly");
    };

    // Send the online status message
    chatSocket.send(
      JSON.stringify({
        status: "online",
        user: localStorage.getItem("username"),
      })
    );

  } catch (error) {
    console.error("Failed to establish WebSocket connection", error);
    return; // Exit if connection failed
  }

  // Handle window close to set user offline and close the WebSocket
  window.onbeforeunload = function () {
    console.log("Closing WebSocket connection");
  
    // Check if the WebSocket is open before sending the status
    if (chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(
        JSON.stringify({
          status: "offline",
          user: localStorage.getItem("username"),
        })
      );
    }
  
    // Close the WebSocket connection
    chatSocket.close();
  };  
}

export async function sendStatusOfflineAndClose() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    await chatSocket.send(
      JSON.stringify({
        status: "offline",
        user: localStorage.getItem("username"),
      })
    );
    chatSocket.close();
  }
}