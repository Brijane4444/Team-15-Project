

  // ===== SECTION: DOM ELEMENTS =====
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const messages = document.getElementById('chat-messages');
 // const promptBtns = document.querySelectorAll('.prompt-btn'); **I don't think this is needed but can't test today**
  const summaryBtn = document.querySelector('.summary-btn');
  const bulletBtn = document.querySelector('.bullet-btn');
  const fileInput = document.getElementById('file-input');

  // ===== SECTION: WELCOME MESSAGES =====
  window.onload = () => {
    appendMessage('bot', "👋 Welcome to AI Study Chatbot. I am here to help you ace your study material.");
    setTimeout(() => {
      appendMessage('bot', "Please upload your material in .txt or .pdf format and choose one of the prompt buttons to get started!");
    }, 1000);
  };

  // ===== SECTION: EVENT LISTENERS =====
  // Send message on click or Enter
  sendBtn.onclick = sendMessage;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  // Prompt buttons set predefined messages
  summaryBtn.onclick = () => {
      input.value = "Summarize the following content in a concise manner.";
      sendMessage();
  };
  bulletBtn.onclick = () => {
      input.value = "Provide the key points of the content in bullet point format.";
      sendMessage();
  };

  //===== SECTION: FILE UPLOAD HANDLER =====
  fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      appendMessage('bot', `📄 Uploaded file: ${file.name}`);
  });
          
  // ===== SECTION: FUNCTION appendMessage =====
  function appendMessage(role, text) {
      const div = document.createElement('div');
      div.className = `message ${role}`;

      const messageText = document.createElement('span');
      messageText.textContent = text;
      div.appendChild(messageText);

      // Add copy button for bot messages
      if (role === 'bot') {
          const copyBtn = document.createElement('button');
          copyBtn.textContent = 'Copy';
          copyBtn.className = 'copy-btn';
          copyBtn.onclick = () => {
              navigator.clipboard.writeText(text);
              copyBtn.textContent = 'Copied!';
              setTimeout(() => copyBtn.textContent = 'Copy', 1500);
          };
          div.appendChild(copyBtn);
      }

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
  }

  // ===== SECTION: FUNCTION sendMessage =====
  function sendMessage() {
    const text = input.value.trim();
    if (text) { 
      appendMessage('user', text);
      input.value = '';
      getReply(text);
    }
  }

  // ===== SECTION: FUNCTION getReply (API call) =====
  async function getReply(msg) {
    //const apiKey = process.env.API_KEY; **this needs to be handled in the backend!
    const apiLocation = "https://api.openai.com/v1/chat/completions";

  try {
    const reply = await fetch(apiLocation, {
      headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'}, 
      method: 'POST',
      body: JSON.stringify({model: "gpt-4.1-nano", messages: [{role:'user', content: msg}], max_tokens: 1000}),
    });

     const toReturn = await reply.json();
     data = toReturn.choices[0].message.content;
     console.log(data);
     appendMessage('bot', data);
     }
 catch(error){
    return "An error has occured";
    console.error("An error has occured", error);
   }
  }