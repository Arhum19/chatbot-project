document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const voiceButton = document.getElementById("voiceButton");
  const chatMessages = document.getElementById("chatMessages");
  const themeToggle = document.getElementById("themeToggle");
  const clearHistoryBtn = document.getElementById("clearHistory");
  const newChatBtn = document.getElementById("newChat");
  const chatHistoryBtn = document.getElementById("chatHistory");
  const chatHistorySidebar = document.getElementById("chatHistorySidebar");
  const closeSidebar = document.getElementById("closeSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const chatSessionsList = document.getElementById("chatSessionsList");
  const menuToggle = document.getElementById("menuToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // === UTILITY FUNCTIONS ===

  // Generate unique session ID
  function generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Get current session messages
  function getCurrentSessionMessages() {
    const session = chatSessions.find((s) => s.id === currentSessionId);
    return session ? session.messages : [];
  }

  // Generate chat title from first user message
  function generateChatTitle(messages) {
    const firstUserMessage = messages.find((msg) => msg.isUser);
    if (firstUserMessage && firstUserMessage.content) {
      return (
        firstUserMessage.content.slice(0, 50) +
        (firstUserMessage.content.length > 50 ? "..." : "")
      );
    }
    return "New Chat";
  }

  // Chat sessions management
  let chatSessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
  let currentSessionId =
    localStorage.getItem("currentSessionId") || generateSessionId();

  // Speech Recognition Setup
  let recognition = null;
  let isRecording = false;

  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
      isRecording = true;
      voiceButton.classList.add('recording');
      voiceButton.title = 'Recording... Click to stop';
      userInput.placeholder = 'Listening...';
    };
    
    recognition.onresult = function(event) {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        userInput.value = transcript;
        userInput.focus();
      }
    };
    
    recognition.onend = function() {
      isRecording = false;
      voiceButton.classList.remove('recording');
      voiceButton.title = 'Click to speak';
      userInput.placeholder = 'Type your message here...';
    };
    
    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isRecording = false;
      voiceButton.classList.remove('recording');
      voiceButton.title = 'Click to speak';
      userInput.placeholder = 'Type your message here...';
      
      // Show user-friendly error message
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };
  } else {
    // Hide voice button if speech recognition is not supported
    if (voiceButton) {
      voiceButton.style.display = 'none';
    }
  }

  // Migrate old chat history to new session system
  const oldChatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  if (oldChatHistory.length > 0 && chatSessions.length === 0) {
    // Migrate old history to new session
    const migratedSession = {
      id: currentSessionId,
      title: generateChatTitle(oldChatHistory),
      timestamp: new Date().toISOString(),
      messages: oldChatHistory,
    };
    chatSessions.push(migratedSession);
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    localStorage.removeItem("chatHistory");
  }

  let chatHistory = getCurrentSessionMessages();

  // Theme management
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  // Theme toggle functionality
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  // Clear history functionality
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to clear ALL chat sessions? This cannot be undone."
        )
      ) {
        chatSessions = [];
        chatHistory = [];
        currentSessionId = generateSessionId();
        localStorage.removeItem("chatHistory");
        localStorage.removeItem("chatSessions");
        localStorage.setItem("currentSessionId", currentSessionId);
        chatMessages.innerHTML = "";
        addMessage(
          "Hello! I'm Arhum's chatbot. How can I help you today?",
          false
        );
        renderChatSessions();
      }
    });
  }

  // New Chat functionality
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      startNewChat();
    });
  }

  // Chat History functionality
  if (chatHistoryBtn) {
    chatHistoryBtn.addEventListener("click", () => {
      toggleChatHistorySidebar();
    });
  }

  // Voice Input functionality
  if (voiceButton && recognition) {
    voiceButton.addEventListener("click", () => {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  // Close sidebar functionality
  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      closeChatHistorySidebar();
    });
  }

  // Sidebar overlay functionality
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      closeChatHistorySidebar();
    });
  }

  // Dropdown menu functionality
  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();

      // Toggle dropdown
      const isShowing = dropdownMenu.classList.contains("show");
      dropdownMenu.classList.toggle("show");

      // Adjust position on mobile to prevent overflow
      if (!isShowing && window.innerWidth <= 480) {
        adjustDropdownPosition();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Adjust dropdown position for mobile
    function adjustDropdownPosition() {
      const rect = dropdownMenu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // If dropdown would overflow on the right
      if (rect.right > viewportWidth - 20) {
        dropdownMenu.style.right = "0";
        dropdownMenu.style.left = "auto";
      }

      // For very small screens, make it full width with margin
      if (viewportWidth <= 380) {
        dropdownMenu.style.left = "20px";
        dropdownMenu.style.right = "20px";
        dropdownMenu.style.width = "auto";
      }
    }
  }

  // Auto-resize the textarea
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
  });

  // Send message on Enter (without Shift)
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  // Handle form submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    const timestamp = new Date();

    // Add user message
    addMessage(message, true, timestamp);

    // Save to history
    chatHistory.push({
      content: message,
      isUser: true,
      timestamp: timestamp.toISOString(),
    });

    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    const typingIndicator = showTypingIndicator();

    try {
      await generateStreamingResponse(message, typingIndicator);
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendButton.disabled = false;
      saveCurrentSession();
    }
  });

  // Apply theme function
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = themeToggle?.querySelector(".theme-icon");
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  // Load chat history from localStorage
  function loadChatHistory() {
    // Clear any existing messages first
    chatMessages.innerHTML = "";

    if (chatHistory.length === 0) {
      // Only show welcome message if this is truly a fresh start
      addMessage(
        "Hello! I'm Arhum's chatbot. How can I help you today?",
        false
      );
      return;
    }

    chatHistory.forEach((msg) => {
      const timestamp = new Date(msg.timestamp);
      addMessage(msg.content, msg.isUser, timestamp);
    });

    // Add copy functionality after loading
    setTimeout(() => addCopyFunctionality(), 100);
  }

  // Streaming response function
  async function generateStreamingResponse(prompt, typingIndicator) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(
        "API Error " + response.status + ": " + response.statusText
      );
    }

    const data = await response.json();
    const fullText = data.text || "";

    // Remove typing indicator
    typingIndicator.remove();

    if (!fullText) {
      addErrorMessage("AI returned an empty response.");
      return;
    }

    // Create AI message element for streaming
    const timestamp = new Date();
    const messageDiv = addMessage("", false, timestamp);
    const messageContent = messageDiv.querySelector(".message-content");

    // Stream the text
    await streamText(messageContent, fullText);

    // Save to history
    chatHistory.push({
      content: fullText,
      isUser: false,
      timestamp: timestamp.toISOString(),
    });
  }

  // Stream text effect
  async function streamText(element, text) {
    element.classList.add("streaming-text");
    let displayedText = "";

    // Stream character by character
    for (let i = 0; i < text.length; i++) {
      displayedText += text[i];
      element.innerHTML = formatText(displayedText);

      // Adjust typing speed here (lower = faster)
      await new Promise((resolve) => setTimeout(resolve, 2));
      // Keep scrolled to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove streaming cursor and finalize
    element.classList.remove("streaming-text");
    element.innerHTML = formatText(displayedText);
    addCopyFunctionality();
  }

  // Add message function
  function addMessage(text, isUser, timestamp = new Date()) {
    const message = document.createElement("div");
    message.className = "message" + (isUser ? " user-message" : "");

    // Create avatar
    const avatar = document.createElement("div");
    avatar.className = "avatar" + (isUser ? " user-avatar" : "");
    avatar.textContent = isUser ? "U" : "AI";

    // Create message wrapper
    const messageWrapper = document.createElement("div");
    messageWrapper.className = "message-wrapper";

    // Create message header with timestamp and copy button
    const messageHeader = document.createElement("div");
    messageHeader.className = "message-header";

    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    if (!isUser) messageContent.classList.add("ai-message");

    // Create timestamp
    const timestampElement = document.createElement("div");
    timestampElement.className = "message-timestamp";
    timestampElement.textContent = formatTimestamp(timestamp);

    // Create copy button
    const copyButton = document.createElement("button");
    copyButton.className = "copy-message-btn";
    copyButton.textContent = "📋";
    copyButton.title = "Copy message";
    copyButton.addEventListener("click", () => {
      // Get the formatted HTML content from the message content div
      const messageContentDiv = messageDiv.querySelector(".message-content");
      const formattedHTML = messageContentDiv.innerHTML;
      copyMessageContent(copyButton, formattedHTML);
    });

    // Assemble message header
    messageHeader.appendChild(timestampElement);
    messageHeader.appendChild(copyButton);

    // Set content
    if (isUser) {
      messageContent.textContent = text;
    } else {
      messageContent.innerHTML = formatText(text);
    }

    // Assemble message
    messageWrapper.appendChild(messageHeader);
    messageWrapper.appendChild(messageContent);
    message.appendChild(avatar);
    message.appendChild(messageWrapper);

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return message;
  }

  // Copy message content function
  function copyMessageContent(button, text) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    
    // Handle code blocks specially to preserve formatting
    const codeBlocks = tempDiv.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
      // Get the raw code text and ensure line breaks are preserved
      const codeText = codeBlock.textContent || codeBlock.innerText || "";
      // Replace the entire pre element with formatted text
      const preElement = codeBlock.closest('pre') || codeBlock.parentElement;
      if (preElement) {
        preElement.outerHTML = '\n```\n' + codeText + '\n```\n';
      }
    });
    
    // Handle inline code
    const inlineCodes = tempDiv.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(code => {
      const codeText = code.textContent || code.innerText || "";
      code.outerHTML = '`' + codeText + '`';
    });
    
    // Handle line breaks and paragraphs
    tempDiv.innerHTML = tempDiv.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/?ul>/gi, '')
      .replace(/<\/?ol>/gi, '');
    
    // Get final plain text
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Clean up formatting
    const cleanText = plainText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\s+$/gm, ''); // Remove trailing spaces from lines

    navigator.clipboard
      .writeText(cleanText)
      .then(() => {
        button.textContent = "✅";
        button.classList.add("copied");
        setTimeout(() => {
          button.textContent = "📋";
          button.classList.remove("copied");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        button.textContent = "❌";
        setTimeout(() => {
          button.textContent = "📋";
        }, 2000);
      });
  }

  // Format timestamp
  function formatTimestamp(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Add copy functionality to code blocks
  function addCopyFunctionality() {
    document.querySelectorAll(".copy-button").forEach((button) => {
      if (!button.hasAttribute("data-listener")) {
        button.setAttribute("data-listener", "true");
        button.addEventListener("click", () => {
          const codeBlock = button.parentElement.querySelector("code");
          const text = codeBlock.textContent;

          navigator.clipboard
            .writeText(text)
            .then(() => {
              button.textContent = "Copied!";
              button.classList.add("copied");
              setTimeout(() => {
                button.textContent = "Copy";
                button.classList.remove("copied");
              }, 2000);
            })
            .catch((err) => {
              console.error("Failed to copy code: ", err);
              button.textContent = "Error";
              setTimeout(() => {
                button.textContent = "Copy";
              }, 2000);
            });
        });
      }
    });
  }

  // Show typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message";
    typingDiv.innerHTML = `
      <div class="avatar">AI</div>
      <div class="message-wrapper">
        <div class="message-content typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
  }

  // Add error message
  function addErrorMessage(errorText) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "message error-message";
    errorDiv.innerHTML = `
      <div class="avatar">⚠️</div>
      <div class="message-wrapper">
        <div class="message-content">
          <strong>Error:</strong> ${errorText}
        </div>
      </div>
    `;
    chatMessages.appendChild(errorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Escape HTML for safe code display
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Format text function for markdown-style formatting
  function formatText(text) {
    if (!text) return "";

    // Remove carriage returns
    text = text.replace(/\r/g, "");

    // Handle code blocks (```code```)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const languageClass = lang ? "language-" + lang : "";
      return (
        '<div class="code-block-container"><pre><code class="' +
        languageClass +
        '">' +
        escapeHTML(code) +
        '</code></pre><button class="copy-button">Copy</button></div>'
      );
    });

    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return "<code>" + escapeHTML(code) + "</code>";
    });

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Split into lines for lists and paragraphs
    const lines = text.split("\n");
    const processedLines = [];
    let inList = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (inList) {
          processedLines.push(inList === "ul" ? "</ul>" : "</ol>");
          inList = false;
        }
        processedLines.push("<br>");
      } else if (trimmed.match(/^(\*|-)\s+/)) {
        // Bullet lists (* or -)
        if (!inList) {
          processedLines.push("<ul>");
          inList = "ul";
        }
        processedLines.push(
          "<li>" + trimmed.replace(/^(\*|-)\s+/, "") + "</li>"
        );
      } else if (trimmed.match(/^\d+\.\s+/)) {
        // Numbered lists
        if (!inList || inList === "ul") {
          if (inList === "ul") processedLines.push("</ul>");
          processedLines.push("<ol>");
          inList = "ol";
        }
        processedLines.push(
          "<li>" + trimmed.replace(/^\d+\.\s+/, "") + "</li>"
        );
      } else {
        if (inList) {
          processedLines.push(inList === "ul" ? "</ul>" : "</ol>");
          inList = false;
        }
        processedLines.push("<p>" + trimmed + "</p>");
      }
    }
    if (inList) processedLines.push(inList === "ul" ? "</ul>" : "</ol>");
    return processedLines.join("");
  }

  // === CHAT SESSIONS MANAGEMENT ===

  // Save current session
  function saveCurrentSession() {
    if (chatHistory.length === 0) return;

    const existingIndex = chatSessions.findIndex(
      (s) => s.id === currentSessionId
    );
    const title = generateChatTitle(chatHistory);
    const session = {
      id: currentSessionId,
      title: title,
      timestamp: new Date().toISOString(),
      messages: [...chatHistory],
    };

    if (existingIndex >= 0) {
      chatSessions[existingIndex] = session;
    } else {
      chatSessions.push(session);
    }

    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }

  // Start new chat
  function startNewChat() {
    // Save current session if it has messages
    if (chatHistory.length > 0) {
      saveCurrentSession();
    }

    // Create new session
    currentSessionId = generateSessionId();
    chatHistory = [];

    // Clear UI and start fresh
    chatMessages.innerHTML = "";
    addMessage("Hello! I'm Arhum's chatbot. How can I help you today?", false);

    // Update storage
    localStorage.setItem("currentSessionId", currentSessionId);
    localStorage.removeItem("chatHistory"); // Remove old single chat history

    // Update sidebar
    renderChatSessions();
  }

  // Load specific chat session
  function loadChatSession(sessionId) {
    // Save current session first
    if (chatHistory.length > 0) {
      saveCurrentSession();
    }

    // Load selected session
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      currentSessionId = sessionId;
      chatHistory = [...session.messages];

      // Clear and reload messages
      chatMessages.innerHTML = "";
      chatHistory.forEach((msg) => {
        const timestamp = new Date(msg.timestamp);
        addMessage(msg.content, msg.isUser, timestamp);
      });

      // Add copy functionality after loading
      setTimeout(() => addCopyFunctionality(), 100);

      // Update storage
      localStorage.setItem("currentSessionId", currentSessionId);

      // Update sidebar
      renderChatSessions();
      closeChatHistorySidebar();
    }
  }

  // Delete chat session
  function deleteChatSession(sessionId) {
    if (confirm("Are you sure you want to delete this chat?")) {
      chatSessions = chatSessions.filter((s) => s.id !== sessionId);
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));

      // If deleting current session, start new chat
      if (sessionId === currentSessionId) {
        startNewChat();
      } else {
        renderChatSessions();
      }
    }
  }

  // Toggle chat history sidebar
  function toggleChatHistorySidebar() {
    renderChatSessions();
    chatHistorySidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("show");
  }

  // Close chat history sidebar
  function closeChatHistorySidebar() {
    chatHistorySidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
  }

  // Render chat sessions in sidebar
  function renderChatSessions() {
    if (chatSessions.length === 0) {
      chatSessionsList.innerHTML = `
        <div class="chat-sessions-empty">
          <h4>No Previous Chats</h4>
          <p>Start a conversation to see your chat history here.</p>
        </div>
      `;
      return;
    }

    // Sort sessions by timestamp (newest first)
    const sortedSessions = [...chatSessions].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    chatSessionsList.innerHTML = sortedSessions
      .map((session) => {
        const isActive = session.id === currentSessionId;
        const date = new Date(session.timestamp);
        const formattedDate = formatChatDate(date);
        const preview = session.messages.find((msg) => !msg.isUser);
        const previewText = preview
          ? preview.content.slice(0, 60) + "..."
          : "No AI response yet";

        return `
        <div class="chat-session-item ${isActive ? "active" : ""}" 
             onclick="loadChatSession('${session.id}')">
          <div class="chat-session-title">${escapeHTML(session.title)}</div>
          <div class="chat-session-preview">${escapeHTML(previewText)}</div>
          <div class="chat-session-meta">
            <span class="chat-session-date">${formattedDate}</span>
            <button class="chat-session-delete" 
                    onclick="event.stopPropagation(); deleteChatSession('${
                      session.id
                    }')"
                    title="Delete chat">
              🗑️
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Format chat date for display
  function formatChatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  // Update the existing saveToHistory function to work with sessions
  function saveToHistory() {
    saveCurrentSession();
  }

  // Initialize the chat
  function initializeChat() {
    // Clear any existing messages to avoid duplicates
    chatMessages.innerHTML = "";

    // Load and render chat history
    loadChatHistory();

    // Initialize chat sessions sidebar
    renderChatSessions();
  }

  // Initialize the chat
  initializeChat();

  // Make functions globally available for HTML onclick events
  window.loadChatSession = loadChatSession;
  window.deleteChatSession = deleteChatSession;

  // Debug function to clear all data (can be called from browser console)
  window.clearAllData = function () {
    localStorage.clear();
    location.reload();
  };
});
