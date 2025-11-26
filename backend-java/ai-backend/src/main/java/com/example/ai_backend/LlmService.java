package com.example.ai_backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/** LlmService talks to the OpenAI API.
 It uses WebClient (from spring-boot-starter-webflux).*/

@Service
public class LlmService {

    private final WebClient client;

    /*Spring injects the value of the OPENAI_API_KEY property here.
     NEED TO SET UP AN environment variable OPENAI_API_KEY on the individual machine.*/
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

        Map response = client.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> Mono.just(Map.of("error", e.getMessage())))
                .block();

        return extractContent(response);
    }

    /* Specialized method for file-based analysis:
     question + fileContent combined into a structured prompt.*/
    public String analyze(String question, String fileContent) {
        String combinedPrompt = """
                You are a study assistant. You will receive file content and a question.
                Use ONLY the information in the file content to answer clearly.

                File content:
                %s

                Question:
                %s
                """.formatted(fileContent, question);

        return ask(combinedPrompt);
    }

    /*Helper to extract the assistant's message from the OpenAI-style JSON.*/
    @SuppressWarnings("unchecked")
    private String extractContent(Map response) {
        try {
            Object error = response.get("error");
            if (error != null) {
                return "Error from model: " + error;
            }

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
                    }
                }
            }
            return "No response from model.";
        } catch (Exception e) {
            return "Error parsing model response: " + e.getMessage();
        }
    }
}