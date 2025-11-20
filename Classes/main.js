
    // ===== SECTION: DOM ELEMENTS =====
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const messages = document.getElementById('chat-messages');
  const summaryBtn = document.querySelector('.summary-btn');
  const bulletBtn = document.querySelector('.bullet-btn');
  const fileInput = document.getElementById('file-input');
  const themeToggle = document.getElementById("theme-toggle");


  // ===== SECTION: WELCOME MESSAGES =====
  window.onload = () => {
    Messages.appendMessage('bot', "👋 Welcome to AI Study Chatbot. I am here to help you ace your study material.");
    setTimeout(() => {
      Messages.appendMessage('bot', "Please upload your material in .txt or .pdf format and choose one of the prompt buttons to get started!");
    }, 1000);
  };


  // ===== SECTION: EVENT LISTENERS =====
  // Send message on click or Enter
  sendBtn.onclick = Chatbot.sendMessage;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') Chatbot.sendMessage(); });

  // Prompt buttons set predefined messages
  summaryBtn.onclick = () => {
      input.value = "Summarize the following content in a concise manner.";
      Chatbot.sendMessage();
  };
  bulletBtn.onclick = () => {
      input.value = "Provide the key points of the content in bullet point format.";
      Chatbot.sendMessage();
  };

  //Toggle to light or dark mode
  themeToggle.onclick = Settings.toggleMode;


  //===== SECTION: FILE UPLOAD HANDLER =====
  fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      Messages.appendMessage('bot', `📄 Uploaded file: ${file.name}`);
  });
          

    async function getReply(msg) {
        const apiKey = "";
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
            Messages.appendMessage('bot', data);
        }
        catch(error){
            Messages.appendMessage('bot', error);
            return "An error has occured";
        }
    }

 