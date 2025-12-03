class Chatbot {
 // state
 static uploadedFile = null;   // currently uploaded file
 static fileUploaded = false;  // flag
 static API_BASE_URL = 'http://localhost:8080';
 // called when user presses Send or hits Enter
 static async sendMessage() {
   const text = input.value.trim();
   if (!text) return;
   Messages.appendMessage('user', text);
   input.value = '';
   const lower = text.toLowerCase();
   // If a file is uploaded and user asks for summary / bullet points
   if (
     Chatbot.fileUploaded &&
     Chatbot.uploadedFile &&
     (Chatbot.uploadedFile.type === 'text/plain' ||
       Chatbot.uploadedFile.type === 'application/pdf')
   ) {
     if (lower.includes('summary') || lower.includes('summarize')) {
       Chatbot.analyzeFileWithQuestion(
         'Summarize this content in a clear, concise way for a student.'
       );
       return;
     }
     if (lower.includes('bullet') || lower.includes('points')) {
       Chatbot.analyzeFileWithQuestion(
         'Create bullet-point summary from this content for a student.'
       );
       return;
     }
   }
   // Otherwise, normal chat
   Chatbot.getReply(text);
 }
 // called from fileInput change event
 static handleFileSelected(file) {
   if (!file) return;
   // If a document has already been uploaded, prompt user
   if (Chatbot.fileUploaded && Chatbot.uploadedFile) {
     Messages.appendMessage(
       'bot',
       '📚 You’ve already uploaded a document. Would you like to end this session or upload a new one?'
     );
     const endBtn = document.createElement('button');
     endBtn.textContent = 'End Session';
     endBtn.className = 'prompt-btn';
     endBtn.onclick = () => {
       Messages.appendMessage(
         'bot',
         '✅ Session ended. Thank you for using the Study Chatbot! Refresh the page to start a new one.'
       );
       Chatbot.resetFileSession();
       Chatbot.disableInputs();
     };
     const newUploadBtn = document.createElement('button');
     newUploadBtn.textContent = 'Upload Another Document';
     newUploadBtn.className = 'prompt-btn';
     newUploadBtn.onclick = () => {
       Messages.appendMessage(
         'bot',
         '📄 Great! Please upload your new document to continue.'
       );
       Chatbot.resetFileSession();
     };
     const buttonRow = document.createElement('div');
     buttonRow.style.display = 'flex';
     buttonRow.style.gap = '10px';
     buttonRow.appendChild(endBtn);
     buttonRow.appendChild(newUploadBtn);
     messages.appendChild(buttonRow);
     messages.scrollTop = messages.scrollHeight;
     return;
   }
   // First file this session
   Chatbot.uploadedFile = file;
   Chatbot.fileUploaded = true;
   if (file.type === 'text/plain') {
     Messages.appendMessage(
       'bot',
       `📄 Uploaded text file: ${file.name}. Would you like a summary or bullet-point notes? You can type "summary" or "bullet points", or click one of the buttons.`
     );
   } else if (file.type === 'application/pdf') {
     Messages.appendMessage(
       'bot',
       `📄 Uploaded PDF file: ${file.name}. I will try to extract text and analyze it.`
     );
   } else {
     Messages.appendMessage(
       'bot',
       `⚠️ Unsupported file type: ${file.type}. Please upload a .txt or .pdf file.`
     );
     Chatbot.resetFileSession();
   }
 }
 // read file content (txt or pdf)
 static readUploadedFileContent() {
   const file = Chatbot.uploadedFile;
   if (!file) {
     return Promise.reject(new Error('No file uploaded'));
   }
   if (file.type === 'text/plain') {
     return Chatbot.readTextFileAsText(file);
   }
   if (file.type === 'application/pdf') {
     return Chatbot.readPdfFileAsText(file);
   }
   return Promise.reject(new Error('Unsupported file type'));
 }
 // for .txt
 static readTextFileAsText(file) {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = e => resolve(e.target.result);
     reader.onerror = () => reject(new Error('Error reading text file'));
     reader.readAsText(file);
   });
 }
 // for .pdf using pdfjsLib
 static async readPdfFileAsText(file) {
   // Requires pdfjsLib loaded via <script> in index.html
   if (typeof pdfjsLib === 'undefined') {
       throw new Error('PDF_SUPPORT_MISSING.');
   }
   
   try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extracted = '';
   
    for (let i = 1; i <= pdf.numPages; i++) {
     const page = await pdf.getPage(i);
     const textContent = await page.getTextContent();
     textContent.items.forEach(item => {
       extracted += item.str + ' ';
     });
     extracted += '\n\n';
   }
   
   if (!extracted.trim()) {
     throw new Error('PDF_NO_TEXT_EXTRACTION.');
   }
   return extracted;
} catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('PDF_EXTRACTION_FAILED.');
    }
}
 // summarization / bullet workflow
 static async analyzeFileWithQuestion(question) {
   try {
     const fileContent = await Chatbot.readUploadedFileContent();
     const combinedMessage = question + '\n\n' + fileContent;
     Chatbot.getReply(combinedMessage);
   } catch (error) {
     console.error('Error analyzing file:', error);

     const isPdf= Chatbot.uploadedFile?.type === 'application/pdf';
     const code =error.message || '';
     if (isPdf) {
       if (code ==='PDF_SUPPORT_MISSING.') {
            Messages.appendMessage(
            'bot',
            'I tried to read your PDF, but PDF support is not fully available in this envionment. Please export your PDF as text and upload that instead.'
        );
       } else if (code ==='PDF_NO_TEXT_EXTRACTION.') {
            Messages.appendMessage(
            'bot',
            'I could not extract any text from your PDF. This can happen with scanned documents or image-based PDFs. Please try a version with selectable text or convert it to .txt.'
        );
       } else if (code ==='PDF_EXTRACTION_FAILED.') {
            Messages.appendMessage(
            'bot',
            'I had trouble reading this PDF. Some PDF use special fonts or formtas that are hard to process. Please try exporting it as .txt and upload that file instead.'
        );
       }
   }else {
       Messages.appendMessage(
        'bot', 
        'I had trouble reading this file. Please make sure it is a valid .txt file with readable text'
        );
    }
   }
 }
 // call backend /chat
 static async getReply(msg) {
   try {
     const response = await fetch(`${Chatbot.API_BASE_URL}/chat`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ message: msg })
     });
     const data = await response.json();
     const replyText = data.reply || '(no reply from backend).';
     console.log(replyText);
     Messages.appendMessage('bot', replyText);
   } catch (error) {
     console.error('Error fetching reply:', error);
     Messages.appendMessage('bot', 'Error talking to the backend.');
   }
 }
 static resetFileSession() {
   Chatbot.uploadedFile = null;
   Chatbot.fileUploaded = false;
   fileInput.value = '';
 }
 static disableInputs() {
   input.disabled = true;
   sendBtn.disabled = true;
   fileInput.disabled = true;
   summaryBtn.disabled = true;
   bulletBtn.disabled = true;
 }
}