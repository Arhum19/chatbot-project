document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");

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

    addMessage(message, true); // User message
    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    const typingIndicator = showTypingIndicator();

    try {
      const response = await generateResponse(message);
      typingIndicator.remove();

      if (!response) {
        addErrorMessage("AI returned an empty response.");
      } else {
        addMessage(response, false);
      }
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendButton.disabled = false;
    }
  });

  // NEW: Generate AI response via Vercel Serverless Function
  async function generateResponse(prompt) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.text || "";
  }

  // The rest of your code remains the same...
  // Function to convert markdown-style formatting to HTML
  // Escape HTML for safe code display
  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  function formatText(text) {
    // Remove carriage returns
    text = text.replace(/\r/g, '');

    // Handle code blocks (```code```)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const languageClass = lang ? `language-${lang}` : '';
      return `<div class="code-block-container"><pre><code class="${languageClass}">${escapeHTML(code)}</code></pre><button class="copy-button">Copy</button></div>`;
    });

    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${escapeHTML(code)}</code>`;
    });

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Split into lines for lists and paragraphs
    const lines = text.split('\n');
    const processedLines = [];
    let inList = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push('<br>');
      } else if (trimmed.match(/^(\*|-)\s+/)) { // Bullet lists (* or -)
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${trimmed.replace(/^(\*|-)\s+/, '')}</li>`);
      } else if (trimmed.match(/^\d+\.\s+/)) { // Numbered lists
        if (!inList) {
          processedLines.push('<ol>');
          inList = 'ol';
        }
        processedLines.push(`<li>${trimmed.replace(/^\d+\.\s+/, '')}</li>`);
      } else {
        if (inList) {
          processedLines.push(inList === 'ul' ? '</ul>' : '</ol>');
          inList = false;
        }
        processedLines.push(`<p>${trimmed}</p>`);
      }
    }
    if (inList) processedLines.push(inList === 'ul' ? '</ul>' : '</ol>');
    return processedLines.join('');
  }

  // Function to strip HTML tags completely
  function stripHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  
  // UPDATED: Add message function
function addMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `message ${isUser ? "user-message" : ""}`;

    // Create avatar
    const avatar = document.createElement("div");
    avatar.className = `avatar ${isUser ? "user-avatar" : ""}`;
    avatar.textContent = isUser ? "U" : "AI";

    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    // AI messages will be formatted and rendered as HTML
    if (!isUser) {
        messageContent.classList.add("ai-message");
        let processedText = formatText(text); // Process markdown to HTML
        messageContent.innerHTML = processedText; // Always use innerHTML for AI
    } else {
        // User messages are plain text, so no formatting is needed
        messageContent.textContent = text;
    }

    // Append elements
    message.appendChild(avatar);
    message.appendChild(messageContent);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Call the function to add copy buttons
    if (!isUser) {
        addCopyFunctionality();
    }
}

  function addCopyFunctionality() {
    document.querySelectorAll(".code-block-container").forEach(container => {
      const button = container.querySelector(".copy-button");
      if (button && !button.hasAttribute('data-listener-added')) {
        button.addEventListener("click", () => {
          const code = container.querySelector("code").innerText;

          navigator.clipboard.writeText(code).then(() => {
            button.innerText = 'Copied!';
            setTimeout(() => {
              button.innerText = 'Copy';
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy text: ', err);
            button.innerText = 'Error!';
          });
        });
        button.setAttribute('data-listener-added', 'true');
      }
    });
  }

  // Show typing indicator
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message";
    indicator.innerHTML = `
      <div class="avatar">AI</div>
      <div class="typing-indicator">
        <div class='dot'></div>
        <div class='dot'></div>
        <div class='dot'></div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  // Add error message
  function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "message";
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";
    
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.style.color = "red";
    messageContent.textContent = `Error: ${text}`;
    
    message.appendChild(avatar);
    message.appendChild(messageContent);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});