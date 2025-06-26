document.addEventListener("DOMContentLoaded", () => {
  const chatLog = document.querySelector(".chatbot-messages");
  const userInput = document.querySelector(".chatbot-input");
  const sendButton = document.querySelector(".send-button");
  const toggleButton = document.querySelector(".chatbot-toggle");
  const chatWindow = document.querySelector(".chatbot-window");
  const chatbotContainer = document.querySelector(".chatbot-container");
  // Toggle chat window
  toggleButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    chatWindow.classList.toggle("active");
    toggleButton.classList.toggle("hidden");
      
    if (chatWindow.classList.contains("active")) {
         chatbotContainer.classList.remove("inactive");
      setTimeout(() => {
        userInput.focus();
      }, 100);
    }
    else {
    chatbotContainer.classList.add("inactive");}
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const isChatWindow = e.target.closest(".chatbot-window");
    const isToggleButton = e.target.closest(".chatbot-toggle");

    if (
      !isChatWindow &&
      !isToggleButton &&
      chatWindow.classList.contains("active")
    ) {
      // Add shrink animation class
      chatWindow.classList.add("closing");

      // After animation completes, hide the window
      setTimeout(() => {
        chatWindow.classList.remove("active", "closing");
        toggleButton.classList.remove("hidden");
        chatbotContainer.classList.add("inactive");
      }, 500); // Match this with CSS animation duration
    }
  });

  // Send message function
  function sendMessage() {
    const userMsg = userInput.value.trim();
    if (!userMsg) return;

    // Display user message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "message user-message";
    userMsgDiv.innerHTML = `<strong>You:</strong> ${userMsg}`;
    chatLog.appendChild(userMsgDiv);

    userInput.value = "";
    chatLog.scrollTop = chatLog.scrollHeight;

    // Show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "message typing-indicator";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
    chatLog.appendChild(typingDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Call the function to get the bot's response
    askGroq(userMsg);
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  async function askGroq(userMsg) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMsg,
        }),
      });

      const data = await response.json();

      const botReply = data.reply || "Sorry, something went wrong.";

      // Remove typing indicator
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }

      // Display bot message
      const botMsgDiv = document.createElement("div");
      botMsgDiv.className = "message bot-message";
      botMsgDiv.innerHTML = `<strong>Luma:</strong> ${botReply}`;
      chatLog.appendChild(botMsgDiv);
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (err) {
      // Remove typing indicator
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }

      // Display error message
      const errorDiv = document.createElement("div");
      errorDiv.className = "message bot-message error";
      errorDiv.innerHTML = `<strong>Luma:</strong> Something went wrong. Try again later.`;
      chatLog.appendChild(errorDiv);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  // Detect system color scheme preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.add("light");
  }

  // Watch for changes in color scheme preference
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    });
});
