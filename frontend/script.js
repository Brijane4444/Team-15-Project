

  // ===== SECTION: DOM ELEMENTS =====
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const messages = document.getElementById('chat-messages');
  const summaryBtn = document.querySelector('.summary-btn');
  const bulletBtn = document.querySelector('.bullet-btn');
  const fileInput = document.getElementById('file-input');
  const themeToggle = document.getElementById("theme-toggle");

  // ===== SECTION: STATE VARIABLES =====
  let uploadedFile = null; //holds the currently uploaded file
  let fileUploaded = false; //flag to know if there is a file uploaded

  const API_BASE_URL = 'http://localhost:8080';

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
      input.value = "Summary.";
      sendMessage();
  };
  bulletBtn.onclick = () => {
      input.value = "bullet points.";
      sendMessage();
  };

  //===== SECTION: FILE UPLOAD HANDLER =====
  fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

  // If a document has already been uploaded, prompt user
    if (fileUploaded) {
      appendMessage('bot', "📚 You’ve already uploaded a document. Would you like to end this session or upload a new one?");
      
      const endBtn = document.createElement('button');
      endBtn.textContent = "End Session";
      endBtn.className = "prompt-btn";
      endBtn.onclick = () => {
        appendMessage('bot', "✅ Session ended. Thank you for using the Study Chatbot! Refresh the page to start a new one.");
        disableInputs();
      };

      const newUploadBtn = document.createElement('button');
      newUploadBtn.textContent = "Upload Another Document";
      newUploadBtn.className = "prompt-btn";
      newUploadBtn.onclick = () => {
        appendMessage('bot', "📄 Great! Please upload your new document to continue.");
        resetFileSession(); //forgets the previous file
        fileUploaded = false; // Reset so user can upload again
      };

      const buttonRow = document.createElement('div');
      buttonRow.style.display = "flex";
      buttonRow.style.gap = "10px";
      buttonRow.appendChild(endBtn);
      buttonRow.appendChild(newUploadBtn);
      messages.appendChild(buttonRow);
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    //first time uploading a file
      uploadedFile = file;
      fileUploaded = true;

    // Handle different file types -new!
      if (file.type === "text/plain"){
        appendMessage('bot', `📄 Uploaded text file: ${file.name}. Would you like a summary or bullet-point notes? You can type "summary" or "bullet points", or click one of the buttons.`);
      } else if (file.type === "application/pdf"){
        appendMessage('bot', `📄 Uploaded PDF file: ${file.name}. Full PDF text analysis is not fully implemented yet. please upload a .txt. version of your material`);
      } else{
        appendMessage('bot', `⚠️ Unsupported file type: ${file.type}. Please upload a .txt.`);
        uploadedFile = null;
        fileUploaded = false;
      }
  });
  // ===== DARK MODE TOGGLE =====
    
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
         themeToggle.textContent = "☀️ Light Mode";
         } else {
            themeToggle.textContent = "🌙 Dark Mode";
        }
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

  // ===== SECTION: FUNCTION sendMessage (normal chat) =====
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    appendMessage('user', text);
    input.value = '';

    const lower =text.toLowerCase();
  // If txt file is uploaded and user asks summary or bullet point, handle accordingly to file workflow
    if (fileUploaded && uploadedFile && uploadedFile.type === "text/plain") {
      if (lower.includes("summary") || lower.includes("summarize")){
        analyzFileWithQuestion("Summarize this content in a clear, concise way for a student.");
        return;
      }
      if (lower.includes("bullet") || lower.includes("points")){
        analyzFileWithQuestion("Create bullet-point notes from this content for a student.");
        return;
      }
     //otherwise, normal chat to backend
      getReply(text);
    }
  }

  // ===== HELPER -to read uploaded file as a text (for .txt files) =====
  function readUploadedFileAsText() {
      return new Promise((resolve, reject) => {
        if (!uploadedFile) {
          reject(new Error("No file uploaded"));
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(uploadedFile);//good only for txt files
      });
  }

  // ===== SECTION: FUNCTION analyzFileWithQuestion =====
  async function analyzFileWithQuestion(question) {
    try {
      const fileContent = await readUploadedFileAsText();
      const combinedMessage = question + "\n\n" + fileContent;
      getReply(combinedMessage);
    } catch (error) {
      console.error('Error analyzing file:', error);
      appendMessage('bot', 'Error reading the uploaded file.');
    }
  }

  // ===== SECTION: FUNCTION getReply (API call) =====
 
  async function getReply(msg) {
    try{
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msg }),
      });

      const data = await response.json();
      const replyText = data.reply || "(no reply from backend).";
      console.log(replyText);
      appendMessage('bot', replyText);
    } catch (error) {
      console.error('Error fetching reply:', error);
      appendMessage('bot', 'Error talking to the backend.');
    }
  }  
  // ===== SECTION: FUNCTION reset AND disableInputs =====
  
  function resetFileSession() {
    uploadedFile = null;
    fileUploaded = false;
    fileInput.value = '';
  }
  function disableInputs() {
    input.disabled = true;
    sendBtn.disabled = true;
    fileInput.disabled = true;
    summaryBtn.disabled = true;
    bulletBtn.disabled = true;
  }
  //** Temporary placeholder reply until backend is implemented} 
  //async function getReply(msg) {
    //const apiKey = process.env.API_KEY; **this needs to be handled in the backend!
   /* const apiLocation = "https://api.openai.com/v1/chat/completions";

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
   }*

   **/


