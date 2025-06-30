    document.addEventListener("DOMContentLoaded", () => {
      const toggleButton = document.querySelector(".chatbot-toggle");
      const chatWindow = document.querySelector(".chatbot-window");
      const userInput = document.querySelector(".chatbot-input");
      const sendButton = document.querySelector(".send-button");
      const chatLog = document.querySelector(".chatbot-messages");

  // Open Chatbot
      function toggleChat() {
        chatWindow.classList.toggle("active");
        if (chatWindow.classList.contains("active")) {
          setTimeout(() => userInput.focus(), 300);
        }
      }

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        if (!chatWindow.contains(e.target) && e.target !== toggleButton) {
          chatWindow.classList.remove("active");
        }
      });

      toggleButton.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChat();
      });

  // Send Message Function
  function sendMessage() {
    const userMsg = userInput.value.trim();
    if (!userMsg) return;

    // Show user message
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

    // Ask server (fake/placeholder call)
    askGroq(userMsg);
  }

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Simulated async response
  async function askGroq(userMsg) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();
      const botReply = data.reply || "Sorry, something went wrong.";

      // Remove typing indicator
      document.getElementById("typing-indicator")?.remove();

      // Show bot reply
      const botMsgDiv = document.createElement("div");
      botMsgDiv.className = "message bot-message";
      botMsgDiv.innerHTML = `<strong>Luma:</strong> ${botReply}`;
      chatLog.appendChild(botMsgDiv);
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (err) {
      document.getElementById("typing-indicator")?.remove();

      const errorDiv = document.createElement("div");
      errorDiv.className = "message bot-message error";
      errorDiv.innerHTML = `<strong>Luma:</strong> Something went wrong. Try again later.`;
      chatLog.appendChild(errorDiv);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  // Theme detection (dark/light)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme() {
    if (prefersDark.matches) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }

  applyTheme();
  prefersDark.addEventListener("change", applyTheme);
});
