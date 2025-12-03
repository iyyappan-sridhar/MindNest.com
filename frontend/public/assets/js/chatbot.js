document.addEventListener("DOMContentLoaded", () => {

  // Inject Chatbot HTML into page
  document.body.insertAdjacentHTML("beforeend", `
    <!-- CHATBOT BUTTON -->
    <div id="chatbot-btn">
      <i class="fas fa-comment-dots"></i>
    </div>

    <!-- CHATBOT BOX -->
    <div id="chatbot-box">
      <div class="chatbot-header">
        <h4>MindNest Assistant</h4>
        <span id="chatbot-close">&times;</span>
      </div>

      <div class="chatbot-body" id="chatBody">
        <p class="bot-msg">Hi 👋 I'm your virtual assistant. How can I help you today?</p>
      </div>

      <div class="chatbot-input">
        <input type="text" id="userInput" placeholder="Type your question...">
        <button id="sendBtn"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `);

  // Chatbot CSS inject
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "chatbot.css";
  document.head.appendChild(style);

  // FAQ ANSWERS
  const botReplies = {
    "hi": "Hello! How can I support you today?",
    "hello": "Hi! Ask me anything about MindNest 😊",
    "what services": "We offer Family Counselling, Relationship Therapy, Career Guidance, Stress Management & more.",
    "price": "Session prices start from ₹199 depending on the counselling type.",
    "booking": "You can book a counselling session here → booking page.",
    "contact": "You can contact us at 8940902102 / 9360358905.",
    "payment": "Refund will be processed within 24 hours."
  };

  // Open/Close chatbot
  document.getElementById("chatbot-btn").onclick = () => {
    document.getElementById("chatbot-box").style.display = "flex";
  };

  document.getElementById("chatbot-close").onclick = () => {
    document.getElementById("chatbot-box").style.display = "none";
  };

  document.getElementById("sendBtn").onclick = sendMessage;
  document.getElementById("userInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    let input = document.getElementById("userInput").value.trim();
    if (!input) return;

    let chatBody = document.getElementById("chatBody");
    chatBody.innerHTML += `<p class='user-msg'>${input}</p>`;
    document.getElementById("userInput").value = "";

    setTimeout(() => {
      let reply = getReply(input.toLowerCase());
      chatBody.innerHTML += `<p class='bot-msg'>${reply}</p>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 400);
  }

  function getReply(msg) {
    for (let key in botReplies) {
      if (msg.includes(key)) return botReplies[key];
    }
    return "I'm not sure about that, but our counsellor can assist you! 😊";
  }
});
