package com.example.ai_backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;
import reactor.core.publisher.Mono;
import java.util.Objects;

import java.util.Map;

/** LlmService talks to the OpenAI API.
 It uses WebClient (from spring-boot-starter-webflux).*/

@Service
public class LlmService {

    private final WebClient client;

    /*Spring injects the value of the OPENAI_API_KEY property here.
     NEED TO SET UP AN environment variable OPENAI_API_KEY on the individual machine.
     will add this step into the README file later on*/
    public LlmService(@Value("${OPENAI_API_KEY}") String apiKey) {
        this.client = WebClient.builder()
                .baseUrl("https://api.openai.com/v1/chat/completions")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /*General "ask the model" method for simple chat questions.*/
    public String ask(String userMessage) {
        Map<String, Object> body = Map.of(
                "model", "gpt-4.1-mini",
                "messages", new Object[]{
                        Map.of("role", "system", "content", "You are a helpful study assistant."),
                        Map.of("role", "user", "content", userMessage)
                },
                "max_tokens", 500
        );

        Map<String, Object> response = client.post()
            .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
            .bodyValue(Objects.requireNonNull(body))
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .onErrorResume(e -> Mono.just(Map.<String, Object>of("error", e.getMessage())))
            .block();

        return extractContent(response);
    }

    /* Specialized method for file-based analysis:
     question + fileContent combined into a structured prompt.*/
    public String analyze(String question, String fileContent) {
        String combinedPrompt = """
                You are a study assistant who has a professional tone.
                You will receive file content and a request to summarize or provide bullet point
                Use ONLY the information in the file content to answer clearly.

                File content:
                %s

                Question:
                %s
                """.formatted(fileContent, question);

        return ask(combinedPrompt);
    }

    /*Checking for errors related to connectivity.*/
    private String extractContent(Map<String, Object> response) {
        if (response == null) return "No response from LLM";

        Object error = response.get("error");
        if (error != null) {
            String errorMessage = error.toString(); 
            if (errorMessage.contains("429")) {
                return "The AI service is currently rate-limited in this account (429)";
            }
            else if(errorMessage.contains("401")){
                    return "Authentication error: Please check your OpenAI API key (401)";
             }

            return "Error from model: " + errorMessage;
        }

        try{
            Object choicesObj = response.get("choices");
            if (choicesObj instanceof java.util.List<?> list && !list.isEmpty()) {
                Object first = list.get(0);
                if (first instanceof Map<?, ?> firstMap) {
                    Object msg = firstMap.get("message");
                    if (msg instanceof Map<?, ?> msgMap) {
                        Object content = msgMap.get("content");
                        if (content != null) {
                            return content.toString();
                        }
                    Object text =firstMap.get("text");
                        if (text != null) {
                        return text.toString();
                            }
                        }
                    }
                }    
            } catch (Exception e) {
                return "Error parsing model response: " + e.getMessage();
            }
        return "No valid response from model.";
    }
}