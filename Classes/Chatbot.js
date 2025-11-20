  
  class Chatbot{
 // ===== SECTION: FUNCTION getReply (API call) =====
 /*
    static async getReply(msg) {
        Messages.appendMessage('bot', msg);
        const apiKey = "";
        const apiLocation = "https://api.openai.com/v1/chat/completions";

        try {
            const reply = await fetch(apiLocation, {
                headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'}, 
                method: 'POST',
                body: JSON.stringify({model: "gpt-4.1-nano", messages: [{role:'user', content: msg}], max_tokens: 1000}),
            });

            const toReturn = await reply.json();
            Messages.appendMessage('bot', "await passed");
            //data = toReturn.choices[0].message.content;
            data = JSON.stringify(toReturn);
            Messages.appendMessage('bot', "stringify passed");
            console.log(data);
            Messages.appendMessage('bot', data);
        }
        catch(error){
            Messages.appendMessage('bot', error);
            return "An error has occured";
            console.error("An error has occured", error);
        }
    }
        */
    

    //===== Reads in file data and sends it to the API =====
    static async getFileContent(text){
      const inputData = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = async function(e){
        const content = e.target.result;
        let pdfString = '';

        if(inputData.type == "application/pdf"){
            const loadingTask = pdfjsLib.getDocument(content);
            const pdf = await loadingTask.promise;

            //Gets text data from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent()

                //Gets text data from one page
                const textItems = textContent.items;
                for (var j = 0; j < textItems.length; j++) {
                    var item = textItems[j];
                    pdfString += item.str + "\n";
                }
            }
            //Messages.appendMessage('bot', pdfString);
            getReply(pdfString + "\n" + text);
        }
        else{
        //Messages.appendMessage('bot', content);
        getReply(content + text);
        }
      }

      if(inputData.type == "application/pdf"){
        reader.readAsArrayBuffer(inputData);
      }
      else{
        reader.readAsText(inputData);
      }
    }

    static sendMessage() {
        const text = input.value.trim();
        const file = fileInput.value;
        if(file && text) {
            Messages.appendMessage('user', text);
            Chatbot.getFileContent(text);
            input.value = '';
        }
        else if (text) { 
            Messages.appendMessage('user', text);
            input.value = '';
            getReply(text);
        }
    }
  }