# Team-15-Project
====== OVERVIEW ======

The AI Study Chatbot is a web-based tool designed to help students analyze study materials by generating summaries and bullet-points notes from uploaded .txt files.
User can also chat naturally with the AI for general help.

The project implements a Java Spring Boot backend (API gateway to OpenAI) and a HTML/CSS/JavaScript frontend. This project maintains a clean separation between fron-end and back-end responsibilities


====== FEATURES ======
1) Student Friendly AI Chat
-Users can ask questions and received intelligent responses from OpenAI's GPT models

2) File Upload + Automatic Summaries
-Accepts .txt files
-Extracts text in the browser
-Sends the conent + the user's request to the backend
-Returns a summary or a bullet-note version of the material

3) PDF Detection(Limited Support)
-The system detects PDF uploads
-It does not extract PDF text yet
-User are prompted to convert PDFs to .txt
-This is documented as a future enhancement

4) Session Handling
if a file is already uploaded: 
    the chatbot asks wheter to:
        -End session(disables inputs +clears file), or
        -Upload a new document

5) Dark Mode Toggle
Accessible UI with a light/dark theme


======= ARCHITECTURE =======

Frontend (HTML/CSS/JS)

Handles:
-Chat UI
-Message history
-Manages file upload states
-Extracts .txt file content
-Encode .pdf input (if supported int he future)
-Communicate with backend REST endpoints
-button-based prompts (Summary, Bullet Points)
-Dark-mode toggle
-Sending requests to backend (fetch -> /chat)
-Present AI responses

Backend (Java Spring Boot)

Handles:
-Routing(/chat, /health)
-Validating 
-Calling the OpenAI API
-Reading system environment variables securely (OPENAI_API_KEY)
-returning AI responses to the frontend

====== BACKEND CLASS DIAGRAM =====
+------------------------------------+
|      AIBackendApplication          |
+------------------------------------+
| + main()                           |
| + Spring Boot initializer          |
+------------------------------------+
       creates Spring context
                |
                v
+------------------------------------+
|          ChatController            |
+------------------------------------+
| + chat(message)                    |
| + healthCheck()                    |
+------------------------------------+
| - llmService : LlmService          |
|------------------------------------|
|  Uses LlmService to handle logic   |
+------------------------------------+
               |
               v
+------------------------------------+
|          LlmService                |                    |
+------------------------------------+
| - apiKey                           |
|------------------------------------|
| + sendChatRequest(message)         |
+------------------------------------+

EXPLANATION
-AIBackendApplication boos Srping and registers all beans
-ChatController exposes the REST endpoints
-LlmService perfroms the OpenAI API request and returns the response

====== CHATBOT WORKFLOW ======

1) User opens the webpage
 -> Welcome messages displayed

2) User uploads a file
 -> if .txt: ready for summary or bullet notes
 -> if .pdf: detected, but user asked to upload .txt instead

3) User reqeusts "summary" or "bullet points"
 -> frontend extracts text (if .txt)
 -> sends to backend
 -> backend sends to OPENAI
 -> AI response shown in chat

 4) User continues chatting normally
 -> Non-file messages go directly through backend to OpenAI

 5) Session controls
 -> if file already uploaded, chatbot asks if user wants:
    -Upload new documents
    -End session

====== SIMPLE BEHAVIOUR SEQUENCE DIAGRAM ======
User
 |
 v
Frontend (script.js)
 |
 |  POST { message: "..." }
 v
ChatController (/chat)
 |
 v
LlmService.sendChatRequest()
 |
 v
OpenAI API
 |
 v
LlmService
 |
 v
ChatController
 |
 v
Frontend
 |
 v
User sees AI output

====== TECH STACK ======

Frontend:
    HTML
    CSS
    JavaScript
    Live Server (VS Code)

Backend:
    Java 21
    Srping Boot 3.5x
    Maven
    OpenAI Chat Completions API
    CORS-enabled REST API

====== API KEY SECURITY ======

The API key is never stored on the frontend
It is stored only in the user's computer environment variable.

    setx OPEN_API_KEY "sk-xxxxx"

then spring boot loads it using:

    System.getenv("OPENAI_API_KEY");

This prevents exposing the user's key publicly.

====== TESTING INSTUCTIONS ======

1)BACKEND

    i) Start backend:

        ./mvnw.cmd spring-boot:run

    ii) Test health endpoints

        http://localhost:8080/healthcheck

        Expected output:

        {"status: "okay"}

    iii) Test chat in browswer DevTools console:

        fetch("http://localhost:8080/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Hello from Brave console" }),
        })
        .then(r => r.json())
        .then(data => console.log("Chat response:", data))
        .catch(err => console.error("Error calling /chat:", err));

2) FRONTEND

    i) Open with VSCode Live Server:

        indext.html -> right-click -> "Open with Live Server"

    ii) Normal chat works:

        User: "Hello" ->AI Replies
    
    iii) TXT upload

        Upload .txt -> type "summary"
        -> AI summarizes
    
    iv) PDF upload

        Upload .pdf -> type "summary"
        -> AI respons that is content is encoded in binary and is not directly readable. 

    v) Second file upload

        User: upload again
        ->chatbot presents:

            End Session
            Upload another document

    vi) Dark mode toggle works

        Top right button switches themes

====== PROJECT STRUCTURE ======

/project-root
|
|__frontend/
|    |_index.html
|    |_style.css
|    |_script.js
|
|__backend/
|    |_src/main/java/com/example/ai_backend/
|    |   |_AiBackendApplication.java
|    |   |_ChatController.java
|    |   |_ChatService.java
|    |
|    |_pom.xml
|    |
|
|__README.md



====== INSTALLATION GUIDE =====

1) Clone the repository
2) Ensure Java 21 is installed
3) Install dependencies (backend)
4) Set environment variables and restart VSCode afterwards
5) Run Backend with spring-boot
6) Run frontend




