class Messages {
 static appendMessage(role, text) {
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
       setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
     };
     div.appendChild(copyBtn);
   }
   messages.appendChild(div);
   messages.scrollTop = messages.scrollHeight;
 }
}